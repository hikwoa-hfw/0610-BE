import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "../../generated/prisma";
import { injectable } from "tsyringe";
import { TransactionService } from "./transaction.service";

@injectable()
export class TransactionController {
  private transactionService: TransactionService;

  constructor(TransactionService: TransactionService) {
    this.transactionService = TransactionService;
  }

  rejectTransaction = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authUserId = Number(res.locals.user.id)
      const { uuid } = req.params
      const result = await this.transactionService.rejectTransaction(authUserId, uuid);
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };
  
  acceptTransaction = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authUserId = Number(res.locals.user.id)
      const { uuid } = req.params
      const result = await this.transactionService.acceptTransaction(authUserId, uuid);
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };

}
