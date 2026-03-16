import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
    @IsString()
    @IsNotEmpty({ message: 'Login bo\'sh bo\'lmasligi kerak' })
    login: string;

    @IsString()
    @IsNotEmpty({ message: 'Parol bo\'sh bo\'lmasligi kerak' })
    @MinLength(4, { message: 'Parol kamida 4 ta belgidan iborat bo\'lishi kerak' })
    password: string;
}

export class AdminResponseDto {
    id: string;
    login: string;
    name: string;
    role: string;
    lastLoginAt?: Date;
}

export class LoginResponseDto {
    success: boolean;
    token: string;
    admin: AdminResponseDto;
}

export class StatsResponseDto {
    totalAnalysis: number;
    highRiskDocuments: number;
    safeDocuments: number;
    localRuleOverrides: number;
    weeklyTrend: {
        analysis: number;
        highRisk: number;
        safe: number;
    };
}
