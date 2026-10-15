import type { FormEvent } from 'react';
import { useState } from 'react';

import { ClassPicker } from '@/components/auth/class-picker';
import { FormMessage } from '@/components/common/form-message';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCollection } from '@/hooks/use-collection';
import { activeClasses } from '@/lib/classes';
import { getErrorMessage } from '@/lib/errors';
import { MAX_NAME_LENGTH, validateName } from '@/lib/names';
import { toE164 } from '@/lib/phone';
import { saveOwnProfile } from '@/lib/profile';
import type { ClassGroup, ClassMember, UserProfile } from '@/types';

// Invited accounts already have a profile and a class; the student confirms
// their name and adds their own contact details (SMS consent must come from
// them). Self sign-ups also pick the class they want to join.
export function ProfileStep({
    uid,
    email,
    profile,
    memberships,
}: {
    uid: string;
    email: string;
    profile: UserProfile | null;
    memberships: ClassMember[];
}) {
    const classes = useCollection<ClassGroup>('classes');
    const [firstName, setFirstName] = useState(profile?.firstName ?? '');
    const [lastName, setLastName] = useState(profile?.lastName ?? '');
    const [phone, setPhone] = useState('');
    const [smsOptIn, setSmsOptIn] = useState(false);
    const [classId, setClassId] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const hasPhone = phone.trim() !== '';
    const pickClass =
        memberships.length === 0 && activeClasses(classes.data).length > 0;

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const normalizedPhone = toE164(phone);
        const message =
            validateName('First name', firstName) ||
            validateName('Last name', lastName) ||
            (normalizedPhone === null
                ? 'Enter a valid phone number, like (312) 555-1234.'
                : '') ||
            (pickClass && classId === '' ? 'Choose your class.' : '');

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
                memberships,
                joinClassId: pickClass ? classId : null,
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
                    Your classmates can see this so you can reach each other.
                </p>
            </div>
            {pickClass && (
                <ClassPicker
                    id="join-class"
                    classes={classes.data}
                    value={classId}
                    onChange={setClassId}
                />
            )}
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
