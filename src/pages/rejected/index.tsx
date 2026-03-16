// AdolatAI - Rad Etilgan Hujjat Sahifasi

import React from 'react';
import { FileX } from 'lucide-react';

const RejectedPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center">
                        <FileX className="w-6 h-6 text-rose-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Rad Etilgan Hujjat</h1>
                        <p className="text-slate-500">Xatolarni aniqlash va tuzatish yo'riqnomasi</p>
                    </div>
                </div>

                {/* TODO: Rejected document input va diagnostika */}
                <div className="bg-white rounded-3xl border border-slate-100 p-8 text-center">
                    <p className="text-slate-400">Rad etilgan hujjat yuklash komponenti shu yerga keladi</p>
                </div>
            </div>
        </div>
    );
};

export default RejectedPage;
