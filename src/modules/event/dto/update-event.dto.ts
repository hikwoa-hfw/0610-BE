import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { PaginationQueryParams } from "../../pagination/dto/pagination.dto";

export class UpdateEventDto{
    @IsOptional()
    @IsString()
    readonly name?: string
    
    @IsOptional()
    @IsString()
    readonly description?: string
    
    @IsOptional()
    @IsString()
    readonly locationDetail?: string
    
    @IsOptional()
    readonly category?: Category

    @IsOptional()
    readonly startDate?:string
    
    @IsOptional()
    readonly endDate?:string
}

enum Category {
    ORCHESTRA = "ORCHESTRA",
    CASUAL = "CASUAL",
    JAZZ = "JAZZ"
  }