import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { getStaffDashboardController, removeOrderAssignment } from '../../controllers/staff/staff.controller';

const router = Router();

// Remove assigned user from order
router.post('/unassign/:orderId', authMiddleware, removeOrderAssignment);
router.get('/:workspaceId/dashboard', authMiddleware, getStaffDashboardController);
export default router;