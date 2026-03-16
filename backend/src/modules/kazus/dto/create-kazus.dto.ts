import { IsString, MinLength } from 'class-validator';

export class CreateKazusDto {
    @IsString()
    @MinLength(20, { message: 'Kazus matni kamida 20 ta belgidan iborat bo\'lishi kerak' })
    situation: string;
}
