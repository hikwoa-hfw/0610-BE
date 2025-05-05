import { Router } from "express";
import { injectable } from "tsyringe";
import { validateBody } from "../../middlewares/validation.middleware";
import { createEventDTO } from "./dto/event.create.dto";
import { EventController } from "./event.controller";
import { JwtMiddleware } from "../../middlewares/jwt.middleware";
import { JWT_SECRET_KEY } from "../../config";
import { verifyRole } from "../../middlewares/role.middleware";

@injectable()
export class EventRouter {
  private router: Router;
  private jwtMiddleware: JwtMiddleware;
  private eventController: EventController;

  constructor(EventController: EventController, JwtMiddleware: JwtMiddleware) {
    this.router = Router();
    this.jwtMiddleware = JwtMiddleware;
    this.eventController = EventController;
    this.initializeRoutes();
  }

  private initializeRoutes = () => {
    this.router.get("/", this.eventController.getEvents);
    this.router.get(
      "/organizer",
      this.jwtMiddleware.verifyToken(JWT_SECRET_KEY!),
      verifyRole(["ORGANIZER"]),
      this.eventController.getEventsListByOrganizer
    );
    this.router.get("/:slug", this.eventController.getEventBySlug);
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
