import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';

import { ProfileStep } from '@/components/auth/profile-step';
import { PageLoader } from '@/components/common/page-loader';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';

// /profile — change your name, phone and text / email consent.
export default function Profile() {
    const navigate = useNavigate();
    const { user, profile, contact, memberships, loading } = useAuth();

    if (loading || !user) {
        return <PageLoader />;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">Your profile</CardTitle>
                <CardDescription className="break-all">
                    {user.email}
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
                <ProfileStep
                    uid={user.uid}
                    email={user.email ?? ''}
                    profile={profile}
                    contact={contact}
                    memberships={memberships}
                    onSaved={() => {
                        toast.success('Profile saved.');
                        navigate('/');
                    }}
                />
                <Button asChild variant="ghost">
                    <Link to="/">Cancel</Link>
                </Button>
            </CardContent>
        </Card>
    );
}
