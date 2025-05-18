import { Router } from 'express'
import { Role } from '@prisma/client'
import roleRestriction from '../../../middleware/roleRestriction'
import variantController from '../../../controllers/variants/variant.controller'
import { authMiddleware } from '../../../middleware/auth.middleware'
const router = Router()

/**
 * Variant Management
 */
router.post('/:workspaceId/products/:productId/variants', authMiddleware, roleRestriction([Role.ADMIN, Role.MANAGER]), variantController.addVariants)

router.put('/:productId/variants/:variantId', authMiddleware, roleRestriction([Role.ADMIN, Role.MANAGER]), variantController.updateVariants)

router.delete('/:productId/variants/:variantId', authMiddleware, roleRestriction([Role.ADMIN, Role.MANAGER]), variantController.deleteVariant)

router.get('/variants/:productId', authMiddleware, roleRestriction([Role.ADMIN, Role.MANAGER, Role.STAFF]), variantController.getVariantsByProduct)

export default router
