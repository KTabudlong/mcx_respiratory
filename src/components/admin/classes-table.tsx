import { Link } from 'react-router';

import { EditButton } from '@/components/common/action-buttons';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { ClassGroup } from '@/types';

// Super admin classes list. Without `joinRequestCounts` the Join requests
// column is hidden (archived classes).
export function ClassesTable({
    classes,
    memberCounts,
    joinRequestCounts,
    emptyMessage,
    onEdit,
    onToggleArchive,
}: {
    classes: ClassGroup[];
    memberCounts: Map<string, number>;
    joinRequestCounts?: Map<string, number>;
    emptyMessage: string;
    onEdit: (classGroup: ClassGroup) => void;
    onToggleArchive: (classGroup: ClassGroup) => void;
}) {
    const columnCount = joinRequestCounts ? 5 : 4;

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Years</TableHead>
                        <TableHead>Members</TableHead>
                        {joinRequestCounts && (
                            <TableHead>Join requests</TableHead>
                        )}
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {classes.length === 0 && (
                        <TableRow>
                            <TableCell
                                colSpan={columnCount}
                                className="py-8 text-center text-muted-foreground"
                            >
                                {emptyMessage}
                            </TableCell>
                        </TableRow>
                    )}
                    {classes.map((item) => {
                        const requestCount =
                            joinRequestCounts?.get(item.id) ?? 0;

                        return (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">
                                    <Link
                                        to={`/admin/classes/${item.id}`}
                                        className="underline-offset-4 hover:underline"
                                    >
                                        {item.name}
                                    </Link>
                                </TableCell>
                                <TableCell className="whitespace-nowrap">
                                    {item.startYear}–{item.endYear ?? ''}
                                </TableCell>
                                <TableCell>
                                    {memberCounts.get(item.id) ?? 0}
                                </TableCell>
                                {joinRequestCounts && (
                                    <TableCell>
                                        {requestCount > 0 ? (
                                            <Link
                                                to={`/admin/classes/${item.id}/students`}
                                                className="font-medium underline-offset-4 hover:underline"
                                            >
                                                {requestCount} waiting
                                            </Link>
                                        ) : (
                                            <span className="text-muted-foreground">
                                                0
                                            </span>
                                        )}
                                    </TableCell>
                                )}
                                <TableCell className="text-right whitespace-nowrap">
                                    <EditButton
                                        label={`Edit ${item.name}`}
                                        onClick={() => onEdit(item)}
                                    />
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => onToggleArchive(item)}
                                    >
                                        {item.archivedAt === null
                                            ? 'Archive'
                                            : 'Unarchive'}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
