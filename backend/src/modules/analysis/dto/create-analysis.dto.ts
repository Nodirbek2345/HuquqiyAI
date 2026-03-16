import { IsString, IsOptional, IsIn, MinLength } from 'class-validator';

export class CreateAnalysisDto {
    @IsString()
    @MinLength(10, { message: 'Matn kamida 10 ta belgidan iborat bo\'lishi kerak' })
    text: string;

    @IsOptional()
    @IsIn(['quick', 'kazus', 'rejected', 'template'])
    mode?: 'quick' | 'kazus' | 'rejected' | 'template';

    @IsOptional()
    @IsString()
    ipAddress?: string;
}
