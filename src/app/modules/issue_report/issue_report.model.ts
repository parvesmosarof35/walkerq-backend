import { Schema, model } from 'mongoose';
import { IIssueReport } from './issue_report.interface';

const IssueReportSchema = new Schema<IIssueReport>(
  {
    reporter_id: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    luggage_id: {
      type: Schema.Types.ObjectId,
      ref: 'luggages',
      required: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    media: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
        resource_type: { type: String, enum: ['image', 'video'], required: true },
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'investigating', 'resolved', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

const IssueReportModel = model<IIssueReport>('issue_reports', IssueReportSchema);

export default IssueReportModel;
