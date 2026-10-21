// The live Firebase project (.env.production / .firebaserc default). Any
// other project ID (e.g. mcx-respiratory-test in .env.local) is a test one.
export const LIVE_PROJECT_ID = 'mcx-respiratory';

export function isTestProject(projectId: string) {
    return projectId !== LIVE_PROJECT_ID;
}

// Keep in sync with isMember() in firestore.rules.
export const ALLOWED_EMAIL_DOMAINS = ['student.ccc.edu', 'ccc.edu'];

export function isAllowedEmail(email: string) {
    const parts = email.trim().toLowerCase().split('@');

    if (parts.length !== 2 || parts[0] === '') {
        return false;
    }

    return ALLOWED_EMAIL_DOMAINS.includes(parts[1]);
}
