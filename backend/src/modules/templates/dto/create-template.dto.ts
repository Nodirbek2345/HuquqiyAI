import { IsString, MinLength } from 'class-validator';

export class CreateTemplateDto {
    @IsString()
    @MinLength(3)
    templateType: string; // ariza, bildirgi, shartnoma, etc.
}
