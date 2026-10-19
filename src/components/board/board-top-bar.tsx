import {
    LayoutDashboard,
    LogOut,
    Plus,
    School,
    UserPen,
    UserRound,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useMatch, useNavigate } from 'react-router';

import { ClassRequestDialog } from '@/components/board/class-request-dialog';
import { NotificationsMenu } from '@/components/board/notifications-menu';
import { NativeSelect } from '@/components/common/native-select';
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
import { useMyClasses } from '@/hooks/use-my-classes';
import { logOut } from '@/lib/auth';
import { rememberClass } from '@/lib/last-class';

function ClassSwitcher({ classId }: { classId: string | undefined }) {
    const navigate = useNavigate();
    const { classes } = useMyClasses();

    if (classes.length < 2) {
        return null;
    }

    return (
        <>
            <label htmlFor="board-class" className="sr-only">
                Class
            </label>
            <NativeSelect
                id="board-class"
                className="w-auto max-w-48 sm:max-w-64"
                value={classId ?? ''}
                onChange={(event) => {
                    rememberClass(event.target.value);
                    navigate(`/classes/${event.target.value}`);
                }}
            >
                {!classId && <option value="">Choose a class…</option>}
                {classes.map((item) => (
                    <option key={item.id} value={item.id}>
                        {item.name}
                        {item.archivedAt !== null ? ' (archived)' : ''}
                    </option>
                ))}
            </NativeSelect>
        </>
    );
}

function UserMenu() {
    const { profile, user, hasAdminAccess } = useAuth();
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
                    {hasAdminAccess && (
                        <DropdownMenuItem asChild>
                            <Link to="/admin">
                                <LayoutDashboard aria-hidden />
                                Admin panel
                            </Link>
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onSelect={() => setRequestOpen(true)}>
                        <School aria-hidden />
                        Request a new class
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => logOut()}>
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

export function BoardTopBar() {
    const { canIn } = useAuth();
    const classMatch = useMatch('/classes/:classId/*');
    const classId = classMatch?.params.classId;
    const canPost = classId ? canIn(classId, 'posts.create') : false;

    return (
        <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
            <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4 sm:gap-3">
                <Link
                    to="/"
                    className="shrink-0 font-semibold whitespace-nowrap"
                >
                    MXC RT
                </Link>
                <ClassSwitcher classId={classId} />
                <div className="ml-auto flex items-center gap-1 sm:gap-2">
                    {classId && canPost && (
                        <Button asChild size="sm">
                            <Link to={`/classes/${classId}/posts/new`}>
                                <Plus aria-hidden />
                                <span className="hidden sm:inline">
                                    New post
                                </span>
                                <span className="sr-only sm:hidden">
                                    New post
                                </span>
                            </Link>
                        </Button>
                    )}
                    <NotificationsMenu />
                    <UserMenu />
                </div>
            </div>
        </header>
    );
}
