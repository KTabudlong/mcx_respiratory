import type { Timestamp } from 'firebase/firestore';
import { describe, expect, it } from 'vitest';

import { diffMemberships } from '@/lib/memberships';
import type { ClassMember } from '@/types';

function makeMember(classId: string, roleIds: string[]): ClassMember {
    return {
        id: 'u',
        classId,
        userId: 'u',
        roleIds,
        permissions: roleIds.includes('moderator') ? ['posts.pin'] : [],
        createdAt: {} as Timestamp,
        updatedAt: {} as Timestamp,
    };
}

describe('diffMemberships', () => {
    const previous = [
        makeMember('rt-2025', ['student']),
        makeMember('rt-2026', ['student']),
    ];

    it('creates new classes, updates changed roles and removes dropped classes', () => {
        const result = diffMemberships(previous, [
            { classId: 'rt-2026', roleIds: ['moderator'], permissions: [] },
            { classId: 'rt-2027', roleIds: ['student'], permissions: [] },
        ]);

        expect(result.create.map((item) => item.classId)).toEqual(['rt-2027']);
        expect(result.update.map((item) => item.classId)).toEqual(['rt-2026']);
        expect(result.remove.map((item) => item.classId)).toEqual(['rt-2025']);
    });

    it('leaves unchanged memberships alone, regardless of role order', () => {
        const result = diffMemberships(
            [makeMember('rt-2026', ['student', 'moderator'])],
            [
                {
                    classId: 'rt-2026',
                    roleIds: ['moderator', 'student'],
                    permissions: ['posts.pin'],
                },
            ],
        );

        expect(result).toEqual({ create: [], update: [], remove: [] });
    });
});
