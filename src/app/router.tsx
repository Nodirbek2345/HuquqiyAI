// AdolatAI - Router (Sahifalar navigatsiyasi)

import React, { lazy, Suspense } from 'react';

// Lazy load sahifalar
const DocumentAnalysisPage = lazy(() => import('../pages/document-analysis/index'));
const KazusPage = lazy(() => import('../pages/kazus/index'));
const RejectedPage = lazy(() => import('../pages/rejected/index'));
const TemplatesPage = lazy(() => import('../pages/templates/index'));

interface Route {
    path: string;
    name: string;
    component: React.LazyExoticComponent<React.FC>;
}

/**
 * Barcha routelarni ro'yxati
 */
export const routes: Route[] = [
    {
        path: '/document-analysis',
        name: 'Hujjat Tahlili',
        component: DocumentAnalysisPage
    },
    {
        path: '/kazus',
        name: 'Kazus Yechish',
        component: KazusPage
    },
    {
        path: '/rejected',
        name: 'Rad Etilgan',
        component: RejectedPage
    },
    {
        path: '/templates',
        name: 'Shablonlar',
        component: TemplatesPage
    }
];

/**
 * Loading komponenti
 */
export const RouteLoading: React.FC = () => (
    <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-blue-600 text-lg font-semibold">
            Yuklanmoqda...
        </div>
    </div>
);

/**
 * Route bo'yicha komponent olish
 */
export const getRouteComponent = (path: string): React.ReactNode => {
    const route = routes.find(r => r.path === path);

    if (!route) {
        return null;
    }

    const Component = route.component;

    return (
        <Suspense fallback={<RouteLoading />}>
            <Component />
        </Suspense>
    );
};

export default routes;
