import { IUserDocument } from '../models/User';
import { IUser, ApiResponse } from '../types';
declare class CRUDService {
    createNewUser(userData: IUser): Promise<ApiResponse<IUserDocument>>;
    getAllUsers(): Promise<ApiResponse<IUserDocument[]>>;
    getUserById(id: string): Promise<ApiResponse<IUserDocument>>;
    updateUser(id: string, updateData: Partial<IUser>): Promise<ApiResponse<IUserDocument>>;
    deleteUser(id: string): Promise<ApiResponse<null>>;
}
declare const _default: CRUDService;
export default _default;
//# sourceMappingURL=CRUDService.d.ts.map