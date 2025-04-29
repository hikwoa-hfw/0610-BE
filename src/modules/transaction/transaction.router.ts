// transaction.router.ts
import { Router } from "express";
import { injectable } from "tsyringe";
import { validateBody } from "../../middlewares/validation.middleware";
import { createTransactionDTO } from "./dto/transaction.create.dto";
import { TransactionController } from "./transaction.controller";

@injectable()
export class TransactionRouter {
  private router: Router;
  private transactionController: TransactionController;

  constructor(transactionController: TransactionController) {
    this.router = Router();
    this.transactionController = transactionController;
    this.initializeRoutes();
  }

  private initializeRoutes = () => {
    // Create a new transaction
    this.router.post(
      "/transactions",
      validateBody(createTransactionDTO),
      (req, res, next) =>
        this.transactionController.createTransaction(req, res, next)
    );

    // Get all transactions
    this.router.get("/transactions", (req, res, next) =>
      this.transactionController.getAllTransactions(req, res, next)
    );

    // Get a transaction by ID
    this.router.get("/transactions/:transactionId", (req, res, next) =>
      this.transactionController.getTransactionById(req, res, next)
    );

    // Update transaction status
    this.router.put("/transactions/:transactionId/status", (req, res, next) =>
      this.transactionController.updateTransactionStatus(req, res, next)
    );

    // Upload payment proof for a transaction
    this.router.post(
      "/transactions/:transactionId/payment-proof",
      (req, res, next) =>
        this.transactionController.uploadPaymentProof(req, res, next)
    );

    // Check automatic status changes for a transaction
    this.router.get(
      "/transactions/:transactionId/check-status",
      (req, res, next) =>
        this.transactionController.checkAutomaticStatusChange(req, res, next)
    );
  };

  getRouter() {
    return this.router;
  }
}
