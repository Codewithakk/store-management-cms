import { Router } from 'express'
import { Role } from '@prisma/client'

import { authMiddleware } from '../../middleware/auth.middleware'
import roleRestriction from '../../middleware/roleRestriction'
import customRoutes from './reports/custom'
import financialRoutes from './reports/financial'
import operationalRoutes from './reports/operational'
import productRoutes from './reports/product'
import userRoutes from './reports/user'
import customerRoutes from './reports/customer'
import { getCustomerReport, getEmployeePerformanceReport, getInventoryReport, getSalesReport } from '../../controllers/reports/report.controller'

const router = Router()

/**
 * Reporting Routes
 */
router.get('/:workspaceId/reports/sales', authMiddleware, roleRestriction([Role.ADMIN, Role.MANAGER]), getSalesReport)

router.get('/:workspaceId/reports/inventory', authMiddleware, roleRestriction([Role.ADMIN, Role.MANAGER]), getInventoryReport)

router.get('/:workspaceId/reports/customer', authMiddleware, roleRestriction([Role.ADMIN, Role.MANAGER]), getCustomerReport)

router.get('/:workspaceId/reports/employee-performance', authMiddleware, roleRestriction([Role.ADMIN, Role.MANAGER]), getEmployeePerformanceReport)

router.use('/custom', customRoutes)
router.use('/customer', customerRoutes)
router.use('/financial', financialRoutes)
router.use('/operational', operationalRoutes)
router.use('/product', productRoutes)
router.use('/user', userRoutes)

export default router
