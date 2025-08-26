import { Request, Response } from 'express';
declare class HomeController {
    getHomePage(req: Request, res: Response): Promise<void>;
    displayAllUsers(req: Request, res: Response): Promise<void>;
    createUser(req: Request, res: Response): Promise<void>;
    getEditPage(req: Request, res: Response): Promise<void>;
    updateUser(req: Request, res: Response): Promise<void>;
    deleteUser(req: Request, res: Response): Promise<void>;
}
declare const _default: HomeController;
export default _default;
//# sourceMappingURL=homeController.d.ts.map