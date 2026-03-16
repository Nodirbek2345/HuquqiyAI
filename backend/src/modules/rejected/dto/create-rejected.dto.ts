import { IsString, IsOptional, MinLength } from 'class-validator';

export class CreateRejectedDto {
    @IsString()
    @MinLength(10)
    documentText: string;

    @IsOptional()
    @IsString()
    rejectionReason?: string;
}
