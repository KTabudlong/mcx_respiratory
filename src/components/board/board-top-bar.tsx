import { Plus } from 'lucide-react';
import { Link, useMatch, useNavigate } from 'react-router';

import { NotificationsMenu } from '@/components/board/notifications-menu';
import { NativeSelect } from '@/components/common/native-select';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { UserMenu } from '@/components/common/user-menu';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useMyClasses } from '@/hooks/use-my-classes';
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
                    <ThemeToggle />
                    <NotificationsMenu />
                    <UserMenu />
                </div>
            </div>
        </header>
    );
}
