import express from 'express';
import { getDashboardSummary } from '../../controllers/admin/dashboard.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = express.Router();

router.get('/dashboard', authMiddleware, getDashboardSummary);

export default router;
