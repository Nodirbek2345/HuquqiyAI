import React, { useState, useEffect } from 'react';
import { FileText, AlertTriangle, CheckCircle, Cpu, Activity } from 'lucide-react';
import { getStats, getAlerts, getSystemHealth, type StatsData, type Alert, type SystemHealth } from '../../services/adminApi';

const StatCard: React.FC<{
    title: string;
    value: string;
    trend?: string;
    color: 'blue' | 'rose' | 'emerald' | 'indigo';
    icon: any;
    loading?: boolean;
    onClick?: () => void;
}> = ({ title, value, trend, color, icon: Icon, loading, onClick }) => {
    const colors = {
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        rose: 'bg-rose-50 text-rose-600 border-rose-100',
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    };

    return (
        <div
            onClick={onClick}
            className={`bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex items-start justify-between transition-all active:scale-[0.98] ${onClick ? 'cursor-pointer hover:shadow-md hover:border-slate-300' : ''}`}
        >
            <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
                {loading ? (
                    <div className="h-9 w-20 bg-slate-100 animate-pulse rounded"></div>
                ) : (
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
                )}
                {trend && !loading && (
                    <p className={`text-xs font-medium mt-2 flex items-center gap-1 ${trend.startsWith('+') ? 'text-emerald-600' : trend.startsWith('-') ? 'text-rose-600' : 'text-slate-500'
                        }`}>
                        <Activity className="w-3 h-3" /> {trend} bu hafta
                    </p>
                )}
            </div>
            <div className={`p-3 rounded-lg ${colors[color]}`}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
    );
};

export const Dashboard: React.FC<{ onNavigate?: (page: string) => void }> = ({ onNavigate }) => {
    const [stats, setStats] = useState<StatsData | null>(null);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [health, setHealth] = useState<SystemHealth | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsData, alertsData, healthData] = await Promise.all([
                    getStats(),
                    getAlerts(),
                    getSystemHealth(),
                ]);
                setStats(statsData);
                setAlerts(alertsData);
                setHealth(healthData);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const formatNumber = (num: number) => num.toLocaleString('uz-UZ');

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Jami Tahlil Qilingan"
                    value={stats ? formatNumber(stats.totalAnalysis) : '0'}
                    trend={stats ? `${stats.weeklyTrend.analysis >= 0 ? '+' : ''}${stats.weeklyTrend.analysis}%` : undefined}
                    color="blue"
                    icon={FileText}
                    loading={loading}
                    onClick={() => onNavigate?.('analysis')}
                />
                <StatCard
                    title="Yuqori Xavfli Hujjatlar"
                    value={stats ? formatNumber(stats.highRiskDocuments) : '0'}
                    trend={stats ? `${stats.weeklyTrend.highRisk >= 0 ? '+' : ''}${stats.weeklyTrend.highRisk}%` : undefined}
                    color="rose"
                    icon={AlertTriangle}
                    loading={loading}
                    onClick={() => onNavigate?.('rejected')}
                />
                <StatCard
                    title="Xavfsiz Deb Topilgan"
                    value={stats ? formatNumber(stats.safeDocuments) : '0'}
                    trend={stats ? `${stats.weeklyTrend.safe >= 0 ? '+' : ''}${stats.weeklyTrend.safe}%` : undefined}
                    color="emerald"
                    icon={CheckCircle}
                    loading={loading}
                    onClick={() => onNavigate?.('kazus')}
                />
                <StatCard
                    title="AI O'rniga Mahalliy Qoida"
                    value={stats ? formatNumber(stats.localRuleOverrides) : '0'}
                    trend="+2%"
                    color="indigo"
                    icon={Cpu}
                    loading={loading}
                    onClick={() => onNavigate?.('ai-control')}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Alerts Table */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Muhim Ogohlantirishlar (Real vaqtda)</h3>
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                    </div>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium text-xs uppercase">
                            <tr>
                                <th className="px-6 py-3">Vaqt</th>
                                <th className="px-6 py-3">Hodisa</th>
                                <th className="px-6 py-3">Daraja</th>
                                <th className="px-6 py-3">Holat</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-3"><div className="h-4 w-12 bg-slate-100 animate-pulse rounded"></div></td>
                                        <td className="px-6 py-3"><div className="h-4 w-48 bg-slate-100 animate-pulse rounded"></div></td>
                                        <td className="px-6 py-3"><div className="h-4 w-16 bg-slate-100 animate-pulse rounded"></div></td>
                                        <td className="px-6 py-3"><div className="h-4 w-20 bg-slate-100 animate-pulse rounded"></div></td>
                                    </tr>
                                ))
                            ) : (
                                alerts.map((row, i) => (
                                    <tr
                                        key={row.id || i}
                                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                                        onClick={() => onNavigate?.('audit')}
                                    >
                                        <td className="px-6 py-3 font-mono text-slate-500 text-xs">{row.time}</td>
                                        <td className="px-6 py-3 font-medium text-slate-700 group-hover:text-blue-600 transition-colors">{row.event}</td>
                                        <td className="px-6 py-3">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${row.level === 'KRITIK' ? 'bg-rose-100 text-rose-700' :
                                                row.level === 'YUQORI' ? 'bg-orange-100 text-orange-700' :
                                                    row.level === "O'RTA" ? 'bg-amber-100 text-amber-700' :
                                                        'bg-emerald-100 text-emerald-700'
                                                }`}>{row.level}</span>
                                        </td>
                                        <td className="px-6 py-3 text-slate-500">{row.status}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* System Health */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4">Tizim Holati</h3>

                    <div className="space-y-4">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="h-4 w-32 bg-slate-100 animate-pulse rounded"></div>
                                    <div className="h-4 w-20 bg-slate-100 animate-pulse rounded"></div>
                                </div>
                            ))
                        ) : health ? (
                            Object.entries(health).map(([key, item]) => {
                                const typedItem = item as { status: string; color: string };
                                const labels: Record<string, string> = {
                                    apiGateway: 'API Gateway',
                                    database: "Ma'lumotlar Bazasi (DB)",
                                    aiEngine: 'AI Dvigatel (Gemini)',
                                    ocr: 'OCR Xizmati',
                                    storage: 'Xotira (Disk)',
                                };
                                return (
                                    <div key={key} className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-slate-600">{labels[key] || key}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-800">{typedItem.status}</span>
                                            <span className={`w-2.5 h-2.5 rounded-full ${typedItem.color}`}></span>
                                        </div>
                                    </div>
                                );
                            })
                        ) : null}
                    </div>

                    <div className="pt-6 border-t border-slate-100">
                        <div className="bg-slate-900 rounded-lg p-4 text-white text-xs font-mono">
                            <div className="flex justify-between mb-2">
                                <span className="text-slate-400">CPU Yuklamasi</span>
                                <span>12%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden mb-4">
                                <div className="w-12 h-full bg-emerald-500 rounded-full"></div>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span className="text-slate-400">RAM (Xotira)</span>
                                <span>2.4GB / 8GB</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <div className="w-1/4 h-full bg-blue-500 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
