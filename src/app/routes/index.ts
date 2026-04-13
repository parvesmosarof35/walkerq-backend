import express from "express";
import AuthRouter from "../modules/auth/auth.routes";
import UserRouters from "../modules/user/user.routes";
import SettingsRoutes from "../modules/settings/settings.routres";
import FaqRoutes from "../modules/faq/faq.routes";
import PaymentRoutes from "../modules/payment/payment.routes";
import OrderRoutes from "../modules/order/order.routes";
import { DashboardRoutes } from "../modules/dashboardstats/dashboard.router";
import IssueReportRoutes from "../modules/issue_report/issue_report.routes";
import LuggageRoutes from "../modules/luggage/luggage.routes";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRouter,
  },
  {
    path: "/user",
    route: UserRouters,
  },
  {
    path: "/payment",
    route: PaymentRoutes,
  },
  {
    path: "/order",
    route: OrderRoutes,
  },
  {
    path: "/setting",
    route: SettingsRoutes,
  },
  {
    path: "/faq",
    route: FaqRoutes,
  },
  {
    path: "/dashboard",
    route: DashboardRoutes,
  },
  {
    path: "/issue-report",
    route: IssueReportRoutes,
  },
  {
    path: "/luggage",
    route: LuggageRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
