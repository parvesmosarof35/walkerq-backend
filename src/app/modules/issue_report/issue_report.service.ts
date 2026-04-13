import { IIssueReport } from './issue_report.interface';
import IssueReportModel from './issue_report.model';
import { uploadMediaToCloudinary } from '../../utils/cloudinary';
import fs from 'fs';

class IssueReportService {
  async createReport(payload: Partial<IIssueReport>, files: any[]) {
    const mediaUrls = [];

    if (files && files.length > 0) {
      for (const file of files) {
        const resourceType = file.mimetype.startsWith('video') ? 'video' : 'image';
        const result = await uploadMediaToCloudinary(file.path, 'reports', resourceType);
        
        mediaUrls.push({
          url: result.secure_url,
          public_id: result.public_id,
          resource_type: resourceType,
        });

        // Delete local file after upload
        try {
          fs.unlinkSync(file.path);
        } catch (err) {
          console.error('Failed to eliminate local file:', err);
        }
      }
    }

    payload.media = mediaUrls as any;
    const result = await IssueReportModel.create(payload);
    return result;
  }

  async getAllReports() {
    return await IssueReportModel.find().populate('reporter_id luggage_id').sort({ createdAt: -1 });
  }

  async getReportsByUserId(userId: string) {
    return await IssueReportModel.find({ reporter_id: userId }).populate('luggage_id');
  }

  async updateReportStatus(id: string, status: string) {
    return await IssueReportModel.findByIdAndUpdate(id, { status }, { new: true });
  }
}

export default new IssueReportService();
