import { IsOptional, IsString } from "class-validator";

export class UpdateUserDTO {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;
}

export class UpdateOrganizerDTO {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  profilePict?: string;

  @IsOptional()
  @IsString()
  bankAccount?: string;
  
  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
