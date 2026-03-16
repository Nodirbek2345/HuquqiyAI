import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface AppSettings {
    geminiEnabled: boolean;
    groqEnabled: boolean;
    openaiEnabled: boolean;
    temperature: number;
    maxTokens: string;
    // Security Settings
    twoFactorEnabled?: boolean;
    sessionDuration?: string;
    whitelistedIps?: string;
}

@Injectable()
export class SettingsService {
    private readonly settingsPath = path.join(process.cwd(), 'data', 'settings.json');
    private readonly dataDir = path.join(process.cwd(), 'data');

    constructor() {
        this.ensureDataDir();
    }

    private ensureDataDir() {
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }
        if (!fs.existsSync(this.settingsPath)) {
            const defaultSettings: AppSettings = {
                geminiEnabled: true,
                groqEnabled: true,
                openaiEnabled: false,
                temperature: 0.1,
                maxTokens: '4,096 (Standart)',
                twoFactorEnabled: true,
                sessionDuration: '15 daqiqa',
                whitelistedIps: '192.168.1.0/24\n10.0.0.5\n213.230.100.12'
            };
            fs.writeFileSync(this.settingsPath, JSON.stringify(defaultSettings, null, 2));
        }
    }

    getSettings(): AppSettings {
        try {
            const data = fs.readFileSync(this.settingsPath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            return {
                geminiEnabled: true,
                groqEnabled: true,
                openaiEnabled: false,
                temperature: 0.1,
                maxTokens: '4,096 (Standart)'
            };
        }
    }

    updateSettings(settings: Partial<AppSettings>): AppSettings {
        const current = this.getSettings();
        const updated = { ...current, ...settings };
        fs.writeFileSync(this.settingsPath, JSON.stringify(updated, null, 2));
        return updated;
    }
}
