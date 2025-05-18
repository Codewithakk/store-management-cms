import { Router } from 'express'
import { createCheckoutSession, orderConfirmation, paymentCancelled, paymentSuccess, stripeconfirmation } from '../../../controllers/payment/payment.controller'
import { handleStripeWebhook } from '../../../controllers/webhookController'
import express from 'express';

const router = Router()

router.post('/checkout', createCheckoutSession); // Initiates Stripe Checkout
router.get('/payment-success', paymentSuccess);
router.get('/payment-cancelled', paymentCancelled);
router.get('/order-confirmation', orderConfirmation);
router.get('/stripe/verify-stripe-session', stripeconfirmation);


router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook); // Stripe Webhook

export default router
