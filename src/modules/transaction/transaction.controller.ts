import { plainToInstance } from "class-transformer";
import { NextFunction, Request, Response } from "express";
import { injectable } from "tsyringe";
import { GetTransactionDTO } from "./dto/get-transaction.dto";
import { TransactionService } from "./transaction.service";

@injectable()
export class TransactionController {
  private transactionService: TransactionService;

  constructor(TransactionService: TransactionService) {
    this.transactionService = TransactionService;
  }

  getTransactionsByOrganizer = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const authUserId = Number(res.locals.user.id);
      const query = plainToInstance(GetTransactionDTO, req.query);
      const result = await this.transactionService.getTransactionsByOrganizer(
        authUserId,
        query
      );
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };

  getTransactionsByEventSlug = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { slug } = req.params;
      const query = plainToInstance(GetTransactionDTO, req.query);
      const result = await this.transactionService.getTransactionsByEventSlug(
        slug,
        query
      );
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };
  
  getTransactionDetail = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { uuid } = req.params;
      const result = await this.transactionService.getTransactionsDetail(
        uuid
      );
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };

  getTransactionsPaid = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const authUserId = Number(res.locals.user.id);
      const query = plainToInstance(GetTransactionDTO, req.query);
      const result = await this.transactionService.getTransactionsPaid(
        authUserId,
        query
      );
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };

  getTotalRevenue = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authUserId = Number(res.locals.user.id);
      const result = await this.transactionService.getTotalRevenue(authUserId);
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };

  rejectTransaction = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const authUserId = Number(res.locals.user.id);
      const { uuid } = req.params;
      const result = await this.transactionService.rejectTransaction(
        authUserId,
        uuid
      );
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };

  acceptTransaction = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const authUserId = Number(res.locals.user.id);
      const { uuid } = req.params;
      const result = await this.transactionService.acceptTransaction(
        authUserId,
        uuid
      );
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };
}
