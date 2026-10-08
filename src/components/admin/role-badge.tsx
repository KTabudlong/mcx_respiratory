import { Badge } from '@/components/ui/badge';
import type { Role } from '@/types';

export function RoleBadge({ role }: { role: Role }) {
    return (
        <Badge variant="outline" className="gap-1.5">
            <span
                className="size-2 rounded-full"
                style={{ backgroundColor: role.color }}
                aria-hidden
            />
            {role.name}
        </Badge>
    );
}
