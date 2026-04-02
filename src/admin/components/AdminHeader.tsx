import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, User, LogOut, Settings, ChevronDown, Lock, ArrowRight, Menu } from 'lucide-react';

interface HeaderProps {
    title: string;
    onLogout?: () => void;
    onNavigate?: (page: string) => void;
    onToggleMobileMenu?: () => void;
}

export const AdminHeader: React.FC<HeaderProps> = ({ title, onLogout, onNavigate, onToggleMobileMenu }) => {
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef<HTMLButtonElement>(null);

    // Modal states
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showAllNotificationsModal, setShowAllNotificationsModal] = useState(false);
    const [viewingNotification, setViewingNotification] = useState<any>(null);

    // Settings state
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Notifications state
    const [localNotifications, setLocalNotifications] = useState([
        { id: 1, title: 'Yangi foydalanuvchi', message: 'Aziz Rahimov ro\'yxatdan o\'tdi', time: '2 daqiqa oldin', unread: true },
        { id: 2, title: 'Tizim xavfsizligi', message: 'Noodatiy kirish urinishi aniqlandi', time: '1 soat oldin', unread: true },
        { id: 3, title: 'Backup', message: 'Ma\'lumotlar muvaffaqiyatli saqlandi', time: '3 soat oldin', unread: false },
    ]);

    const unreadCount = localNotifications.filter(n => n.unread).length;

    const markAllAsRead = () => {
        setLocalNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    };

    const markAsRead = (id: number) => {
        setLocalNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
    };
    // Close notifications when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close user dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);



    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40">
            <div className="flex items-center gap-3">
                {onToggleMobileMenu && (
                    <button
                        onClick={onToggleMobileMenu}
                        className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                )}
                <h2 className="text-[15px] sm:text-lg font-bold text-slate-800 uppercase tracking-tight truncate max-w-[150px] sm:max-w-none">{title}</h2>
            </div>

            <div className="flex items-center gap-6">
                {/* Search */}
                <div className="relative hidden md:block">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Global qidiruv..."
                        className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-700 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    />
                </div>

                <div className="h-6 w-px bg-slate-200"></div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <button
                            ref={notificationRef}
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors active:scale-95"
                        >
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
                            )}
                        </button>

                        {/* Notifications Dropdown */}
                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right z-50">
                                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                    <h3 className="font-bold text-slate-800 text-sm">Bildirishnomalar</h3>
                                    {unreadCount > 0 ? (
                                        <button
                                            onClick={markAllAsRead}
                                            className="text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wider"
                                        >
                                            Hammasini o'qish
                                        </button>
                                    ) : (
                                        <span className="text-xs font-medium text-slate-400 italic">Yangi xabarlar yo'q</span>
                                    )}
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    {localNotifications.map((notif) => (
                                        <div
                                            key={notif.id}
                                            onClick={() => {
                                                markAsRead(notif.id);
                                                setViewingNotification(notif);
                                                setShowNotifications(false);
                                            }}
                                            className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer relative group ${notif.unread ? 'bg-blue-50/30' : ''}`}
                                        >
                                            {notif.unread && (
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                                            )}
                                            <div className="flex justify-between items-start mb-1">
                                                <p className={`text-sm font-bold ${notif.unread ? 'text-slate-900' : 'text-slate-700'}`}>{notif.title}</p>
                                                <span className="text-[10px] text-slate-400 font-medium">{notif.time}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{notif.message}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-2 border-t border-slate-100 bg-slate-50 text-center">
                                    <button
                                        onClick={() => { setShowNotifications(false); setShowAllNotificationsModal(true); }}
                                        className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors w-full py-1"
                                    >
                                        Barchasini ko'rish
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="flex items-center gap-3 pl-2 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                        >
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-slate-800 leading-none">Admin User</p>
                                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mt-1">Super Admin</p>
                            </div>
                            <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 text-slate-500 relative">
                                <User className="w-5 h-5" />
                                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-slate-100">
                                    <ChevronDown className="w-3 h-3 text-slate-400" />
                                </div>
                            </div>
                        </button>

                        {/* Dropdown Menu */}
                        {isOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                                    <p className="font-bold text-slate-800">Admin User</p>
                                    <p className="text-xs text-slate-500 truncate">admin@adolat.uz</p>
                                </div>
                                <div className="p-1">
                                    <button
                                        onClick={() => { setIsOpen(false); setShowProfileModal(true); }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                                    >
                                        <User className="w-4 h-4 text-slate-400" />
                                        Mening Profilim
                                    </button>
                                    <button
                                        onClick={() => { setIsOpen(false); setShowSettingsModal(true); }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                                    >
                                        <Settings className="w-4 h-4 text-slate-400" />
                                        Sozlamalar
                                    </button>
                                </div>
                                <div className="border-t border-slate-100 p-1">
                                    <button
                                        onClick={() => {
                                            setIsOpen(false);
                                            onLogout?.();
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg transition-colors font-medium"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Chiqish
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Profile Modal */}
            {showProfileModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800 text-lg">Mening Profilim</h3>
                            <button onClick={() => setShowProfileModal(false)} className="text-slate-400 hover:text-slate-600">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 border border-blue-200">
                                    <User className="w-8 h-8" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-slate-800">Admin User</h4>
                                    <p className="text-slate-500 text-sm">Super Admin</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <p className="text-xs text-slate-400 uppercase font-bold mb-0.5">Login ID</p>
                                    <p className="font-mono text-sm font-medium text-slate-700">admin@adolat.uz</p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <p className="text-xs text-slate-400 uppercase font-bold mb-0.5">Rol</p>
                                    <p className="font-mono text-sm font-medium text-slate-700">Tizim Administratori</p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <p className="text-xs text-slate-400 uppercase font-bold mb-0.5">Oxirgi Kirish</p>
                                    <p className="font-mono text-sm font-medium text-slate-700">{new Date().toLocaleString('uz-UZ')}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-100 flex justify-end">
                            <button onClick={() => setShowProfileModal(false)} className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium">Yopish</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Settings Modal */}
            {showSettingsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800 text-lg">Sozlamalar</h3>
                            <button onClick={() => setShowSettingsModal(false)} className="text-slate-400 hover:text-slate-600">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div
                                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                                className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-white group-hover:text-blue-600 transition-colors">
                                        <Bell className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-700 text-sm">Bildirishnomalar</p>
                                        <p className="text-xs text-slate-500">Ovoz va pop-up sozlamalari</p>
                                    </div>
                                </div>
                                <div className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors duration-200 ${notificationsEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}>
                                    <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${notificationsEnabled ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                </div>
                            </div>

                            <div
                                onClick={() => {
                                    setShowSettingsModal(false);
                                    onNavigate?.('security');
                                }}
                                className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-white group-hover:text-amber-600 transition-colors">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-700 text-sm">Xavfsizlik</p>
                                        <p className="text-xs text-slate-500">Parol va 2FA himoyasi</p>
                                    </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-all group-hover:translate-x-1" />
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-100 flex justify-end">
                            <button
                                onClick={() => {
                                    setIsSaving(true);
                                    setTimeout(() => {
                                        setIsSaving(false);
                                        setShowSettingsModal(false);
                                    }, 800);
                                }}
                                disabled={isSaving}
                                className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-bold text-sm transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2"
                            >
                                {isSaving ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Saqlanmoqda...
                                    </>
                                ) : 'Saqlash'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* All Notifications Modal */}
            {showAllNotificationsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">Barcha Bildirishnomalar</h3>
                                <p className="text-xs text-slate-500">So'nggi 30 kunlik tarix</p>
                            </div>
                            <button onClick={() => setShowAllNotificationsModal(false)} className="text-slate-400 hover:text-slate-600">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="overflow-y-auto">
                            {localNotifications.concat([
                                { id: 4, title: 'Tizim Yangilanishi', message: 'Yangi versiya v2.4.0 muvaffaqiyatli o\'rnatildi', time: 'Kecha', unread: false },
                                { id: 5, title: 'Server Yuklamasi', message: 'CPU yuklamasi 80% dan oshdi (Ogohlantirish)', time: 'Kecha', unread: false },
                                { id: 6, title: 'Foydalanuvchi Bloklandi', message: 'IP 192.168.1.45 bloklandi (3 marta xato parol)', time: '2 kun oldin', unread: false },
                            ]).map((notif) => (
                                <div
                                    key={notif.id}
                                    onClick={() => {
                                        markAsRead(notif.id);
                                        setViewingNotification(notif);
                                    }}
                                    className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer ${notif.unread ? 'bg-blue-50/30' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <p className={`text-sm font-bold ${notif.unread ? 'text-slate-900' : 'text-slate-700'}`}>{notif.title}</p>
                                        <span className="text-[10px] text-slate-400 font-medium">{notif.time}</span>
                                    </div>
                                    <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    markAllAsRead();
                                    setShowAllNotificationsModal(false);
                                }}
                                className="text-xs font-bold text-blue-600 hover:text-blue-800 px-4 py-2 transition-colors"
                            >
                                Barchasini o'qilgan deb belgilash
                            </button>
                            <button onClick={() => setShowAllNotificationsModal(false)} className="px-4 py-2 bg-slate-200 text-slate-700 font-bold text-sm rounded-lg hover:bg-slate-300 transition-colors">Yopish</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Single Notification Detail Modal */}
            {viewingNotification && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800">Xabar Tafsiloti</h3>
                            <button onClick={() => setViewingNotification(null)} className="text-slate-400 hover:text-slate-600">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded">Tizim</span>
                                <span className="text-xs text-slate-400 font-medium">{viewingNotification.time}</span>
                            </div>
                            <h4 className="font-black text-slate-900 text-lg mb-2">{viewingNotification.title}</h4>
                            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                                "{viewingNotification.message}"
                            </p>
                        </div>
                        <div className="p-4 border-t border-slate-100 flex justify-end">
                            <button
                                onClick={() => setViewingNotification(null)}
                                className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-bold text-sm transition-all active:scale-95"
                            >
                                Tushunarli
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};
