// AdolatAI - App Providers (Context providerlar)

import React, { ReactNode } from 'react';
import ErrorBoundary from '../components/shared/ErrorBoundary';

interface ProvidersProps {
    children: ReactNode;
}

/**
 * Barcha context providerlarni o'rab oluvchi komponent
 */
export const Providers: React.FC<ProvidersProps> = ({ children }) => {
    return (
        <ErrorBoundary>
            {children}
        </ErrorBoundary>
    );
};

export default Providers;
