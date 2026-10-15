import { describe, expect, it } from 'vitest';

import { adminCrumbs } from '@/lib/breadcrumbs';

describe('adminCrumbs', () => {
    it('starts at Admin', () => {
        expect(adminCrumbs('/admin', {}, true)).toEqual([
            { label: 'Admin', to: '/admin' },
        ]);
    });

    it('names class pages and the class itself', () => {
        expect(
            adminCrumbs('/admin/classes/c1/roles', { c1: 'RT 2026' }, true),
        ).toEqual([
            { label: 'Admin', to: '/admin' },
            { label: 'Classes', to: '/admin/classes' },
            { label: 'RT 2026', to: '/admin/classes/c1' },
            { label: 'Roles', to: '/admin/classes/c1/roles' },
        ]);
    });

    it('hides the super-admin-only Classes crumb from class admins', () => {
        expect(
            adminCrumbs('/admin/classes/c1/students', { c1: 'RT' }, false).map(
                (crumb) => crumb.label,
            ),
        ).toEqual(['Admin', 'RT', 'Students']);
    });

    it('shows a placeholder until a name loads', () => {
        expect(adminCrumbs('/admin/users/u1', {}, true).at(-1)).toEqual({
            label: '…',
            to: '/admin/users/u1',
        });
    });

    it('ignores paths outside the admin panel', () => {
        expect(adminCrumbs('/classes/c1', {}, true)).toEqual([]);
    });
});
