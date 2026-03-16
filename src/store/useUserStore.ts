// AdolatAI - Foydalanuvchi Store (Zustand)

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { STORAGE_KEYS } from '../core/constants';

interface UserSettings {
    theme: 'light' | 'dark' | 'system';
    language: 'uz' | 'ru' | 'en';
    notifications: boolean;
    autoSave: boolean;
}

interface UserState {
    // STATE
    user: User | null;
    isAuthenticated: boolean;
    settings: UserSettings;

    // ACTIONS
    setUser: (user: User | null) => void;
    login: (user: User) => void;
    logout: () => void;
    updateSettings: (settings: Partial<UserSettings>) => void;
    toggleTheme: () => void;
}

const defaultSettings: UserSettings = {
    theme: 'light',
    language: 'uz',
    notifications: true,
    autoSave: true
};

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            // STATE - Boshlang'ich qiymatlar
            user: null,
            isAuthenticated: false,
            settings: defaultSettings,

            // ACTIONS
            setUser: (user) => set({
                user,
                isAuthenticated: !!user
            }),

            login: (user) => set({
                user,
                isAuthenticated: true
            }),

            logout: () => set({
                user: null,
                isAuthenticated: false
            }),

            updateSettings: (newSettings) => set((state) => ({
                settings: { ...state.settings, ...newSettings }
            })),

            toggleTheme: () => {
                const current = get().settings.theme;
                const next = current === 'light' ? 'dark' : 'light';
                set((state) => ({
                    settings: { ...state.settings, theme: next }
                }));
            }
        }),
        {
            name: STORAGE_KEYS.USER
        }
    )
);

export default useUserStore;
