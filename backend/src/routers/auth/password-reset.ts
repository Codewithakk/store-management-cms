import { Router } from 'express'
import { authController } from '../../controllers/auth/auth.controller'

const router = Router()

router.post('/forgot-password', authController.forgotPassword)
router.post('/verify-otp', authController.verifyOtp)
router.post('/reset-password', authController.resetPassword)

export default router
