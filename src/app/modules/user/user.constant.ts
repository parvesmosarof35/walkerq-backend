import config from "../../config";

//'admin' | 'user' | 'faculty'
export const USER_ROLE = {
  user: "user",
  admin: "admin",
  superadmin: "superadmin",
  staff_port: "staff_port",
  staff_warehouse: "staff_warehouse",
  staff_airport: "staff_airport",
  driver: "driver",
  helper: "helper",
} as const;

export const USER_ACCESSIBILITY = {
  isProgress: "isProgress",
  blocked: "blocked",
} as const;

//   male: "Male" | "Female" | "Others";

export const GENDER = {
  male: "Male",
  female: "Female",
  others: "Others",
} as const;

export interface UserResponse {
  status: boolean;
  message: string;
}


// superadmin credentials

export const superAdminCredentials = {

  fullname: "Super Admin",
  email: `${config.SUPER_ADMIN_EMAIL}`,
  password: `${config.SUPER_ADMIN_PASS}`,
  phoneNumber:"01722305054",
  isVerify: true,
}
