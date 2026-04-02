// Admin Panel API Client
// Handles authentication and admin panel data fetching

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface AdminUser {
    id: string;
    login: string;
    name: string;
    role: string;
    lastLoginAt?: string;
}

export interface LoginResponse {
    success: boolean;
    token: string;
    admin: AdminUser;
}

export interface StatsData {
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

export interface Alert {
    id: string;
    time: string;
    event: string;
    level: string;
    status: string;
}

export interface SystemHealth {
    apiGateway: { status: string; color: string };
    database: { status: string; color: string };
    aiEngine: { status: string; color: string };
    ocr: { status: string; color: string };
    storage: { status: string; color: string };
}

// Token storage
const TOKEN_KEY = 'adolat_admin_token';
const ADMIN_KEY = 'adolat_admin_user';

export function getStoredToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function getStoredAdmin(): AdminUser | null {
    const data = localStorage.getItem(ADMIN_KEY);
    return data ? JSON.parse(data) : null;
}

export function setAuthData(token: string, admin: AdminUser): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
}

export function clearAuthData(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_KEY);
}

// API Helper
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getStoredToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Xatolik yuz berdi' }));
        throw new Error(error.message || `HTTP error ${response.status}`);
    }

    return response.json();
}

// Login
export async function adminLogin(login: string, password: string): Promise<LoginResponse> {
    const response = await apiRequest<LoginResponse>('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ login, password }),
    });

    if (response.success && response.token) {
        setAuthData(response.token, response.admin);
    }

    return response;
}

// Logout
export async function adminLogout(): Promise<void> {
    try {
        await apiRequest('/api/admin/logout', { method: 'POST' });
    } catch {
        // Ignore logout errors
    } finally {
        clearAuthData();
    }
}

// Validate token
export async function validateToken(): Promise<AdminUser | null> {
    const token = getStoredToken();
    if (!token) return null;

    try {
        const response = await apiRequest<{ success: boolean; admin: AdminUser }>('/api/admin/profile');
        return response.admin;
    } catch {
        clearAuthData();
        return null;
    }
}

// Get dashboard stats
export async function getStats(): Promise<StatsData> {
    try {
        const response = await apiRequest<{ success: boolean; stats: StatsData }>('/api/admin/stats');
        return response.stats;
    } catch {
        // Return mock data if backend unavailable
        return {
            totalAnalysis: 1248,
            highRiskDocuments: 86,
            safeDocuments: 942,
            localRuleOverrides: 23,
            weeklyTrend: { analysis: 12, highRisk: -5, safe: 8 },
        };
    }
}

// Get alerts
export async function getAlerts(): Promise<Alert[]> {
    try {
        const response = await apiRequest<{ success: boolean; alerts: Alert[] }>('/api/admin/alerts');
        return response.alerts;
    } catch {
        // Return mock data if backend unavailable
        return [
            { id: '1', time: '10:42', event: 'Gemini API Kalit #1 Limiti Tugadi (429)', level: 'YUQORI', status: 'Almashtirildi' },
            { id: '2', time: '09:15', event: 'PDF O\'qish Xatosi (Buzilgan Fayl)', level: 'O\'RTA', status: 'Qayd etildi' },
            { id: '3', time: '08:00', event: 'Tizim Zaxira Nusxasi (Backup)', level: 'PAST', status: 'Muvaffaqiyatli' },
            { id: '4', time: 'Kecha', event: 'Ruxsatsiz Kirish Urinishi (IP 192.x)', level: 'KRITIK', status: 'Bloklandi' },
        ];
    }
}

// Get system health
export async function getSystemHealth(): Promise<SystemHealth> {
    try {
        const response = await apiRequest<{ success: boolean; health: SystemHealth }>('/api/admin/system-health');
        return response.health;
    } catch {
        // Return mock data if backend unavailable
        return {
            apiGateway: { status: 'Ishlamoqda', color: 'bg-emerald-500' },
            database: { status: 'Ishlamoqda', color: 'bg-emerald-500' },
            aiEngine: { status: 'Sekinlashgan', color: 'bg-amber-500' },
            ocr: { status: 'Ishlamoqda', color: 'bg-emerald-500' },
            storage: { status: '98% Bo\'sh', color: 'bg-blue-500' },
        };
    }
}

// ==========================================
// ADMIN MONITOR ENDPOINTS
// ==========================================

export interface AnalysisRecord {
    id: string;
    documentType: string;
    mode: string;
    overallRisk: string;
    riskScore: number;
    summary: string;
    createdAt: string;
    issues?: any[];
}

export interface AnalysisListResponse {
    analyses: AnalysisRecord[];
    total: number;
    page: number;
    limit: number;
}

// Get analysis list for admin monitor
export async function getAnalysisList(page = 1, limit = 20, search = '', status = ''): Promise<AnalysisListResponse> {
    try {
        const queryParams = new URLSearchParams({
            limit: limit.toString(),
            search,
            ...(status ? { status } : {})
        });

        const response = await fetch(`${API_BASE_URL}/api/analysis?${queryParams}`, {
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) throw new Error('Failed to fetch');

        const data = await response.json();
        return {
            analyses: data,
            total: data.length,
            page,
            limit,
        };
    } catch {
        return {
            analyses: [],
            total: 0,
            page,
            limit,
        };
    }
}

// Get kazus list
export async function getKazusList(page = 1, limit = 20): Promise<{ kazuslar: any[]; total: number }> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/kazus?limit=${limit}`, {
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) throw new Error('Failed to fetch');

        const data = await response.json();
        return { kazuslar: data, total: data.length };
    } catch {
        return {
            kazuslar: [],
            total: 0,
        };
    }
}

// Get rejected documents list
export async function getRejectedList(page = 1, limit = 20): Promise<{ rejected: any[]; total: number }> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/rejected?limit=${limit}`, {
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) throw new Error('Failed to fetch');

        const data = await response.json();
        return { rejected: data, total: data.length };
    } catch {
        return {
            rejected: [],
            total: 0,
        };
    }
}

// Get templates list
export async function getTemplatesList(page = 1, limit = 20): Promise<{ templates: any[]; total: number }> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/templates?limit=${limit}`, {
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) throw new Error('Failed to fetch');

        const data = await response.json();
        return { templates: data, total: data.length };
    } catch {
        return {
            templates: [],
            total: 0,
        };
    }
}

// Get audit logs
export async function getAuditLogs(page = 1, limit = 50): Promise<{ logs: any[]; total: number }> {
    try {
        const response = await apiRequest<{ success: boolean; logs: any[] }>('/api/admin/audit-logs');
        return { logs: response.logs, total: response.logs.length };
    } catch {
        // Return mock data
        return {
            logs: [
                { id: '1', action: 'LOGIN', userId: 'admin', ipAddress: '192.168.1.1', timestamp: '2026-01-29T10:00:00Z' },
                { id: '2', action: 'ANALYZE', userId: 'admin', ipAddress: '192.168.1.1', timestamp: '2026-01-29T09:45:00Z' },
            ],
            total: 234,
        };
    }
}

// ==========================================
// SYSTEM SETTINGS
// ==========================================

export interface AppSettings {
    geminiEnabled: boolean;
    openaiEnabled: boolean;
    groqEnabled: boolean;
    temperature: number;
    maxTokens: string;
    twoFactorEnabled?: boolean;
    sessionDuration?: string;
    whitelistedIps?: string;
}

const SETTINGS_STORAGE_KEY = 'adolat_app_settings';

export async function getSystemSettings(): Promise<AppSettings> {
    try {
        const response = await apiRequest<{ success: boolean; settings: AppSettings }>('/api/admin/settings');
        // Sync to localStorage on success
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(response.settings));
        return response.settings;
    } catch {
        // Try localStorage first
        const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (stored) {
            try { return JSON.parse(stored); } catch { }
        }
        // Fallback to defaults
        return {
            geminiEnabled: true,
            openaiEnabled: false,
            groqEnabled: true,
            temperature: 0.1,
            maxTokens: '4,096 (Standart)'
        };
    }
}

export async function updateSystemSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    try {
        const response = await apiRequest<{ success: boolean; settings: AppSettings }>('/api/admin/settings', {
            method: 'PUT',
            body: JSON.stringify(settings)
        });
        // Sync to localStorage on success
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(response.settings));
        return response.settings;
    } catch {
        // Fallback: save to localStorage if backend fails
        const defaults: AppSettings = {
            geminiEnabled: true,
            openaiEnabled: false,
            groqEnabled: true,
            temperature: 0.1,
            maxTokens: '4,096 (Standart)'
        };
        let current = defaults;
        try {
            const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
            if (stored) current = JSON.parse(stored);
        } catch { }
        const updated = { ...current, ...settings } as AppSettings;
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
        return updated;
    }
}

// ==========================================
// USER MANAGEMENT
// ==========================================

export async function getUsers(): Promise<any[]> {
    try {
        const response = await apiRequest<{ success: boolean; users: any[] }>('/api/admin/users');
        return response.users;
    } catch {
        return [
            { id: '1', name: 'Admin User', login: 'admin@adolat.uz', role: 'SUPER_ADMIN', isActive: true, lastLoginAt: new Date().toISOString() },
            { id: '2', name: 'Aziz Rahimov', login: 'aziz.r@adolat.uz', role: 'AUDITOR', isActive: true, lastLoginAt: new Date(Date.now() - 7200000).toISOString() },
        ];
    }
}

export async function createUser(userData: any): Promise<any> {
    const response = await apiRequest<{ success: boolean; user: any }>('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(userData)
    });
    return response.user;
}

export async function deleteUser(id: string): Promise<void> {
    try {
        await apiRequest(`/api/admin/users/${id}`, { method: 'DELETE' });
    } catch {
        // Mock success
    }
}

export async function updateUser(id: string, data: any): Promise<any> {
    try {
        const response = await apiRequest<{ success: boolean; user: any }>(`/api/admin/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        return response.user;
    } catch {
        // Mock success return
        return { id, ...data };
    }
}

// ==========================================
// PLATFORM USER MANAGEMENT
// ==========================================

export async function getPlatformUsersList(): Promise<any[]> {
    try {
        const response = await apiRequest<{ success: boolean; users: any[] }>('/api/admin/platform-users');
        return response.users || [];
    } catch (e) {
        console.error('Failed to fetch platform users from DB', e);
        return [];
    }
}

export async function updatePlatformUserStatusApi(id: string, status: string): Promise<any> {
    const response = await apiRequest<{ success: boolean; user: any }>(`/api/admin/platform-users/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
    });
    return response.user;
}

export async function deletePlatformUserApi(id: string): Promise<void> {
    await apiRequest(`/api/admin/platform-users/${id}`, { method: 'DELETE' });
}

// ==========================================
// TEMPLATE & ANALYSIS ROW ACTIONS
// ==========================================

export async function deleteTemplate(id: string): Promise<void> {
    try {
        await apiRequest(`/api/admin/templates/${id}`, { method: 'DELETE' });
    } catch {
        // Mock success
    }
}

export async function deleteAnalysis(id: string): Promise<void> {
    try {
        await apiRequest(`/api/admin/analysis/${id}`, { method: 'DELETE' });
    } catch {
        // Mock success
    }
}
