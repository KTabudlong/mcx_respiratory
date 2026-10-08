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
};

// Turns Firebase Auth / Firestore errors into messages a student can act on.
export function getErrorMessage(error: unknown) {
    const code =
        typeof error === 'object' && error !== null && 'code' in error
            ? String(error.code)
            : '';

    return MESSAGES[code] ?? 'Something went wrong. Please try again.';
}
