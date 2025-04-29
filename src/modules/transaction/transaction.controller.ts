// transaction.controller.ts
import { Request, Response, NextFunction } from "express";
import { injectable } from "tsyringe";
import TransactionService from "./transaction.service";
import { TransactionStatus } from "./transaction-status.enum";

@injectable()
export class TransactionController {
  private transactionService: TransactionService;

  constructor(transactionService: TransactionService) {
    this.transactionService = transactionService;
  }

  // Create a new transaction
  createTransaction = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.transactionService.createTransaction(req.body);
      res.status(201).json(result); // Use 201 for resource creation
    } catch (error) {
      next(error);
    }
  };

  // Get all transactions
  getAllTransactions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.transactionService.getAllTransactions();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  // Get a transaction by ID
  getTransactionById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { transactionId } = req.params;

      if (!transactionId) {
        return res.status(400).json({ message: "Missing transaction ID." });
      }

      const result = await this.transactionService.getTransactionById(
        Number(transactionId)
      );
      if (!result) {
        return res.status(404).json({ message: "Transaction not found." });
      }

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  // Update transaction status
  updateTransactionStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { transactionId } = req.params;
      const { status } = req.body;

      if (
        !transactionId ||
        !status ||
        !Object.values(TransactionStatus).includes(status as TransactionStatus)
      ) {
        return res.status(400).json({ message: "Invalid request data." });
      }

      const result = await this.transactionService.updateTransactionStatus(
        Number(transactionId),
        status as TransactionStatus
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  // Upload payment proof for a transaction
  uploadPaymentProof = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { transactionId } = req.params;
      const { paymentProof } = req.body;

      if (!transactionId || !paymentProof) {
        return res.status(400).json({ message: "Missing required fields." });
      }

      const result = await this.transactionService.uploadPaymentProof(
        Number(transactionId),
        paymentProof
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  // Check automatic status changes for a transaction
  checkAutomaticStatusChange = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { transactionId } = req.params;

      if (!transactionId) {
        return res.status(400).json({ message: "Missing transaction ID." });
      }

      const result = await this.transactionService.checkAutomaticStatusChange(
        Number(transactionId)
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
