import {
    Archive,
    ArchiveRestore,
    ExternalLink,
    Eye,
    Pencil,
    RotateCcw,
    Trash2,
} from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ActionButtonProps = Omit<
    ComponentProps<typeof Button>,
    'variant' | 'children'
> & {
    // Screen-reader name and hover tooltip (`title` overrides the tooltip).
    label?: string;
};

// Every Delete button: red, trash icon only.
export function DeleteButton({
    label = 'Delete',
    size = 'icon-sm',
    title,
    ...props
}: ActionButtonProps) {
    return (
        <Button
            variant="destructive"
            size={size}
            aria-label={label}
            title={title ?? label}
            {...props}
        >
            <Trash2 aria-hidden />
        </Button>
    );
}

// Every Restore button: green, restore icon only.
export function RestoreButton({
    label = 'Restore',
    size = 'icon-sm',
    title,
    className,
    ...props
}: ActionButtonProps) {
    return (
        <Button
            size={size}
            aria-label={label}
            title={title ?? label}
            className={cn(
                'bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-600/30 dark:bg-green-700 dark:hover:bg-green-600',
                className,
            )}
            {...props}
        >
            <RotateCcw aria-hidden />
        </Button>
    );
}

type LinkButtonProps = ActionButtonProps & {
    to?: string;
    state?: unknown;
    target?: string;
    rel?: string;
};

// Blue icon-only button; with `to` it's an in-app link.
function BlueIconButton({
    label,
    size = 'icon-sm',
    title,
    className,
    to,
    state,
    target,
    rel,
    icon,
    ...props
}: LinkButtonProps & { label: string; icon: ReactNode }) {
    const linkRel =
        rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined);

    return (
        <Button
            size={size}
            asChild={to !== undefined}
            aria-label={label}
            title={title ?? label}
            className={cn(
                'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600/30 dark:bg-blue-700 dark:hover:bg-blue-600',
                className,
            )}
            {...props}
        >
            {to !== undefined ? (
                <Link to={to} state={state} target={target} rel={linkRel}>
                    {icon}
                </Link>
            ) : (
                icon
            )}
        </Button>
    );
}

// Every Edit button: blue, pencil icon only.
export function EditButton({ label = 'Edit', ...props }: LinkButtonProps) {
    return (
        <BlueIconButton
            label={label}
            icon={<Pencil aria-hidden />}
            {...props}
        />
    );
}

// Every View button: blue, eye icon only (details / preview).
export function ViewButton({ label = 'View', ...props }: LinkButtonProps) {
    return (
        <BlueIconButton label={label} icon={<Eye aria-hidden />} {...props} />
    );
}

// Open in a new tab: blue, external-link icon only.
export function OpenTabButton({
    label = 'Open in new tab',
    ...props
}: LinkButtonProps) {
    return (
        <BlueIconButton
            label={label}
            icon={<ExternalLink aria-hidden />}
            target="_blank"
            {...props}
        />
    );
}

// Archive a class: amber, archive icon only (same size as Edit).
export function ArchiveButton({
    label = 'Archive',
    size = 'icon-sm',
    title,
    className,
    ...props
}: ActionButtonProps) {
    return (
        <Button
            size={size}
            aria-label={label}
            title={title ?? label}
            className={cn(
                'bg-amber-600 text-white hover:bg-amber-700 focus-visible:ring-amber-600/30 dark:bg-amber-700 dark:hover:bg-amber-600',
                className,
            )}
            {...props}
        >
            <Archive aria-hidden />
        </Button>
    );
}

// Unarchive a class: amber, archive-restore icon only.
export function UnarchiveButton({
    label = 'Unarchive',
    size = 'icon-sm',
    title,
    className,
    ...props
}: ActionButtonProps) {
    return (
        <Button
            size={size}
            aria-label={label}
            title={title ?? label}
            className={cn(
                'bg-amber-600 text-white hover:bg-amber-700 focus-visible:ring-amber-600/30 dark:bg-amber-700 dark:hover:bg-amber-600',
                className,
            )}
            {...props}
        >
            <ArchiveRestore aria-hidden />
        </Button>
    );
}
