import { describe, expect, it } from 'vitest';

import { linkLabel, normalizeUrl, preparePost } from '@/lib/posts';

describe('normalizeUrl', () => {
    it('keeps http(s) URLs and adds https:// when missing', () => {
        expect(normalizeUrl('https://drive.google.com/x')).toBe(
            'https://drive.google.com/x',
        );
        expect(normalizeUrl('  docs.google.com/doc ')).toBe(
            'https://docs.google.com/doc',
        );
    });

    it('rejects other schemes and garbage', () => {
        expect(normalizeUrl('javascript:alert(1)')).toBeNull();
        expect(normalizeUrl('mailto:a@b.c')).toBeNull();
        expect(normalizeUrl('http://')).toBeNull();
        expect(normalizeUrl('   ')).toBeNull();
    });
});

describe('linkLabel', () => {
    it('falls back to the host name without www', () => {
        expect(linkLabel({ url: 'https://www.ccc.edu/a', label: ' ' })).toBe(
            'ccc.edu',
        );
        expect(linkLabel({ url: 'https://ccc.edu', label: 'Syllabus' })).toBe(
            'Syllabus',
        );
    });
});

describe('preparePost', () => {
    const valid = {
        title: '  Exam 2 moved  ',
        body: ' See the schedule. ',
        links: [
            { url: 'ccc.edu/schedule', label: 'Schedule' },
            { url: '', label: '' },
        ],
        pinned: false,
    };

    it('trims text, drops empty link rows and normalizes URLs', () => {
        expect(preparePost(valid)).toEqual({
            post: {
                title: 'Exam 2 moved',
                body: 'See the schedule.',
                links: [{ url: 'https://ccc.edu/schedule', label: 'Schedule' }],
                pinned: false,
            },
            error: '',
        });
    });

    it('requires a title', () => {
        expect(preparePost({ ...valid, title: ' ' }).error).toBe(
            'Title is required.',
        );
    });

    it('rejects bad links by position', () => {
        expect(
            preparePost({
                ...valid,
                links: [{ url: 'javascript:alert(1)', label: 'x' }],
            }).error,
        ).toBe('Link 1 needs a valid web address (https://…).');
    });
});
