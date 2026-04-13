import mongoose from "mongoose";
import users from "../user/user.model";
import { USER_ACCESSIBILITY, USER_ROLE } from "../user/user.constant";
import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { jwtHelpers } from "../../helper/jwtHelpers";
import config from "../../config";
import { ProfileUpdateResponse, RequestWithFile } from "./auth.interface";
import QueryBuilder from "../../builder/QueryBuilder";
import { user_search_filed } from "./auth.constant";
import {
  deleteFromCloudinary,
  uploadImageToCloudinary,
} from "../../utils/cloudinary";
import fs from "fs";

const loginUserIntoDb = async (payload: {
  email: string;
  password: string;
  fcm?: string;
}) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const isUserExist = await users.findOne(
      {
        $and: [
          { email: payload.email },
          { isVerify: true },
          { status: USER_ACCESSIBILITY.isProgress },
          { isDelete: false },
        ],
      },
      { password: 1, _id: 1, isVerify: 1, email: 1, role: 1 },
      { session }
    );

    if (!isUserExist) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found", "");
    }

    const checkedFcm = await users.findOneAndUpdate(
      { email: payload.email },
      {
        $addToSet: {
          fcmTokens: payload?.fcm,
        },
      },
      { new: true, upsert: true, session }
    );

    if (!checkedFcm) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        "issues by the fcm token updatation",
        ""
      );
    }

    if (
      !(await users.isPasswordMatched(payload?.password, isUserExist.password))
    ) {
      throw new AppError(httpStatus.FORBIDDEN, "This Password Not Matched", "");
    }

    const jwtPayload = {
      id: isUserExist._id.toString(),
      role: isUserExist.role,
      email: isUserExist.email,
    };

    let accessToken: string | null = null;
    let refreshToken: string | null = null;

    if (isUserExist.isVerify) {
      accessToken = jwtHelpers.generateToken(
        jwtPayload,
        config.jwt_access_secret as string,
        config.expires_in as string
      );

      refreshToken = jwtHelpers.generateToken(
        jwtPayload,
        config.jwt_refresh_secret as string,
        config.refresh_expires_in as string
      );
    }
    await session.commitTransaction();

    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const refreshTokenIntoDb = async (token: string) => {
  if (!token) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Refresh Token is missing", "");
  }

  try {
    const decoded = jwtHelpers.verifyToken(
      token,
      config.jwt_refresh_secret as string
    );

    const { id } = decoded;

    const isUserExist = await users.findOne(
      {
        _id: id,
        isVerify: true,
        status: USER_ACCESSIBILITY.isProgress,
        isDelete: false,
      },
      { _id: 1, isVerify: 1, email: 1, role: 1 }
    );

    if (!isUserExist) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found or account inaccessible", "");
    }

    const jwtPayload = {
      id: isUserExist._id.toString(),
      role: isUserExist.role,
      email: isUserExist.email,
    };

    const accessToken = jwtHelpers.generateToken(
      jwtPayload,
      config.jwt_access_secret as string,
      config.expires_in as string
    );

    return {
      accessToken,
    };
  } catch (error: any) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Invalid or expired refresh token",
      error.message
    );
  }
};

const myprofileIntoDb = async (id: string) => {
  try {
    return await users
      .findById(id)
      .select("fullname email  address photo phoneNumber role");
  } catch (error: any) {
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      "issues by the get my profile section server  error",
      error
    );
  }
};

/**
 * @param req
 * @param id
 * @returns
 */
const changeMyProfileIntoDb = async (
  req: RequestWithFile,
  id: string
): Promise<ProfileUpdateResponse> => {
  try {
    const file = req.file;
    const { fullname, gender, address, phoneNumber } = req.body as {
      fullname?: string;
      gender?: string;
      address?: string;
      phoneNumber?: string;
    };

    const updateData: {
      fullname?: string;
      gender?: string;
      photo?: string;
      photoPublicId?: string;
      address?: string;
      phoneNumber?: string;
    } = {};

    if (fullname) updateData.fullname = fullname;
    if (gender) updateData.gender = gender;
    if (address) updateData.address = address;
    if (phoneNumber || phoneNumber === "") {
      updateData.phoneNumber = phoneNumber;
    }

    if (file) {
      const filePath = file.path.replace(/\\/g, "/");
      const existingUser = await users.findById(id).select("photoPublicId");
      const uploaded = await uploadImageToCloudinary(
        filePath,
        "profiles",
        "high"
      );

      updateData.photo = uploaded.secure_url;
      updateData.photoPublicId = uploaded.public_id;

      try {
        fs.unlinkSync(file.path);
      } catch {}

      try {
        if (existingUser?.photoPublicId) {
          await deleteFromCloudinary(existingUser.photoPublicId);
        }
      } catch {}
    }

    if (Object.keys(updateData).length === 0) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "No data provided for update",
        ""
      );
    }

    const result = await users.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!result) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found", "");
    }

    return {
      status: true,
      message: "Successfully updated profile",
    };
  } catch (error: any) {
    if (error instanceof AppError) throw error;

    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      "Profile update failed",
      error.message
    );
  }
};

const findByAllUsersAdminIntoDb = async (query: Record<string, unknown>) => {
  try {
    const allUsersdQuery = new QueryBuilder(
      users
        .find()
        .select(
          "_id fullname email phoneNumber role isVerify photo status createdAt"
        ),
      query
    )
      .search(user_search_filed)
      .filter()
      .sort()
      .paginate()
      .fields();

    const all_users = await allUsersdQuery.modelQuery;
    const meta = await allUsersdQuery.countTotal();

    return { meta, all_users };
  } catch (error: any) {
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      "find By All User Admin IntoDb server unavailable",
      error
    );
  }
};

const deleteAccountIntoDb = async (id: string) => {
  try {
    return id;
  } catch (error: any) {
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      "delete Account Into Db server unavailable",
      error
    );
  }
};

const isBlockAccountIntoDb = async (
  id: string,
  payload: { status: boolean }
) => {
  try {
    const status = payload?.status
      ? USER_ACCESSIBILITY.isProgress
      : USER_ACCESSIBILITY.blocked;

    const result = await users.findByIdAndUpdate(
      id,
      { status: status },
      { new: true, upsert: true }
    );

    return result ? { status: true, message: `successfully ${status} ` } : "";
  } catch (error: any) {
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      " is block account into db server unavailable",
      error
    );
  }
};

const find_by_all_admin_IntoDb = async (
  adminId: string,
  query: Record<string, unknown>
) => {
  try {
    const allAdminQuery = new QueryBuilder(
      users
        .find({
          $or: [{ role: USER_ROLE.admin }, { role: USER_ROLE.superadmin }],
        })
        .select(
          "_id fullname email phoneNumber role isVerify photo  status"
        ),
      query
    )
      .search(user_search_filed)
      .filter()
      .sort()
      .paginate()
      .fields();

    const all_admin = await allAdminQuery.modelQuery;
    const meta = await allAdminQuery.countTotal();

    return { meta, all_admin };
  } catch (error: any) {
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      "issues by the find by all admin into db server unavailable",
      error
    );
  }
};

const getSingleUserByIdIntoDb = async (id: string) => {
  try {
    const result = await users
      .findById(id)
      .select(
        "_id fullname email phoneNumber role isVerify photo status createdAt address gender"
      );
    
    if (!result) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found", "");
    }
    
    return result;
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      "issues by the get single user by id into db server unavailable",
      error
    );
  }
};

const googleLoginIntoDb = async (payload: {
  email: string;
  fullname: string;
  photo?: string;
  role: "user";
  isVerify: boolean;
  status: "isProgress" | "Blocked";
  isDelete: boolean;
  fcm?: string;
}) => {
  try {
    // Check if user already exists
    const isUserExist = await users.findOne(
      {
        $and: [
          { email: payload.email },
          { isDelete: false },
        ],
      }
    );

    let user;
    
    if (isUserExist) {
      // Update existing user with Google data
      user = await users.findOneAndUpdate(
        { email: payload.email },
        {
          $set: {
            fullname: payload.fullname,
            photo: payload.photo,
            isVerify: payload.isVerify,
            status: payload.status,
            lastLoginAt: new Date(),
          },
          $addToSet: {
            fcmTokens: payload?.fcm,
          },
        },
        { new: true }
      );
    } else {
      // Create new user from Google data
      const newUser = {
        id: new mongoose.Types.ObjectId().toString(),
        email: payload.email,
        fullname: payload.fullname,
        photo: payload.photo,
        role: payload.role,
        isVerify: payload.isVerify,
        status: payload.status,
        isDelete: payload.isDelete,
        password: "GOOGLE_USER_NO_PASSWORD", // Special password for Google users
        verificationCode: 0,
        gender: "Others" as const,
        fcmTokens: payload?.fcm ? [payload.fcm] : [],
      };

      
      const UserModel = users;
      user = new UserModel(newUser);
      await user.save();
    }

    if (!user) {
      throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to process Google login", "");
    }

    // Generate JWT tokens
    const jwtPayload = {
      id: user.id,
      role: user.role,
      email: user.email,
    };

    const accessToken = jwtHelpers.generateToken(
      jwtPayload,
      config.jwt_access_secret as string,
      config.expires_in as string
    );

    const refreshToken = jwtHelpers.generateToken(
      jwtPayload,
      config.jwt_refresh_secret as string,
      config.refresh_expires_in as string
    );

    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    throw error;
  }
};

const AuthServices = {
  loginUserIntoDb,
  refreshTokenIntoDb,
  myprofileIntoDb,
  changeMyProfileIntoDb,
  findByAllUsersAdminIntoDb,
  deleteAccountIntoDb,
  isBlockAccountIntoDb,
  find_by_all_admin_IntoDb,
  getSingleUserByIdIntoDb,
  googleLoginIntoDb,
};

export default AuthServices;
