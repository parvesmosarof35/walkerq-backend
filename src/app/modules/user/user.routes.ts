import express from "express";
import UserValidationSchema from "./user.validation";
import UserController from "./user.controller";

import { USER_ROLE } from "./user.constant";
import validationRequest from "../../middlewares/validationRequest";
import auth from "../../middlewares/auth";

const router = express.Router();

// Create user (Admin creation) - Restricted to Super Admin
router.post(
  "/create_user",
  auth(USER_ROLE.superadmin),
  validationRequest(UserValidationSchema.createUserZodSchema),
  UserController.createUser
);

router.patch(
  "/user_verification",
  validationRequest(UserValidationSchema.UserVerification),
  UserController.userVarification
);

router.patch(
  "/change_password",
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
  validationRequest(UserValidationSchema.ChnagePasswordSchema),
  UserController.chnagePassword
);

router.post(
  "/forgot_password",
  validationRequest(UserValidationSchema.ForgotPasswordSchema),
  UserController.forgotPassword
);

router.post(
  "/verification_forgot_user",
  validationRequest(UserValidationSchema.verificationCodeSchema),
  UserController.verificationForgotUser
);

router.post(
  "/reset_password",
  validationRequest(UserValidationSchema.resetPasswordSchema),
  UserController.resetPassword
);

router.get(
  "/find_by_user_growth",
  auth(USER_ROLE.admin, USER_ROLE.superadmin),
  UserController.getUserGrowth
);

router.get(
  "/recently_joined_user",
  auth(USER_ROLE.admin, USER_ROLE.superadmin),
  UserController.recently_joined_user
);
router.delete(
  "/delete_user/:id",
  auth(USER_ROLE.superadmin),
  UserController.deleteAllTypesOfUser
);


router.patch(
  "/update_user/:id",
  auth(USER_ROLE.admin, USER_ROLE.superadmin),
  UserController.updateUser
);

router.patch(
  "/update_location",
  auth(
    USER_ROLE.admin,
    USER_ROLE.superadmin,
    USER_ROLE.staff_port,
    USER_ROLE.staff_warehouse,
    USER_ROLE.staff_airport,
    USER_ROLE.driver,
    USER_ROLE.helper
  ),
  UserController.updateLocation
);

// user Growth
// Recently Joined Users

const UserRouters = router;
export default UserRouters;
