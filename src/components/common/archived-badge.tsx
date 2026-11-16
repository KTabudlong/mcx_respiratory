import { Badge } from '@/components/ui/badge';

// Archived classes across admin and board views.
export function ArchivedBadge() {
    return (
        <Badge className="border-transparent bg-orange-500 text-white dark:bg-orange-600">
            Archived
        </Badge>
    );
}
