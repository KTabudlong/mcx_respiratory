const STORAGE_KEY = 'mxc:adminSidebarOpen';

// Admin sidebar open / collapsed on desktop, kept across reloads. Defaults
// to open.
export function readSidebarOpen() {
    try {
        return localStorage.getItem(STORAGE_KEY) !== 'false';
    } catch {
        return true;
    }
}

export function saveSidebarOpen(open: boolean) {
    try {
        localStorage.setItem(STORAGE_KEY, String(open));
    } catch {
        // Private mode / storage disabled: just don't remember.
    }
}
