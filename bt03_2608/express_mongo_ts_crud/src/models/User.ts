import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from '../types';

// Interface cho Mongoose document - chỉ extend Document, không extend IUser
export interface IUserDocument extends Document {
  firstName: string;
  lastName: string;
  email: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUserDocument>({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  address: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Tạo index cho email để tăng tốc độ query
userSchema.index({ email: 1 });

export const User = mongoose.model<IUserDocument>('User', userSchema);