import type { FormEvent } from 'react';
import { useState } from 'react';

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
import { Label } from '@/components/ui/label';
import { useCollection } from '@/hooks/use-collection';
import { addExistingMember } from '@/lib/class-members';
import { getErrorMessage } from '@/lib/errors';
import { compareByName } from '@/lib/user-filters';
import type { ClassRole, UserContact, UserProfile } from '@/types';

// Super admin only: add an account that already exists (including your own)
// to this class. Rendered only while open.
export function AddMemberDialog({
    classId,
    memberIds,
    joinRequestIds,
    roles,
    defaultRoleId,
    currentUserId,
    onClose,
}: {
    classId: string;
    memberIds: Set<string>;
    joinRequestIds: Set<string>;
    roles: ClassRole[];
    defaultRoleId: string;
    currentUserId: string;
    onClose: () => void;
}) {
    const users = useCollection<UserProfile>('users');
    const contacts = useCollection<UserContact>('userContacts');
    const [userId, setUserId] = useState('');
    const [roleId, setRoleId] = useState(defaultRoleId);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const candidates = users.data
        .filter((user) => !memberIds.has(user.id) && user.deletedAt === null)
        .sort(compareByName);
    const loadError = users.error ?? contacts.error;

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const role = roles.find((item) => item.id === roleId);
        const message =
            (userId ? '' : 'Pick a person.') || (role ? '' : 'Pick a role.');

        setError(message);

        if (message || !role) {
            return;
        }

        setSubmitting(true);

        try {
            const contact = contacts.data.find((item) => item.id === userId);

            await addExistingMember(
                classId,
                {
                    userId,
                    phone: contact?.phone ?? '',
                    smsOptIn: contact?.smsOptIn ?? false,
                },
                role,
                currentUserId,
                joinRequestIds.has(userId),
            );
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
                    <DialogTitle>Add existing user</DialogTitle>
                    <DialogDescription>
                        For accounts that already exist, including yours. Their
                        phone number is copied so classmates can see it.
                    </DialogDescription>
                </DialogHeader>
                <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
                    <FormMessage
                        message={loadError ? getErrorMessage(loadError) : error}
                    />
                    <div className="grid gap-2">
                        <Label htmlFor="add-member-user">Person</Label>
                        <NativeSelect
                            id="add-member-user"
                            value={userId}
                            disabled={users.loading}
                            onChange={(event) => setUserId(event.target.value)}
                        >
                            <option value="">
                                {users.loading
                                    ? 'Loading…'
                                    : candidates.length === 0
                                      ? 'Everyone is already in this class'
                                      : 'Choose a person…'}
                            </option>
                            {candidates.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.lastName}, {user.firstName}
                                    {user.id === currentUserId
                                        ? ' (you)'
                                        : ` · ${user.email}`}
                                </option>
                            ))}
                        </NativeSelect>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="add-member-role">Role</Label>
                        <NativeSelect
                            id="add-member-role"
                            value={roleId}
                            onChange={(event) => setRoleId(event.target.value)}
                        >
                            {roles.map((role) => (
                                <option key={role.id} value={role.id}>
                                    {role.name}
                                </option>
                            ))}
                        </NativeSelect>
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
                        <Button
                            type="submit"
                            disabled={submitting || contacts.loading}
                        >
                            {submitting ? 'Adding…' : 'Add to class'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
