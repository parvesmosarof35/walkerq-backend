import { Model } from "mongoose";
import { USER_ROLE } from "./user.constant";

export interface UserResponse {
  status: boolean;
  message: string;
}

export type TUser = {
  id: string;
  role:
    | "user"
    | "admin"
    | "superadmin"
    | "staff_port"
    | "staff_warehouse"
    | "staff_airport"
    | "driver"
    | "helper";
  gender: "Male" | "Female" | "Others";
  fullname: string;
  password: string;
  email: string;
  phoneNumber?: string;
  verificationCode: number;
  isVerify: boolean;
  status: "isProgress" | "Blocked";
  photo?: string;
  photoPublicId?: string;
  stripeAccountId?: string;
  isStripeConnected?: boolean;
  fcmTokens?: string[];
  address?: string;
  sessionId?: string;
  isDelete: boolean;
  latitude?: number;
  longitude?: number;
};

export interface UserModel extends Model<TUser> {
  isUserExistByCustomId(id: string): Promise<TUser>;

  isPasswordMatched(
    userSendingPassword: string,
    existingPassword: string
  ): Promise<boolean>;
  isJWTIssuesBeforePasswordChange(
    passwordChangeTimestamp: Date,
    jwtIssuesTime: number
  ): Promise<boolean>;
}

export type TUserRole = keyof typeof USER_ROLE;
