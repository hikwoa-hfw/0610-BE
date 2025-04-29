import cors from "cors";
import express, { Express, json } from "express";
import "reflect-metadata";
import { container } from "tsyringe";
import { PORT } from "./config";
import "./jobs";
import { errorMiddleware } from "./middlewares/error.middleware";
import { AuthRouter } from "./modules/auth/auth.router";
<<<<<<< HEAD
import { PORT } from "./config";
import { EventRouter } from "./modules/event/event.router";
=======
import { SampleRouter } from "./modules/sample/sample.router";
import { UserRouter } from "./modules/user/user.router";
>>>>>>> e01caa751a69a89a46d69a96bc6fe00ed33d929f

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
<<<<<<< HEAD
    const authRouter = container.resolve(AuthRouter);
    const eventRouter = container.resolve(EventRouter);

    this.app.use("/auth", authRouter.getRouter());
    this.app.use("/events", eventRouter.getRouter());
=======
    const authRouter = container.resolve(AuthRouter)
    const sampleRouter = container.resolve(SampleRouter)
    const userRouter = container.resolve(UserRouter)

    this.app.use("/auth", authRouter.getRouter())
    this.app.use("/samples", sampleRouter.getRouter())
    this.app.use("/users",userRouter.getRouter())
>>>>>>> e01caa751a69a89a46d69a96bc6fe00ed33d929f
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
