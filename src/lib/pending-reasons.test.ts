import type { Timestamp } from 'firebase/firestore';
import { describe, expect, it } from 'vitest';

import { NO_CLASS_REASON, pendingReasons } from '@/lib/pending-reasons';
import type {
    ClassGroup,
    ClassInvite,
    ClassRequest,
    JoinRequest,
} from '@/types';

const at = {} as Timestamp;
const classes = [
    { id: 'a', name: 'Class A' },
    { id: 'b', name: 'Class B' },
] as ClassGroup[];

const joinRequest = (userId: string, classId: string): JoinRequest => ({
    id: userId,
    userId,
    classId,
    phone: '',
    createdAt: at,
});

const invite = (email: string, classId: string): ClassInvite => ({
    id: email,
    email,
    classId,
    roleId: 'student',
    roleName: 'Student',
    invitedBy: 'pres',
    createdAt: at,
});

const classRequest = (userId: string, name: string): ClassRequest => ({
    id: userId,
    userId,
    name,
    startYear: 2026,
    endYear: null,
    note: '',
    createdAt: at,
});

describe('pendingReasons', () => {
    it('lists join requests, invites and class requests', () => {
        const reasons = pendingReasons(
            [{ id: 'u1', email: 'New@student.ccc.edu' }],
            {
                joinRequests: [joinRequest('u1', 'a'), joinRequest('u2', 'b')],
                invites: [invite('new@student.ccc.edu', 'b')],
                classRequests: [classRequest('u1', 'Class C')],
                classes,
            },
        );

        expect(reasons.get('u1')).toEqual([
            'Asked to join Class A',
            'Invited to Class B as Student — not accepted yet',
            'Requested a new class: Class C',
        ]);
    });

    it('says when there is nothing waiting', () => {
        const reasons = pendingReasons(
            [{ id: 'u1', email: 'x@student.ccc.edu' }],
            { joinRequests: [], invites: [], classRequests: [], classes },
        );

        expect(reasons.get('u1')).toEqual([NO_CLASS_REASON]);
    });
});
