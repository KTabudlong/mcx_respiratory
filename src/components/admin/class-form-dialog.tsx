import type { FormEvent } from 'react';
import { useState } from 'react';
import { toast } from 'sonner';

import { FormMessage } from '@/components/common/form-message';
import { NativeSelect } from '@/components/common/native-select';
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
import { useAuth } from '@/hooks/use-auth';
import {
    createClass,
    MAX_CLASS_NAME_LENGTH,
    updateClass,
    validateClass,
} from '@/lib/classes';
import { getErrorMessage } from '@/lib/errors';
import { compareByName } from '@/lib/user-filters';
import type { ClassGroup, UserProfile } from '@/types';

// Rendered only while open; closing unmounts it so the form resets.
// `classGroup` null = add a new class, optionally with a President picked
// from `users` (they get a top-ranked role with every permission).
export function ClassFormDialog({
    classGroup,
    users,
    onClose,
}: {
    classGroup: ClassGroup | null;
    users: UserProfile[];
    onClose: () => void;
}) {
    const { user } = useAuth();
    const [presidentId, setPresidentId] = useState('');
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
                toast.success(`${input.name.trim()} saved.`);
            } else {
                await createClass(input, presidentId || null, user?.uid ?? '');
                toast.success(`${input.name.trim()} created.`);
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
                    {!classGroup && (
                        <div className="grid gap-2">
                            <Label htmlFor="class-president">
                                President{' '}
                                <span className="font-normal text-muted-foreground">
                                    (optional)
                                </span>
                            </Label>
                            <NativeSelect
                                id="class-president"
                                value={presidentId}
                                onChange={(event) =>
                                    setPresidentId(event.target.value)
                                }
                            >
                                <option value="">No President yet</option>
                                {[...users]
                                    .filter((item) => item.deletedAt === null)
                                    .sort(compareByName)
                                    .map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.lastName}, {item.firstName} (
                                            {item.email})
                                        </option>
                                    ))}
                            </NativeSelect>
                            <p className="text-xs text-muted-foreground">
                                Adds a President role with every permission in
                                this class and gives it to this person. Leave
                                empty for a class with only the Student role.
                            </p>
                        </div>
                    )}
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
