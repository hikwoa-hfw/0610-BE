import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "../../generated/prisma";
import { injectable } from "tsyringe";
import { AuthService } from "./auth.service";
import { ApiError } from "../../utils/api-error";

@injectable()
export class AuthController {
  private authService: AuthService;

  constructor(AuthService: AuthService) {
    this.authService = AuthService;
  }

  registerUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.registerUser(req.body);
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };

  registerOrganizer = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const profilePict = files.profilePict?.[0];
      if (!profilePict) {
        throw new ApiError("Profile Picture is required", 400);
      }
      const result = await this.authService.registerOrganizer(req.body, profilePict);
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.login(req.body);
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.forgotPassword(req.body);
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.resetPassword(
        req.body,
        Number(res.locals.user.id)
      );
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };
}
