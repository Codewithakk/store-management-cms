import { NextFunction, Request, Response } from 'express'
import httpResponse from '../../util/httpResponse';
import { categoryService } from '../../services/category.service';
import { deleteFromCache, getFromCache, setToCache } from '../../util/redis.utils';
import httpError from '../../util/httpError';
import { RedisTTL } from '../../cache/redisClient';

// Cache key generators
const getWorkspaceCacheKey = (userId: string) => `workspaces:${userId}`;
const getAdminWorkspacesCacheKey = (userId: string) => `admin:workspaces:${userId}`;
const getCategoriesCacheKey = (workspaceId: number) => `workspace:${workspaceId}:categories`;

// Create Category
export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
    const { workspaceId } = req.params
    const userId = req.user?.userId
    if (!userId) {
        return httpResponse(req, res, 401, 'Unauthorized: Missing user ID.', null)
    }
    try {
        // Ensure workspaceId is a valid number
        const parsedWorkspaceId = Number(workspaceId)
        if (isNaN(parsedWorkspaceId)) {
            return httpResponse(req, res, 400, 'Invalid workspaceId')
        }

        const category = await categoryService.createCategory(parsedWorkspaceId, req.body)
        // Invalidate relevant caches
        await Promise.all([
            deleteFromCache(getWorkspaceCacheKey(userId)),
            deleteFromCache(getAdminWorkspacesCacheKey(userId)),
            deleteFromCache(getCategoriesCacheKey(parsedWorkspaceId))
        ]);

        return httpResponse(req, res, 201, 'Category created successfully', category)
    } catch (err) {
        return httpError(next, err, req)
    }
}

// Get Categories in a Workspace
export const getCategoriesInWorkspace = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const workspaceId = Number(req.params.workspaceId);
    const userId = req.user?.userId
    if (!userId) {
        return httpResponse(req, res, 401, 'Unauthorized: Missing user ID.', null)
    }
    try {
        if (isNaN(workspaceId)) {
            return httpError(next, new Error('Invalid workspaceId'), req, 400)
        }
        const cacheKey = getCategoriesCacheKey(workspaceId);
        const cachedData = await getFromCache(cacheKey);
        if (cachedData && typeof cachedData === 'string') {
            const parsed = JSON.parse(cachedData);
            return httpResponse(req, res, 200, 'Categories fetched from cache', parsed);
        }

        const categories = await categoryService.getCategoriesInWorkspace(workspaceId);
        await setToCache(cacheKey, JSON.stringify(categories), RedisTTL.ACCESS_TOKEN);

        return httpResponse(req, res, 200, 'Categories fetched successfully', categories);
    } catch (err) {
        return httpError(next, err, req)
    }
}

// Update Category
export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
    const { categoryId, workspaceId } = req.params
    const userId = req.user?.userId
    if (!userId) {
        return httpResponse(req, res, 401, 'Unauthorized: Missing user ID.', null)
    }
    try {
        if (!categoryId || !workspaceId) {
            return httpResponse(req, res, 400, 'Invalid categoryId or workspaceId')
        }

        const updatedCategory = await categoryService.updateCategory(categoryId, Number(workspaceId), req.body)

        await Promise.all([
            deleteFromCache(getWorkspaceCacheKey(userId)),
            deleteFromCache(getAdminWorkspacesCacheKey(userId)),
            deleteFromCache(getCategoriesCacheKey(Number(workspaceId)))
        ]);
        return httpResponse(req, res, 200, 'Category updated successfully', updatedCategory)
    } catch (err) {
        return httpError(next, err, req)
    }
}

// Delete Category
export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
    const { categoryId, workspaceId } = req.params
    const userId = req.user?.userId
    if (!userId) {
        return httpResponse(req, res, 401, 'Unauthorized: Missing user ID.', null)
    }
    try {
        if (!categoryId || !workspaceId) {
            return httpResponse(req, res, 400, 'Invalid categoryId or workspaceId')
        }
        const deletedCategory = await categoryService.deleteCategory(categoryId, Number(workspaceId))
        await Promise.all([
            deleteFromCache(getWorkspaceCacheKey(userId)),
            deleteFromCache(getAdminWorkspacesCacheKey(userId)),
            deleteFromCache(getCategoriesCacheKey(Number(workspaceId)))
        ]);
        return httpResponse(req, res, 200, 'Category deleted successfully', deletedCategory)
    } catch (err) {
        return httpError(next, err, req)
    }
}
