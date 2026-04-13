import express, { NextFunction, Request, Response } from "express";
import AuthController from "./auth.controller";
import LoginValidationSchema from "./auth.validation";
import validationRequest from "../../middlewares/validationRequest";
import { USER_ROLE } from "../user/user.constant";
import auth from "../../middlewares/auth";
import upload from "../../utils/uploadFile";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";

const router = express.Router();

router.post(
  "/login_user",
  validationRequest(LoginValidationSchema.LoginSchema),
  AuthController.loginUser
);

router.post(
  "/login_with_google",
  validationRequest(LoginValidationSchema.googleLoginSchema),
  AuthController.googleLogin
);

router.post(
  "/refresh-token",
  validationRequest(LoginValidationSchema.requestTokenValidationSchema),
  AuthController.refreshToken
);

router.get(
  "/myprofile",
  auth(
    USER_ROLE.admin,
    USER_ROLE.user,
    USER_ROLE.superadmin,
    USER_ROLE.staff_port,
    USER_ROLE.staff_warehouse,
    USER_ROLE.staff_airport,
    USER_ROLE.driver,
    USER_ROLE.helper
  ),
  AuthController.myprofile
);

// Routes file
router.patch(
  "/update_my_profile",
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
  upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.body.data && typeof req.body.data === "string") {
        req.body = JSON.parse(req.body.data);
      }
      next();
    } catch (error) {
      next(new AppError(httpStatus.BAD_REQUEST, "Invalid JSON data", ""));
    }
  },
  validationRequest(LoginValidationSchema.changeMyProfileSchema),
  AuthController.chnageMyProfile
);

router.get(
  "/find_by_admin_all_users",
  auth(USER_ROLE.admin, USER_ROLE.superadmin),
  AuthController.findByAllUsersAdmin
);

router.get(
  "/get_single_user/:id",
  auth(USER_ROLE.admin, USER_ROLE.superadmin),
  AuthController.getSingleUserById
);

router.delete(
  "/delete_account/:id",
  auth(USER_ROLE.user, USER_ROLE.admin, USER_ROLE.superadmin),
  AuthController.deleteAccount
);

//  changeUserAccountStatus

router.patch(
  "/change_status/:id",
  auth(USER_ROLE.admin, USER_ROLE.superadmin),
  validationRequest(LoginValidationSchema.changeUserAccountStatus),
  AuthController.isBlockAccount
);

router.post(
  "/create-staff",
  auth(USER_ROLE.admin, USER_ROLE.superadmin),
  AuthController.createStaff
);

router.get(
  "/find_by_all_admin",
  auth(USER_ROLE.admin, USER_ROLE.superadmin),
  AuthController.find_by_all_admin
);




const AuthRouter = router;
export default AuthRouter;
