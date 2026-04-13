import { Request, Response } from 'express';
import IssueReportService from './issue_report.service';
import catchAsync from '../../utils/asyncCatch';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';

class IssueReportController {
  createReport = catchAsync(async (req: Request, res: Response) => {
    const reportData = {
      ...req.body,
      reporter_id: req.user.id,
    };
    
    // Check if files exist (multer)
    const files = req.files as any[] || [];
    
    const result = await IssueReportService.createReport(reportData, files);
    
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: 'Damage report submitted successfully',
      data: result,
    });
  });

  getAllReports = catchAsync(async (req: Request, res: Response) => {
    const result = await IssueReportService.getAllReports();
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'All reports retrieved successfully',
      data: result,
    });
  });

  getMyReports = catchAsync(async (req: Request, res: Response) => {
    const result = await IssueReportService.getReportsByUserId(req.user.id);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Your reports retrieved successfully',
      data: result,
    });
  });

  updateStatus = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const result = await IssueReportService.updateReportStatus(id, status);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Report status updated successfully',
      data: result,
    });
  });
}

export default new IssueReportController();
