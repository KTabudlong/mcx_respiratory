import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router';

import { ClassSidebar } from '@/components/board/class-sidebar';
import { FormMessage } from '@/components/common/form-message';
import { PageLoader } from '@/components/common/page-loader';
import { SearchInput } from '@/components/common/search-input';
import { PostActions } from '@/components/posts/post-actions';
import { PostCard } from '@/components/posts/post-card';
import { VoteButtons } from '@/components/posts/vote-buttons';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useCollection } from '@/hooks/use-collection';
import { useDocument } from '@/hooks/use-document';
import { useMyVotes } from '@/hooks/use-my-votes';
import type { FeedSort } from '@/hooks/use-posts';
import { usePosts } from '@/hooks/use-posts';
import { useUsersById } from '@/hooks/use-users-by-id';
import { getErrorMessage } from '@/lib/errors';
import {
    canVoteIn,
    hasClassPermission,
    postAbilities,
} from '@/lib/permissions';
import { FEED_PAGE_SIZE } from '@/lib/posts';
import { postPath } from '@/lib/votes';
import type { ClassGroup, ClassMember } from '@/types';

function ClassFeed({ classId }: { classId: string }) {
    const { user, accessIn } = useAuth();
    const access = accessIn(classId);
    const [count, setCount] = useState(FEED_PAGE_SIZE);
    const [sort, setSort] = useState<FeedSort>('new');
    const [search, setSearch] = useState('');
    const [actionError, setActionError] = useState('');

    const classGroup = useDocument<ClassGroup>(`classes/${classId}`);
    const members = useCollection<ClassMember>(`classes/${classId}/members`);
    const feed = usePosts(classId, count, sort);
    const myVotes = useMyVotes(classId);
    const authors = useUsersById(
        feed.posts.flatMap((post) =>
            post.editedBy ? [post.userId, post.editedBy] : [post.userId],
        ),
    );

    const classOpen = classGroup.data?.archivedAt === null;
    const canPost = classOpen && hasClassPermission(access, 'posts.create');
    const canVote = canVoteIn(access, classOpen);
    const query = search.trim().toLowerCase();
    const posts = query
        ? feed.posts.filter((post) => post.title.toLowerCase().includes(query))
        : feed.posts;
    const firstLoad = feed.loading && feed.posts.length === 0;
    const error = feed.error ?? classGroup.error ?? myVotes.error;

    return (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <section className="grid content-start gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-xl font-semibold lg:sr-only">
                        {classGroup.data?.name ?? 'Class board'}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2">
                        <div
                            role="group"
                            aria-label="Sort posts"
                            className="inline-flex rounded-md border p-0.5"
                        >
                            {(['new', 'top'] as const).map((option) => (
                                <Button
                                    key={option}
                                    size="sm"
                                    variant={
                                        sort === option ? 'secondary' : 'ghost'
                                    }
                                    className="h-7 px-3"
                                    aria-pressed={sort === option}
                                    onClick={() => setSort(option)}
                                >
                                    {option === 'new' ? 'New' : 'Top'}
                                </Button>
                            ))}
                        </div>
                        <SearchInput
                            value={search}
                            onChange={setSearch}
                            label="Search loaded posts by title"
                            placeholder="Search post titles"
                        />
                    </div>
                </div>

                {classGroup.data && !classOpen && (
                    <Alert>
                        <AlertDescription>
                            This class is archived. Posts are read-only.
                        </AlertDescription>
                    </Alert>
                )}
                {error && <FormMessage message={getErrorMessage(error)} />}
                <FormMessage message={actionError} />

                {firstLoad ? (
                    <PageLoader />
                ) : posts.length === 0 ? (
                    <div className="grid justify-items-center gap-3 rounded-lg border border-dashed bg-card p-8 text-center">
                        <p className="text-sm text-muted-foreground">
                            {query
                                ? 'No loaded posts match your search.'
                                : 'No posts yet.'}
                        </p>
                        {!query && canPost && (
                            <Button asChild size="sm">
                                <Link to={`/classes/${classId}/posts/new`}>
                                    <Plus aria-hidden />
                                    Write the first post
                                </Link>
                            </Button>
                        )}
                    </div>
                ) : (
                    <ul className="grid gap-3">
                        {posts.map((post) => (
                            <li key={post.id}>
                                <PostCard
                                    post={post}
                                    author={authors.get(post.userId)}
                                    editor={
                                        post.editedBy
                                            ? authors.get(post.editedBy)
                                            : undefined
                                    }
                                    votes={
                                        <VoteButtons
                                            targetPath={postPath(
                                                classId,
                                                post.id,
                                            )}
                                            classId={classId}
                                            score={post.score}
                                            myVote={myVotes.votes.get(
                                                postPath(classId, post.id),
                                            )}
                                            canVote={canVote}
                                            onError={setActionError}
                                        />
                                    }
                                    actions={
                                        <PostActions
                                            post={post}
                                            {...postAbilities(
                                                post,
                                                user?.uid,
                                                access,
                                                classOpen,
                                            )}
                                            onError={setActionError}
                                        />
                                    }
                                />
                            </li>
                        ))}
                    </ul>
                )}

                {feed.hasMore && (
                    <Button
                        variant="outline"
                        className="justify-self-center"
                        disabled={feed.loading}
                        onClick={() => setCount(count + FEED_PAGE_SIZE)}
                    >
                        {feed.loading ? 'Loading…' : 'Load more'}
                    </Button>
                )}
            </section>

            {classGroup.data && (
                <aside className="hidden lg:block">
                    <div className="sticky top-20">
                        <ClassSidebar
                            classGroup={classGroup.data}
                            memberCount={members.data.length}
                            pinnedPosts={feed.posts.filter(
                                (post) => post.pinned,
                            )}
                        />
                    </div>
                </aside>
            )}
        </div>
    );
}

// /classes/:classId — keyed by class so paging and search reset on switch.
export default function PostsIndex() {
    const { classId = '' } = useParams();

    return <ClassFeed key={classId} classId={classId} />;
}
