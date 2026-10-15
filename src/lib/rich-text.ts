import type { Post } from '@/types';

const ENTITIES: Record<string, string> = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    '#39': "'",
    nbsp: ' ',
};

// Editor HTML → plain text (feed previews, "is it empty?"). Only the
// entities the editor writes are decoded; the result is rendered as text.
export function htmlToText(html: string) {
    return html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/(p|h[1-6]|li|blockquote)>/gi, '\n')
        .replace(/<hr\s*\/?>/gi, '\n')
        .replace(/<[^>]*>/g, '')
        .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (_, name: string) => {
            return ENTITIES[name];
        })
        .replace(/\n{2,}/g, '\n')
        .trim();
}

// An empty editor still produces "<p></p>".
export function isBlankHtml(html: string) {
    return htmlToText(html) === '' && !/<hr/i.test(html);
}

function escapeHtml(text: string) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Older plain-text posts opened in the editor: blank lines become
// paragraphs, single line breaks stay line breaks.
export function textToHtml(text: string) {
    const escaped = escapeHtml(text.trim());

    if (escaped === '') {
        return '';
    }

    return escaped
        .split(/\n{2,}/)
        .map((paragraph) => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
        .join('');
}

// The body as editor HTML, whatever format it was saved in.
export function postBodyHtml(post: Pick<Post, 'body' | 'format'>) {
    return post.format === 'html' ? post.body : textToHtml(post.body);
}

// The body as plain text, for previews.
export function postBodyText(post: Pick<Post, 'body' | 'format'>) {
    return post.format === 'html' ? htmlToText(post.body) : post.body;
}
