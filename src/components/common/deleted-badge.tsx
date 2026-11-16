import { Badge } from '@/components/ui/badge';

// Soft-deleted posts and comments across admin views.
export function DeletedBadge() {
    return (
        <Badge className="border-transparent bg-orange-500 text-white dark:bg-orange-600">
            Deleted
        </Badge>
    );
}
