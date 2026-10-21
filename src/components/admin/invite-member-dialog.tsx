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
import { createInvite } from '@/lib/class-invites';
import { inviteToClass } from '@/lib/class-members';
import { isAllowedEmail } from '@/lib/config';
import { getErrorMessage } from '@/lib/errors';
import { MAX_NAME_LENGTH, validateName } from '@/lib/names';
import type { ClassRole } from '@/types';

function isEmailInUse(err: unknown) {
    return (
        err instanceof Error &&
        'code' in err &&
        err.code === 'auth/email-already-in-use'
    );
}

// Rendered only while open; closing unmounts it so the form resets.
// `roles` = the roles this user may assign, highest first. New emails get
// an account in this class; emails that already have an account get an
// invite they accept after logging in.
export function InviteMemberDialog({
    classId,
    roles,
    defaultRoleId,
    invitedBy,
    memberEmails,
    invitedEmails,
    onClose,
}: {
    classId: string;
    roles: ClassRole[];
    defaultRoleId: string;
    invitedBy: string;
    memberEmails: Set<string>;
    invitedEmails: Set<string>;
    onClose: () => void;
}) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [roleId, setRoleId] = useState(defaultRoleId);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const role = roles.find((item) => item.id === roleId);
    const normalizedEmail = email.trim().toLowerCase();

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const message =
            validateName('First name', firstName) ||
            validateName('Last name', lastName) ||
            (isAllowedEmail(email) ? '' : 'Use their school email address.') ||
            (memberEmails.has(normalizedEmail)
                ? 'They are already in this class.'
                : '') ||
            (invitedEmails.has(normalizedEmail)
                ? 'They already have an invite. Cancel it first to change the role.'
                : '') ||
            (role ? '' : 'Pick a role.');

        setError(message);

        if (message || !role) {
            return;
        }

        setSubmitting(true);

        try {
            await inviteToClass(
                classId,
                { firstName, lastName, email, role },
                invitedBy,
            );
            toast.success(
                `${firstName.trim()} added as ${role.name}. They'll get an email to set their password.`,
            );
            onClose();

            return;
        } catch (err) {
            if (!isEmailInUse(err)) {
                setError(getErrorMessage(err));
                setSubmitting(false);

                return;
            }
        }

        try {
            await createInvite(classId, normalizedEmail, role, invitedBy);
            toast.success(
                `${normalizedEmail} already has an account. They'll be asked to join as ${role.name} next time they log in.`,
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
                    <DialogTitle>Invite a student</DialogTitle>
                    <DialogDescription>
                        New to the app: creates their account in this class and
                        emails them a link to set their password. Already has an
                        account: they accept the invite next time they log in.
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
                            {roles.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
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
