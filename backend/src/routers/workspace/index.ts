// import { Router } from 'express'
// import { Role } from '@prisma/client'
// import upload from '../../config/multerConfig'
// import { authMiddleware } from '../../middleware/auth.middleware'
// import roleRestriction from '../../middleware/roleRestriction'
// import {
//     createWorkspace,
//     updateWorkspace,
//     getWorkspaceUsers,
//     getAdminWorkspaces,
//     toggleWorkspaceStatus,
//     getWorkspacesByUserId,
//     exportWorkspaceData,
//     searchWorkspaces,
//     allDeleteWorkspace,
//     deleteWorkspaceById,
//     createWorkspaceWithAssignRole
// } from '../../controllers/workspace.controller'
// import invitationRouter from './invitation'
// import rolePermissionRouter from './role-permission'
// const router = Router()

// // Workspace CRUD
// router.post('/', authMiddleware, roleRestriction([Role.ADMIN]), upload.array('images'), createWorkspace)

// router.post('/createWorkspace', authMiddleware, upload.array('images'), createWorkspaceWithAssignRole)

// router.put('/:workspaceId', authMiddleware, roleRestriction([Role.ADMIN]), upload.array('images'), updateWorkspace)

// router.delete('/', authMiddleware, roleRestriction([Role.ADMIN]), allDeleteWorkspace)

// router.delete('/:workspaceId', authMiddleware, roleRestriction([Role.ADMIN]), deleteWorkspaceById)

// // Workspace Status
// router.patch('/:workspaceId/status', authMiddleware, roleRestriction([Role.ADMIN]), toggleWorkspaceStatus)

// // Workspace Queries
// router.get('/', authMiddleware, searchWorkspaces)

// router.get('/admin', authMiddleware, getAdminWorkspaces)

// router.get('/user/:userId/workspaces', authMiddleware, roleRestriction([Role.ADMIN]), getWorkspacesByUserId)

// router.get('/:workspaceId/export', authMiddleware, roleRestriction([Role.ADMIN]), exportWorkspaceData)

// // User Management
// router.get('/:workspaceId/users', authMiddleware, getWorkspaceUsers)

// // Sub-routes
// router.use('/', invitationRouter)
// router.use('/', rolePermissionRouter)

// export default router

import { Router } from 'express'
import { Role } from '@prisma/client'
import upload from '../../config/multerConfig'
import { authMiddleware } from '../../middleware/auth.middleware'
import roleRestriction from '../../middleware/roleRestriction'
import {
  createWorkspace,
  updateWorkspace,
  getWorkspaceUsers,
  getAdminWorkspaces,
  toggleWorkspaceStatus,
  getWorkspacesByUserId,
  exportWorkspaceData,
  searchWorkspaces,
  allDeleteWorkspace,
  deleteWorkspaceById,
  createWorkspaceWithAssignRole
} from '../../controllers/workspace/workspace.controller'
import invitationRouter from './invitation'
import rolePermissionRouter from './role-permission'

import { getWorkspaceDashboardSummary } from '../../controllers/manager/dashboard.controller'

const router = Router()

// Workspace CRUD - with cache invalidation
router.post('/',
  authMiddleware,
  roleRestriction([Role.ADMIN]),
  upload.array('images'),
  createWorkspace,

)

router.post('/createWorkspace',
  authMiddleware,
  upload.array('images'),
  createWorkspaceWithAssignRole,
)

router.put('/:workspaceId',
  authMiddleware,
  roleRestriction([Role.ADMIN]),
  upload.array('images'),
  updateWorkspace,
)

router.delete('/',
  authMiddleware,
  roleRestriction([Role.ADMIN]),
  allDeleteWorkspace,
)

router.delete('/:workspaceId',
  authMiddleware,
  roleRestriction([Role.ADMIN]),
  deleteWorkspaceById,
)

// Workspace Status - with cache invalidation
router.patch('/:workspaceId/status',
  authMiddleware,
  roleRestriction([Role.ADMIN]),
  toggleWorkspaceStatus,
)

// Workspace Queries - with caching
router.get('/',
  authMiddleware,
  searchWorkspaces
)

router.get('/admin',
  authMiddleware,
  getAdminWorkspaces
)

router.get('/user/:userId/workspaces',
  authMiddleware,
  roleRestriction([Role.ADMIN]),
  getWorkspacesByUserId
)

router.get('/:workspaceId/export',
  authMiddleware,
  roleRestriction([Role.ADMIN]),
  exportWorkspaceData
) // No caching for exports

// User Management - with caching
router.get('/:workspaceId/users',
  authMiddleware,
  getWorkspaceUsers
)

router.get('/:workspaceId', authMiddleware, getWorkspaceDashboardSummary);
// Sub-routes
router.use('/', invitationRouter)
router.use('/', rolePermissionRouter)

export default router