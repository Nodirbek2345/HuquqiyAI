import React from 'react';
import {
    LayoutDashboard,
    FileText,
    BrainCircuit,
    FileX,
    Settings,
    ShieldCheck,
    Users,
    Activity,
    LogOut,
    FilePlus // New icon for templates
} from 'lucide-react';

interface SidebarProps {
    activePage: string;
    onNavigate: (page: string) => void;
    onLogout: () => void;
    isOpen?: boolean;
}

export const AdminSidebar: React.FC<SidebarProps> = ({ activePage, onNavigate, onLogout, isOpen = false }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Boshqaruv Paneli', icon: LayoutDashboard },
        { id: 'analysis', label: 'Hujjat Tahlili', icon: FileText },
        { id: 'kazus', label: 'Kazus Monitoringi', icon: BrainCircuit },
        { id: 'rejected', label: 'Rad Etilganlar', icon: FileX },
        { id: 'templates', label: 'Hujjat Shablonlari', icon: FilePlus },
        { id: 'ai-control', label: 'AI Boshqaruv Markazi', icon: Settings },
        { id: 'audit', label: 'Audit Jurnali', icon: Activity },
        { id: 'security', label: 'Xavfsizlik', icon: ShieldCheck },
        { id: 'users', label: 'Foydalanuvchilar', icon: Users },
    ];

    return (
        <aside className={`fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white flex flex-col z-50 transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            {/* Brand – bosganda asosiy sahifaga orqaga qaytish */}
            <button
                type="button"
                onClick={() => { window.location.hash = ''; }}
                className="h-16 w-full flex items-center px-6 border-b border-slate-800 hover:bg-slate-800/50 transition-colors text-left cursor-pointer"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold uppercase tracking-wider">AdolatAI</h1>
                        <p className="text-[10px] text-slate-400 font-medium tracking-widest">ADMIN PANEL</p>
                    </div>
                </div>
            </button>

            {/* Menu */}
            <nav className="flex-1 py-6 px-3 space-y-1">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activePage === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${isActive
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-rose-400 hover:bg-slate-800 hover:text-rose-300 rounded-lg transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Chiqish
                </button>
                <div className="mt-4 text-center text-[10px] text-slate-600 font-mono">
                    v2.0.1 (PROD)
                </div>
            </div>
        </aside>
    );
};
