import { IsNotEmpty, IsStrongPassword } from "class-validator";

export class ResetPasswordDTO {
  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 6,
    minSymbols: 0,
    minLowercase: 0,
    minNumbers: 0,
    minUppercase: 0,
  })
  readonly password!: string;
}
