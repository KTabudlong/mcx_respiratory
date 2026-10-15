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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { inviteToClass } from '@/lib/class-members';
import { isAllowedEmail } from '@/lib/config';
import { getErrorMessage } from '@/lib/errors';
import { MAX_NAME_LENGTH, validateName } from '@/lib/names';
import type { ClassRole } from '@/types';

// Rendered only while open; closing unmounts it so the form resets.
// `roles` = the roles this user may assign, highest first.
export function InviteMemberDialog({
    classId,
    roles,
    defaultRoleId,
    invitedBy,
    onClose,
}: {
    classId: string;
    roles: ClassRole[];
    defaultRoleId: string;
    invitedBy: string;
    onClose: () => void;
}) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [roleId, setRoleId] = useState(defaultRoleId);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const message =
            validateName('First name', firstName) ||
            validateName('Last name', lastName) ||
            (isAllowedEmail(email) ? '' : 'Use their school email address.') ||
            (roleId ? '' : 'Pick a role.');

        setError(message);

        if (message) {
            return;
        }

        setSubmitting(true);

        try {
            await inviteToClass(
                classId,
                { firstName, lastName, email, roleId },
                invitedBy,
            );
            onClose();
        } catch (err) {
            setError(
                err instanceof Error &&
                    'code' in err &&
                    err.code === 'auth/email-already-in-use'
                    ? 'This email already has an account. Ask them to log in and request to join this class.'
                    : getErrorMessage(err),
            );
            setSubmitting(false);
        }
    }

    return (
        <Dialog open onOpenChange={(open) => !open && !submitting && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Invite a student</DialogTitle>
                    <DialogDescription>
                        Creates their account in this class and emails them a
                        link to set their password. They add their phone number
                        when they first log in.
                    </DialogDescription>
                </DialogHeader>
                <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
                    <FormMessage message={error} />
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="invite-first-name">
                                First name
                            </Label>
                            <Input
                                id="invite-first-name"
                                autoComplete="off"
                                maxLength={MAX_NAME_LENGTH}
                                value={firstName}
                                onChange={(event) =>
                                    setFirstName(event.target.value)
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="invite-last-name">Last name</Label>
                            <Input
                                id="invite-last-name"
                                autoComplete="off"
                                maxLength={MAX_NAME_LENGTH}
                                value={lastName}
                                onChange={(event) =>
                                    setLastName(event.target.value)
                                }
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="invite-email">School email</Label>
                        <Input
                            id="invite-email"
                            type="email"
                            autoComplete="off"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="invite-role">Role</Label>
                        <NativeSelect
                            id="invite-role"
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
                        <Button type="submit" disabled={submitting}>
                            {submitting ? 'Inviting…' : 'Send invite'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
