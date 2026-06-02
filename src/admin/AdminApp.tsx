import React, { useState, useEffect, lazy, Suspense } from 'react';
import { AdminLayout } from './layout/AdminLayout';
import { AdminLogin } from './pages/Login';
import { validateToken, adminLogout, setAuthData } from '../services/adminApi';

// ━━━ Lazy-loaded sahifalar (faqat tanlanganda yuklanadi) ━━━
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const AIControlCenter = lazy(() => import('./pages/AIControlCenter').then(m => ({ default: m.AIControlCenter })));
const AuditLogs = lazy(() => import('./pages/AuditLogs').then(m => ({ default: m.AuditLogs })));
const AnalysisMonitor = lazy(() => import('./pages/AnalysisMonitor').then(m => ({ default: m.AnalysisMonitor })));
const KazusMonitor = lazy(() => import('./pages/KazusMonitor').then(m => ({ default: m.KazusMonitor })));
const RejectedMonitor = lazy(() => import('./pages/RejectedMonitor').then(m => ({ default: m.RejectedMonitor })));
const TemplatesManager = lazy(() => import('./pages/TemplatesManager').then(m => ({ default: m.TemplatesManager })));
const UsersManager = lazy(() => import('./pages/UsersManager').then(m => ({ default: m.UsersManager })));
const SecurityControl = lazy(() => import('./pages/SecurityControl').then(m => ({ default: m.SecurityControl })));

// Sahifa yuklanish indikatori
const PageLoader = () => (
    <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Yuklanmoqda...</p>
        </div>
    </div>
);

export const AdminApp: React.FC = () => {
    const [activePage, _setActivePage] = useState(localStorage.getItem('admin_active_page') || 'dashboard');
    const setActivePage = (page: string) => {
        localStorage.setItem('admin_active_page', page);
        _setActivePage(page);
    };
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
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
            <Suspense fallback={<PageLoader />}>
                {renderContent()}
            </Suspense>
        </AdminLayout>
    );
};
