import cors from "cors";
import express, { Express, json } from "express";
import "reflect-metadata";
import { container } from "tsyringe";
import { PORT } from "./config";
import "./jobs";
import { errorMiddleware } from "./middlewares/error.middleware";
import { AuthRouter } from "./modules/auth/auth.router";
import { SampleRouter } from "./modules/sample/sample.router";
import { UserRouter } from "./modules/user/user.router";
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
    const sampleRouter = container.resolve(SampleRouter);
    const userRouter = container.resolve(UserRouter);
    const eventRouter = container.resolve(EventRouter);

    this.app.use("/auth", authRouter.getRouter());
    this.app.use("/samples", sampleRouter.getRouter());
    this.app.use("/users", userRouter.getRouter());
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
