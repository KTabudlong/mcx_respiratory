import {
    LayoutDashboard,
    LogOut,
    Newspaper,
    School,
    UserPen,
    UserRound,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useMatch } from 'react-router';

import { ClassRequestDialog } from '@/components/board/class-request-dialog';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';
import { useLogOut } from '@/hooks/use-log-out';

// The account menu in the top right of the board and the admin panel.
// Inside the admin panel it links back to the board instead.
export function UserMenu() {
    const { profile, user, hasAdminAccess } = useAuth();
    const inAdmin = useMatch('/admin/*') !== null;
    const logOut = useLogOut();
    const [requestOpen, setRequestOpen] = useState(false);

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Account menu"
                    >
                        <UserRound aria-hidden />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="grid font-normal">
                        <span className="truncate font-medium">
                            {profile?.firstName} {profile?.lastName}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                            {user?.email}
                        </span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link to="/profile">
                            <UserPen aria-hidden />
                            Profile
                        </Link>
                    </DropdownMenuItem>
                    {inAdmin ? (
                        <DropdownMenuItem asChild>
                            <Link to="/">
                                <Newspaper aria-hidden />
                                Board
                            </Link>
                        </DropdownMenuItem>
                    ) : (
                        hasAdminAccess && (
                            <DropdownMenuItem asChild>
                                <Link to="/admin">
                                    <LayoutDashboard aria-hidden />
                                    Admin panel
                                </Link>
                            </DropdownMenuItem>
                        )
                    )}
                    <DropdownMenuItem onSelect={() => setRequestOpen(true)}>
                        <School aria-hidden />
                        Request a new class
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => void logOut()}>
                        <LogOut aria-hidden />
                        Log out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            {requestOpen && (
                <ClassRequestDialog onClose={() => setRequestOpen(false)} />
            )}
        </>
    );
}
