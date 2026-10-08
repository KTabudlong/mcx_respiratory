import type { FormEvent } from 'react';
import { useState } from 'react';

import { CheckboxList } from '@/components/admin/checkbox-list';
import type { ClassRoles } from '@/components/admin/class-roles-field';
import { ClassRolesField } from '@/components/admin/class-roles-field';
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
import { createUserAccount, updateUser } from '@/lib/admin-users';
import { ALLOWED_EMAIL_DOMAINS, isAllowedEmail } from '@/lib/config';
import { getErrorMessage } from '@/lib/errors';
import { MAX_NAME_LENGTH, validateName } from '@/lib/names';
import {
    canGrantRole,
    classPermissionsForRoles,
    permissionsForRoles,
} from '@/lib/permissions';
import type { ClassGroup, ClassMember, Role, UserProfile } from '@/types';

// Rendered only while open; closing unmounts it so the form resets.
// `user` null = add a new user (admin-created account).
export function UserFormDialog({
    user,
    memberships,
    users,
    classes,
    roles,
    ownPermissions,
    onClose,
}: {
    user: UserProfile | null;
    memberships: ClassMember[];
    users: UserProfile[];
    classes: ClassGroup[];
    roles: Role[];
    ownPermissions: string[];
    onClose: () => void;
}) {
    const isNew = user === null;
    const [firstName, setFirstName] = useState(user?.firstName ?? '');
    const [lastName, setLastName] = useState(user?.lastName ?? '');
    const [email, setEmail] = useState('');
    const [classRoles, setClassRoles] = useState<ClassRoles>(() =>
        Object.fromEntries(
            memberships.map((membership) => [
                membership.classId,
                membership.roleIds,
            ]),
        ),
    );
    const [roleIds, setRoleIds] = useState(user?.roleIds ?? []);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const roleItems = roles.map((role) => {
        const grantable = canGrantRole(role, ownPermissions);

        return {
            id: role.id,
            label: role.name,
            hint: grantable ? undefined : 'Includes permissions you don’t have',
            disabled: !grantable,
        };
    });

    function validate() {
        const nameError =
            validateName('First name', firstName) ||
            validateName('Last name', lastName);

        if (nameError) {
            return nameError;
        }

        if (isNew) {
            const normalized = email.trim().toLowerCase();

            if (!isAllowedEmail(normalized)) {
                return `Use a school email (${ALLOWED_EMAIL_DOMAINS.map((domain) => `@${domain}`).join(' or ')}).`;
            }

            if (users.some((item) => item.email === normalized)) {
                return 'This person already has an account — find them in the table.';
            }
        }

        return '';
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const message = validate();

        setError(message);

        if (message) {
            return;
        }

        setSubmitting(true);

        const input = {
            firstName,
            lastName,
            roleIds,
            permissions: permissionsForRoles(roleIds, roles),
        };
        const nextMemberships = Object.entries(classRoles).map(
            ([classId, classRoleIds]) => ({
                classId,
                roleIds: classRoleIds,
                permissions: classPermissionsForRoles(classRoleIds, roles),
            }),
        );

        try {
            if (isNew) {
                await createUserAccount(email, input, nextMemberships);
            } else {
                await updateUser(user.id, input, memberships, nextMemberships);
            }

            onClose();
        } catch (err) {
            const code =
                typeof err === 'object' && err !== null && 'code' in err
                    ? err.code
                    : '';

            setError(
                code === 'auth/email-already-in-use'
                    ? 'This email already has a login. If they’re not in the table, ask them to log in and finish signing up.'
                    : getErrorMessage(err),
            );
            setSubmitting(false);
        }
    }

    return (
        <Dialog open onOpenChange={(open) => !open && !submitting && onClose()}>
            <DialogContent className="max-h-[90svh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isNew ? 'Add user' : `Edit ${user.firstName}`}
                    </DialogTitle>
                    <DialogDescription>
                        {isNew
                            ? 'Creates their login and emails them a link to set a password.'
                            : 'Add them to a class to approve a pending user.'}
                    </DialogDescription>
                </DialogHeader>
                <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
                    <FormMessage message={error} />
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="user-first-name">First name</Label>
                            <Input
                                id="user-first-name"
                                maxLength={MAX_NAME_LENGTH}
                                value={firstName}
                                onChange={(event) =>
                                    setFirstName(event.target.value)
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="user-last-name">Last name</Label>
                            <Input
                                id="user-last-name"
                                maxLength={MAX_NAME_LENGTH}
                                value={lastName}
                                onChange={(event) =>
                                    setLastName(event.target.value)
                                }
                            />
                        </div>
                    </div>
                    {isNew ? (
                        <div className="grid gap-2">
                            <Label htmlFor="user-email">School email</Label>
                            <Input
                                id="user-email"
                                type="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                            />
                        </div>
                    ) : (
                        <p className="text-sm break-all text-muted-foreground">
                            {user.email}
                        </p>
                    )}
                    <fieldset className="grid gap-2">
                        <legend className="text-sm font-medium">
                            Classes and roles
                        </legend>
                        <p className="mb-1 text-xs text-muted-foreground">
                            Roles apply only inside that class.
                        </p>
                        <ClassRolesField
                            classes={classes}
                            roles={roles}
                            value={classRoles}
                            ownPermissions={ownPermissions}
                            onChange={setClassRoles}
                        />
                    </fieldset>
                    <fieldset className="grid gap-2">
                        <legend className="text-sm font-medium">
                            App-wide roles
                        </legend>
                        <p className="mb-1 text-xs text-muted-foreground">
                            Apply in every class and unlock the admin panel.
                            Usually only for admins.
                        </p>
                        <CheckboxList
                            name="role"
                            items={roleItems}
                            selectedIds={roleIds}
                            onChange={setRoleIds}
                            emptyMessage="No roles yet."
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
                            {submitting
                                ? 'Saving…'
                                : isNew
                                  ? 'Add user'
                                  : 'Save'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
