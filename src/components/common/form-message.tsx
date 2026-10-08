import { AlertCircle, CheckCircle2 } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';

export function FormMessage({
    message,
    variant = 'error',
}: {
    message: string;
    variant?: 'error' | 'success';
}) {
    if (!message) {
        return null;
    }

    const Icon = variant === 'error' ? AlertCircle : CheckCircle2;

    return (
        <Alert variant={variant === 'error' ? 'destructive' : 'default'}>
            <Icon aria-hidden />
            <AlertDescription>{message}</AlertDescription>
        </Alert>
    );
}
