export interface IUser {
    _id?: string;
    firstName: string;
    lastName: string;
    email: string;
    address?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}
//# sourceMappingURL=index.d.ts.map