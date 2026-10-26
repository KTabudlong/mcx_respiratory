import { ChevronRight } from 'lucide-react';
import { Link, useLocation, useMatch } from 'react-router';

import { useAuth } from '@/hooks/use-auth';
import { useDocument } from '@/hooks/use-document';
import { adminCrumbs } from '@/lib/breadcrumbs';
import { cn } from '@/lib/utils';
import type { ClassGroup, Post, UserProfile } from '@/types';

// Admin › Classes › <class> › Students. The last crumb is the current page.
export function AdminBreadcrumbs() {
    const { pathname } = useLocation();
    const { isSuperAdmin } = useAuth();
    const classId = useMatch('/admin/classes/:classId/*')?.params.classId;
    const userId = useMatch('/admin/users/:userId')?.params.userId;
    const classGroup = useDocument<ClassGroup>(
        classId ? `classes/${classId}` : null,
    );
    const user = useDocument<UserProfile>(userId ? `users/${userId}` : null);
    const postId = useMatch('/admin/classes/:classId/moderation/:postId')
        ?.params.postId;
    const post = useDocument<Post>(
        classId && postId ? `classes/${classId}/posts/${postId}` : null,
    );

    const names: Record<string, string> = {};

    if (postId && post.data) {
        names[postId] = post.data.title;
    }

    if (classId && classGroup.data) {
        names[classId] = classGroup.data.name;
    }

    if (userId && user.data) {
        names[userId] = `${user.data.firstName} ${user.data.lastName}`;
    }

    const crumbs = adminCrumbs(pathname, names, isSuperAdmin);

    return (
        <nav aria-label="Breadcrumb" className="min-w-0">
            <ol className="flex items-center gap-1 text-sm">
                {crumbs.map((crumb, index) => {
                    const last = index === crumbs.length - 1;

                    return (
                        <li
                            key={crumb.to}
                            className={cn(
                                'min-w-0 items-center gap-1',
                                last
                                    ? 'flex font-medium'
                                    : 'hidden text-muted-foreground sm:flex',
                            )}
                        >
                            {index > 0 && (
                                <ChevronRight
                                    className="size-3.5 shrink-0 text-muted-foreground max-sm:hidden"
                                    aria-hidden
                                />
                            )}
                            {last ? (
                                <span aria-current="page" className="truncate">
                                    {crumb.label}
                                </span>
                            ) : (
                                <Link
                                    to={crumb.to}
                                    className="truncate hover:text-foreground"
                                >
                                    {crumb.label}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
