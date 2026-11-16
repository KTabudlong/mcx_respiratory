import { ModerationPostRow } from '@/components/admin/moderation-post-row';
import { SortableHead } from '@/components/common/sortable-head';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { ModerationSortKey } from '@/lib/moderation';
import type { Sort } from '@/lib/table-sort';
import type { Post, UserProfile } from '@/types';

const COLUMNS: { key: ModerationSortKey; label: string }[] = [
    { key: 'title', label: 'Post' },
    { key: 'author', label: 'Author' },
    { key: 'posted', label: 'Posted' },
    { key: 'status', label: 'Status' },
];

// The moderation posts table with sortable headers; each row expands to
// its comments. Posts with comments matching the search (`hits`) start
// open; `toggledIds` are the ones the user opened or closed by hand.
export function ModerationTable({
    posts,
    hasPosts,
    authors,
    sort,
    hits,
    toggledIds,
    canPosts,
    canComments,
    abilitiesOf,
    onSort,
    onToggle,
    onDelete,
    onRestore,
    onTogglePin,
}: {
    posts: Post[];
    hasPosts: boolean;
    authors: Map<string, UserProfile>;
    sort: Sort<ModerationSortKey> | null;
    hits: Map<string, Set<string>>;
    toggledIds: Set<string>;
    canPosts: boolean;
    canComments: boolean;
    abilitiesOf: (post: Post) => { canEdit: boolean; canPin: boolean };
    onSort: (key: ModerationSortKey) => void;
    onToggle: (post: Post) => void;
    onDelete: (post: Post) => void;
    onRestore: (post: Post) => void;
    onTogglePin: (post: Post) => void;
}) {
    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        {COLUMNS.map((column) => (
                            <SortableHead
                                key={column.key}
                                dir={sort?.key === column.key ? sort.dir : null}
                                onSort={() => onSort(column.key)}
                            >
                                {column.label}
                            </SortableHead>
                        ))}
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {posts.length === 0 && (
                        <TableRow>
                            <TableCell
                                colSpan={5}
                                className="py-8 text-center text-muted-foreground"
                            >
                                {hasPosts
                                    ? 'No posts match.'
                                    : 'No posts in this class yet.'}
                            </TableCell>
                        </TableRow>
                    )}
                    {posts.map((post) => (
                        <ModerationPostRow
                            key={post.id}
                            post={post}
                            author={authors.get(post.userId)}
                            open={hits.has(post.id) !== toggledIds.has(post.id)}
                            matchIds={hits.get(post.id)}
                            canPosts={canPosts}
                            canComments={canComments}
                            {...abilitiesOf(post)}
                            onToggle={() => onToggle(post)}
                            onDelete={() => onDelete(post)}
                            onRestore={() => onRestore(post)}
                            onTogglePin={() => onTogglePin(post)}
                        />
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
