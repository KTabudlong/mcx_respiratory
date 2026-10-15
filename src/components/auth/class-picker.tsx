import { NativeSelect } from '@/components/common/native-select';
import { Label } from '@/components/ui/label';
import { activeClasses } from '@/lib/classes';
import type { ClassGroup } from '@/types';

export function ClassPicker({
    id,
    classes,
    value,
    onChange,
}: {
    id: string;
    classes: ClassGroup[];
    value: string;
    onChange: (classId: string) => void;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>Your class</Label>
            <NativeSelect
                id={id}
                value={value}
                onChange={(event) => onChange(event.target.value)}
            >
                <option value="">Choose your class…</option>
                {activeClasses(classes).map((item) => (
                    <option key={item.id} value={item.id}>
                        {item.name}
                    </option>
                ))}
            </NativeSelect>
            <p className="text-xs text-muted-foreground">
                Someone in that class who manages students will approve you.
            </p>
        </div>
    );
}
