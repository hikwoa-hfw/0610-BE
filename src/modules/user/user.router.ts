import { Router } from "express";
import { injectable } from "tsyringe";
import { JWT_SECRET_KEY } from "../../config";
import { JwtMiddleware } from "../../middlewares/jwt.middleware";
import { validateBody } from "../../middlewares/validation.middleware";
import { UpdateUserDTO } from "./dto/update-user.dto";
import { UserController } from "./user.controller";
import { UploaderMiddleware } from "../../middlewares/uploader.middleware";

@injectable()
export class UserRouter {
  private router: Router;
  private userController: UserController;
  private jwtMiddleware: JwtMiddleware;
  private uploaderMiddleware: UploaderMiddleware;
  constructor(
    UserController: UserController,
    JwtMiddleware: JwtMiddleware,
    UploaderMiddleware: UploaderMiddleware
  ) {
    this.router = Router();
    this.userController = UserController;
    this.jwtMiddleware = JwtMiddleware;
    this.uploaderMiddleware = UploaderMiddleware;
    this.intializeRoutes();
  }

  private intializeRoutes = () => {
    this.router.get(
      "/",
      this.jwtMiddleware.verifyToken(JWT_SECRET_KEY!),
      this.userController.getUser
    );
    this.router.patch(
      "/update-user",
      this.jwtMiddleware.verifyToken(JWT_SECRET_KEY!),
      validateBody(UpdateUserDTO),
      this.userController.updateUser
    );
    this.router.patch(
      "/update-organizer",
      this.jwtMiddleware.verifyToken(JWT_SECRET_KEY!),
      this.uploaderMiddleware
        .upload()
        .fields([{ name: "profilePict", maxCount: 1 }]),
      this.uploaderMiddleware.fileFilter([
        "image/avif",
        "image/jpeg",
        "image/png",
      ]),
      validateBody(UpdateUserDTO),
      this.userController.updateOrganizer
    );
  };

  getRouter() {
    return this.router;
  }
}
