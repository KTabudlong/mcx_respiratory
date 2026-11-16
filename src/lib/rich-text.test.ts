import { describe, expect, it } from 'vitest';

import {
    htmlToText,
    isBlankHtml,
    postBodyText,
    textToHtml,
} from '@/lib/rich-text';

describe('htmlToText', () => {
    it('keeps block breaks and decodes entities', () => {
        expect(
            htmlToText(
                '<h2>Exam</h2><p>Room <strong>B</strong> &amp; lab</p><ul><li><p>Pens</p></li><li><p>ID</p></li></ul>',
            ),
        ).toBe('Exam\nRoom B & lab\nPens\nID');
    });

    it('decodes each entity once', () => {
        expect(htmlToText('<p>&amp;lt;tag&amp;gt;</p>')).toBe('&lt;tag&gt;');
    });
});

describe('isBlankHtml', () => {
    it('treats an empty editor as blank', () => {
        expect(isBlankHtml('<p></p>')).toBe(true);
        expect(isBlankHtml('<p>Hi</p>')).toBe(false);
        expect(isBlankHtml('<hr>')).toBe(false);
    });
});

describe('textToHtml', () => {
    it('escapes and turns blank lines into paragraphs', () => {
        expect(textToHtml('a < b\nnext\n\n<script>')).toBe(
            '<p>a &lt; b<br>next</p><p>&lt;script&gt;</p>',
        );
        expect(textToHtml('  ')).toBe('');
    });
});

describe('postBodyText', () => {
    it('handles both formats', () => {
        expect(postBodyText({ body: 'plain <b>', format: undefined })).toBe(
            'plain <b>',
        );
        expect(postBodyText({ body: '<p>rich</p>', format: 'html' })).toBe(
            'rich',
        );
    });
});
