import { NextFunction, Request, Response } from "express";
import { injectable } from "tsyringe";
import { UserService } from "./user.service";
import { ApiError } from "../../utils/api-error";
import { GetUsersDto } from "./dto/get-users.dto";
import { plainToInstance } from "class-transformer";

@injectable()
export class UserController {
  private userService: UserService;

  constructor(UserService: UserService) {
    this.userService = UserService;
  }

  getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.userService.getUsers();
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };
  
  getUsersByEventSlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {slug} = req.params
      const query = plainToInstance(GetUsersDto, req.query);
      const result = await this.userService.getUsersByEventSlug(slug, query);
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };

  getUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.userService.getUser(Number(res.locals.user.id));
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };

  updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.userService.updateUser(
        req.body,
        Number(res.locals.user.id)
      );
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };

  updateOrganizer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      console.log(files);
      
      const profilePict = files.profilePict?.[0];
     
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
