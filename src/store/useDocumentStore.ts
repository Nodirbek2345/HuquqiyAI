// AdolatAI - Hujjat Store (Zustand)

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AnalysisResult, AnalysisMode, AppStep } from '../types';
import { STORAGE_KEYS } from '../core/constants';
import { generateId } from '../utils/helpers';

interface DocumentState {
    // STATE
    currentStep: AppStep;
    analysisMode: AnalysisMode;
    analysisResult: AnalysisResult | null;
    analyzedText: string;
    history: AnalysisResult[];
    loading: boolean;
    error: string | null;
    progress: number;
    progressLabel: string;

    // ACTIONS
    setStep: (step: AppStep) => void;
    setMode: (mode: AnalysisMode) => void;
    setResult: (result: AnalysisResult | null) => void;
    setAnalyzedText: (text: string) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setProgress: (progress: number, label?: string) => void;

    // HISTORY
    addToHistory: (result: AnalysisResult) => void;
    updateHistoryItem: (result: AnalysisResult) => void;
    removeFromHistory: (id: string) => void;
    clearHistory: () => void;

    // RESET
    resetAnalysis: () => void;
    resetAll: () => void;
}

export const useDocumentStore = create<DocumentState>()(
    persist(
        (set) => ({
            // STATE - Boshlang'ich qiymatlar
            currentStep: 'landing',
            analysisMode: 'quick',
            analysisResult: null,
            analyzedText: '',
            history: [],
            loading: false,
            error: null,
            progress: 0,
            progressLabel: '',

            // ACTIONS
            setStep: (step) => set({ currentStep: step }),
            setMode: (mode) => set({ analysisMode: mode }),
            setResult: (result) => set({ analysisResult: result }),
            setAnalyzedText: (text) => set({ analyzedText: text }),
            setLoading: (loading) => set({ loading }),
            setError: (error) => set({ error }),
            setProgress: (progress, label) => set({
                progress,
                progressLabel: label || ''
            }),

            // HISTORY
            addToHistory: (result) => set((state) => ({
                history: [result, ...state.history].slice(0, 50) // Max 50 ta
            })),

            updateHistoryItem: (result) => set((state) => ({
                history: state.history.map(item =>
                    item.id === result.id ? result : item
                ),
                analysisResult: state.analysisResult?.id === result.id
                    ? result
                    : state.analysisResult
            })),

            removeFromHistory: (id) => set((state) => ({
                history: state.history.filter(item => item.id !== id)
            })),

            clearHistory: () => set({ history: [] }),

            // RESET
            resetAnalysis: () => set({
                analysisResult: null,
                analyzedText: '',
                currentStep: 'upload',
                error: null,
                progress: 0,
                progressLabel: ''
            }),

            resetAll: () => set({
                currentStep: 'landing',
                analysisMode: 'quick',
                analysisResult: null,
                analyzedText: '',
                loading: false,
                error: null,
                progress: 0,
                progressLabel: ''
            })
        }),
        {
            name: STORAGE_KEYS.HISTORY,
            partialize: (state) => ({ history: state.history })
        }
    )
);

export default useDocumentStore;
