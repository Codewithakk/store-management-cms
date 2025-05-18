import { NextFunction, Request, Response } from 'express'
import { ProductInput, ProductVariantInput } from '../../types/product'
import httpResponse from '../../util/httpResponse'
import { productService } from '../../services/product.service'
import { deleteFromCache, getFromCache, setToCache } from '../../util/redis.utils'
import httpError from '../../util/httpError'
import { RedisTTL } from '../../cache/redisClient'
import prisma from '../../util/prisma'
// Cache key generators
const getWorkspaceCacheKey = (userId: string) => `workspaces:${userId}`
const getAdminWorkspacesCacheKey = (userId: string) => `admin:workspaces:${userId}`
const getCategoriesCacheKey = (workspaceId: number) => `workspace:${workspaceId}:categories`
const getProductsCacheKey = (workspaceId: number) => `workspace:${workspaceId}:products`

export const createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { categoryId } = req.params
    const workspaceId = parseInt(req.params.workspaceId)
    const { name, description } = req.body
    const images = req.files ? (req.files as Express.Multer.File[]).map((file) => file.path) : []
    let parsedVariants: ProductVariantInput[] = []
    try {
        parsedVariants =
            typeof req.body.variants === 'string' ? JSON.parse(req.body.variants) : Array.isArray(req.body.variants) ? req.body.variants : []
    } catch (e) {
        return httpResponse(req, res, 400, 'Invalid variants JSON format')
    }

    if (isNaN(workspaceId)) {
        return httpResponse(req, res, 400, 'Invalid workspaceId')
    }

    try {
        if (!name?.trim()) {
            return httpResponse(req, res, 400, 'Product name is required')
        }
        if (!description?.trim()) {
            return httpResponse(req, res, 400, 'Product description is required')
        }

        const productInput: ProductInput = {
            name,
            description,
            isActive: true,
            images,
            variants: parsedVariants
        }

        const product = await productService.createProduct(workspaceId, categoryId, productInput)

        // Await cache invalidation
        await Promise.all([
            deleteFromCache(getWorkspaceCacheKey(req.user?.userId as string)),
            deleteFromCache(getAdminWorkspacesCacheKey(req.user?.userId as string)),
            deleteFromCache(getCategoriesCacheKey(workspaceId)),
            deleteFromCache(getProductsCacheKey(workspaceId))
        ])
        return httpResponse(req, res, 201, 'Product created', product)
    } catch (err) {
        return httpError(next, err, req, 400)
    }
}

export const getProductsInWorkspace = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { workspaceId } = req.params
    const page = parseInt(req.query.page as string) || 1 // Default to page 1
    const pageSize = parseInt(req.query.pageSize as string) || 10 // Default to 10 products per page

    if (isNaN(page) || isNaN(pageSize)) {
        return httpError(next, new Error('Invalid page or pageSize'), req, 400)
    }
    if (isNaN(Number(workspaceId))) {
        return httpError(next, new Error('Invalid workspaceId'), req, 400)
    }

    try {
        const products = await productService.getProductsInWorkspace(Number(workspaceId), page, pageSize)
        return httpResponse(req, res, 201, 'Products', products)
    } catch (err) {
        return httpError(next, err, req)
    }
}

export const updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { workspaceId, productId } = req.params
    try {
        const updatedProduct = await productService.updateProduct(Number(workspaceId), productId, req.body)

        // Await cache invalidation
        await Promise.all([
            deleteFromCache(getWorkspaceCacheKey(req.user?.userId as string)),
            deleteFromCache(getAdminWorkspacesCacheKey(req.user?.userId as string)),
            deleteFromCache(getCategoriesCacheKey(Number(workspaceId))),
            deleteFromCache(getProductsCacheKey(Number(workspaceId))),
            deleteFromCache(`product:${productId}`),
            deleteFromCache(`product:slug:${updatedProduct?.slug}`)
        ])

        return httpResponse(req, res, 200, 'Product updated', updatedProduct)

        httpResponse(req, res, 200, 'Product updated', updatedProduct)
    } catch (err) {
        httpError(next, err, req, 400)
    }
}

export const deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { workspaceId, productId } = req.params
    try {
        const deletedProduct = await productService.deleteProduct(Number(workspaceId), productId)

        // Await cache invalidation
        await Promise.all([
            deleteFromCache(getWorkspaceCacheKey(req.user?.userId as string)),
            deleteFromCache(getAdminWorkspacesCacheKey(req.user?.userId as string)),
            deleteFromCache(getCategoriesCacheKey(Number(workspaceId))),
            deleteFromCache(getProductsCacheKey(Number(workspaceId))),
            deleteFromCache(`product:${productId}`),
            deleteFromCache(`product:slug:${deletedProduct.message}`)
        ])
        return httpResponse(req, res, 204, 'Product deleted', deletedProduct)
    } catch (err) {
        return httpError(next, err, req, 400)
    }
}

export const bulkDeleteProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { workspaceId } = req.params
    const { productIds } = req.body // Expecting an array of product IDs in the body

    try {
        if (!Array.isArray(productIds) || productIds.length === 0) {
            return httpError(next, new Error('Product IDs array is required'), req, 400)
        }
        const deletedProducts = await productService.bulkDeleteProducts(Number(workspaceId), productIds)

        // Prepare cache keys to delete
        const cacheKeysToDelete = [
            getWorkspaceCacheKey(req.user?.userId as string),
            getAdminWorkspacesCacheKey(req.user?.userId as string),
            getCategoriesCacheKey(Number(workspaceId)),
            getProductsCacheKey(Number(workspaceId)),
            ...(Array.isArray(deletedProducts) ? deletedProducts.map(p => `product:${p.id}`) : []),
            ...(Array.isArray(deletedProducts) ? deletedProducts.map(p => `product:slug:${p.slug}`) : [])
        ]

        // Await cache invalidation
        await Promise.all(cacheKeysToDelete.map(key => deleteFromCache(key)))
        await productService.bulkDeleteProducts(Number(workspaceId), productIds)
        return httpResponse(req, res, 204, 'Products deleted successfully')
    } catch (err) {
        return httpError(next, err, req, 400)
    }
}

export const getProductById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { productId } = req.params
        const cacheKey = `product:${productId}`

        const cachedProduct = await getFromCache(cacheKey)
        if (cachedProduct) {
            try {
                const parsed = JSON.parse(cachedProduct as string)
                return httpResponse(req, res, 200, 'Product fetched from cache', parsed)
            } catch (e) {
                console.error('Error parsing cached product:', e)
            }
        }
        const product = await productService.getProductById(productId)
        if (!product) {
            return httpError(next, new Error('Product not found'), req, 404)
        }

        await setToCache(cacheKey, JSON.stringify(product), RedisTTL.ONE_DAY)
        return httpResponse(req, res, 200, 'Product fetched', product)
    } catch (err) {
        return httpError(next, err, req, 400)
    }
}

export const getProductBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { slug } = req.params
        const cacheKey = `product:slug:${slug}`

        const cachedProduct = await getFromCache(cacheKey)
        if (cachedProduct) {
            try {
                const parsed = JSON.parse(cachedProduct as string)
                return httpResponse(req, res, 200, 'Product by slug fetched from cache', parsed)
            } catch (e) {
                console.error('Error parsing cached product:', e)
            }
        }
        const product = await productService.getProductBySlug(slug)
        if (!product) {
            return httpError(next, new Error('Product not found'), req, 404)
        }

        await setToCache(cacheKey, JSON.stringify(product), RedisTTL.ONE_DAY)
        return httpResponse(req, res, 200, 'Product by slug fetched', product)
    } catch (err) {
        return httpError(next, err, req, 400)
    }
}

export const toggleProductStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { productId } = req.params
        // const product = await findProductById(productId);

        // if (!product) {
        //   return httpError(next, 'Product not found', req, 404);
        // }
        const updatedProduct = await productService.toggleProductStatus(productId)
        if (!updatedProduct) {
            return httpError(next, new Error('Product not found'), req, 404)
        }

        // Await cache invalidation
        await Promise.all([
            deleteFromCache(getWorkspaceCacheKey(req.user?.userId as string)),
            deleteFromCache(getAdminWorkspacesCacheKey(req.user?.userId as string)),
            deleteFromCache(`product:${productId}`),
            deleteFromCache(`product:slug:${updatedProduct.slug}`)
        ])
        return httpResponse(req, res, 200, 'Product status toggled', updatedProduct)
    } catch (err) {
        return httpError(next, err, req)
    }
}

export const getProductStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { workspaceId } = req.params
        const cacheKey = `product:stats:${workspaceId}`

        const cachedStats = await getFromCache(cacheKey)
        if (cachedStats) {
            try {
                const parsed = JSON.parse(cachedStats as string)
                return httpResponse(req, res, 200, 'Product stats fetched from cache', parsed)
            } catch (e) {
                console.error('Error parsing cached stats:', e)
            }
        }
        const stats = await productService.getProductStats(Number(workspaceId))
        if (!stats) {
            return httpError(next, new Error('Stats not found'), req, 404)
        }

        await setToCache(cacheKey, JSON.stringify(stats), RedisTTL.ONE_HOUR)
        return httpResponse(req, res, 200, 'Product stats fetched', stats)
    } catch (err) {
        return httpError(next, err, req, 400)
    }
}

export const updateVariants = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { productId } = req.params
        const product = await prisma.product.findUnique({
            where: { id: productId }
        })

        if (!product) {
            throw new Error(`Product with ID ${productId} not found`)
        }
        const updated = await productService.updateVariants(productId, req.body.variants)

        // Await cache invalidation
        await Promise.all([
            deleteFromCache(getWorkspaceCacheKey(req.user?.userId as string)),
            deleteFromCache(getAdminWorkspacesCacheKey(req.user?.userId as string)),
            deleteFromCache(`product:${productId}`),
            deleteFromCache(`product:slug:${product.slug}`),
            deleteFromCache(`product:variants:${productId}`)
        ])
        return httpResponse(req, res, 200, 'Variants updated', updated)
    } catch (err) {
        return httpError(next, err, req, 400)
    }
}

export const bulkUploadProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { workspaceId } = req.params

    try {
        const numericWorkspaceId = Number(workspaceId)

        if (isNaN(numericWorkspaceId)) {
            throw new Error('workspaceId must be a number')
        }

        const products = req.body

        if (!Array.isArray(products) || products.length === 0) {
            throw new Error('Product list is empty or invalid')
        }

        const createdProducts = await productService.bulkUploadProducts(numericWorkspaceId, products)
        // Await cache invalidation
        await Promise.all([
            deleteFromCache(getWorkspaceCacheKey(req.user?.userId as string)),
            deleteFromCache(getAdminWorkspacesCacheKey(req.user?.userId as string)),
            deleteFromCache(getCategoriesCacheKey(numericWorkspaceId)),
            deleteFromCache(getProductsCacheKey(numericWorkspaceId))
        ])

        return httpResponse(req, res, 201, 'Products uploaded successfully', createdProducts)
        httpResponse(req, res, 201, 'Products uploaded successfully', createdProducts)
    } catch (err) {
        return httpError(next, err, req, 400)
    }
}

export const getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { workspaceId } = req.params
        const { page = '1', limit = '10' } = req.query

        const parsedWorkspaceId = parseInt(workspaceId, 10)
        const parsedPage = parseInt(page as string, 10)
        const parsedLimit = parseInt(limit as string, 10)
        if (!parsedWorkspaceId || !parsedPage || !parsedLimit) {
            return httpError(next, new Error('Invalid input'), req, 400)
        }

        const skip = (parsedPage - 1) * parsedLimit

        const products = await prisma.product.findMany({
            where: { workspaceId: parsedWorkspaceId },
            skip,
            take: parsedLimit
        })

        const total = await prisma.product.count({
            where: { workspaceId: parsedWorkspaceId }
        })

        return httpResponse(req, res, 200, 'Products fetched', products)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Something went wrong' })
    }
}

export const checkSlugAvailability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { slug, workspaceId } = req.params

        if (!slug || !workspaceId) {
            return httpError(next, new Error('Slug and workspaceId are required'), req, 400)
        }
        const isAvailable = await productService.checkSlugAvailability(slug, Number(workspaceId))
        return httpResponse(req, res, 200, 'Slug availability checked', { isAvailable })
    } catch (err) {
        return httpError(next, err, req, 400)
    }
}

export const getProductVariants = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { productId } = req.params
        const cacheKey = `product:variants:${productId}`

        const cachedVariants = await getFromCache(cacheKey)
        if (cachedVariants) {
            try {
                if (typeof cachedVariants === 'string') {
                    const parsed = JSON.parse(cachedVariants)
                    return httpResponse(req, res, 200, 'Product variants fetched from cache', parsed)
                }
            } catch (e) {
                console.error('Error parsing cached variants:', e)
            }
        }
        const variants = await productService.getProductVariants(productId)
        if (!variants) {
            return httpError(next, new Error('Variants not found'), req, 404)
        }

        await setToCache(cacheKey, JSON.stringify(variants), RedisTTL.ONE_HOUR)
        return httpResponse(req, res, 200, 'Product variants fetched', variants)
    } catch (err) {
        return httpError(next, err, req, 400)
    }
}
