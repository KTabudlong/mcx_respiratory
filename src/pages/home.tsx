import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { logOut } from '@/lib/auth';

export default function Home() {
    const { profile } = useAuth();

    return (
        <main className="flex min-h-svh items-center justify-center p-4 sm:p-6">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-xl">
                        Welcome, {profile?.firstName}
                    </CardTitle>
                    <CardDescription>
                        The class board is coming in Phase 3.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button variant="outline" onClick={() => logOut()}>
                        Log out
                    </Button>
                </CardContent>
            </Card>
        </main>
    );
}
