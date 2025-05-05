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
    // 🔹 Middleware reusable
    const authMiddleware = this.jwtMiddleware.verifyToken(JWT_SECRET_KEY!);
    const roleMiddleware = verifyRole(["ORGANIZER"]);
  
    // 🔹 Index & List Routes (GET)
    this.router.get(
      "/",
      authMiddleware,
      roleMiddleware,
      this.transactionController.getTransactionsByOrganizer
    );
  
    this.router.get(
      "/paid",
      authMiddleware,
      roleMiddleware,
      this.transactionController.getTransactionsPaid
    );
  
    this.router.get(
      "/revenue",
      authMiddleware,
      roleMiddleware,
      this.transactionController.getTotalRevenue
    );
  
    // 🔹 Detail Routes (GET by ID/UUID/Slug)
    this.router.get(
      "/:uuid",
      authMiddleware,
      roleMiddleware,
      this.transactionController.getTransactionDetail
    );
  
    this.router.get(
      "/events/:slug",
      authMiddleware,
      roleMiddleware,
      this.transactionController.getTransactionsByEventSlug
    );
  
    // 🔹 Action Routes (PATCH)
    this.router.patch(
      "/accept-transaction/:uuid",
      authMiddleware,
      roleMiddleware,
      this.transactionController.acceptTransaction
    );
  
    this.router.patch(
      "/reject-transaction/:uuid",
      authMiddleware,
      roleMiddleware,
      this.transactionController.rejectTransaction
    );
  };

  getRouter() {
    return this.router;
  }
}
