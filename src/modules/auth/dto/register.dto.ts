import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsStrongPassword,
} from "class-validator";

export class RegisterUserDTO {
  @IsNotEmpty()
  @IsString()
  readonly fullName!: string;

  @IsNotEmpty()
  @IsEmail()
  readonly email!: string;

  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 6,
    minSymbols: 0,
    minLowercase: 0,
    minNumbers: 0,
    minUppercase: 0,
  })
  readonly password!: string;

  @IsOptional()
  @IsString()
  referralCodeUsed?: string;
}

export class RegisterOrganizerDTO {
  @IsNotEmpty()
  @IsString()
  readonly fullName!: string;

  @IsNotEmpty()
  @IsEmail()
  readonly email!: string;

  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 6,
    minSymbols: 0,
    minLowercase: 0,
    minNumbers: 0,
    minUppercase: 0,
  })
  readonly password!: string;

  @IsNotEmpty()
  @IsString()
  readonly profilePict!: string

  @IsNotEmpty()
  @IsNumber()
  readonly bankAccount!:number

  @IsNotEmpty()
  @IsString()
  readonly bankName!:string
  
  @IsNotEmpty()
  @IsNumber()
  readonly phoneNumber!:number
}


