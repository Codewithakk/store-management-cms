import { NextFunction, Request, Response } from 'express'
import { notificationService } from '../../services/notification.service'
import { z } from 'zod'
import { Role } from '@prisma/client'
import httpError from '../../util/httpError'
import httpResponse from '../../util/httpResponse'
import { deleteFromCache, getFromCache, setToCache } from '../../util/redis.utils'
import redisClient, { RedisTTL } from '../../cache/redisClient'
const getNotificationCacheKey = (userId: string) => `notifications:${userId}`;

// --- Zod Schemas ---
const querySchema = z.object({
    limit: z
        .string()
        .optional()
        .default('50')
        .transform(Number)
        .refine((val) => val > 0 && val <= 100, {
            message: 'Limit must be between 1 and 100'
        }),
    offset: z
        .string()
        .optional()
        .default('0')
        .transform(Number)
        .refine((val) => val >= 0, {
            message: 'Offset must be non-negative'
        }),
    type: z.enum(['LOW_STOCK', 'ORDER_UPDATE', 'INVITATION', 'SYSTEM']).optional(),
    isRead: z
        .enum(['true', 'false'])
        .optional()
        .transform((val) => val === 'true')
})

const createNotificationSchema = z.object({
    userId: z.string().uuid('Invalid user ID'),
    title: z.string().min(1, 'Title is required').max(100),
    message: z.string().min(1, 'Message is required').max(500),
    type: z.enum(['LOW_STOCK', 'ORDER_UPDATE', 'INVITATION', 'SYSTEM'])
})

const bulkDeleteSchema = z.object({
    notificationIds: z.array(z.string().uuid())
})

type NotificationData = z.infer<typeof createNotificationSchema>

export const getNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { limit, offset, type, isRead } = querySchema.parse(req.query)
        const userId = req.user?.userId
        const cacheKey = `notifications:${userId}:${limit}:${offset}:${type || 'all'}:${isRead ?? 'any'}`;
        const cached = await getFromCache<typeof notifications>(cacheKey);
        if (cached) {
            res.status(200).json(cached);
            return
        }
        const notifications = await notificationService.getNotifications(userId as string, {
            limit,
            offset,
            type,
            isRead
        })
        await setToCache(cacheKey, notifications, RedisTTL.ACCESS_TOKEN); // Or use a specific TTL
        res.status(200).json(notifications)
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to fetch notifications'
        res.status(400).json({ error: message })
    }
}

export const createNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { workspaceId } = req.params
        const data = createNotificationSchema.parse(req.body)
        const notification = await notificationService.createNotification(parseInt(workspaceId), data)
        // Invalidate cache for user's notifications
        // Invalidate cache
        await deleteFromCache(getNotificationCacheKey(data.userId));

        return httpResponse(req, res, 201, 'Notification created successfully', notification)
    } catch (error: unknown) {
        return httpError(next, error, req)
    }
}

export const markNotificationAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { workspaceId, notificationId } = req.params
        const userId = req.user?.userId

        await notificationService.markNotificationAsRead(parseInt(workspaceId), notificationId, userId as string)
        return httpResponse(req, res, 200, 'Notification marked as read successfully')
    } catch (error: unknown) {
        return httpError(next, error, req)
    }
}

export const deleteNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { workspaceId, notificationId } = req.params
        const userId = req.user?.userId
        const roles = req.user?.roles || []

        const result = await notificationService.deleteNotification({
            notificationId,
            workspaceId: parseInt(workspaceId),
            userId: userId!,
            userRoles: roles.filter((role) => role.workspaceId !== null) as { role: Role; workspaceId: number }[]
        })
        // Invalidate cache
        if (!userId) {
            throw new Error('User ID is required to delete the notification cache');
        }
        await deleteFromCache(getNotificationCacheKey(userId));
        return httpResponse(req, res, 200, 'Notification deleted successfully', result)
    } catch (error: unknown) {
        return httpError(next, error, req)
    }
}

export const markAllNotificationsAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const workspaceId = parseInt(req.params.workspaceId)
        const userId = req.user?.userId
        const result = await notificationService.markAllAsRead(workspaceId, userId as string)
        if (!result) {
            return httpResponse(req, res, 404, 'No notifications found to mark as read')
        }
        return httpResponse(req, res, 200, 'All notifications marked as read successfully', result)
    } catch (error: unknown) {
        return httpError(next, error, req)
    }
}

export const getUnreadNotificationsCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const workspaceId = parseInt(req.params.workspaceId)
    const userId = req.user?.userId

    const count = await notificationService.getUnreadCount(workspaceId, userId as string)
    return httpResponse(req, res, 200, 'Unread notifications count fetched successfully', { count })
}

// 1. Filter Notifications
export const filterNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const workspaceId = parseInt(req.params.workspaceId)
        const userId = req.user?.userId
        const filters = req.query

        const result = await notificationService.filter(workspaceId, userId as string, filters)
        return httpResponse(req, res, 200, 'Notifications filtered successfully', result)
    } catch (error) {
        return httpError(next, error, req)
    }
}

// 2. Update Notification
export const updateNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { notificationId } = req.params
        const workspaceId = parseInt(req.params.workspaceId)
        const data = req.body

        const result = await notificationService.update(notificationId, data)
        return httpResponse(req, res, 200, 'Notification updated successfully', result)
    } catch (error) {
        return httpError(next, error, req)
    }
}

// 3. Send Notification to User(s)
export const sendNotificationToUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { userIds } = req.body
        const workspaceId = parseInt(req.params.workspaceId)
        const notificationData = req.body.notification
        const io = req.app.get('io')
        const results = []

        for (const userId of userIds) {
            const result = await notificationService.sendToUser(
                workspaceId,
                userId,
                {
                    ...notificationData,
                    userId
                },
                io
            )
            results.push(result)
        }

        return httpResponse(req, res, 200, 'Notifications sent successfully', results)
    } catch (error) {
        return httpError(next, error, req)
    }
}

// 4. Bulk Delete Notifications
export const bulkDeleteNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const workspaceId = parseInt(req.params.workspaceId)
        const { notificationIds } = bulkDeleteSchema.parse(req.body)

        const result = await notificationService.bulkDelete(workspaceId, notificationIds)
        return httpResponse(req, res, 200, 'Notifications deleted successfully', result)
    } catch (error) {
        return httpError(next, error, req)
    }
}
