import React, { useState } from 'react';
import { AdminHeader } from '../components/AdminHeader';
import { AdminSidebar } from '../components/AdminSidebar';

interface LayoutProps {
    children: React.ReactNode;
    activePage: string;
    onNavigate: (page: string) => void;
    onLogout: () => void;
}

export const AdminLayout: React.FC<LayoutProps> = ({ children, activePage, onNavigate, onLogout }) => {
    // Title mapping
    const titles: Record<string, string> = {
        dashboard: 'Tizim Umumiy Holati',
        analysis: 'Hujjat Tahlili Monitoringi',
        kazus: 'Kazus Yechimlari Nazorati',
        rejected: 'Rad Etilgan Hujjatlar Auditi',
        'ai-control': 'AI Provayderlar Boshqaruvi',
        audit: 'Tizim Audit Jurnali',
        security: 'Xavfsizlik va Kirish Huquqlari',
        users: 'Foydalanuvchilar Boshqaruvi',
    };

    return (
        <div className="min-h-screen bg-[#f1f5f9] font-sans antialiased text-slate-900 flex">
            {/* Sidebar */}
            <AdminSidebar activePage={activePage} onNavigate={onNavigate} onLogout={onLogout} />

            {/* Main Content */}
            <div className="flex-1 ml-64 flex flex-col min-h-screen">
                <AdminHeader
                    title={titles[activePage] || 'Admin Panel'}
                    onLogout={onLogout}
                    onNavigate={onNavigate}
                />

                <main className="flex-1 p-8 overflow-y-auto">
                    <div className="max-w-[1600px] mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};
