import cors from "cors";
import express, { Express, json } from "express";
import "reflect-metadata";
import { container } from "tsyringe";
import { errorMiddleware } from "./middlewares/error.middleware";
import { AuthRouter } from "./modules/auth/auth.router";
import { PORT } from "./config";
import { EventRouter } from "./modules/event/event.router";

export class App {
  public app: Express;

  constructor() {
    this.app = express();
    this.configure();
    this.routes();
    this.handleError();
  }

  private configure() {
    this.app.use(cors());
    this.app.use(json());
  }

  private routes() {
    const authRouter = container.resolve(AuthRouter);
    const eventRouter = container.resolve(EventRouter);

    this.app.use("/auth", authRouter.getRouter());
    this.app.use("/events", eventRouter.getRouter());
  }

  private handleError() {
    this.app.use(errorMiddleware);
  }

  public start() {
    this.app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  }
}
