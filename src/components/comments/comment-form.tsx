import type { FormEvent } from 'react';
import { useState } from 'react';

import { FormMessage } from '@/components/common/form-message';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MAX_COMMENT_LENGTH, validateComment } from '@/lib/comments';
import { getErrorMessage } from '@/lib/errors';

// New comment, reply or edit. Clears itself after a successful new comment.
export function CommentForm({
    label,
    initialBody = '',
    submitLabel,
    autoFocus = false,
    onSubmit,
    onCancel,
}: {
    label: string;
    initialBody?: string;
    submitLabel: string;
    autoFocus?: boolean;
    onSubmit: (body: string) => Promise<void>;
    onCancel?: () => void;
}) {
    const [body, setBody] = useState(initialBody);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const message = validateComment(body);

        setError(message);

        if (message) {
            return;
        }

        setSubmitting(true);

        try {
            await onSubmit(body);
            setBody('');
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form className="grid gap-2" onSubmit={handleSubmit} noValidate>
            <FormMessage message={error} />
            <Textarea
                aria-label={label}
                placeholder={label}
                rows={3}
                maxLength={MAX_COMMENT_LENGTH}
                autoFocus={autoFocus}
                value={body}
                onChange={(event) => setBody(event.target.value)}
            />
            <div className="flex justify-end gap-2">
                {onCancel && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onCancel}
                        disabled={submitting}
                    >
                        Cancel
                    </Button>
                )}
                <Button type="submit" size="sm" disabled={submitting}>
                    {submitting ? 'Saving…' : submitLabel}
                </Button>
            </div>
        </form>
    );
}
