import {
    createUserWithEmailAndPassword,
    sendEmailVerification,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
} from 'firebase/auth';

import { auth } from '@/lib/firebase';

export const MIN_PASSWORD_LENGTH = 8;

export async function signUp(email: string, password: string) {
    const { user } = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
    );

    await sendEmailVerification(user);
}

export function logIn(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email.trim(), password);
}

export function logOut() {
    return signOut(auth);
}

export async function resendVerificationEmail() {
    if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
    }
}

export function sendPasswordReset(email: string) {
    return sendPasswordResetEmail(auth, email.trim());
}

// Reloads the signed-in user and refreshes the ID token so Firestore rules
// see the new email_verified value right away.
export async function reloadCurrentUser() {
    if (!auth.currentUser) {
        return;
    }

    await auth.currentUser.reload();
    await auth.currentUser.getIdToken(true);
}
