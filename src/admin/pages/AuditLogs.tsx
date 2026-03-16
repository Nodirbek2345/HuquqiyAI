import React, { useState, useEffect } from 'react';
import { Download, Filter, Search, Loader2, Eye, X } from 'lucide-react';
import { getAuditLogs } from '../../services/adminApi';
import { TableRowActions } from '../components/shared/TableRowActions';

export const AuditLogs: React.FC = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [actionFilter, setActionFilter] = useState('Barcha Amallar');
    const [showFilters, setShowFilters] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [viewingLog, setViewingLog] = useState<any | null>(null);
    const limit = 20;

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            try {
                const data = await getAuditLogs(page, limit);
                setLogs(data.logs);
                setTotal(data.total);
            } catch (error) {
                console.error('Failed to fetch logs:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, [page]);

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);

        if (minutes < 60) return `${minutes} daqiqa oldin`;
        if (minutes < 1440) return `${Math.floor(minutes / 60)} soat oldin`;
        return date.toLocaleDateString('uz-UZ');
    };

    const getActionStyle = (action: string): string => {
        if (action.includes('LOGIN')) return 'bg-emerald-50 text-emerald-700 border-emerald-100';
        if (action.includes('CHANGE') || action.includes('UPDATE')) return 'bg-amber-50 text-amber-700 border-amber-100';
        if (action.includes('FAIL') || action.includes('ERROR')) return 'bg-rose-50 text-rose-700 border-rose-100';
        return 'bg-slate-100 text-slate-600 border-slate-200';
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch = !search ||
            log.action?.toLowerCase().includes(search.toLowerCase()) ||
            log.userId?.toLowerCase().includes(search.toLowerCase());

        const matchesAction = actionFilter === 'Barcha Amallar' ||
            (log.action && log.action.toUpperCase().includes(actionFilter.toUpperCase().split(' ')[0]));

        return matchesSearch && matchesAction;
    });

    const handleDownloadCSV = () => {
        setIsDownloading(true);
        setTimeout(() => {
            const headers = "ID,Action,User,Details,IP,Timestamp\n";
            const rows = filteredLogs.map(l => `${l.id},${l.action},${l.userId},${l.entityId},${l.ipAddress},${l.timestamp}`).join("\n");
            const blob = new Blob([headers + rows], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.setAttribute('hidden', '');
            a.setAttribute('href', url);
            a.setAttribute('download', `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setIsDownloading(false);
        }, 1000);
    };

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Jurnalni qidirish..."
                        className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                </div>

                <div className="flex items-center gap-3 relative">
                    <div className="relative">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-all ${actionFilter !== 'Barcha Amallar'
                                ? 'bg-blue-50 border-blue-200 text-blue-600'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <Filter className="w-4 h-4" /> {actionFilter}
                        </button>

                        {showFilters && (
                            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                                {['Barcha Amallar', 'LOGIN', 'UPDATE', 'FAIL', 'CREATE'].map((action) => (
                                    <button
                                        key={action}
                                        onClick={() => {
                                            setActionFilter(action);
                                            setShowFilters(false);
                                        }}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors ${actionFilter === action ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-slate-600'
                                            }`}
                                    >
                                        {action}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleDownloadCSV}
                        disabled={isDownloading}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-70"
                    >
                        {isDownloading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Download className="w-4 h-4" />
                        )}
                        <span>CSV Yuklash</span>
                    </button>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Log ID</th>
                            <th className="px-6 py-4">Amal</th>
                            <th className="px-6 py-4">Foydalanuvchi</th>
                            <th className="px-6 py-4">Tafsilotlar</th>
                            <th className="px-6 py-4">IP Manzil</th>
                            <th className="px-6 py-4">Vaqt</th>
                            <th className="px-6 py-4 text-right">Amallar</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i}>
                                    <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-100 animate-pulse rounded"></div></td>
                                    <td className="px-6 py-4"><div className="h-6 w-28 bg-slate-100 animate-pulse rounded"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-100 animate-pulse rounded"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 w-40 bg-slate-100 animate-pulse rounded"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-100 animate-pulse rounded"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-100 animate-pulse rounded"></div></td>
                                </tr>
                            ))
                        ) : filteredLogs.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                    <p className="font-medium">Loglar topilmadi</p>
                                </td>
                            </tr>
                        ) : (
                            filteredLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4 font-mono text-slate-400 text-xs group-hover:text-blue-600 transition-colors">
                                        {log.id?.substring(0, 8).toUpperCase() || 'LOG-' + Math.random().toString(36).substr(2, 4).toUpperCase()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold uppercase border ${getActionStyle(log.action)}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-700">{log.userId || 'Tizim'}</td>
                                    <td className="px-6 py-4 text-slate-600">{log.entityId || '-'}</td>
                                    <td className="px-6 py-4 font-mono text-slate-400 text-xs">{log.ipAddress || '-'}</td>
                                    <td className="px-6 py-4 text-slate-500 text-xs">{formatTime(log.timestamp || log.createdAt)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <TableRowActions
                                            onView={() => setViewingLog(log)}
                                        />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Log Details Modal */}
            {viewingLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800">Log Tafsilotlari</h3>
                            <button onClick={() => setViewingLog(null)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Amal</p>
                                    <p className="text-sm font-bold text-slate-800">{viewingLog.action}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vaqt</p>
                                    <p className="text-sm font-bold text-slate-800">{new Date(viewingLog.timestamp || viewingLog.createdAt).toLocaleString('uz-UZ')}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Foydalanuvchi</p>
                                <p className="text-sm font-bold text-slate-800">{viewingLog.userId || 'Tizim'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Metadatalar</p>
                                <pre className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-slate-600 font-mono overflow-auto max-h-40">
                                    {viewingLog.details || JSON.stringify(viewingLog, null, 2)}
                                </pre>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button
                                onClick={() => setViewingLog(null)}
                                className="px-6 py-2 bg-slate-900 text-white font-bold text-sm rounded-lg hover:bg-slate-800 transition-colors"
                            >
                                Yopish
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs text-slate-500">
                <span>Jami: {total} ta log (Ko'rsatilmoqda: {(page - 1) * limit + 1}-{Math.min(page * limit, total)})</span>
                <div className="flex gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1 || loading}
                        className="px-3 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50"
                    >
                        Oldingi
                    </button>
                    <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={logs.length < limit || loading}
                        className="px-3 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50"
                    >
                        Keyingi
                    </button>
                </div>
            </div>
        </div>
    );
};
