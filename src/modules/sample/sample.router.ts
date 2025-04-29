import { Router } from "express";
import { injectable } from "tsyringe";
import { SampleController } from "./sample.controller";
@injectable()
export class SampleRouter {
  private router: Router;
  private sampleController: SampleController;
  constructor(sampleController: SampleController) {
    this.router = Router();
    this.sampleController = sampleController;
    this.intializeRoutes();
  }

  private intializeRoutes = () => {
    this.router.get("/", this.sampleController.getSamples);
    this.router.get("/:id", this.sampleController.getSample);
  };

  getRouter() {
    return this.router;
  }
}
