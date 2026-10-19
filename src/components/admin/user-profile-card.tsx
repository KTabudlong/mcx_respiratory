import type { ReactNode } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateTime } from '@/lib/dates';
import { formatPhone } from '@/lib/phone';
import type { ClassGroup, UserContact, UserProfile } from '@/types';

function Field({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="grid gap-0.5">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="text-sm break-words">{children}</dd>
        </div>
    );
}

// Account and private contact details (super admin user page).
export function UserProfileCard({
    user,
    contact,
    inviter,
    invitedInto,
}: {
    user: UserProfile;
    contact: UserContact | null;
    inviter: UserProfile | null;
    invitedInto: ClassGroup | undefined;
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile</CardTitle>
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
                        {contact?.phone ? formatPhone(contact.phone) : '—'}
                    </Field>
                    <Field label="SMS updates">
                        {contact?.smsOptIn
                            ? `Opted in${contact.smsOptInAt ? ` ${formatDateTime(contact.smsOptInAt.toDate())}` : ''}`
                            : 'Not opted in'}
                    </Field>
                    <Field label="Email updates">
                        {contact?.emailOptIn
                            ? `Opted in${contact.emailOptInAt ? ` ${formatDateTime(contact.emailOptInAt.toDate())}` : ''}`
                            : 'Not opted in'}
                    </Field>
                    <Field label="Joined">
                        {formatDateTime(user.createdAt.toDate())}
                    </Field>
                    <Field label="Account created by">
                        {user.createdBy === null
                            ? 'Signed up themselves'
                            : `${inviter ? `${inviter.firstName} ${inviter.lastName}` : 'Unknown'}${invitedInto ? ` (invited into ${invitedInto.name})` : ''}`}
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
