import { Types } from 'mongoose';

export interface IIssueReport {
  reporter_id: Types.ObjectId;
  luggage_id: Types.ObjectId;
  description: string;
  media: {
    url: string;
    public_id: string;
    resource_type: 'image' | 'video';
  }[];
  status: 'pending' | 'investigating' | 'resolved' | 'rejected';
  createdAt?: Date;
  updatedAt?: Date;
}
