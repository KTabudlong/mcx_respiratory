import type { ReactNode } from 'react';

import { ArchivedBadge } from '@/components/common/archived-badge';
import { useDocument } from '@/hooks/use-document';
import type { ClassGroup } from '@/types';

export function ClassPageHeader({
    classId,
    title,
    description,
    action,
}: {
    classId: string;
    title: string;
    description: string;
    action?: ReactNode;
}) {
    const classGroup = useDocument<ClassGroup>(`classes/${classId}`);

    return (
        <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    {classGroup.data?.name ?? '…'}
                    {classGroup.data?.archivedAt && <ArchivedBadge />}
                </p>
                <h1 className="text-2xl font-semibold">{title}</h1>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            {action}
        </div>
    );
}
