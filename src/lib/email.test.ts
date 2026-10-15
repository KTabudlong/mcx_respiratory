import { describe, expect, it } from 'vitest';

import { mailtoBcc, uniqueEmails } from '@/lib/email';

describe('uniqueEmails', () => {
    it('trims, lowercases, and drops blanks and duplicates', () => {
        expect(
            uniqueEmails([' A@ccc.edu', 'a@ccc.edu', '', 'b@student.ccc.edu']),
        ).toEqual(['a@ccc.edu', 'b@student.ccc.edu']);
    });
});

describe('mailtoBcc', () => {
    it('puts every address in BCC', () => {
        expect(mailtoBcc(['a@ccc.edu', 'b+x@ccc.edu'])).toBe(
            'mailto:?bcc=a%40ccc.edu,b%2Bx%40ccc.edu',
        );
    });
});
