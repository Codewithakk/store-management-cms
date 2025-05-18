import { Router } from 'express'
import { billController } from '../../controllers/billing/billing.controller'
import { Role } from '@prisma/client'
import roleRestriction from '../../middleware/roleRestriction'
import { authMiddleware } from '../../middleware/auth.middleware'
import billItemsRouter from './items/items' // Import the items sub-router

const router = Router()

// Bill CRUD Operations
router.post('/', authMiddleware, roleRestriction([Role.ADMIN, Role.MANAGER, Role.STAFF]), billController.createBill)

router.get('/', authMiddleware, roleRestriction([Role.ADMIN, Role.MANAGER]), billController.getAllBills)

router.get('/:billId', authMiddleware, roleRestriction([Role.ADMIN, Role.MANAGER, Role.STAFF]), billController.getBillById)

router.put('/:billId', authMiddleware, roleRestriction([Role.ADMIN, Role.MANAGER]), billController.updateBill)

router.delete('/:billId', authMiddleware, roleRestriction([Role.ADMIN]), billController.deleteBill)

// Bill Status Management
router.patch('/:billId/status', authMiddleware, roleRestriction([Role.ADMIN, Role.MANAGER]), billController.updateBillStatus)

// User-specific Bills
router.get('/users/:userId/bills', authMiddleware, roleRestriction([Role.ADMIN, Role.MANAGER, Role.STAFF]), billController.getBillsByUser)

// Mount the bill items sub-router
router.use('/:billId/items', billItemsRouter)

export default router
