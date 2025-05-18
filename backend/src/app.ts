import express, { Application, NextFunction, Request, Response } from 'express'
import path from 'path'
import compression from 'compression'
import helmet from 'helmet'
import cors from 'cors'
import dotenv from 'dotenv'

import { PrismaClient } from '@prisma/client'

// Middleware and utilities
import globalErrorHandler from './middleware/globalErrorHandler'
import responseMessage from './constant/responseMessage'
import httpError from './util/httpError'

// Routes
// import authRoutes from './routers/auth.routes';
import authRoutes from './routers/auth/index'
// import workspaceRoutes from './routers/workspace.routes';
import workspaceRoutes from './routers/workspace/index'
// import categoryRoutes from './routers/category.routes';
import categoryRoutes from './routers/category/index'
// import productRoutes from './routers/product.routes';
import productRoutes from './routers/product/index'
// import orderRoutes from './routers/order.routes';
import orderRoutes from './routers/order/index'
// import reportRoutes from './routers/report.routes';
import reportRoutes from './routers/report/index'
// import inventoryRoutes from './routers/inventory.routes';
import inventoryRoutes from './routers/inventory/index'
// import notificationRoutes from './routers/notification.routes';
import notificationRoutes from './routers/notification/index'
// import billRoutes from './routers/billing.route';
import billRoutes from './routers/billing/index'
import adminRoutes from './routers/admin/admin.routes'
import staffRoutes from './routers/staff/staff.routes';
import cartRoutes from './routers/cart/index'
import { getBaseUrl } from './util/baseUrl'
// Initialize low stock alert cron job
import './automaticAlert/node-cron' // Ensures the low stock alert cron job is scheduled on server start

// Load environment variables
dotenv.config()

// Create Express app
const app: Application = express()

// Initialize Prisma Client
export const prisma = new PrismaClient()

// Apply security headers
app.use(helmet())

// Enable gzip compression
app.use(compression())

// Enable CORS for specified origins
app.use(
    cors({
        origin: [
            'https://store-management-cms-frontend.onrender.com'
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
        credentials: true
    })
)
// Parse incoming JSON requests
app.use(express.json())

// Serve static files from "public" directory
app.use(express.static(path.join(__dirname, '../', 'public')))

// Root route
app.get('/', (_req, res) => {
    res.send('🚀 Backend is running!')
})

// Express route
app.get('/api/v1/meta/base-url', (_req, res) => {
    const baseUrl = getBaseUrl()
    res.json({ baseUrl })
})

// API Routes
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/admin', adminRoutes)
app.use('/api/v1/staff', staffRoutes);
// app.use('/api/v1/dashboard', dashboardRoutes)
app.use('/api/v1/workspaces', workspaceRoutes)
app.use('/api/v1/categories', categoryRoutes)
app.use('/api/v1/products', productRoutes)
app.use('/api/v1/orders', orderRoutes)
app.use('/api/v1/reports', reportRoutes)
app.use('/api/v1/inventory', inventoryRoutes)
app.use('/api/v1/notifications', notificationRoutes)
app.use('/api/v1/bills', billRoutes)
app.use('/api/v1/cart', cartRoutes)

// 404 Not Found handler
app.use((req: Request, _res: Response, next: NextFunction) => {
    const error = new Error(responseMessage.NOT_FOUND('route'))
    httpError(next, error, req, 404)
})

// Global error handler
app.use(globalErrorHandler)

// Export the app for use in other files (like server.ts)
export default app
