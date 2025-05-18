import { Request, Response, NextFunction } from 'express';
import prisma from '../../util/prisma';
import httpError from '../../util/httpError';
import httpResponse from '../../util/httpResponse';
import { convertBigIntToString } from '../../util/bigintHelper';

export const getDashboardSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const now = new Date();

    // Step 1: Validate req.user and req.user.id
    if (!req.user || !req.user?.userId) {
      return httpError(next, new Error('Unauthorized: User not authenticated'), req, 401);
    }

    // Step 2: Fetch owned workspaces
    const workspaces = await prisma.$queryRawUnsafe<{ id: number; name: string }[]>(
      `
      SELECT id, name
      FROM "Workspace"
      WHERE "ownerId" = $1
      `,
      req.user.userId
    );

    if (!workspaces || workspaces.length === 0) {
      return httpError(next, new Error('No owned workspaces found for user'), req, 401);
    }

    const workspaceIds = workspaces.map((workspace) => workspace.id);

    // Step 3: Fetch dashboard data filtered by admin's owned workspaces
    const [
      usersByRole,
      activeInactiveWorkspaces,
      totalRevenue,
      revenueByWorkspace,
      revenueByMonth,
      recentOrders,
      pendingInvitations,
      expiredInvitations,
      topSellingProducts,
      userSignupsOverTime,
      systemNotifications,
      mostActiveWorkspaces,
    ] = await Promise.all([
      // Users by role in admin's owned workspaces
      prisma.userRole.groupBy({
        by: ['role'],
        _count: { role: true },
        where: {
          workspaceId: { in: workspaceIds },
        },
      }),

      // Active/inactive status of admin's owned workspaces
      (async () => {
        const active = await prisma.workspace.count({
          where: { id: { in: workspaceIds }, isActive: true },
        });
        const inactive = await prisma.workspace.count({
          where: { id: { in: workspaceIds }, isActive: false },
        });
        return { active, inactive };
      })(),

      // Total revenue for admin's owned workspaces
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { workspaceId: { in: workspaceIds } },
      }),

      // Revenue by workspace with workspace name
      prisma.order.groupBy({
        by: ['workspaceId'],
        _sum: { totalAmount: true },
        where: { workspaceId: { in: workspaceIds } },
      }).then((results) =>
        Promise.all(
          results.map(async (result) => ({
            workspaceId: result.workspaceId,
            workspaceName: workspaces.find((w) => w.id === result.workspaceId)?.name || 'Unknown',
            totalAmount: result._sum.totalAmount,
          }))
        )
      ),

      // Revenue by month for admin's owned workspaces
      prisma.$queryRawUnsafe(
        `
        SELECT DATE_TRUNC('month', "createdAt") AS month, SUM("totalAmount")::text AS total
        FROM "Order"
        WHERE "workspaceId" IN (${workspaceIds.map((_, i) => `$${i + 1}`).join(',')})
        GROUP BY month
        ORDER BY month ASC
      `,
        ...workspaceIds
      ),

      // Recent orders: Only id and count for admin's owned workspaces
      (async () => {
        const orders = await prisma.order.findMany({
          where: { workspaceId: { in: workspaceIds } },
          select: { id: true },
          take: 10,
          orderBy: { createdAt: 'desc' },
        });
        const count = await prisma.order.count({
          where: { workspaceId: { in: workspaceIds } },
        });
        return { orders, count };
      })(),

      // Pending invitations for admin's owned workspaces
      prisma.invitation.findMany({
        where: {
          workspaceId: { in: workspaceIds },
          status: 'PENDING',
          expiresAt: { gt: now },
        },
      }),

      // Expired invitations for admin's owned workspaces
      prisma.invitation.findMany({
        where: {
          workspaceId: { in: workspaceIds },
          status: 'PENDING',
          expiresAt: { lt: now },
        },
      }),

      // Top-selling products with variant name
      prisma.orderItem.groupBy({
        by: ['variantId'],
        _sum: { quantity: true },
        where: {
          order: { workspaceId: { in: workspaceIds } },
        },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }).then((results) =>
        Promise.all(
          results.map(async (result) => {
            const variant = await prisma.productVariant.findUnique({
              where: { id: result.variantId },
              select: { id: true, title: true },
            });
            return {
              variantId: result.variantId,
              variantName: variant?.title || 'Unknown',
              quantity: result._sum.quantity,
            };
          })
        )
      ),

      // User signups over time for admin's owned workspaces
      prisma.$queryRawUnsafe(
        `
        SELECT DATE_TRUNC('day', "createdAt") AS day, COUNT(*)::text
        FROM "User"
        WHERE id IN (
          SELECT "A"
          FROM "_UserWorkspaces"
          WHERE "B" IN (${workspaceIds.map((_, i) => `$${i + 1}`).join(',')})
        )
        GROUP BY day
        ORDER BY day ASC
      `,
        ...workspaceIds
      ),

      // System notifications for admin's owned workspaces
      prisma.invitation.findMany({
        where: {
          workspaceId: { in: workspaceIds },
          status: 'PENDING',
          expiresAt: { gt: now },
        },
      }),

      // Most active workspaces with workspace name
      prisma.order.groupBy({
        by: ['workspaceId'],
        _count: { workspaceId: true },
        where: { workspaceId: { in: workspaceIds } },
        orderBy: { _count: { workspaceId: 'desc' } },
        take: 5,
      }).then((results) =>
        Promise.all(
          results.map(async (result) => ({
            workspaceId: result.workspaceId,
            workspaceName: workspaces.find((w) => w.id === result.workspaceId)?.name || 'Unknown',
            orderCount: result._count.workspaceId,
          }))
        )
      ),
    ]);

    // Step 4: Structure the response
    const data = {
      usersByRole,
      workspaceStatus: activeInactiveWorkspaces,
      revenue: {
        total: totalRevenue._sum.totalAmount,
        byWorkspace: revenueByWorkspace,
        byMonth: revenueByMonth,
      },
      recentOrders: {
        orders: recentOrders.orders,
        count: recentOrders.count,
      },
      invitations: {
        pending: pendingInvitations,
        expired: expiredInvitations,
      },
      topSellingProducts,
      userSignupsOverTime,
      systemNotifications,
      mostActiveWorkspaces,
    };

    const result = convertBigIntToString(data);
    return httpResponse(req, res, 200, 'Dashboard summary fetched successfully', result);
  } catch (error) {
    return httpError(next, error, req, 500);
  }
};