import { NextFunction, Request, Response } from "express";
import { removeAssignedUser, getStaffDashboard } from "../../services/staff/staff.service";
import httpError from "../../util/httpError";
import httpResponse from "../../util/httpResponse";

export const removeOrderAssignment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { orderId } = req.params;
    const changedBy = req.user?.userId; // Assuming user ID is available in req.user from auth middleware

    if (!orderId) {
      return httpError(next, new Error('Order ID is required'), req, 400);
    }

    if (!changedBy) {
      return httpError(next, new Error('Unauthorized: User not authenticated'), req, 401);
    }

    const updatedOrder = await removeAssignedUser(orderId, changedBy);
    if (!updatedOrder) {
      return httpError(next, new Error('Failed to remove assigned user'), req, 500);
    }
    return httpResponse(req, res, 200, 'Assigned user removed successfully', updatedOrder)
  } catch (error) {
    return httpError(next, error, req, 500);
  }
};


export const getStaffDashboardController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const userId = req.user?.userId
  const workspaceId = Number(req.params.workspaceId)
  if (!workspaceId) {
    res.status(401).json({ error: 'Unauthorized: Missing workspace ID' });
    return
  }
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized: Missing user ID' });
    return
  }
  try {
    const dashboardData = await getStaffDashboard(userId as string, workspaceId);
    if (!dashboardData) {
      res.status(404).json({ error: 'Dashboard data not found' });
      return;
    }
    res.json(dashboardData);
  } catch (error) {
    console.error('[Staff Dashboard Error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
