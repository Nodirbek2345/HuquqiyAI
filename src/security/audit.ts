// AdolatAI - Audit Log xizmati

import logger from '../core/logger';
import { User } from '../types';

type AuditAction =
    | 'document.upload'
    | 'document.analyze'
    | 'document.view'
    | 'document.delete'
    | 'kazus.create'
    | 'kazus.solve'
    | 'template.create'
    | 'template.download'
    | 'user.login'
    | 'user.logout'
    | 'settings.change'
    | 'history.clear';

interface AuditEntry {
    id: string;
    action: AuditAction;
    userId: string | null;
    userEmail: string | null;
    timestamp: string;
    details: Record<string, unknown>;
    ip?: string;
    userAgent?: string;
}

class AuditService {
    private logs: AuditEntry[] = [];
    private maxLogs = 500;

    /**
     * Audit log yozish
     */
    log(
        action: AuditAction,
        user: User | null,
        details: Record<string, unknown> = {}
    ): void {
        const entry: AuditEntry = {
            id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            action,
            userId: user?.id || null,
            userEmail: user?.email || null,
            timestamp: new Date().toISOString(),
            details,
            userAgent: navigator?.userAgent
        };

        this.logs.push(entry);

        // Limitni saqlash
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs);
        }

        // Logger ga ham yozish
        logger.info(`AUDIT: ${action}`, {
            userId: entry.userId,
            ...details
        });
    }

    /**
     * Hujjat yuklandi
     */
    logDocumentUpload(user: User | null, fileName: string, fileSize: number) {
        this.log('document.upload', user, { fileName, fileSize });
    }

    /**
     * Hujjat tahlil qilindi
     */
    logDocumentAnalyze(user: User | null, mode: string, resultId: string) {
        this.log('document.analyze', user, { mode, resultId });
    }

    /**
     * Foydalanuvchi tizimga kirdi
     */
    logLogin(user: User) {
        this.log('user.login', user, { email: user.email });
    }

    /**
     * Foydalanuvchi tizimdan chiqdi
     */
    logLogout(user: User) {
        this.log('user.logout', user, { email: user.email });
    }

    /**
     * Tarix tozalandi
     */
    logHistoryClear(user: User | null, count: number) {
        this.log('history.clear', user, { clearedCount: count });
    }

    /**
     * Barcha loglarni olish
     */
    getLogs(): AuditEntry[] {
        return [...this.logs];
    }

    /**
     * Foydalanuvchi loglarini olish
     */
    getUserLogs(userId: string): AuditEntry[] {
        return this.logs.filter(log => log.userId === userId);
    }

    /**
     * Oxirgi N ta log
     */
    getRecentLogs(count: number = 50): AuditEntry[] {
        return this.logs.slice(-count).reverse();
    }

    /**
     * Ma'lum action bo'yicha filter
     */
    getLogsByAction(action: AuditAction): AuditEntry[] {
        return this.logs.filter(log => log.action === action);
    }

    /**
     * Sana oralig'i bo'yicha filter
     */
    getLogsByDateRange(startDate: Date, endDate: Date): AuditEntry[] {
        return this.logs.filter(log => {
            const logDate = new Date(log.timestamp);
            return logDate >= startDate && logDate <= endDate;
        });
    }

    /**
     * Loglarni eksport qilish
     */
    exportLogs(): string {
        return JSON.stringify(this.logs, null, 2);
    }

    /**
     * Loglarni tozalash (faqat admin uchun)
     */
    clearLogs(): void {
        this.logs = [];
        logger.warn('Audit logs cleared');
    }
}

// Singleton
export const auditService = new AuditService();
export default auditService;
