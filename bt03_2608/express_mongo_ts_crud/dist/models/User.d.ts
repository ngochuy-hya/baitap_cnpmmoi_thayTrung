import mongoose, { Document } from 'mongoose';
export interface IUserDocument extends Document {
    firstName: string;
    lastName: string;
    email: string;
    address?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const User: mongoose.Model<IUserDocument, {}, {}, {}, mongoose.Document<unknown, {}, IUserDocument, {}, {}> & IUserDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=User.d.ts.map