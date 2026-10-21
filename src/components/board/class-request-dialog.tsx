import type { FormEvent } from 'react';
import { useState } from 'react';
import { toast } from 'sonner';

import { FormMessage } from '@/components/common/form-message';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { useDocument } from '@/hooks/use-document';
import {
    deleteClassRequest,
    MAX_CLASS_NAME_LENGTH,
    MAX_CLASS_REQUEST_NOTE_LENGTH,
    requestClass,
    validateClass,
} from '@/lib/classes';
import { getErrorMessage } from '@/lib/errors';
import type { ClassRequest } from '@/types';

// Ask the super admin to start a class; approving makes you its President.
// Shows your open request instead of the form if you already sent one.
// Rendered only while open; closing unmounts it so the form resets.
export function ClassRequestDialog({ onClose }: { onClose: () => void }) {
    const { user } = useAuth();
    const existing = useDocument<ClassRequest>(
        user ? `classRequests/${user.uid}` : null,
    );
    const [name, setName] = useState('');
    const [startYear, setStartYear] = useState(
        String(new Date().getFullYear()),
    );
    const [endYear, setEndYear] = useState('');
    const [note, setNote] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    async function run(action: () => Promise<unknown>, successMessage: string) {
        setBusy(true);
        setError('');

        try {
            await action();
            toast.success(successMessage);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setBusy(false);
        }
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!user) {
            return;
        }

        const input = {
            name,
            startYear: Number(startYear),
            endYear: endYear.trim() === '' ? null : Number(endYear),
        };
        const message = validateClass(input);

        setError(message);

        if (!message) {
            run(
                () => requestClass(user.uid, { ...input, note }),
                `Request for ${input.name.trim()} sent. The admin will review it.`,
            );
        }
    }

    const request = existing.data;

    return (
        <Dialog open onOpenChange={(open) => !open && !busy && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Request a new class</DialogTitle>
                    <DialogDescription>
                        For a cohort that isn't on the app yet. If the admin
                        approves, you become its President and can set up roles
                        and approve classmates.
                    </DialogDescription>
                </DialogHeader>
                <FormMessage
                    message={
                        error ||
                        (existing.error ? getErrorMessage(existing.error) : '')
                    }
                />
                {existing.loading ? null : request ? (
                    <>
                        <p className="rounded-md border p-3 text-sm">
                            You asked for{' '}
                            <span className="font-medium">{request.name}</span>{' '}
                            ({request.startYear}–{request.endYear ?? ''}).
                            Waiting for the admin.
                        </p>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                disabled={busy}
                                onClick={() =>
                                    run(
                                        () => deleteClassRequest(request.id),
                                        'Class request cancelled.',
                                    )
                                }
                            >
                                Cancel request
                            </Button>
                            <Button onClick={onClose} disabled={busy}>
                                Close
                            </Button>
                        </DialogFooter>
                    </>
                ) : (
                    <form
                        className="grid gap-4"
                        onSubmit={handleSubmit}
                        noValidate
                    >
                        <div className="grid gap-2">
                            <Label htmlFor="request-class-name">
                                Class name
                            </Label>
                            <Input
                                id="request-class-name"
                                placeholder="RT Class of 2028"
                                maxLength={MAX_CLASS_NAME_LENGTH}
                                value={name}
                                onChange={(event) =>
                                    setName(event.target.value)
                                }
                            />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="request-start-year">
                                    Start year
                                </Label>
                                <Input
                                    id="request-start-year"
                                    type="number"
                                    inputMode="numeric"
                                    value={startYear}
                                    onChange={(event) =>
                                        setStartYear(event.target.value)
                                    }
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="request-end-year">
                                    End year{' '}
                                    <span className="font-normal text-muted-foreground">
                                        (optional)
                                    </span>
                                </Label>
                                <Input
                                    id="request-end-year"
                                    type="number"
                                    inputMode="numeric"
                                    value={endYear}
                                    onChange={(event) =>
                                        setEndYear(event.target.value)
                                    }
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="request-note">
                                Note for the admin{' '}
                                <span className="font-normal text-muted-foreground">
                                    (optional)
                                </span>
                            </Label>
                            <Textarea
                                id="request-note"
                                rows={3}
                                maxLength={MAX_CLASS_REQUEST_NOTE_LENGTH}
                                value={note}
                                onChange={(event) =>
                                    setNote(event.target.value)
                                }
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={busy}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={busy}>
                                {busy ? 'Sending…' : 'Send request'}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
