import { collection, doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { db } from '@/lib/firebase';
import { docData } from '@/lib/firestore-data';
import type { Comment } from '@/types';

type Loaded<T> = { key: string; value: T; error: Error | null };

// Every comment on the given posts, deleted ones included, plus the text of
// "[deleted]" tombstones (comment id → archived body), for moderation
// search. Moderators only (comments.delete_any): one listener per post, so
// pass enabled = false unless a search is running.
export function useClassComments(
    classId: string,
    postIds: string[],
    enabled: boolean,
) {
    const postKey =
        enabled && postIds.length > 0 ? [...postIds].sort().join(',') : '';
    const [comments, setComments] = useState<Loaded<Comment[]> | null>(null);
    const [archived, setArchived] = useState<Loaded<
        Map<string, string>
    > | null>(null);

    useEffect(() => {
        if (postKey === '') {
            return;
        }

        const ids = postKey.split(',');
        const byPost = new Map<string, Comment[]>();
        const publish = (error: Error | null) =>
            setComments({
                key: postKey,
                value: [...byPost.values()].flat(),
                error,
            });

        const stops = ids.map((postId) =>
            onSnapshot(
                collection(db, 'classes', classId, 'posts', postId, 'comments'),
                (snap) => {
                    byPost.set(
                        postId,
                        snap.docs.map((item) => docData<Comment>(item)),
                    );

                    if (byPost.size === ids.length) {
                        publish(null);
                    }
                },
                publish,
            ),
        );

        return () => stops.forEach((stop) => stop());
    }, [classId, postKey]);

    const currentComments =
        comments?.key === postKey ? comments.value : ([] as Comment[]);
    const tombstoneKey = currentComments
        .filter((item) => item.deletedAt !== null && item.body === '')
        .map((item) => `${item.postId}/${item.id}`)
        .sort()
        .join(',');

    useEffect(() => {
        if (tombstoneKey === '') {
            return;
        }

        const refs = tombstoneKey.split(',');
        const bodies = new Map<string, string>();
        const answered = new Set<string>();
        const publish = (error: Error | null) =>
            setArchived({ key: tombstoneKey, value: new Map(bodies), error });

        const stops = refs.map((ref) => {
            const [postId, commentId] = ref.split('/');

            return onSnapshot(
                doc(
                    db,
                    'classes',
                    classId,
                    'posts',
                    postId,
                    'comments',
                    commentId,
                    'archive',
                    'body',
                ),
                (snap) => {
                    const body = snap.data()?.body;

                    if (typeof body === 'string') {
                        bodies.set(commentId, body);
                    } else {
                        bodies.delete(commentId);
                    }

                    answered.add(ref);

                    if (answered.size === refs.length) {
                        publish(null);
                    }
                },
                publish,
            );
        });

        return () => stops.forEach((stop) => stop());
    }, [classId, tombstoneKey]);

    if (postKey === '') {
        return {
            comments: [] as Comment[],
            archived: new Map<string, string>(),
            loading: false,
            error: null,
        };
    }

    const currentArchived =
        tombstoneKey === '' || archived?.key !== tombstoneKey
            ? new Map<string, string>()
            : archived.value;

    return {
        comments: currentComments,
        archived: currentArchived,
        loading:
            comments?.key !== postKey ||
            (tombstoneKey !== '' && archived?.key !== tombstoneKey),
        error:
            (comments?.key === postKey ? comments.error : null) ??
            (archived?.key === tombstoneKey ? archived.error : null),
    };
}
