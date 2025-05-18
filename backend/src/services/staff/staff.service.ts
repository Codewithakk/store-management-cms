import prisma from "../../util/prisma";

export const removeAssignedUser = async (orderId: string, changedBy: string) => {
  try {
    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { assignedToUser: true },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (!order.assignedTo) {
      throw new Error('No user assigned to this order');
    }

    // Update order to remove assigned user
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { assignedTo: null },
      include: {
        assignedToUser: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    // Create order status history
    await prisma.orderStatusHistory.create({
      data: {
        orderId,
        status: updatedOrder.status,
        note: `Assigned user removed from order`,
        changedBy,
      },
    });

    return updatedOrder;
  } catch (error) {
    throw new Error(`Failed to remove assigned user: ${error}`);
  }
};

export const getStaffDashboard = async (userId: string, workspaceId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAvailable: true }
  });

  if (!user) throw new Error('User not found');

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: {
      id: true,
      name: true,
      images: true,
      location: true,
      description: true,
      createdAt: true,
    }
  });

  if (!workspace) throw new Error('Workspace not found');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Fetch all assigned orders for this user in the workspace
  const assignedOrders = await prisma.order.findMany({
    where: {
      assignedTo: userId,
      workspaceId: workspaceId,
    },
    select: {
      id: true,
      status: true,
      totalAmount: true,
      placedAt: true,
      items: {
        select: {
          quantity: true,
          price: true,
          variant: {
            select: {
              id: true,
              title: true,
              sku: true,
              price: true,
              stock: true,
              color: true,
              size: true
            }
          }
        }
      }
    },
    orderBy: { placedAt: 'desc' },
  });

  // Compute stats
  const totalOrders = assignedOrders.length;
  const ordersToday = assignedOrders.filter(order =>
    order.placedAt >= today
  ).length;

  const processingOrders = assignedOrders.filter(order => order.status === 'PROCESSING').length;
  const completedOrders = assignedOrders.filter(order => order.status === 'DELIVERED' || order.status === 'COMPLETED').length;
  const successfulDeliveries = assignedOrders.filter(order => order.status === 'DELIVERED').length;
  const totalRevenue = assignedOrders.reduce((sum, order) => sum + order.totalAmount, 0);

  return {
    availabilityStatus: user.isAvailable,
    workspaceDetails: workspace,
    stats: {
      totalOrders,
      ordersToday,
      processingOrders,
      completedOrders,
      successfulDeliveries,
      totalRevenue
    },
    assignedOrders: assignedOrders.map(order => ({
      id: order.id,
      status: order.status,
      totalAmount: order.totalAmount,
      placedAt: order.placedAt,
      items: order.items.map(item => ({
        quantity: item.quantity,
        price: item.price,
        variant: item.variant
      }))
    }))
  };
};




