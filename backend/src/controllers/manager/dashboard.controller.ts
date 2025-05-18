import { Request, Response, NextFunction } from 'express';
import httpError from '../../util/httpError';
import prisma from '../../util/prisma';
import { convertBigIntToString } from '../../util/bigintHelper';

export const getWorkspaceDashboardSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.userId) {
      return httpError(next, new Error('Unauthorized'), req, 401);
    }

    const workspaceId = parseInt(req.params.workspaceId);
    if (isNaN(workspaceId)) {
      return httpError(next, new Error('Invalid workspace ID'), req, 400);
    }

    // Dashboard queries
    const [
      workspace,
      productsCount,
      lowStockProducts,
      categoriesCount,
      ordersCount,
      recentOrders,
      pendingBills,
      teamMembers,
    ] = await Promise.all([
      prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: {
          name: true,
          description: true,
          isActive: true,
          createdAt: true,
          location: true,
          images: true,
        },
      }),

      prisma.product.count({
        where: { workspaceId, isActive: true },
      }),

      prisma.productVariant.count({
        where: {
          product: { workspaceId },
          stock: { lt: 10 },
          isAvailable: true,
        },
      }),

      prisma.category.count({ where: { workspaceId } }),

      prisma.order.count({
        where: {
          workspaceId,
          placedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      }),

      prisma.order.findMany({
        where: { workspaceId },
        orderBy: { placedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          totalAmount: true,
          status: true,
          placedAt: true,
          user: { select: { firstName: true, lastName: true } },
        },
      }),

      prisma.bill.findMany({
        where: {
          items: {
            some: { variant: { product: { workspaceId } } },
          },
          status: 'PENDING',
        },
        select: {
          id: true,
          totalAmount: true,
          createdAt: true,
          user: { select: { firstName: true } },
        },
        take: 5,
      }),

      // Team members (excluding ADMINs)
      prisma.userRole.findMany({
        where: {
          workspaceId,
          NOT: {
            role: 'ADMIN'
          }
        },
        select: {
          role: true,
          user: {
            select: {
              id: true,
              firstName: true,
              email: true
            }
          }
        }
      }),

    ]);

    if (!workspace) {
      return httpError(next, new Error('Workspace not found'), req, 404);
    }

    const responseData = {
      success: true,
      data: {
        workspaceInfo: {
          name: workspace.name,
          description: workspace.description,
          isActive: workspace.isActive,
          createdAt: workspace.createdAt,
          location: workspace.location,
          images: workspace.images,
        },
        inventorySummary: {
          totalProducts: productsCount,
          lowStockProducts,
          totalCategories: categoriesCount,
        },
        ordersSummary: {
          recentOrdersCount: ordersCount,
          recentOrders,
          pendingBills,
        },
        teamSummary: {
          totalMembers: teamMembers.length,
          members: teamMembers.map((m) => ({
            id: m.user.id,
            name: m.user.firstName,
            email: m.user.email,
            role: m.role,
          })),
        },
      },
    };

    res.status(200).json(responseData);
  } catch (error) {
    httpError(next, error, req);
  }
};
