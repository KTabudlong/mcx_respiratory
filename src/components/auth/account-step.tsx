import type { FormEvent } from 'react';
import { useState } from 'react';

import { FormMessage } from '@/components/common/form-message';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MIN_PASSWORD_LENGTH, signUp } from '@/lib/auth';
import { ALLOWED_EMAIL_DOMAINS, isAllowedEmail } from '@/lib/config';
import { getErrorMessage } from '@/lib/errors';

const domainList = ALLOWED_EMAIL_DOMAINS.map((domain) => `@${domain}`).join(
    ' or ',
);

function validate(email: string, password: string, confirmPassword: string) {
    if (!isAllowedEmail(email)) {
        return `Use your school email (${domainList}).`;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
        return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    }

    if (password !== confirmPassword) {
        return 'Passwords do not match.';
    }

    return '';
}

export function AccountStep() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const message = validate(email, password, confirmPassword);

        setError(message);

        if (message) {
            return;
        }

        setSubmitting(true);

        try {
            await signUp(email, password);
        } catch (err) {
            setError(getErrorMessage(err));
            setSubmitting(false);
        }
    }

    return (
        <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
            <FormMessage message={error} />
            <div className="grid gap-2">
                <Label htmlFor="email">School email</Label>
                <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder={`name@${ALLOWED_EMAIL_DOMAINS[0]}`}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                />
                <p className="text-xs text-muted-foreground">
                    Only {domainList} addresses can sign up.
                </p>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirm password</Label>
                <Input
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                />
            </div>
            <Button type="submit" disabled={submitting}>
                {submitting ? 'Creating account…' : 'Create account'}
            </Button>
        </form>
    );
}
