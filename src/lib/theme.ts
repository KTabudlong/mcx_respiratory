export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'mxc:theme';

export function readTheme(): Theme {
    try {
        return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
    } catch {
        return 'light';
    }
}

export function saveTheme(theme: Theme) {
    try {
        localStorage.setItem(STORAGE_KEY, theme);
    } catch {
        // Private mode / storage disabled: just don't remember.
    }
}

export function applyTheme(theme: Theme) {
    document.documentElement.classList.toggle('dark', theme === 'dark');
}
