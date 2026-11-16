import { Link } from 'react-router';

import { AccountStep } from '@/components/auth/account-step';
import { DoneStep } from '@/components/auth/done-step';
import { ProfileStep } from '@/components/auth/profile-step';
import { SignupProgress } from '@/components/auth/signup-progress';
import { VerifyEmailStep } from '@/components/auth/verify-email-step';
import { FormMessage } from '@/components/common/form-message';
import { PageLoader } from '@/components/common/page-loader';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import type { SignupStep } from '@/lib/account-status';
import { getSignupStep, isApproved } from '@/lib/account-status';
import { getErrorMessage } from '@/lib/errors';

const STEP_COPY: Record<SignupStep, { title: string; description: string }> = {
    account: {
        title: 'Create your account',
        description: 'Sign up with your school email.',
    },
    verify: {
        title: 'Verify your email',
        description: 'This confirms the school email is yours.',
    },
    profile: {
        title: 'Your profile',
        description: 'Tell your classmates and instructors who you are.',
    },
    done: {
        title: 'All done',
        description: 'Your account is ready.',
    },
};

export default function Signup() {
    const {
        user,
        emailVerified,
        profile,
        contact,
        memberships,
        isSuperAdmin,
        loading,
        error,
    } = useAuth();

    if (loading) {
        return <PageLoader />;
    }

    const step = getSignupStep({
        signedIn: user !== null,
        emailVerified,
        hasProfile: profile !== null,
        hasContact: contact !== null,
    });
    const { title, description } = STEP_COPY[step];

    return (
        <Card>
            <CardHeader className="gap-4">
                <SignupProgress current={step} />
                <div className="grid gap-1.5">
                    <CardTitle className="text-xl">{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="grid gap-4">
                {error && <FormMessage message={getErrorMessage(error)} />}
                {step === 'account' && <AccountStep />}
                {step === 'verify' && user && (
                    <VerifyEmailStep email={user.email ?? ''} />
                )}
                {step === 'profile' && user && (
                    <ProfileStep
                        uid={user.uid}
                        email={user.email ?? ''}
                        profile={profile}
                        contact={contact}
                        memberships={memberships}
                    />
                )}
                {step === 'done' && (
                    <DoneStep
                        approved={isApproved(
                            profile,
                            memberships.length,
                            isSuperAdmin,
                        )}
                    />
                )}
            </CardContent>
            {step === 'account' && (
                <CardFooter className="justify-center text-sm text-muted-foreground">
                    Already have an account?&nbsp;
                    <Link
                        to="/login"
                        className="font-medium text-foreground underline-offset-4 hover:underline"
                    >
                        Log in
                    </Link>
                </CardFooter>
            )}
        </Card>
    );
}
