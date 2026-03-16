// AdolatAI - Kazus Yechish Sahifasi

import React from 'react';
import { BrainCircuit } from 'lucide-react';

const KazusPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
                        <BrainCircuit className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Kazus Yechish</h1>
                        <p className="text-slate-500">Murakkab huquqiy vaziyatlarni tahlil qilish</p>
                    </div>
                </div>

                {/* TODO: Kazus input va natijalar komponenti */}
                <div className="bg-white rounded-3xl border border-slate-100 p-8 text-center">
                    <p className="text-slate-400">Kazus kiritish komponenti shu yerga keladi</p>
                </div>
            </div>
        </div>
    );
};

export default KazusPage;
