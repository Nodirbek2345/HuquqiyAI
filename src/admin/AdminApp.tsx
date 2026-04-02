import React, { useState, useEffect } from 'react';
import { AdminLayout } from './layout/AdminLayout';
import { Dashboard } from './pages/Dashboard';
import { AIControlCenter } from './pages/AIControlCenter';
import { AuditLogs } from './pages/AuditLogs';
import { AdminLogin } from './pages/Login';
import { AnalysisMonitor } from './pages/AnalysisMonitor';
import { KazusMonitor } from './pages/KazusMonitor';
import { RejectedMonitor } from './pages/RejectedMonitor';
import { TemplatesManager } from './pages/TemplatesManager';
import { UsersManager } from './pages/UsersManager';
import { SecurityControl } from './pages/SecurityControl';
import { validateToken, adminLogout, setAuthData } from '../services/adminApi';

export const AdminApp: React.FC = () => {
    const [activePage, _setActivePage] = useState(localStorage.getItem('admin_active_page') || 'dashboard');
    const setActivePage = (page: string) => {
        localStorage.setItem('admin_active_page', page);
        _setActivePage(page);
    };
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Validate token on mount
        const checkAuth = async () => {
            const admin = await validateToken();
            setIsAuthenticated(!!admin);
            setIsLoading(false);
        };
        checkAuth();
    }, []);

    const handleLogin = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = async () => {
        await adminLogout();
        setIsAuthenticated(false);
        window.location.hash = '';
        window.location.reload();
    };

    // Show loading while checking auth
    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <AdminLogin onLogin={handleLogin} />;
    }

    const renderContent = () => {
        switch (activePage) {
            case 'dashboard': return <Dashboard onNavigate={setActivePage} />;
            case 'analysis': return <AnalysisMonitor />;
            case 'kazus': return <KazusMonitor />;
            case 'rejected': return <RejectedMonitor />;
            case 'templates': return <TemplatesManager />;
            case 'ai-control': return <AIControlCenter />;
            case 'audit': return <AuditLogs />;
            case 'users': return <UsersManager />;
            case 'security': return <SecurityControl />;

            default: return <Dashboard />;
        }
    };

    return (
        <AdminLayout activePage={activePage} onNavigate={setActivePage} onLogout={handleLogout}>
            {renderContent()}
        </AdminLayout>
    );
};
