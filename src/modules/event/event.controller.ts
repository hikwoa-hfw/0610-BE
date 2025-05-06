import { NextFunction, Request, Response } from "express";
import { injectable } from "tsyringe";
import { EventService } from "./event.service";
import { plainToInstance } from "class-transformer";
import { GetTransactionDTO } from "../transaction/dto/get-transaction.dto";
import { GetEventsListByOrganizerDTO } from "./dto/get-events-list-by-organizer.dto";
import { ApiError } from "../../utils/api-error";

@injectable()
export class EventController {
  private eventService: EventService;

  constructor(EventService: EventService) {
    this.eventService = EventService;
  }

  createEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.eventService.createEvent(req.body);
      res.status(201).json(result); // Use 201 for resource creation
    } catch (error) {
      next(error);
    }
  };

  getEventsListByOrganizer = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const authUserId = res.locals.user.id;
      const query = plainToInstance(GetEventsListByOrganizerDTO, req.query);
      const result = await this.eventService.getEventsListByOrganizer(
        authUserId,
        query
      );
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };

  getEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.eventService.getEvents();
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };

  getEventBySlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.eventService.getEventBySlug(req.params.slug);
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };

  getEventOrganizerBySlug = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { slug } = req.params;
      const result = await this.eventService.getEventOrganizerBySlug(slug);
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };

  updateEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const { slug } = req.params;
      const thumbnail = files?.thumbnail?.[0];

      if (thumbnail && !thumbnail.mimetype.startsWith("image/")) {
        throw new ApiError("Invalid file type. Only images are allowed.", 400);
      }

      const result = await this.eventService.updateEvent(
        req.body,
        res.locals.user.id,
        slug,
        thumbnail
      );
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };

  deleteEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authUserId = Number(res.locals.user.id);
      const { slug } = req.params;
      const result = await this.eventService.deleteEvent(slug, authUserId);
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };
}
