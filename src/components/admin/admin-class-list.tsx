import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router';

import { Badge } from '@/components/ui/badge';
import type { ClassGroup } from '@/types';

// Links into each class's admin overview.
export function AdminClassList({ classes }: { classes: ClassGroup[] }) {
    if (classes.length === 0) {
        return <p className="text-sm text-muted-foreground">No classes yet.</p>;
    }

    return (
        <ul className="divide-y rounded-md border">
            {classes.map((classGroup) => (
                <li key={classGroup.id}>
                    <Link
                        to={`/admin/classes/${classGroup.id}`}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none"
                    >
                        <span className="min-w-0 flex-1 truncate font-medium">
                            {classGroup.name}
                        </span>
                        {classGroup.archivedAt && (
                            <Badge variant="outline">Archived</Badge>
                        )}
                        <ChevronRight
                            className="size-4 text-muted-foreground"
                            aria-hidden
                        />
                    </Link>
                </li>
            ))}
        </ul>
    );
}
