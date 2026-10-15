import DOMPurify from 'dompurify';

// Post HTML is written by the browser, so the rules can't trust it: every
// render goes through this allowlist (the editor's tags only, no styles,
// no scripts, links only to http(s) / mailto and opening in a new tab).
const ALLOWED_TAGS = [
    'p',
    'br',
    'strong',
    'em',
    's',
    'u',
    'code',
    'h2',
    'h3',
    'ul',
    'ol',
    'li',
    'blockquote',
    'hr',
    'a',
];

DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName !== 'A') {
        return;
    }

    const href = node.getAttribute('href') ?? '';

    if (!/^(https?:\/\/|mailto:)/i.test(href)) {
        node.removeAttribute('href');
    }

    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer nofollow');
});

export function sanitizePostHtml(html: string) {
    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS,
        ALLOWED_ATTR: ['href', 'target', 'rel'],
    });
}
