import { Router } from 'express'
import { Role } from '@prisma/client'
import { authMiddleware } from '../../middleware/auth.middleware'
import roleRestriction from '../../middleware/roleRestriction'
// import cacheMiddleware from '../../middleware/cache.middleware'
import { assignRolePermission, getRolePermissions, removeRolePermission } from '../../controllers/workspace/workspace.controller'
import CacheInvalidator from '../../middleware/cache.invalidator'
import { RedisTTL } from '../../cache/redisClient'
import cacheMiddleware from '../../middleware/cache.middleware'
import invalidateCache from '../../middleware/cache.invalidator'

const router = Router()

router.post('/:workspaceId/assignRolePermission',
  authMiddleware,
  roleRestriction([Role.ADMIN]),
  assignRolePermission,
)

router.get('/:workspaceId/roles/:role/permissions',
  authMiddleware,
  roleRestriction([Role.ADMIN]),
  getRolePermissions,
)

router.delete('/:workspaceId/roles/:role/permissions',
  authMiddleware,
  roleRestriction([Role.ADMIN]),
  removeRolePermission,
)

export default router