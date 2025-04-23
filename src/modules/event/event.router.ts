import { Router } from "express";
import { injectable } from "tsyringe";
import { validateBody } from "../../middlewares/validation.middleware";
import { createEventDTO } from "./dto/event.create.dto";
import { EventController } from "./event.controller";

@injectable()
export class EventRouter {
  private router: Router;
  private eventController: EventController;

  constructor(EventController: EventController) {
    this.router = Router();
    this.eventController = EventController;
    this.initializeRoutes();
  }

  private initializeRoutes = () => {
    this.router.post(
      "/events",
      validateBody(createEventDTO),
      this.eventController.createEvent
    );
  };

  getRouter() {
    return this.router;
  }
}
