import { Check, Copy, MessageSquare } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { inBatches, SMS_BATCH_SIZE, smsLink, smsPlatform } from '@/lib/sms';

export type TextRecipient = { userId: string; name: string; phone: string };

// Group texts sent from the admin's own phone (sms: links), in batches.
// On a computer the numbers are copied into Google Messages for web,
// Phone Link or similar.
export function TextSelectedDialog({
    recipients,
    skippedNames,
    onClose,
}: {
    recipients: TextRecipient[];
    skippedNames: string[];
    onClose: () => void;
}) {
    const [message, setMessage] = useState('');
    const [copied, setCopied] = useState('');
    const [copyError, setCopyError] = useState('');
    const platform = smsPlatform(navigator.userAgent);
    const batches = inBatches(recipients, SMS_BATCH_SIZE);

    async function copy(key: string, text: string) {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(key);
            setCopyError('');
        } catch {
            setCopyError(
                "Couldn't copy. Your browser may block clipboard access.",
            );
        }
    }

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-h-[90dvh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Text selected</DialogTitle>
                    <DialogDescription>
                        Opens your phone's Messages app as a group text from
                        your own number. Everyone in a group sees the others'
                        numbers and replies go to the whole group.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-2">
                    <Label htmlFor="sms-message">
                        Message{' '}
                        <span className="font-normal text-muted-foreground">
                            (optional, you can also type it in Messages)
                        </span>
                    </Label>
                    <Textarea
                        id="sms-message"
                        rows={3}
                        maxLength={1000}
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                    />
                    {message.trim() && (
                        <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="justify-self-start"
                            onClick={() => copy('message', message.trim())}
                        >
                            {copied === 'message' ? (
                                <Check aria-hidden />
                            ) : (
                                <Copy aria-hidden />
                            )}
                            Copy message
                        </Button>
                    )}
                </div>

                {copyError && (
                    <p className="text-sm text-destructive">{copyError}</p>
                )}

                <ul className="grid gap-2">
                    {batches.map((batch, index) => {
                        const key = `batch-${index}`;
                        const phones = batch.map((item) => item.phone);

                        return (
                            <li
                                key={batch[0].userId}
                                className="grid gap-2 rounded-md border bg-card p-3"
                            >
                                <p className="text-sm font-medium">
                                    {batches.length > 1
                                        ? `Group ${index + 1} of ${batches.length} · `
                                        : ''}
                                    {batch.length}{' '}
                                    {batch.length === 1 ? 'person' : 'people'}
                                </p>
                                <p className="line-clamp-2 text-xs text-muted-foreground">
                                    {batch.map((item) => item.name).join(', ')}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <Button asChild size="sm">
                                        <a
                                            href={smsLink(
                                                phones,
                                                message,
                                                platform,
                                            )}
                                        >
                                            <MessageSquare aria-hidden />
                                            Open in Messages
                                        </a>
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                            copy(key, phones.join(', '))
                                        }
                                    >
                                        {copied === key ? (
                                            <Check aria-hidden />
                                        ) : (
                                            <Copy aria-hidden />
                                        )}
                                        Copy numbers
                                    </Button>
                                </div>
                            </li>
                        );
                    })}
                </ul>

                {recipients.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                        None of the selected people can be texted.
                    </p>
                )}
                {skippedNames.length > 0 && (
                    <div className="grid gap-2 rounded-md border bg-card p-3">
                        <p className="text-sm font-medium">
                            Not included{' '}
                            <span className="font-normal text-muted-foreground">
                                (no phone number or not opted in to texts)
                            </span>
                        </p>
                        <ul className="max-h-32 overflow-y-auto text-sm text-muted-foreground">
                            {skippedNames.map((name, index) => (
                                <li key={`${name}-${index}`}>{name}</li>
                            ))}
                        </ul>
                    </div>
                )}
                <p className="text-xs text-muted-foreground">
                    On a computer, copy the numbers into Google Messages for web
                    or Phone Link (paired with your Android phone).
                </p>
            </DialogContent>
        </Dialog>
    );
}
