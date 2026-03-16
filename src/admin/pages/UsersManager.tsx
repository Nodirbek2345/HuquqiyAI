import React, { useState, useEffect } from 'react';
import { User, Shield, MoreVertical, Plus, Loader2, Save, X, Eye, EyeOff } from 'lucide-react';
import { getUsers, createUser, deleteUser, updateUser } from '../../services/adminApi';
import { TableRowActions } from '../components/shared/TableRowActions';

interface AdminUser {
    id: string;
    name: string;
    login: string;
    role: string;
    isActive: boolean;
    lastLoginAt: string;
}

export const UsersManager: React.FC = () => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', role: 'ADMIN', password: '' });
    const [saving, setSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async () => {
        setSaving(true);
        try {
            await createUser(newUser);
            setIsModalOpen(false);
            setNewUser({ name: '', email: '', role: 'ADMIN', password: '' });
            fetchUsers();
            alert("✅ Foydalanuvchi muvaffaqiyatli yaratildi!");
        } catch (error) {
            alert("❌ Xatolik yuz berdi");
        } finally {
            setSaving(false);
        }
    };

    const handleToggleStatus = async (user: AdminUser) => {
        try {
            await updateUser(user.id, { isActive: !user.isActive });
            setUsers(users.map(u => u.id === user.id ? { ...u, isActive: !u.isActive } : u));
        } catch (error) {
            alert("Statusni o'zgartirishda xatolik");
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!confirm("Ushbu foydalanuvchini o'chirmoqchimisiz?")) return;
        try {
            await deleteUser(id);
            setUsers(users.filter(u => u.id !== id));
        } catch (error) {
            alert("O'chirishda xatolik");
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Hech qachon';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Hech qachon';
        return date.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Foydalanuvchilar Boshqaruvi</h3>
                    <p className="text-sm text-slate-500">Tizimga kirish huquqiga ega xodimlar ro'yxati.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                >
                    <Plus className="w-4 h-4" /> Yangi Foydalanuvchi
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4">F.I.SH</th>
                            <th className="px-6 py-4">Email (Login)</th>
                            <th className="px-6 py-4">Rol</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Oxirgi Kirish</th>
                            <th className="px-6 py-4 text-right">Amallar</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan={6} className="text-center py-10"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" /></td></tr>
                        ) : users.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-10 text-slate-500">Foydalanuvchilar topilmadi</td></tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 flex items-center gap-3 font-medium text-slate-800">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                            <User className="w-4 h-4" />
                                        </div>
                                        {user.name}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 font-mono text-xs">{user.login}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${['SUPER_ADMIN', 'ADMIN'].includes(user.role) ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                            'bg-slate-50 text-slate-600 border-slate-200'
                                            }`}>
                                            {['SUPER_ADMIN', 'ADMIN'].includes(user.role) && <Shield className="w-3 h-3" />}
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleToggleStatus(user)}
                                            className="flex items-center hover:bg-slate-50 px-2 py-1 rounded-lg transition-colors"
                                        >
                                            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${user.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`}></span>
                                            <span className="text-slate-600">{user.isActive ? 'Faol' : 'Nofaol'}</span>
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-slate-50">{formatDate(user.lastLoginAt)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <TableRowActions
                                            onEdit={() => {
                                                setNewUser({ name: user.name, email: user.login, role: user.role, password: '' });
                                                setIsModalOpen(true);
                                            }}
                                            onDelete={() => handleDeleteUser(user.id)}
                                            extraActions={[
                                                { label: user.isActive ? 'Bloklash' : 'Faollashtirish', icon: Shield, onClick: () => handleToggleStatus(user), variant: user.isActive ? 'danger' : 'success' }
                                            ]}
                                        />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create User Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800">Yangi Foydalanuvchi</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">F.I.SH</label>
                                <input
                                    type="text"
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={newUser.name}
                                    onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                    placeholder="Masalan: Aziz Rahimov"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email (Login)</label>
                                <input
                                    type="email"
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={newUser.email}
                                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                    placeholder="aziz@adolat.uz"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Parol</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="w-full border border-slate-200 rounded-lg pl-3 pr-10 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={newUser.password}
                                        onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                        placeholder="********"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Rol</label>
                                <select
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={newUser.role}
                                    onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                >
                                    <option value="ADMIN">Admin</option>
                                    <option value="SUPER_ADMIN">Super Admin</option>
                                    <option value="AUDITOR">Auditor</option>
                                    <option value="YURIST">Yurist</option>
                                </select>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-slate-600 font-medium text-sm hover:bg-slate-200 rounded-lg transition-colors"
                            >
                                Bekor qilish
                            </button>
                            <button
                                onClick={handleCreateUser}
                                disabled={saving}
                                className="px-4 py-2 bg-blue-600 text-white font-bold text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-70"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Saqlash
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
