import { NextFunction, Request, Response } from "express";
import { injectable } from "tsyringe";
import { UserService } from "./user.service";
import { ApiError } from "../../utils/api-error";

@injectable()
export class UserController {
  private userService: UserService;

  constructor(UserService: UserService) {
    this.userService = UserService;
  }

  getUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.userService.getSamples();
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };

  updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.userService.updateUser(
        req.body,
        res.locals.user.id
      );
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };

  updateOrganizer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const profilePict = files.profilePict?.[0];
      if (!profilePict) {
        throw new ApiError("Profile Picture is required", 400);
      }
      const result = await this.userService.updateOrganizer(
        req.body,
        res.locals.user.id,
        profilePict
      );
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };
}
