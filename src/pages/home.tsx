import { CheckCircle2 } from 'lucide-react';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { ALLOWED_EMAIL_DOMAINS } from '@/lib/config';
import { app } from '@/lib/firebase';

export default function Home() {
    return (
        <main className="flex min-h-svh items-center justify-center p-4 sm:p-6">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-xl">
                        MXC Respiratory Therapy
                    </CardTitle>
                    <CardDescription>
                        Class announcements, coming soon.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <p className="flex items-center gap-2">
                        <CheckCircle2 className="size-4 shrink-0 text-green-600" />
                        <span>
                            Connected to Firebase project{' '}
                            <code className="rounded bg-muted px-1 py-0.5">
                                {app.options.projectId}
                            </code>
                        </span>
                    </p>
                    <p className="text-muted-foreground">
                        Sign-up will be open to{' '}
                        {ALLOWED_EMAIL_DOMAINS.map(
                            (domain) => `@${domain}`,
                        ).join(' and ')}{' '}
                        email addresses.
                    </p>
                </CardContent>
            </Card>
        </main>
    );
}
