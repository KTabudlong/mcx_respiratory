import { Loader2 } from 'lucide-react';

export function PageLoader() {
    return (
        <div
            className="flex min-h-48 w-full items-center justify-center"
            role="status"
        >
            <Loader2
                className="size-6 animate-spin text-muted-foreground"
                aria-hidden
            />
            <span className="sr-only">Loading…</span>
        </div>
    );
}
