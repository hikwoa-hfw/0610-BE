import { IsOptional, IsString } from "class-validator";

export class UpdateTransactionDTO {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  paymentProof?: string;

  @IsOptional()
  @IsString()
  voucherId?:string

  @IsOptional()
  @IsString()
  couponId?:string


}
