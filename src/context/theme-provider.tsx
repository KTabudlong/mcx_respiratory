import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import { ThemeContext } from '@/context/theme-context';
import { applyTheme, readTheme, saveTheme } from '@/lib/theme';
import type { Theme } from '@/lib/theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(readTheme);

    useEffect(() => {
        applyTheme(theme);
        saveTheme(theme);
    }, [theme]);

    function setTheme(next: Theme) {
        setThemeState(next);
    }

    function toggleTheme() {
        setThemeState((current) => (current === 'dark' ? 'light' : 'dark'));
    }

    return (
        <ThemeContext value={{ theme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext>
    );
}
