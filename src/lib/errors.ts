const SERVER_PROBLEM = "There's a problem reaching the server";
const IF_IT_KEEPS_HAPPENING =
    'If it keeps happening, check your internet connection or turn off ad blockers for this site.';

const MESSAGES: Record<string, string> = {
    'auth/email-already-in-use':
        'An account with this email already exists. Try logging in instead.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/weak-password': 'Choose a stronger password.',
    'auth/invalid-credential': 'Email or password is incorrect.',
    'auth/wrong-password': 'Email or password is incorrect.',
    'auth/user-not-found': 'Email or password is incorrect.',
    'auth/user-disabled':
        'This account has been disabled. Contact your instructor.',
    'auth/too-many-requests':
        'Too many attempts. Wait a few minutes and try again.',
    'auth/network-request-failed':
        'Network error. Check your connection and try again.',
    'permission-denied': "You don't have permission to do that.",
    'save-timeout': `${SERVER_PROBLEM}, so this wasn't saved. Reload the page and try again later. ${IF_IT_KEEPS_HAPPENING}`,
    'load-timeout': `${SERVER_PROBLEM}. Try again later. ${IF_IT_KEEPS_HAPPENING}`,
    unavailable: `${SERVER_PROBLEM}. Try again later. ${IF_IT_KEEPS_HAPPENING}`,
};

// Turns Firebase Auth / Firestore errors into messages a student can act on.
export function getErrorMessage(error: unknown) {
    const code =
        typeof error === 'object' && error !== null && 'code' in error
            ? String(error.code)
            : '';

    return MESSAGES[code] ?? 'Something went wrong. Please try again.';
}
