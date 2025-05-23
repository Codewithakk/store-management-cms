import { Router } from 'express'
import { Role } from '@prisma/client'

import { authMiddleware } from '../../middleware/auth.middleware'
import roleRestriction from '../../middleware/roleRestriction'

import {
  createProduct,
  getProductsInWorkspace,
  updateProduct,
  deleteProduct,
  getProductById,
  getProductBySlug,
  toggleProductStatus,
  getProductStats,
  updateVariants,
  bulkUploadProducts,
  bulkDeleteProducts,
  checkSlugAvailability,
  getProductVariants,
  getProducts
} from '../../controllers/product/product.controller'

import upload from '../../config/multerConfig'
import variantController from '../../controllers/variants/variant.controller'

const router = Router()

/**
 * Product CRUD
 */
router.post('/:workspaceId/:categoryId', authMiddleware, upload.array('images'), roleRestriction([Role.ADMIN, Role.MANAGER]), createProduct)
router.get('/:workspaceId', authMiddleware, getProductsInWorkspace)
router.put('/:workspaceId/:productId', authMiddleware, roleRestriction([Role.ADMIN, Role.MANAGER]), updateProduct)
router.delete('/:workspaceId/:productId', authMiddleware, roleRestriction([Role.ADMIN, Role.MANAGER]), deleteProduct)
router.delete('/products/:workspaceId', authMiddleware, roleRestriction([Role.ADMIN]), bulkDeleteProducts)

/**
 * Product Status & Variants
 */
router.patch('/:productId/status', authMiddleware, roleRestriction([Role.ADMIN]), toggleProductStatus)
router.patch('/:productId/variants', authMiddleware, roleRestriction([Role.ADMIN, Role.MANAGER]), updateVariants)

/**
 * Product Details
 */
router.get('/single/:productId', authMiddleware, getProductById)
router.get('/slug/:slug', authMiddleware, getProductBySlug)
router.get('/:workspaceId/:productId/variants', authMiddleware, getProductVariants)

/**
 * Bulk & Stats
 */
router.post('/:workspaceId/bulk', authMiddleware, roleRestriction([Role.ADMIN]), bulkUploadProducts)
router.get('/:workspaceId/stats', authMiddleware, roleRestriction([Role.ADMIN, Role.MANAGER]), getProductStats)

/**
 * Search & Slug Check
 */
router.get('/:workspaceId/search', authMiddleware, getProducts)
router.get('/:workspaceId/check-slug/:slug', authMiddleware, checkSlugAvailability)

/**
 * Variant Management
 */
router.post('/:workspaceId/products/:productId/variants', authMiddleware, roleRestriction([Role.ADMIN, Role.MANAGER]), variantController.addVariants)

router.put('/:productId/variants/:variantId', authMiddleware, roleRestriction([Role.ADMIN, Role.MANAGER]), variantController.updateVariants)

router.delete('/:productId/variants/:variantId', authMiddleware, roleRestriction([Role.ADMIN, Role.MANAGER]), variantController.deleteVariant)

router.get('/variants/:productId', authMiddleware, roleRestriction([Role.ADMIN, Role.MANAGER, Role.STAFF]), variantController.getVariantsByProduct)

export default router
