import { useState } from 'react';

import { FormMessage } from '@/components/common/form-message';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { logOut, resendVerificationEmail } from '@/lib/auth';
import { getErrorMessage } from '@/lib/errors';

export function VerifyEmailStep({ email }: { email: string }) {
    const { refreshUser } = useAuth();
    const [message, setMessage] = useState<{
        text: string;
        variant: 'error' | 'success';
    }>({ text: '', variant: 'success' });
    const [busy, setBusy] = useState(false);

    async function run(action: () => Promise<void>) {
        setBusy(true);
        setMessage({ text: '', variant: 'success' });

        try {
            await action();
        } catch (err) {
            setMessage({ text: getErrorMessage(err), variant: 'error' });
        } finally {
            setBusy(false);
        }
    }

    function handleCheck() {
        return run(async () => {
            const verified = await refreshUser();

            if (!verified) {
                setMessage({
                    text: 'Not verified yet. Open the link in the email, then try again.',
                    variant: 'error',
                });
            }
        });
    }

    function handleResend() {
        return run(async () => {
            await resendVerificationEmail();
            setMessage({
                text: `Sent a new link to ${email}.`,
                variant: 'success',
            });
        });
    }

    return (
        <div className="grid gap-4">
            <FormMessage message={message.text} variant={message.variant} />
            <p className="text-sm">
                We sent a verification link to{' '}
                <span className="font-medium break-all">{email}</span>. Open it,
                then come back here.
            </p>
            <p className="text-sm text-muted-foreground">
                Can't find it? Check your junk or quarantine folder — school
                email sometimes filters it.
            </p>
            <Button onClick={handleCheck} disabled={busy}>
                I've verified my email
            </Button>
            <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleResend}
                    disabled={busy}
                >
                    Resend email
                </Button>
                <Button
                    variant="ghost"
                    className="flex-1"
                    onClick={() => logOut()}
                    disabled={busy}
                >
                    Use a different account
                </Button>
            </div>
        </div>
    );
}
