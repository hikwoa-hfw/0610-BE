import { NextFunction, Request, Response } from "express";
import { injectable } from "tsyringe";
import { EventService } from "./event.service";

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

  getEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.eventService.getEvents();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getEventBySlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.eventService.getEventBySlug(req.params.slug);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
