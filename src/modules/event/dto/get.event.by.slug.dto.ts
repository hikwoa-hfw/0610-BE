import { IsNotEmpty } from "class-validator";

export class GetEventBySlugDTO {
  @IsNotEmpty()
  readonly slug!: string;
}
