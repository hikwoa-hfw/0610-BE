// transaction-status.enum.ts
export enum TransactionStatus {
  WAITING_FOR_PAYMENT = "waiting_for_payment",
  WAITING_FOR_ADMIN_CONFIRMATION = "waiting_for_admin_confirmation",
  DONE = "done",
  REJECTED = "rejected",
  EXPIRED = "expired",
  CANCELED = "canceled",
}
