import { Router } from 'express'
import { authMiddleware } from '../../middleware/auth.middleware'
import { addOrderItem, removeOrderItem, getAllOrderItems } from '../../controllers/order/order.controller'

const router = Router()

router.post('/workspaces/:workspaceId/orders/:orderId/items', authMiddleware, addOrderItem)
router.delete('/workspaces/:workspaceId/orders/:orderId/items/:itemId', authMiddleware, removeOrderItem)
router.get('/workspaces/:workspaceId/order/items', authMiddleware, getAllOrderItems)

export default router
