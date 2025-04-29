import { IsNotEmpty } from "class-validator";

export class createTransactionDTO {
  @IsNotEmpty()
  readonly id!: number;

  @IsNotEmpty()
  readonly uuid!: string;

  @IsNotEmpty()
  readonly amount!: number;

  @IsNotEmpty()
  readonly status!: string;

  @IsNotEmpty()
  readonly paymentProof!: string;

  @IsNotEmpty()
  readonly pointAmount!: number;

  @IsNotEmpty()
  readonly couponAmount!: number;

  @IsNotEmpty()
  readonly totalPrice!: number;

  @IsNotEmpty()
  readonly userId!: number;

  @IsNotEmpty()
  readonly users!: string;

  @IsNotEmpty()
  readonly eventId!: number;

  @IsNotEmpty()
  readonly events!: string;

  @IsNotEmpty()
  readonly fullName!: string;
}

enum TransactionStatus {
  WAITING_FOR_PAYMENT,
  WAITING_CONFIRMATION,
  PAID,
  REJECT,
  EXPIRED,
}
