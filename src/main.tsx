import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router/dom';
import { Toaster } from 'sonner';

import { EnvironmentBadge } from '@/components/common/environment-badge';
import { AuthProvider } from '@/context/auth-provider';
import { ThemeProvider } from '@/context/theme-provider';
import { useTheme } from '@/hooks/use-theme';
import { applyTheme, readTheme } from '@/lib/theme';
import { router } from '@/router';

import './index.css';

applyTheme(readTheme());

function ThemedToaster() {
    const { theme } = useTheme();

    return (
        <Toaster theme={theme} position="top-center" richColors closeButton />
    );
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ThemeProvider>
            <AuthProvider>
                <RouterProvider router={router} />
            </AuthProvider>
            <EnvironmentBadge />
            <ThemedToaster />
        </ThemeProvider>
    </StrictMode>,
);
