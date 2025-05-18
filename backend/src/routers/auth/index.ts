import { Router } from 'express'
import { authController } from '../../controllers/auth/auth.controller'
import { authMiddleware } from '../../middleware/auth.middleware'
import { decryptPayload } from '../../middleware/decrypt-payload'
import roleRestriction from '../../middleware/roleRestriction'
import { Role } from '@prisma/client'
import passwordResetRouter from './password-reset'
import upload from '../../config/multerConfig'

const router = Router()

// Authentication routes
router.post('/signup', decryptPayload, authController.signup)
router.post('/signin', decryptPayload, authController.signin)
router.post('/refresh-token', authController.refreshToken)
router.post('/logout', authMiddleware, authController.logout)

// User management
router.get('/userRoles', authMiddleware, authController.userRoles)
router.get('/userDetails', authMiddleware, authController.getUserDetails)
router.put('/user/:id', authMiddleware, upload.single('profileImageFile'), authController.UpdateProfile)
router.delete('/address/:addressId', authMiddleware, authController.deleteAddress)
router.put('/address/:addressId', authMiddleware, authController.updateAddress)
router.post('/address', authMiddleware, authController.addAddress)
// Sub-routes
router.use('/', passwordResetRouter)

export default router
