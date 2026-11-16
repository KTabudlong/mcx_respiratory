import { useNavigate } from 'react-router';

import { NativeSelect } from '@/components/common/native-select';
import { Label } from '@/components/ui/label';
import { sortClasses } from '@/lib/classes';
import type { ClassGroup } from '@/types';

// Switches the admin panel between the classes this user can manage.
export function ClassSwitcher({
    classes,
    currentClassId,
    onSwitch,
}: {
    classes: ClassGroup[];
    currentClassId: string | undefined;
    onSwitch?: () => void;
}) {
    const navigate = useNavigate();

    if (classes.length === 0) {
        return null;
    }

    return (
        <div className="grid gap-1.5 px-2">
            <Label htmlFor="admin-class" className="text-xs">
                Class
            </Label>
            <NativeSelect
                id="admin-class"
                value={currentClassId ?? ''}
                onChange={(event) => {
                    if (event.target.value) {
                        navigate(`/admin/classes/${event.target.value}`);
                        onSwitch?.();
                    }
                }}
            >
                {!currentClassId && <option value="">Choose a class…</option>}
                {sortClasses(classes).map((item) => (
                    <option key={item.id} value={item.id}>
                        {item.name}
                        {item.archivedAt !== null ? ' (archived)' : ''}
                    </option>
                ))}
            </NativeSelect>
        </div>
    );
}
