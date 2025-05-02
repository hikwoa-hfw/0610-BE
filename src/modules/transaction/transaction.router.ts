import { Router } from "express";
import { injectable } from "tsyringe";
import { TransactionController } from "./transaction.controller";
import { JwtMiddleware } from "../../middlewares/jwt.middleware";
import { JWT_SECRET_KEY } from "../../config";
import { verifyRole } from "../../middlewares/role.middleware";

@injectable()
export class TransactionRouter {
  private router: Router;
  private transactionController: TransactionController;
  private jwtMiddleware: JwtMiddleware;
  constructor(
    TransactionController: TransactionController,
    JwtMiddleware: JwtMiddleware
  ) {
    this.router = Router();
    this.jwtMiddleware = JwtMiddleware;
    this.transactionController = TransactionController;
    this.intializeRoutes();
  }

  private intializeRoutes = () => {
    this.router.patch(
      "/reject-transaction/:uuid",
      this.jwtMiddleware.verifyToken(JWT_SECRET_KEY!),
      verifyRole(["ORGANIZER"]),
      this.transactionController.rejectTransaction
    );
    this.router.patch(
      "/accept-transaction/:uuid",
      this.jwtMiddleware.verifyToken(JWT_SECRET_KEY!),
      verifyRole(["ORGANIZER"]),
      this.transactionController.acceptTransaction
    );
  };

  getRouter() {
    return this.router;
  }
}
