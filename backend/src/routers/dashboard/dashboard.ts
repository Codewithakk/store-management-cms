import express from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { getDashboardSummary } from '../../controllers/admin/dashboard.controller';

const router = express.Router();

router.get('/', authMiddleware, getDashboardSummary);

export default router;
