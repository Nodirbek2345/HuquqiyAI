// AdolatAI - Shablonlar Sahifasi

import React from 'react';
import { FilePlus } from 'lucide-react';

const TemplatesPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                        <FilePlus className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Shablonlar</h1>
                        <p className="text-slate-500">Professional yuridik hujjatlar yaratish</p>
                    </div>
                </div>

                {/* TODO: Template generator */}
                <div className="bg-white rounded-3xl border border-slate-100 p-8 text-center">
                    <p className="text-slate-400">Shablon yaratish komponenti shu yerga keladi</p>
                </div>
            </div>
        </div>
    );
};

export default TemplatesPage;
