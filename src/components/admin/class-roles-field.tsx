import { CheckboxList } from '@/components/admin/checkbox-list';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { canGrantClassRole } from '@/lib/permissions';
import type { ClassGroup, Role } from '@/types';

// classId → roleIds in that class. A key being present means "member".
export type ClassRoles = Record<string, string[]>;

const DEFAULT_CLASS_ROLE = 'student';

export function ClassRolesField({
    classes,
    roles,
    value,
    ownPermissions,
    onChange,
}: {
    classes: ClassGroup[];
    roles: Role[];
    value: ClassRoles;
    ownPermissions: string[];
    onChange: (value: ClassRoles) => void;
}) {
    // Archived classes only show if the person is already in them.
    const visibleClasses = classes.filter(
        (item) => item.archivedAt === null || item.id in value,
    );

    if (visibleClasses.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                No classes yet — add one on the Classes page.
            </p>
        );
    }

    const roleItems = roles.map((role) => {
        const grantable = canGrantClassRole(role, ownPermissions);

        return {
            id: role.id,
            label: role.name,
            hint: grantable ? undefined : 'Includes permissions you don’t have',
            disabled: !grantable,
        };
    });

    function toggleClass(classId: string, checked: boolean) {
        const next = { ...value };

        if (checked) {
            const defaultRole = roleItems.find(
                (item) => item.id === DEFAULT_CLASS_ROLE && !item.disabled,
            );

            next[classId] = defaultRole ? [defaultRole.id] : [];
        } else {
            delete next[classId];
        }

        onChange(next);
    }

    return (
        <ul className="grid gap-3">
            {visibleClasses.map((item) => {
                const inputId = `class-${item.id}`;
                const selected = item.id in value;

                return (
                    <li key={item.id} className="grid gap-2">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id={inputId}
                                checked={selected}
                                onCheckedChange={(checked) =>
                                    toggleClass(item.id, checked === true)
                                }
                            />
                            <Label htmlFor={inputId}>
                                {item.name}
                                {item.archivedAt !== null && (
                                    <span className="text-xs font-normal text-muted-foreground">
                                        (archived)
                                    </span>
                                )}
                            </Label>
                        </div>
                        {selected && (
                            <div className="ml-6 rounded-md border bg-muted/40 p-3">
                                <CheckboxList
                                    name={`class-${item.id}-role`}
                                    items={roleItems}
                                    selectedIds={value[item.id]}
                                    onChange={(roleIds) =>
                                        onChange({
                                            ...value,
                                            [item.id]: roleIds,
                                        })
                                    }
                                    emptyMessage="No roles yet."
                                />
                            </div>
                        )}
                    </li>
                );
            })}
        </ul>
    );
}
