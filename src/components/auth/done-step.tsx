import { Link } from 'react-router';

import { Button } from '@/components/ui/button';

export function DoneStep({ approved }: { approved: boolean }) {
    return (
        <div className="grid gap-4">
            <p className="text-sm">
                {approved
                    ? "You're all set. Your class board is ready."
                    : 'Thanks! An instructor or admin will add you to your class. The board opens as soon as they do.'}
            </p>
            <Button asChild>
                <Link to="/">
                    {approved ? 'Go to the class board' : 'Continue'}
                </Link>
            </Button>
        </div>
    );
}
