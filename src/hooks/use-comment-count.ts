import { useEffect, useState } from 'react';

import { countComments } from '@/lib/comments';

// Comment count for a feed card. Fetched once (an aggregation query isn't
// live); null while loading or if it fails, so the card just hides it.
export function useCommentCount(classId: string, postId: string) {
    const key = `${classId}/${postId}`;
    const [result, setResult] = useState<{
        key: string;
        count: number;
    } | null>(null);

    useEffect(() => {
        let cancelled = false;

        countComments(classId, postId)
            .then((count) => {
                if (!cancelled) {
                    setResult({ key, count });
                }
            })
            .catch(() => {
                // Leave the count hidden; the post itself still works.
            });

        return () => {
            cancelled = true;
        };
    }, [key, classId, postId]);

    return result?.key === key ? result.count : null;
}
