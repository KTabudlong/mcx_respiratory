import { doc, increment, writeBatch } from 'firebase/firestore';

import { db } from '@/lib/firebase';
import { save } from '@/lib/save';
import type { VoteValue } from '@/types';

// Tapping your current vote removes it; tapping the other one switches.
export function nextVote(
    current: VoteValue | null,
    tapped: VoteValue,
): VoteValue | null {
    return current === tapped ? null : tapped;
}

// How much going from `current` to `next` moves the score (-2 to 2).
export function scoreChange(current: VoteValue | null, next: VoteValue | null) {
    return (next ?? 0) - (current ?? 0);
}

// Firestore path of a post or comment, the key for useMyVotes().
export function postPath(classId: string, postId: string) {
    return `classes/${classId}/posts/${postId}`;
}

export function commentPath(
    classId: string,
    postId: string,
    commentId: string,
) {
    return `${postPath(classId, postId)}/comments/${commentId}`;
}

// The vote doc and the target's score change together in one batch; the
// rules reject anything else. increment() keeps simultaneous votes from
// overwriting each other (like SQL's `score = score + 1`).
export async function castVote(
    targetPath: string,
    classId: string,
    uid: string,
    current: VoteValue | null,
    tapped: VoteValue,
) {
    const next = nextVote(current, tapped);
    const voteRef = doc(db, targetPath, 'votes', uid);
    const batch = writeBatch(db);

    if (next === null) {
        batch.delete(voteRef);
    } else if (current === null) {
        batch.set(voteRef, { userId: uid, classId, value: next });
    } else {
        batch.update(voteRef, { value: next });
    }

    batch.update(doc(db, targetPath), {
        score: increment(scoreChange(current, next)),
    });

    await save(batch.commit());
}
