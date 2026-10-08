import type { FormEvent } from 'react';
import { useState } from 'react';

import { FormMessage } from '@/components/common/form-message';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getErrorMessage } from '@/lib/errors';
import { toE164 } from '@/lib/phone';
import { saveOwnProfile } from '@/lib/profile';
import type { UserProfile } from '@/types';

const MAX_NAME_LENGTH = 50;

function validateName(label: string, value: string) {
    const trimmed = value.trim();

    if (trimmed === '') {
        return `${label} is required.`;
    }

    if (trimmed.length > MAX_NAME_LENGTH) {
        return `${label} must be ${MAX_NAME_LENGTH} characters or fewer.`;
    }

    return '';
}

// Admin-created accounts already have a profile; the student confirms their
// name and adds their own contact details (SMS consent must come from them).
export function ProfileStep({
    uid,
    email,
    profile,
}: {
    uid: string;
    email: string;
    profile: UserProfile | null;
}) {
    const [firstName, setFirstName] = useState(profile?.firstName ?? '');
    const [lastName, setLastName] = useState(profile?.lastName ?? '');
    const [phone, setPhone] = useState('');
    const [smsOptIn, setSmsOptIn] = useState(false);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const hasPhone = phone.trim() !== '';

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const normalizedPhone = toE164(phone);
        const message =
            validateName('First name', firstName) ||
            validateName('Last name', lastName) ||
            (normalizedPhone === null
                ? 'Enter a valid phone number, like (312) 555-1234.'
                : '');

        setError(message);

        if (message || normalizedPhone === null) {
            return;
        }

        setSubmitting(true);

        try {
            await saveOwnProfile({
                uid,
                email,
                profileExists: profile !== null,
                input: {
                    firstName,
                    lastName,
                    phone: normalizedPhone,
                    smsOptIn: smsOptIn && normalizedPhone !== '',
                },
            });
        } catch (err) {
            setError(getErrorMessage(err));
            setSubmitting(false);
        }
    }

    return (
        <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
            <FormMessage message={error} />
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="first-name">First name</Label>
                    <Input
                        id="first-name"
                        autoComplete="given-name"
                        maxLength={MAX_NAME_LENGTH}
                        value={firstName}
                        onChange={(event) => setFirstName(event.target.value)}
                        required
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="last-name">Last name</Label>
                    <Input
                        id="last-name"
                        autoComplete="family-name"
                        maxLength={MAX_NAME_LENGTH}
                        value={lastName}
                        onChange={(event) => setLastName(event.target.value)}
                        required
                    />
                </div>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="phone">
                    Contact number{' '}
                    <span className="font-normal text-muted-foreground">
                        (optional)
                    </span>
                </Label>
                <Input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="(312) 555-1234"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                    Only you and class admins can see this.
                </p>
            </div>
            <div className="flex items-start gap-3">
                <Checkbox
                    id="sms-opt-in"
                    className="mt-0.5"
                    checked={smsOptIn && hasPhone}
                    disabled={!hasPhone}
                    onCheckedChange={(checked) => setSmsOptIn(checked === true)}
                />
                <Label
                    htmlFor="sms-opt-in"
                    className="leading-snug font-normal"
                >
                    Text me class announcements at this number. Message and data
                    rates may apply. I can opt out anytime in my profile.
                </Label>
            </div>
            <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving…' : 'Save and continue'}
            </Button>
        </form>
    );
}
