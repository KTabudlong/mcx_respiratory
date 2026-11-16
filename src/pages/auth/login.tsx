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
import { logIn } from '@/lib/auth';
import { getErrorMessage } from '@/lib/errors';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            await logIn(email, password);
        } catch (err) {
            setError(getErrorMessage(err));
            setSubmitting(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">Log in</CardTitle>
                <CardDescription>Use your school email.</CardDescription>
            </CardHeader>
            <CardContent>
                <form className="grid gap-4" onSubmit={handleSubmit}>
                    <FormMessage message={error} />
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <div className="flex items-center justify-between gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Link
                                to="/forgot-password"
                                className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            required
                        />
                    </div>
                    <Button type="submit" disabled={submitting}>
                        {submitting ? 'Logging in…' : 'Log in'}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="justify-center text-sm text-muted-foreground">
                New here?&nbsp;
                <Link
                    to="/signup"
                    className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                    Create an account
                </Link>
            </CardFooter>
        </Card>
    );
}
