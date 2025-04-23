import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "../../generated/prisma";
import { injectable } from "tsyringe";
import { AuthService } from "./auth.service";

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
      const result = await this.authService.registerOrganizer(req.body);
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };
  
  login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this.authService.login(req.body);
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };
  
  forgotPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this.authService.forgotPassword(req.body);
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };
}
