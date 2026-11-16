import { Plus, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MAX_LINK_LABEL_LENGTH, MAX_LINKS } from '@/lib/posts';
import type { PostLink } from '@/types';

// `key` only lives in the form, so rows keep their identity when one is
// removed.
export type LinkRow = PostLink & { key: string };

// Rows of URL + optional label. Files stay in Drive/OneDrive; posts only link
// to them.
export function LinksField({
    links,
    onChange,
}: {
    links: LinkRow[];
    onChange: (links: LinkRow[]) => void;
}) {
    function update(index: number, change: Partial<PostLink>) {
        onChange(
            links.map((link, i) =>
                i === index ? { ...link, ...change } : link,
            ),
        );
    }

    return (
        <fieldset className="grid gap-2">
            <legend className="mb-2 text-sm font-medium">
                Links{' '}
                <span className="font-normal text-muted-foreground">
                    (optional: Drive, OneDrive, websites)
                </span>
            </legend>
            {links.map((link, index) => (
                <div
                    key={link.key}
                    className="grid gap-2 sm:grid-cols-[1fr_12rem_auto]"
                >
                    <Input
                        type="url"
                        inputMode="url"
                        placeholder="https://…"
                        aria-label={`Link ${index + 1} address`}
                        value={link.url}
                        onChange={(event) =>
                            update(index, { url: event.target.value })
                        }
                    />
                    <Input
                        placeholder="Label (optional)"
                        aria-label={`Link ${index + 1} label`}
                        maxLength={MAX_LINK_LABEL_LENGTH}
                        value={link.label}
                        onChange={(event) =>
                            update(index, { label: event.target.value })
                        }
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Remove link ${index + 1}`}
                        onClick={() =>
                            onChange(links.filter((_, i) => i !== index))
                        }
                    >
                        <X aria-hidden />
                    </Button>
                </div>
            ))}
            {links.length < MAX_LINKS && (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="justify-self-start"
                    onClick={() =>
                        onChange([
                            ...links,
                            { url: '', label: '', key: crypto.randomUUID() },
                        ])
                    }
                >
                    <Plus aria-hidden />
                    Add link
                </Button>
            )}
        </fieldset>
    );
}
