import { ArrowBigDown, ArrowBigUp } from 'lucide-react';
import { useState } from 'react';

import { useAuth } from '@/hooks/use-auth';
import { getErrorMessage } from '@/lib/errors';
import { cn } from '@/lib/utils';
import { castVote } from '@/lib/votes';
import type { VoteValue } from '@/types';

// Up / score / down for a post or comment. Your own vote is highlighted;
// nobody else can see it. `canVote` false shows the score read-only.
export function VoteButtons({
    targetPath,
    classId,
    score,
    myVote,
    canVote,
    onError,
}: {
    targetPath: string;
    classId: string;
    score: number | undefined;
    myVote: VoteValue | undefined;
    canVote: boolean;
    onError: (message: string) => void;
}) {
    const { user } = useAuth();
    const [busy, setBusy] = useState(false);
    const current = myVote ?? null;

    async function vote(tapped: VoteValue) {
        if (!user) {
            return;
        }

        setBusy(true);
        onError('');

        try {
            await castVote(targetPath, classId, user.uid, current, tapped);
        } catch (err) {
            onError(getErrorMessage(err));
        } finally {
            setBusy(false);
        }
    }

    const buttonClass =
        'inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50';

    return (
        <div className="inline-flex items-center gap-0.5">
            {canVote && (
                <button
                    type="button"
                    className={cn(
                        buttonClass,
                        current === 1 && 'text-primary hover:text-primary',
                    )}
                    aria-label="Upvote"
                    aria-pressed={current === 1}
                    disabled={busy}
                    onClick={() => vote(1)}
                >
                    <ArrowBigUp
                        className={cn(
                            'size-5',
                            current === 1 && 'fill-current',
                        )}
                        aria-hidden
                    />
                </button>
            )}
            <span
                className={cn(
                    'min-w-6 text-center text-sm font-medium tabular-nums',
                    current === 1 && 'text-primary',
                    current === -1 && 'text-destructive',
                )}
                aria-label={`Score ${score ?? 0}`}
            >
                {!canVote && (
                    <ArrowBigUp
                        className="mr-0.5 inline size-4 text-muted-foreground"
                        aria-hidden
                    />
                )}
                {score ?? 0}
            </span>
            {canVote && (
                <button
                    type="button"
                    className={cn(
                        buttonClass,
                        current === -1 &&
                            'text-destructive hover:text-destructive',
                    )}
                    aria-label="Downvote"
                    aria-pressed={current === -1}
                    disabled={busy}
                    onClick={() => vote(-1)}
                >
                    <ArrowBigDown
                        className={cn(
                            'size-5',
                            current === -1 && 'fill-current',
                        )}
                        aria-hidden
                    />
                </button>
            )}
        </div>
    );
}
