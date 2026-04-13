import { Router } from 'express';
import OrderController from './order.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';

const router = Router();

// Public routes (if needed for guest checkout)
// router.post('/guest', OrderController.createGuestOrder);

// Protected routes (require authentication)
router.post(
  '/create',
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
  OrderController.createOrder
);
router.get(
  '/my-orders/:customerId',
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
  OrderController.getOrdersByCustomerId
);
router.get(
  '/:orderId',
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
  OrderController.getOrderById
);

// Admin / Staff routes
router.get(
  '/',
  auth(USER_ROLE.admin, USER_ROLE.superadmin, USER_ROLE.staff_airport, USER_ROLE.staff_port, USER_ROLE.staff_warehouse),
  OrderController.getAllOrders
);
router.patch(
  '/:orderId/status',
  auth(USER_ROLE.admin, USER_ROLE.superadmin, USER_ROLE.staff_airport, USER_ROLE.staff_port, USER_ROLE.staff_warehouse),
  OrderController.updateOrderStatus
);
router.patch(
  '/:orderId/payment-status',
  auth(USER_ROLE.admin, USER_ROLE.superadmin),
  OrderController.updatePaymentStatus
);
router.patch(
  '/:orderId/cancel',
  auth(USER_ROLE.user, USER_ROLE.admin, USER_ROLE.superadmin),
  OrderController.cancelOrder
);

export default router;