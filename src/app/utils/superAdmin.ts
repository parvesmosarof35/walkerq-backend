import status from "http-status";
import AppError from "../errors/AppError";
import users from "../modules/user/user.model";
import { superAdminCredentials, USER_ROLE, USER_ACCESSIBILITY } from "../modules/user/user.constant";

const superAdmin = async () => {
    try {
        const result = await users.findOneAndUpdate(
            { email: superAdminCredentials.email },
            {
                $set: {
                    ...superAdminCredentials,
                    role: USER_ROLE.superadmin,
                    status: USER_ACCESSIBILITY.isProgress,
                    isDelete: false,
                },
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        if (!result) {
            throw new AppError(status.NOT_EXTENDED, 'SOME ISSUES BY THE SUPER ADMIN CREATTION RESULT SECTION', '')
        }
    } catch (error: any) {
        throw new AppError(
            status.SERVICE_UNAVAILABLE,
            "Issue in super admin creation section",
            error.message
        );
    }
};

export default superAdmin;
