import { Badge } from '@/components/ui/badge';
import type { ClassRole } from '@/types';

export function RoleBadge({ role }: { role: ClassRole | undefined }) {
    if (!role) {
        return <Badge variant="outline">No role</Badge>;
    }

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
