import express from 'express';
import LuggageController from './luggage.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';

const router = express.Router();

/**
 * Intelligent Rack Allocation
 */
router.post(
  '/allocate-rack/:luggageId',
  auth(USER_ROLE.admin, USER_ROLE.superadmin, USER_ROLE.staff_warehouse),
  LuggageController.allocateSmartRack
);

/**
 * Real-time Tracking
 * Allows users to see where their luggage is based on the assigned driver/batch
 */
router.get(
  '/track/:luggageId',
  auth(USER_ROLE.user, USER_ROLE.admin, USER_ROLE.superadmin),
  LuggageController.trackLuggage
);

const LuggageRoutes = router;
export default LuggageRoutes;
