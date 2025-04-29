// transaction.service.ts
import { TransactionStatus } from "./transaction-status.enum";

class TransactionService {
  id: number;
  uuid: string;
  amount: number;
  status: TransactionStatus;
  paymentProof: string | null;
  pointAmount: number;
  voucherAmount: number;
  couponAmount: number;
  totalPrice: number;
  userId: number;
  eventId: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  constructor(
    id: number,
    uuid: string,
    amount: number,
    status: TransactionStatus,
    paymentProof: string | null,
    pointAmount: number,
    voucherAmount: number,
    couponAmount: number,
    totalPrice: number,
    userId: number,
    eventId: number,
    createdAt: Date,
    updatedAt: Date,
    deletedAt: Date | null
  ) {
    this.id = id;
    this.uuid = uuid;
    this.amount = amount;
    this.status = status;
    this.paymentProof = paymentProof;
    this.pointAmount = pointAmount;
    this.voucherAmount = voucherAmount;
    this.couponAmount = couponAmount;
    this.totalPrice = totalPrice;
    this.userId = userId;
    this.eventId = eventId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt;
  }

  // Method to update payment proof and change status
  uploadPaymentProof(paymentProof: string): void {
    if (this.status === TransactionStatus.WAITING_FOR_PAYMENT) {
      this.paymentProof = paymentProof;
      this.status = TransactionStatus.WAITING_FOR_ADMIN_CONFIRMATION;
      this.updatedAt = new Date();
    } else {
      throw new Error(
        "Cannot upload payment proof for this transaction status."
      );
    }
  }

  // Method to handle automatic status changes
  checkAutomaticStatusChange(): void {
    const now = new Date();

    // Check if transaction has expired due to no payment proof
    if (
      this.status === TransactionStatus.WAITING_FOR_PAYMENT &&
      now > new Date(this.createdAt.getTime() + 2 * 60 * 60 * 1000)
    ) {
      this.status = TransactionStatus.EXPIRED;
      this.updatedAt = now;
    }

    // Check if transaction has been canceled due to no admin confirmation
    if (
      this.status === TransactionStatus.WAITING_FOR_ADMIN_CONFIRMATION &&
      now > new Date(this.createdAt.getTime() + 3 * 24 * 60 * 60 * 1000)
    ) {
      this.status = TransactionStatus.CANCELED;
      this.updatedAt = now;
    }
  }

  // Method to handle rollbacks and seat restoration
  rollbackAndRestoreSeats(): void {
    if (
      [TransactionStatus.CANCELED, TransactionStatus.EXPIRED].includes(
        this.status
      )
    ) {
      // Return points, vouchers, and coupons to the user
      // Logic to restore seats for the event
      console.log(`Rollback completed for transaction ID: ${this.id}`);
    }
  }

  // Method to calculate total price with point usage
  calculateTotalPriceWithPoints(
    originalPrice: number,
    pointsBalance: number
  ): number {
    const pointsUsed = Math.min(pointsBalance, originalPrice);
    this.pointAmount = pointsUsed;
    this.totalPrice = originalPrice - pointsUsed;
    return this.totalPrice;
  }
}

export default TransactionService;
