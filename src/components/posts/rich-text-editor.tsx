import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import type { LucideIcon } from 'lucide-react';
import {
    Bold,
    Heading2,
    Heading3,
    Italic,
    Link2,
    List,
    ListOrdered,
    Minus,
    Quote,
    Redo2,
    Undo2,
} from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { normalizeUrl } from '@/lib/posts';

function ToolbarButton({
    label,
    icon: Icon,
    active,
    disabled,
    onClick,
}: {
    label: string;
    icon: LucideIcon;
    active?: boolean;
    disabled?: boolean;
    onClick: () => void;
}) {
    return (
        <Button
            type="button"
            variant={active ? 'secondary' : 'ghost'}
            size="icon"
            className="size-8"
            aria-label={label}
            title={label}
            aria-pressed={active}
            disabled={disabled}
            onClick={onClick}
        >
            <Icon aria-hidden />
        </Button>
    );
}

// Rich-text post body (Tiptap). Emits HTML; it's sanitized when shown.
// Lazy-loaded by the post form so the board doesn't download the editor.
export function RichTextEditor({
    value,
    labelledBy,
    onChange,
}: {
    value: string;
    labelledBy: string;
    onChange: (html: string) => void;
}) {
    const [linkUrl, setLinkUrl] = useState<string | null>(null);
    const [linkError, setLinkError] = useState('');
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [2, 3] },
                codeBlock: false,
                link: {
                    openOnClick: false,
                    autolink: true,
                    defaultProtocol: 'https',
                },
            }),
        ],
        content: value,
        editorProps: {
            attributes: {
                class: 'rich-text min-h-40 px-3 py-2 text-base outline-none md:text-sm',
                role: 'textbox',
                'aria-multiline': 'true',
                'aria-labelledby': labelledBy,
            },
        },
        onUpdate: ({ editor: current }) => onChange(current.getHTML()),
    });
    const active = useEditorState({
        editor,
        selector: ({ editor: current }) => ({
            bold: current.isActive('bold'),
            italic: current.isActive('italic'),
            h2: current.isActive('heading', { level: 2 }),
            h3: current.isActive('heading', { level: 3 }),
            bulletList: current.isActive('bulletList'),
            orderedList: current.isActive('orderedList'),
            blockquote: current.isActive('blockquote'),
            link: current.isActive('link'),
            canUndo: current.can().undo(),
            canRedo: current.can().redo(),
        }),
    });

    function chain() {
        return editor.chain().focus();
    }

    function applyLink() {
        const url = normalizeUrl(linkUrl ?? '');

        if (!url) {
            setLinkError('Enter a valid web address (https://…).');

            return;
        }

        if (editor.state.selection.empty && !active.link) {
            chain()
                .insertContent({
                    type: 'text',
                    text: url,
                    marks: [{ type: 'link', attrs: { href: url } }],
                })
                .run();
        } else {
            chain().extendMarkRange('link').setLink({ href: url }).run();
        }

        setLinkUrl(null);
        setLinkError('');
    }

    function removeLink() {
        chain().extendMarkRange('link').unsetLink().run();
        setLinkUrl(null);
        setLinkError('');
    }

    return (
        <div className="rounded-md border border-input shadow-xs focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
            <div
                role="toolbar"
                aria-label="Formatting"
                className="flex flex-wrap gap-0.5 border-b p-1"
            >
                <ToolbarButton
                    label="Bold"
                    icon={Bold}
                    active={active.bold}
                    onClick={() => chain().toggleBold().run()}
                />
                <ToolbarButton
                    label="Italic"
                    icon={Italic}
                    active={active.italic}
                    onClick={() => chain().toggleItalic().run()}
                />
                <ToolbarButton
                    label="Heading"
                    icon={Heading2}
                    active={active.h2}
                    onClick={() => chain().toggleHeading({ level: 2 }).run()}
                />
                <ToolbarButton
                    label="Subheading"
                    icon={Heading3}
                    active={active.h3}
                    onClick={() => chain().toggleHeading({ level: 3 }).run()}
                />
                <ToolbarButton
                    label="Bulleted list"
                    icon={List}
                    active={active.bulletList}
                    onClick={() => chain().toggleBulletList().run()}
                />
                <ToolbarButton
                    label="Numbered list"
                    icon={ListOrdered}
                    active={active.orderedList}
                    onClick={() => chain().toggleOrderedList().run()}
                />
                <ToolbarButton
                    label="Quote"
                    icon={Quote}
                    active={active.blockquote}
                    onClick={() => chain().toggleBlockquote().run()}
                />
                <ToolbarButton
                    label="Divider line"
                    icon={Minus}
                    onClick={() => chain().setHorizontalRule().run()}
                />
                <ToolbarButton
                    label="Link"
                    icon={Link2}
                    active={active.link || linkUrl !== null}
                    onClick={() =>
                        setLinkUrl(
                            linkUrl === null
                                ? ((editor.getAttributes('link').href as
                                      string | undefined) ?? '')
                                : null,
                        )
                    }
                />
                <span className="mx-1 w-px self-stretch bg-border" />
                <ToolbarButton
                    label="Undo"
                    icon={Undo2}
                    disabled={!active.canUndo}
                    onClick={() => chain().undo().run()}
                />
                <ToolbarButton
                    label="Redo"
                    icon={Redo2}
                    disabled={!active.canRedo}
                    onClick={() => chain().redo().run()}
                />
            </div>

            {linkUrl !== null && (
                <div className="grid gap-1 border-b p-2">
                    <div className="flex flex-wrap gap-2">
                        <Input
                            autoFocus
                            type="url"
                            inputMode="url"
                            aria-label="Link address"
                            placeholder="https://…"
                            className="h-8 min-w-48 flex-1"
                            value={linkUrl}
                            onChange={(event) => setLinkUrl(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    applyLink();
                                }

                                if (event.key === 'Escape') {
                                    setLinkUrl(null);
                                }
                            }}
                        />
                        <Button type="button" size="sm" onClick={applyLink}>
                            Apply
                        </Button>
                        {active.link && (
                            <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={removeLink}
                            >
                                Remove link
                            </Button>
                        )}
                    </div>
                    {linkError && (
                        <p className="text-xs text-destructive">{linkError}</p>
                    )}
                </div>
            )}

            <EditorContent editor={editor} />
        </div>
    );
}
