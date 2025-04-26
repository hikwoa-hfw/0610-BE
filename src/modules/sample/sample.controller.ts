import { NextFunction, Request, Response } from "express";
import { SampleService } from "./sample.service";
import { PrismaClient } from "../../generated/prisma";
import { injectable } from "tsyringe";

@injectable()
export class SampleController {
  private sampleService: SampleService;

  constructor(SampleService: SampleService) {
    this.sampleService = SampleService;
  }

  getSamples = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.sampleService.getSamples();
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };

  getSample = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.sampleService.getSample(Number(req.params.id));
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };
}
