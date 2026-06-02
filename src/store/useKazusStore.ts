// AdolatAI - Kazus Store (Zustand)

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface KazusCase {
    id: string;
    title: string;
    description: string;
    parties: string[];
    facts: string[];
    legalIssues: string[];
    createdAt: string;
    status: 'draft' | 'analyzing' | 'solved';
}

interface KazusSolution {
    caseId: string;
    logicalChain: string[];
    applicableLaws: {
        code: string;
        article: string;
        relevance: string;
    }[];
    conclusion: string;
    alternatives: string[];
    createdAt: string;
}

interface KazusState {
    // STATE
    currentCase: KazusCase | null;
    cases: KazusCase[];
    currentSolution: KazusSolution | null;

    // ACTIONS
    setCurrentCase: (kazus: KazusCase | null) => void;
    addCase: (kazus: KazusCase) => void;
    updateCase: (kazus: KazusCase) => void;
    removeCase: (id: string) => void;
    setSolution: (solution: KazusSolution | null) => void;
    clearAll: () => void;
}

export const useKazusStore = create<KazusState>()(
    persist(
        (set) => ({
            // STATE - Boshlang'ich qiymatlar
            currentCase: null,
            cases: [],
            currentSolution: null,

            // ACTIONS
            setCurrentCase: (kazus) => set({ currentCase: kazus }),

            addCase: (kazus) => set((state) => ({
                cases: [kazus, ...state.cases].slice(0, 20) // Max 20 ta
            })),

            updateCase: (kazus) => set((state) => ({
                cases: state.cases.map(c => c.id === kazus.id ? kazus : c),
                currentCase: state.currentCase?.id === kazus.id
                    ? kazus
                    : state.currentCase
            })),

            removeCase: (id) => set((state) => ({
                cases: state.cases.filter(c => c.id !== id),
                currentCase: state.currentCase?.id === id
                    ? null
                    : state.currentCase
            })),

            setSolution: (solution) => set({ currentSolution: solution }),

            clearAll: () => set({
                currentCase: null,
                cases: [],
                currentSolution: null
            })
        }),
        {
            name: 'adolat_kazus'
        }
    )
);

export default useKazusStore;
