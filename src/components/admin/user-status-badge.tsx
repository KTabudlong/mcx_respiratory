import { Badge } from '@/components/ui/badge';
import type { UserStatus } from '@/lib/account-status';

const LABELS: Record<UserStatus, string> = {
    active: 'Active',
    pending: 'Pending',
    deactivated: 'Deactivated',
};

const VARIANTS = {
    active: 'default',
    pending: 'secondary',
    deactivated: 'outline',
} as const;

export function UserStatusBadge({ status }: { status: UserStatus }) {
    return <Badge variant={VARIANTS[status]}>{LABELS[status]}</Badge>;
}
