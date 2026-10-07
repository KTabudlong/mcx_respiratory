import { Link } from 'react-router';

import { Button } from '@/components/ui/button';

export default function NotFound() {
    return (
        <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-4 text-center">
            <h1 className="text-2xl font-semibold">Page not found</h1>
            <p className="text-muted-foreground">
                That page doesn't exist or has moved.
            </p>
            <Button asChild>
                <Link to="/">Back to home</Link>
            </Button>
        </main>
    );
}
