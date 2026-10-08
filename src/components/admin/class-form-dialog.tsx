import type { FormEvent } from 'react';
import { useState } from 'react';

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
import {
    createClass,
    MAX_CLASS_NAME_LENGTH,
    updateClass,
    validateClass,
} from '@/lib/classes';
import { getErrorMessage } from '@/lib/errors';
import type { ClassGroup } from '@/types';

// Rendered only while open; closing unmounts it so the form resets.
// `classGroup` null = add a new class.
export function ClassFormDialog({
    classGroup,
    onClose,
}: {
    classGroup: ClassGroup | null;
    onClose: () => void;
}) {
    const [name, setName] = useState(classGroup?.name ?? '');
    const [startYear, setStartYear] = useState(
        String(classGroup?.startYear ?? new Date().getFullYear()),
    );
    const [endYear, setEndYear] = useState(
        classGroup?.endYear ? String(classGroup.endYear) : '',
    );
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const input = {
            name,
            startYear: Number(startYear),
            endYear: endYear.trim() === '' ? null : Number(endYear),
        };
        const message = validateClass(input);

        setError(message);

        if (message) {
            return;
        }

        setSubmitting(true);

        try {
            if (classGroup) {
                await updateClass(classGroup.id, input);
            } else {
                await createClass(input);
            }

            onClose();
        } catch (err) {
            setError(getErrorMessage(err));
            setSubmitting(false);
        }
    }

    return (
        <Dialog open onOpenChange={(open) => !open && !submitting && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {classGroup ? 'Edit class' : 'Add class'}
                    </DialogTitle>
                    <DialogDescription>
                        A class is a cohort, for example “RT Class of 2027”.
                    </DialogDescription>
                </DialogHeader>
                <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
                    <FormMessage message={error} />
                    <div className="grid gap-2">
                        <Label htmlFor="class-name">Name</Label>
                        <Input
                            id="class-name"
                            maxLength={MAX_CLASS_NAME_LENGTH}
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                        />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="class-start-year">Start year</Label>
                            <Input
                                id="class-start-year"
                                type="number"
                                inputMode="numeric"
                                value={startYear}
                                onChange={(event) =>
                                    setStartYear(event.target.value)
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="class-end-year">
                                End year{' '}
                                <span className="font-normal text-muted-foreground">
                                    (optional)
                                </span>
                            </Label>
                            <Input
                                id="class-end-year"
                                type="number"
                                inputMode="numeric"
                                value={endYear}
                                onChange={(event) =>
                                    setEndYear(event.target.value)
                                }
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? 'Saving…' : 'Save'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
