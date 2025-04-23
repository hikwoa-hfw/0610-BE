import { Router } from "express";
import { injectable } from "tsyringe";
import { AuthController } from "./auth.controller";
import { RegisterOrganizerDTO, RegisterUserDTO } from "./dto/register.dto";
import { validateBody } from "../../middlewares/validation.middleware";


@injectable()
export class AuthRouter {
  private router: Router;
  private authController: AuthController;
  constructor(AuthController: AuthController) {
    this.router = Router();
    this.authController = AuthController;
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
      validateBody(RegisterOrganizerDTO),
      this.authController.registerOrganizer
    );
    // this.router.post(
    //   "/login",
    //   validateBody(loginDTO),
    //   this.authController.login
    // );
    
  };

  getRouter() {
    return this.router;
  }
}
