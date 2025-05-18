import { Router } from 'express'
import { Role } from '@prisma/client'

import {
    inviteUserToWorkspace,
    acceptInvite,
    removeUserFromWorkspace,
    changeInvitationStatus
} from '../../controllers/workspace/workspace.controller'
import roleRestriction from '../../middleware/roleRestriction'
import { authMiddleware } from '../../middleware/auth.middleware'

const router = Router()

router.post('/:workspaceId/invite', authMiddleware, roleRestriction([Role.ADMIN, Role.MANAGER]), inviteUserToWorkspace)

router.get('/invitation/accept/:invitetoken', acceptInvite)

router.delete('/:workspaceId/removeUser', authMiddleware, removeUserFromWorkspace)

router.patch('/invitations/:invitationId/:status', authMiddleware, roleRestriction([Role.ADMIN]), changeInvitationStatus)

export default router
