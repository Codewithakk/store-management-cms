import { Router } from 'express'
import { authMiddleware } from '../../middleware/auth.middleware'
import roleRestriction from '../../middleware/roleRestriction'
import { Role } from '@prisma/client'
import {
    createOrder,
    getOrder,
    getOrders,
    updateOrder,
    deleteOrder,
    getOrdersByStatus,
    getOrdersByUser,
    reorder,
    getOrdersByWorkspace,
    downloadInvoice,
    bulkUpdateOrders,
    cloneOrder,
    notifyOrderStatus,
    getOrderHistory,
    searchOrders,
    exportOrders,
    getOrdersByDateRangeController,
    getOrdersAddress,
    cancelOrderController,
    updateOrderStatus,
    assignDeliveryPartner,
    getStaffByWorkspace,
} from '../../controllers/order/order.controller'
import itemsRouter from './items'
import paymentRouter from './payment'

const router = Router()

// Basic Order Operations
router.post('/', authMiddleware, createOrder)
router.post('/:orderId/cancel', authMiddleware, roleRestriction([Role.ADMIN, Role.MANAGER]), cancelOrderController)
router.get('/ordersAddress', authMiddleware, getOrdersAddress)

// Order CRUD
router.get('/workspaces/:workspaceId/orders', authMiddleware, getOrders)
router.get('/workspaces/:workspaceId/orders/:orderId', authMiddleware, getOrder)
router.patch('/workspaces/:workspaceId/orders/:orderId', authMiddleware, updateOrder)
router.delete('/workspaces/:workspaceId/orders/:orderId', authMiddleware, deleteOrder)

// Order Status
router.patch('/workspaces/:workspaceId/orders/:orderId/status', authMiddleware, updateOrderStatus)
router.get('/workspaces/:workspaceId/orders/status/:status', authMiddleware, getOrdersByStatus)
// User Orders
router.get('/users/:userId', authMiddleware, getOrdersByUser)
router.post('/:orderId/reorder', authMiddleware, reorder)

// Order Utilities
router.get('/workspaces/:workspaceId/orders', authMiddleware, getOrdersByWorkspace)
router.get('/workspaces/:workspaceId/orders/:orderId/history', authMiddleware, getOrderHistory)
router.get('/workspaces/:workspaceId/orders/:orderId/invoice', authMiddleware, downloadInvoice)

// Bulk Operations
router.patch('/workspaces/:workspaceId/orders/bulk-update', authMiddleware, bulkUpdateOrders)
router.post('/workspaces/:workspaceId/orders/assign-order', authMiddleware, assignDeliveryPartner)
router.get('/workspaces/:workspaceId/staff', authMiddleware, getStaffByWorkspace)
router.post('/workspaces/:workspaceId/orders/:orderId/clone', authMiddleware, cloneOrder)
router.post('/workspaces/:workspaceId/orders/:orderId/notify', authMiddleware, notifyOrderStatus)

// Search & Export
router.get('/workspaces/:workspaceId/orders/search', authMiddleware, searchOrders)
router.get('/workspaces/:workspaceId/orders/:orderId/export', authMiddleware, exportOrders)
router.get('/workspaces/:workspaceId/orders/date-range', authMiddleware, getOrdersByDateRangeController)

// Sub-routes
router.use('/', itemsRouter)
router.use('/', paymentRouter)

export default router
