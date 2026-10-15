import { ExternalLink } from 'lucide-react';

import { linkLabel, normalizeUrl } from '@/lib/posts';
import type { PostLink } from '@/types';

// External links open in a new tab. URLs are re-checked here because the
// rules can't validate each link: anything not http(s) is skipped.
export function LinkChips({ links }: { links: PostLink[] }) {
    const safe = links.flatMap((link) => {
        const url = normalizeUrl(link.url);

        return url ? [{ url, label: linkLabel({ ...link, url }) }] : [];
    });

    if (safe.length === 0) {
        return null;
    }

    return (
        <ul className="flex flex-wrap gap-2">
            {safe.map((link, index) => (
                <li key={`${link.url}-${index}`} className="min-w-0">
                    <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex max-w-full items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                    >
                        <ExternalLink className="size-3 shrink-0" aria-hidden />
                        <span className="truncate">{link.label}</span>
                        <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                </li>
            ))}
        </ul>
    );
}
