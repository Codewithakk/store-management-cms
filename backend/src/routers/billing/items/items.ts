import { Router } from 'express'
import { billController } from '../../../controllers/billing/billing.controller'
import { Role } from '@prisma/client'
import roleRestriction from '../../../middleware/roleRestriction'
import { authMiddleware } from '../../../middleware/auth.middleware'
import { validateBillItem } from './validation'

const router = Router({ mergeParams: true }) // Merge params to access billId

// Bill Items CRUD Operations
router.get('/', authMiddleware, roleRestriction([Role.ADMIN, Role.MANAGER, Role.STAFF]), billController.getBillItemsByBill)

router.post(
    '/',
    authMiddleware,
    roleRestriction([Role.ADMIN, Role.MANAGER]),
    validateBillItem, // Add validation middleware
    billController.addItemsToBill
)

router.put(
    '/:itemId',
    authMiddleware,
    roleRestriction([Role.ADMIN, Role.MANAGER]),
    validateBillItem, // Add validation middleware
    billController.updateBillItem
)

router.delete('/:itemId', authMiddleware, roleRestriction([Role.ADMIN, Role.MANAGER]), billController.deleteBillItem)

export default router
