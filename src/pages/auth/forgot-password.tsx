import type { FormEvent } from 'react';
import { useState } from 'react';
import { Link } from 'react-router';

import { FormMessage } from '@/components/common/form-message';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { sendPasswordReset } from '@/lib/auth';
import { getErrorMessage } from '@/lib/errors';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState<{
        text: string;
        variant: 'error' | 'success';
    }>({ text: '', variant: 'success' });
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSubmitting(true);

        try {
            await sendPasswordReset(email);
            // Same message whether or not the account exists, so the form
            // can't be used to discover who has an account.
            setMessage({
                text: `If an account exists for ${email.trim()}, we sent a reset link. Check your inbox and junk folder.`,
                variant: 'success',
            });
        } catch (err) {
            setMessage({ text: getErrorMessage(err), variant: 'error' });
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">Reset your password</CardTitle>
                <CardDescription>
                    We'll email you a link to set a new password.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form className="grid gap-4" onSubmit={handleSubmit}>
                    <FormMessage
                        message={message.text}
                        variant={message.variant}
                    />
                    <div className="grid gap-2">
                        <Label htmlFor="email">School email</Label>
                        <Input
                            id="email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />
                    </div>
                    <Button type="submit" disabled={submitting}>
                        {submitting ? 'Sending…' : 'Send reset link'}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="justify-center text-sm">
                <Link
                    to="/login"
                    className="font-medium underline-offset-4 hover:underline"
                >
                    Back to log in
                </Link>
            </CardFooter>
        </Card>
    );
}
