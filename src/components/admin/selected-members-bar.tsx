import { Check, Copy, Mail, MessageSquare, X } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { MAILTO_MAX_LENGTH, mailtoBcc } from '@/lib/email';

const SELECT_HINT = 'Select at least 1 student to email or text';

// Always shown to people who may message the roster: open the mail app with
// everyone in BCC, copy the addresses (long lists or webmail), or text them.
// The actions stay disabled until someone is selected.
export function SelectedMembersBar({
    selectedCount,
    emails,
    onText,
    onClear,
}: {
    selectedCount: number;
    emails: string[];
    onText: () => void;
    onClear: () => void;
}) {
    const [copied, setCopied] = useState(false);
    const [copyFailed, setCopyFailed] = useState(false);
    const none = selectedCount === 0;
    const href = mailtoBcc(emails);
    const tooLong = href.length > MAILTO_MAX_LENGTH;

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(emails.join(', '));
            setCopied(true);
            setCopyFailed(false);
        } catch {
            setCopyFailed(true);
        }
    }

    return (
        <div
            role="region"
            aria-label="Selected people"
            className="flex flex-col gap-2 rounded-md border bg-muted p-3 sm:flex-row sm:items-center"
        >
            <p className="text-sm font-medium sm:mr-auto">
                {selectedCount} selected
                {none && (
                    <span className="block text-xs font-normal text-muted-foreground">
                        {SELECT_HINT}.
                    </span>
                )}
                {tooLong && (
                    <span className="block text-xs font-normal text-muted-foreground">
                        Too many for an email link — copy the addresses and
                        paste them into BCC.
                    </span>
                )}
                {copyFailed && (
                    <span className="block text-xs font-normal text-destructive">
                        Couldn't copy. Your browser may block clipboard access.
                    </span>
                )}
            </p>
            <span
                className="flex flex-wrap gap-2"
                title={none ? SELECT_HINT : undefined}
            >
                {none ? (
                    <Button size="sm" disabled>
                        <Mail aria-hidden />
                        Email (BCC)
                    </Button>
                ) : (
                    !tooLong &&
                    emails.length > 0 && (
                        <Button asChild size="sm">
                            <a href={href}>
                                <Mail aria-hidden />
                                Email (BCC)
                            </a>
                        </Button>
                    )
                )}
                <Button
                    size="sm"
                    variant="outline"
                    disabled={emails.length === 0}
                    onClick={handleCopy}
                >
                    {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
                    {copied ? 'Copied' : 'Copy addresses'}
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    disabled={none}
                    onClick={onText}
                >
                    <MessageSquare aria-hidden />
                    Text
                </Button>
                <Button
                    size="sm"
                    variant="ghost"
                    disabled={none}
                    onClick={onClear}
                >
                    <X aria-hidden />
                    Clear
                </Button>
            </span>
        </div>
    );
}
