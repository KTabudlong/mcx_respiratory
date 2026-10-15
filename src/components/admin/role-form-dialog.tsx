import type { FormEvent } from 'react';
import { useState } from 'react';

import { CheckboxList } from '@/components/admin/checkbox-list';
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
    createRole,
    MAX_ROLE_NAME_LENGTH,
    updateRole,
    validateRole,
} from '@/lib/class-roles';
import { getErrorMessage } from '@/lib/errors';
import type { ClassAccess } from '@/lib/permissions';
import {
    grantablePermissions,
    MAX_ROLE_RANK,
    MIN_ROLE_RANK,
    myRank,
    PERMISSIONS,
} from '@/lib/permissions';
import type { ClassRole } from '@/types';

// Rendered only while open; closing unmounts it so the form resets.
// `role` null = add a new role.
export function RoleFormDialog({
    classId,
    role,
    access,
    onClose,
}: {
    classId: string;
    role: ClassRole | null;
    access: ClassAccess;
    onClose: () => void;
}) {
    const maxRank = Math.min(myRank(access), MAX_ROLE_RANK + 1);
    const grantable = grantablePermissions(access);
    const [name, setName] = useState(role?.name ?? '');
    const [color, setColor] = useState(role?.color ?? '#2563eb');
    const [rank, setRank] = useState(
        String(
            role?.rank ?? Math.max(MIN_ROLE_RANK, Math.min(10, maxRank - 1)),
        ),
    );
    const [permissions, setPermissions] = useState<string[]>(
        role?.permissions ?? [],
    );
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const input = { name, color, rank: Number(rank), permissions };
        const notGrantable = permissions.filter((p) => !grantable.includes(p));
        const message =
            validateRole(input, maxRank) ||
            (notGrantable.length > 0
                ? "Uncheck the permissions your own role doesn't have."
                : '');

        setError(message);

        if (message) {
            return;
        }

        setSubmitting(true);

        try {
            if (role) {
                await updateRole(classId, role.id, input);
            } else {
                await createRole(classId, input);
            }

            onClose();
        } catch (err) {
            setError(getErrorMessage(err));
            setSubmitting(false);
        }
    }

    return (
        <Dialog open onOpenChange={(open) => !open && !submitting && onClose()}>
            <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{role ? 'Edit role' : 'Add role'}</DialogTitle>
                    <DialogDescription>
                        Higher rank = more senior. People can only manage roles
                        ranked below their own.
                    </DialogDescription>
                </DialogHeader>
                <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
                    <FormMessage message={error} />
                    <div className="grid gap-4 sm:grid-cols-[1fr_auto_8rem]">
                        <div className="grid gap-2">
                            <Label htmlFor="role-name">Name</Label>
                            <Input
                                id="role-name"
                                maxLength={MAX_ROLE_NAME_LENGTH}
                                placeholder="e.g. Treasurer"
                                value={name}
                                onChange={(event) =>
                                    setName(event.target.value)
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="role-color">Color</Label>
                            <Input
                                id="role-color"
                                type="color"
                                className="w-16 p-1"
                                value={color}
                                onChange={(event) =>
                                    setColor(event.target.value)
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="role-rank">Rank</Label>
                            <Input
                                id="role-rank"
                                type="number"
                                inputMode="numeric"
                                min={MIN_ROLE_RANK}
                                max={maxRank - 1}
                                value={rank}
                                onChange={(event) =>
                                    setRank(event.target.value)
                                }
                            />
                        </div>
                    </div>
                    <p className="-mt-2 text-xs text-muted-foreground">
                        Rank {MIN_ROLE_RANK} is the lowest
                        {Number.isFinite(myRank(access))
                            ? `; yours is ${myRank(access)}, so pick something below it.`
                            : '.'}
                    </p>
                    <fieldset className="grid gap-3">
                        <legend className="mb-2 text-sm font-medium">
                            Permissions in this class
                        </legend>
                        <CheckboxList
                            name="role-permission"
                            items={PERMISSIONS.map((permission) => ({
                                id: permission.key,
                                label: permission.label,
                                hint: grantable.includes(permission.key)
                                    ? undefined
                                    : "Your role doesn't have this",
                                disabled:
                                    !grantable.includes(permission.key) &&
                                    !permissions.includes(permission.key),
                            }))}
                            selectedIds={permissions}
                            onChange={setPermissions}
                            emptyMessage="No permissions defined."
                        />
                    </fieldset>
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
