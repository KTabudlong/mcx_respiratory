import { Pin, Users } from 'lucide-react';
import { Link } from 'react-router';

import { ArchivedBadge } from '@/components/common/archived-badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type { ClassGroup, Post } from '@/types';

// Right column on large screens: class info and pinned quick links.
export function ClassSidebar({
    classGroup,
    memberCount,
    pinnedPosts,
}: {
    classGroup: ClassGroup;
    memberCount: number;
    pinnedPosts: Post[];
}) {
    return (
        <div className="grid gap-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex flex-wrap items-center gap-2">
                        {classGroup.name}
                        {classGroup.archivedAt && <ArchivedBadge />}
                    </CardTitle>
                    <CardDescription>
                        {classGroup.startYear}–{classGroup.endYear ?? ''}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="size-4" aria-hidden />
                        {memberCount} {memberCount === 1 ? 'member' : 'members'}
                    </p>
                </CardContent>
            </Card>
            {pinnedPosts.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-sm">
                            <Pin className="size-4" aria-hidden />
                            Pinned
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="grid gap-2 text-sm">
                            {pinnedPosts.map((post) => (
                                <li key={post.id}>
                                    <Link
                                        to={`/classes/${post.classId}/posts/${post.id}`}
                                        className="line-clamp-2 hover:underline"
                                    >
                                        {post.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
