import { Router } from "express";
import PaymentController from "./payment.controller";
import auth from "../../middlewares/auth";
import { USER_ROLE } from "../user/user.constant";

const router = Router();

// Cart payment routes (require authentication - user ID from JWT) 
// by card of stripe
router.post(
  "/cart/create-checkout-session",
  auth(
    USER_ROLE.user,
    USER_ROLE.admin,
    USER_ROLE.superadmin,
    USER_ROLE.staff_port,
    USER_ROLE.staff_warehouse,
    USER_ROLE.staff_airport,
    USER_ROLE.driver,
    USER_ROLE.helper
  ),
  PaymentController.createCartCheckoutSession
);

// by google pay stripe
router.post(
  "/cart/create-checkout-session-by-google-pay-stripe",
  auth(
    USER_ROLE.user,
    USER_ROLE.admin,
    USER_ROLE.superadmin,
    USER_ROLE.staff_port,
    USER_ROLE.staff_warehouse,
    USER_ROLE.staff_airport,
    USER_ROLE.driver,
    USER_ROLE.helper
  ),
  PaymentController.createGooglePayCheckoutSession
);

// by apple pay stripe
router.post(
  "/cart/create-checkout-session-by-apple-pay-stripe",
  auth(
    USER_ROLE.user,
    USER_ROLE.admin,
    USER_ROLE.superadmin,
    USER_ROLE.staff_port,
    USER_ROLE.staff_warehouse,
    USER_ROLE.staff_airport,
    USER_ROLE.driver,
    USER_ROLE.helper
  ),
  PaymentController.createApplePayCheckoutSession
);

// get available payment methods
router.get(
  "/available-payment-methods",
  auth(
    USER_ROLE.user,
    USER_ROLE.admin,
    USER_ROLE.superadmin,
    USER_ROLE.staff_port,
    USER_ROLE.staff_warehouse,
    USER_ROLE.staff_airport,
    USER_ROLE.driver,
    USER_ROLE.helper
  ),
  PaymentController.getAvailablePaymentMethods
);

// user will choose the payment method provided by stripe
router.post(
  "/cart/create-checkout-session-by-multiple-payments-stripe",
  auth(
    USER_ROLE.user,
    USER_ROLE.admin,
    USER_ROLE.superadmin,
    USER_ROLE.staff_port,
    USER_ROLE.staff_warehouse,
    USER_ROLE.staff_airport,
    USER_ROLE.driver,
    USER_ROLE.helper
  ),
  PaymentController.createMultiplePaymentCheckoutSession
);

// Direct payment route (require authentication - for Stripe.js frontend integration)
router.post(
  "/direct-payment",
  auth(
    USER_ROLE.user,
    USER_ROLE.admin,
    USER_ROLE.superadmin,
    USER_ROLE.staff_port,
    USER_ROLE.staff_warehouse,
    USER_ROLE.staff_airport,
    USER_ROLE.driver,
    USER_ROLE.helper
  ),
  PaymentController.createDirectPayment
);

// Protected routes (require authentication)
router.post(
  "/confirm-payment",
  auth(
    USER_ROLE.user,
    USER_ROLE.admin,
    USER_ROLE.superadmin,
    USER_ROLE.staff_port,
    USER_ROLE.staff_warehouse,
    USER_ROLE.staff_airport,
    USER_ROLE.driver,
    USER_ROLE.helper
  ),
  PaymentController.confirmPayment
);
router.post(
  "/refund",
  auth(
    USER_ROLE.user,
    USER_ROLE.admin,
    USER_ROLE.superadmin,
    USER_ROLE.staff_port,
    USER_ROLE.staff_warehouse,
    USER_ROLE.staff_airport,
    USER_ROLE.driver,
    USER_ROLE.helper
  ),
  PaymentController.refundPayment
);

// Webhook endpoint (no auth middleware for Stripe webhooks)
router.post("/webhook", PaymentController.webhookHandler);

export default router;
