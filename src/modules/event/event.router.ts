import { Router } from "express";
import { injectable } from "tsyringe";
import { validateBody } from "../../middlewares/validation.middleware";
import { createEventDTO } from "./dto/event.create.dto";
import { EventController } from "./event.controller";
import { JwtMiddleware } from "../../middlewares/jwt.middleware";
import { JWT_SECRET_KEY } from "../../config";
import { verifyRole } from "../../middlewares/role.middleware";
import { UploaderMiddleware } from "../../middlewares/uploader.middleware";
import { UpdateEventDto } from "./dto/update-event.dto";

@injectable()
export class EventRouter {
  private router: Router;
  private jwtMiddleware: JwtMiddleware;
  private eventController: EventController;
  private uploaderMiddleware: UploaderMiddleware;
  constructor(
    EventController: EventController,
    JwtMiddleware: JwtMiddleware,
    UploaderMiddleware: UploaderMiddleware
  ) {
    this.router = Router();
    this.jwtMiddleware = JwtMiddleware;
    this.eventController = EventController;
    this.uploaderMiddleware = UploaderMiddleware;
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
    this.router.get(
      "/organizer/:slug",
      this.jwtMiddleware.verifyToken(JWT_SECRET_KEY!),
      verifyRole(["ORGANIZER"]),
      this.eventController.getEventOrganizerBySlug
    );
    this.router.get("/:slug", this.eventController.getEventBySlug);
    this.router.post(
      "/events",
      validateBody(createEventDTO),
      this.eventController.createEvent
    );
    this.router.patch(
      "/:slug",
      this.jwtMiddleware.verifyToken(JWT_SECRET_KEY!),
      verifyRole(["ORGANIZER"]),
      this.uploaderMiddleware
        .upload()
        .fields([{ name: "thumbnail", maxCount: 1 }]),
      this.uploaderMiddleware.fileFilter([
        "image/avif",
        "image/jpeg",
        "image/png",
      ]),
      validateBody(UpdateEventDto),
      this.eventController.updateEvent
    );

    this.router.delete(
      "/:slug",
      this.jwtMiddleware.verifyToken(JWT_SECRET_KEY!),
      verifyRole(["ORGANIZER"]),
      this.eventController.deleteEvent
    );
  };

  getRouter() {
    return this.router;
  }
}
