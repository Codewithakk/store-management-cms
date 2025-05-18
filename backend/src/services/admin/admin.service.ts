import prisma from "../../util/prisma";

export class AnalyticsService {
  static async getAnalyticsSummary() {
    const now = new Date();

    const [
      usersByRole,
      workspaceStatus,
      revenueTotal,
      revenueByWorkspace,
      revenueByMonth,
      recentOrders,
      pendingInvites,
      expiredInvites,
      topProducts,
      signupsOverTime,
      notifications,
      activeWorkspaces
    ] = await Promise.all([
      prisma.userRole.groupBy({
        by: ['role'],
        _count: { role: true }
      }),

      // Active vs Inactive Workspaces
      (async () => {
        const active = await prisma.workspace.count({ where: { isActive: true } });
        const inactive = await prisma.workspace.count({ where: { isActive: false } });
        return { active, inactive };
      })(),

      // Revenue Total
      prisma.order.aggregate({ _sum: { totalAmount: true } }),

      // Revenue by Workspace
      prisma.order.groupBy({
        by: ['workspaceId'],
        _sum: { totalAmount: true }
      }),

      // Revenue by Month
      prisma.$queryRawUnsafe(`
        SELECT DATE_TRUNC('month', "createdAt") as month, SUM("totalAmount") as total
        FROM "Order"
        GROUP BY month
        ORDER BY month ASC
      `),

      // Recent Orders
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: true,
          workspace: true,
          items: {
            include: {
              variant: {
                include: {
                  product: true
                }
              }
            }
          }
        }
      }),

      // Pending Invitations
      prisma.invitation.findMany({
        where: { status: 'PENDING', expiresAt: { gt: now } }
      }),

      // Expired Invitations
      prisma.invitation.findMany({
        where: { status: 'PENDING', expiresAt: { lt: now } }
      }),

      // Top-Selling Products
      prisma.orderItem.groupBy({
        by: ['variantId'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5
      }),

      // User Signups Over Time
      prisma.$queryRawUnsafe(`
        SELECT DATE_TRUNC('day', "createdAt") AS day, COUNT(*) 
        FROM "User" 
        GROUP BY day 
        ORDER BY day ASC
      `),

      // System Notifications
      prisma.notification.findMany({
        where: { type: 'SYSTEM' },
        orderBy: { createdAt: 'desc' }
      }),

      // Most Active Workspaces
      prisma.order.groupBy({
        by: ['workspaceId'],
        _count: { workspaceId: true },
        orderBy: { _count: { workspaceId: 'desc' } },
        take: 5
      }),
    ]);

    return {
      usersByRole,
      workspaceStatus,
      revenue: {
        total: revenueTotal._sum.totalAmount,
        byWorkspace: revenueByWorkspace,
        byMonth: revenueByMonth
      },
      recentOrders,
      invitations: {
        pending: pendingInvites,
        expired: expiredInvites
      },
      topSellingProducts: topProducts,
      userSignupsOverTime: signupsOverTime,
      systemNotifications: notifications,
      mostActiveWorkspaces: activeWorkspaces
    };
  }
}
