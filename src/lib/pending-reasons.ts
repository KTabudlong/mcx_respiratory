import type {
    ClassGroup,
    ClassInvite,
    ClassRequest,
    JoinRequest,
    UserProfile,
} from '@/types';

export const NO_CLASS_REASON = "Not in a class and hasn't asked to join one";

// Why each pending (class-less) account is waiting, for the super admin:
// join requests, invites not yet accepted, and new-class requests. Invites
// are keyed by school email, the rest by uid.
export function pendingReasons(
    users: Pick<UserProfile, 'id' | 'email'>[],
    {
        joinRequests,
        invites,
        classRequests,
        classes,
    }: {
        joinRequests: JoinRequest[];
        invites: ClassInvite[];
        classRequests: ClassRequest[];
        classes: ClassGroup[];
    },
) {
    const className = new Map(classes.map((item) => [item.id, item.name]));
    const nameOf = (classId: string) => className.get(classId) ?? 'a class';
    const reasons = new Map<string, string[]>();

    for (const user of users) {
        const email = user.email.toLowerCase();
        const asked = joinRequests
            .filter((request) => request.userId === user.id)
            .map((request) => nameOf(request.classId));
        const invited = invites
            .filter((invite) => invite.email === email)
            .map((invite) => `${nameOf(invite.classId)} as ${invite.roleName}`);
        const requested = classRequests.find(
            (request) => request.userId === user.id,
        );
        const list = [
            ...(asked.length > 0 ? [`Asked to join ${asked.join(', ')}`] : []),
            ...(invited.length > 0
                ? [`Invited to ${invited.join(', ')} — not accepted yet`]
                : []),
            ...(requested ? [`Requested a new class: ${requested.name}`] : []),
        ];

        reasons.set(user.id, list.length > 0 ? list : [NO_CLASS_REASON]);
    }

    return reasons;
}
