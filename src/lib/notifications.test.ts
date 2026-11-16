import { describe, expect, it } from 'vitest';

import { notificationText } from '@/lib/notifications';

describe('notificationText', () => {
    it('describes being added with the role', () => {
        expect(
            notificationText(
                { type: 'added', roleName: 'Student' },
                'Class A',
                'Ana Cruz',
            ),
        ).toBe('Ana Cruz added you to Class A as Student.');
    });

    it('describes a role change with the new role', () => {
        expect(
            notificationText(
                { type: 'role_changed', roleName: 'President' },
                'Class A',
                'Ana Cruz',
            ),
        ).toBe('Ana Cruz changed your role in Class A to President.');
    });

    it('describes being removed', () => {
        expect(
            notificationText(
                { type: 'removed', roleName: '' },
                'Class A',
                'Ana Cruz',
            ),
        ).toBe('Ana Cruz removed you from Class A.');
    });
});
