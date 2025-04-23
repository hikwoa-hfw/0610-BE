import { IsNotEmpty } from "class-validator";
import { Category, User } from "../../../generated/prisma";

export class createEventDTO {
  @IsNotEmpty()
  readonly name!: string;

  @IsNotEmpty()
  readonly locationDetail!: string;

  @IsNotEmpty()
  readonly description!: string;

  @IsNotEmpty()
  readonly thumbnail!: string;

  @IsNotEmpty()
  readonly startDate!: Date;

  @IsNotEmpty()
  readonly endDate!: Date;

  @IsNotEmpty()
  readonly category!: Category;

  @IsNotEmpty()
  readonly userId!: number;

  @IsNotEmpty()
  readonly slug!: string;
}
