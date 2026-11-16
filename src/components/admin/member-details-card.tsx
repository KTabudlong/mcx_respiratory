import type { ReactNode } from 'react';

import { RoleBadge } from '@/components/admin/role-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateTime } from '@/lib/dates';
import { formatPhone } from '@/lib/phone';
import type { ClassMember, ClassRole, UserProfile } from '@/types';

function Field({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="grid gap-0.5">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="text-sm break-words">{children}</dd>
        </div>
    );
}

// What a class admin sees about one member: the membership copy of their
// phone / SMS consent (private contact details stay super admin only).
export function MemberDetailsCard({
    user,
    member,
    role,
    addedBy,
}: {
    user: UserProfile;
    member: ClassMember;
    role: ClassRole | undefined;
    addedBy: UserProfile | null;
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent>
                <dl className="grid gap-4 sm:grid-cols-2">
                    <Field label="Email">
                        <a
                            href={`mailto:${user.email}`}
                            className="underline-offset-4 hover:underline"
                        >
                            {user.email}
                        </a>
                    </Field>
                    <Field label="Phone">
                        {member.phone ? formatPhone(member.phone) : '—'}
                    </Field>
                    <Field label="SMS updates">
                        {member.smsOptIn ? 'Opted in' : 'Not opted in'}
                    </Field>
                    <Field label="Role">
                        <RoleBadge role={role} />
                    </Field>
                    <Field label="In this class since">
                        {formatDateTime(member.createdAt.toDate())}
                    </Field>
                    <Field label="Added by">
                        {addedBy
                            ? `${addedBy.firstName} ${addedBy.lastName}`
                            : '—'}
                    </Field>
                    <Field label="Account created">
                        {formatDateTime(user.createdAt.toDate())}
                    </Field>
                    {user.deletedAt && (
                        <Field label="Deactivated">
                            {formatDateTime(user.deletedAt.toDate())}
                        </Field>
                    )}
                </dl>
            </CardContent>
        </Card>
    );
}
