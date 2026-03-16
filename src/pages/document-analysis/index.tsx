// AdolatAI - Hujjat Tahlili Sahifasi

import React from 'react';
import { Zap } from 'lucide-react';

const DocumentAnalysisPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                        <Zap className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Hujjat Tahlili</h1>
                        <p className="text-slate-500">Shartnomalar va hujjatlarni tahlil qilish</p>
                    </div>
                </div>

                {/* TODO: UploadSection va ResultsDashboard komponentlarini qo'shish */}
                <div className="bg-white rounded-3xl border border-slate-100 p-8 text-center">
                    <p className="text-slate-400">Hujjat yuklash komponenti shu yerga keladi</p>
                </div>
            </div>
        </div>
    );
};

export default DocumentAnalysisPage;
