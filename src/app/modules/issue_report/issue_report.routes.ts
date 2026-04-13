import express, { NextFunction, Request, Response } from 'express';
import IssueReportController from './issue_report.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import upload from '../../utils/uploadFile';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';

const router = express.Router();

/**
 * Report Damage with Multiple Media (Images/Videos)
 */
router.post(
  '/',
  auth(USER_ROLE.user),
  upload.array('media', 5), // Allow up to 5 files (images or videos)
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.body.data && typeof req.body.data === 'string') {
        req.body = JSON.parse(req.body.data);
      }
      next();
    } catch (error) {
      next(new AppError(httpStatus.BAD_REQUEST, "Invalid JSON data", ""));
    }
  },
  IssueReportController.createReport
);

/**
 * Admin: Get all submitted reports
 */
router.get(
  '/all',
  auth(USER_ROLE.admin, USER_ROLE.superadmin),
  IssueReportController.getAllReports
);

/**
 * User: Get their own submitted reports
 */
router.get(
  '/my-reports',
  auth(USER_ROLE.user),
  IssueReportController.getMyReports
);

/**
 * Admin: Update investigation status
 */
router.patch(
  '/:id/status',
  auth(USER_ROLE.admin, USER_ROLE.superadmin),
  IssueReportController.updateStatus
);

const IssueReportRoutes = router;
export default IssueReportRoutes;
