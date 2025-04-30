import { Router } from "express";
import { injectable } from "tsyringe";
import "reflect-metadata";
import { JWT_SECRET_KEY_FORGOT_PASSWORD } from "../../config";
import { JwtMiddleware } from "../../middlewares/jwt.middleware";
import { UploaderMiddleware } from "../../middlewares/uploader.middleware";
import { validateBody } from "../../middlewares/validation.middleware";
import { AuthController } from "./auth.controller";
import { forgotPasswordDTO } from "./dto/forgot-password.dto";
import { loginDTO } from "./dto/login.dto";
import { RegisterOrganizerDTO, RegisterUserDTO } from "./dto/register.dto";
import { ResetPasswordDTO } from "./dto/reset-password.dto";

@injectable()
export class AuthRouter {
  private router: Router;
  private authController: AuthController;
  private jwtMiddleware: JwtMiddleware;
  private uploaderMiddleware: UploaderMiddleware;
  constructor(
    AuthController: AuthController,
    UploaderMiddleware: UploaderMiddleware,
    JwtMiddleware: JwtMiddleware
  ) {
    this.router = Router();
    this.authController = AuthController;
    this.jwtMiddleware = JwtMiddleware;
    this.uploaderMiddleware = UploaderMiddleware;
    this.intializeRoutes();
  }

  private intializeRoutes = () => {
    this.router.post(
      "/register-user",
      validateBody(RegisterUserDTO),
      this.authController.registerUser
    );
    this.router.post(
      "/register-organizer",
      this.uploaderMiddleware
      .upload()
      .fields([{ name: "profilePict", maxCount: 1 }]),
      this.uploaderMiddleware.fileFilter([
        "image/avif",
        "image/jpeg",
        "image/png",
      ]),
      validateBody(RegisterOrganizerDTO),
      this.authController.registerOrganizer
    );
    this.router.post(
      "/login",
      validateBody(loginDTO),
      this.authController.login
    );
    this.router.post(
      "/forgot-password",
      validateBody(forgotPasswordDTO),
      this.authController.forgotPassword
    );
    this.router.patch(
      "/reset-password",
      this.jwtMiddleware.verifyToken(JWT_SECRET_KEY_FORGOT_PASSWORD!),
      validateBody(ResetPasswordDTO),
      this.authController.resetPassword
    );
  };

  getRouter() {
    return this.router;
  }
}
