import { NativeSelect } from '@/components/common/native-select';
import { Label } from '@/components/ui/label';
import { activeClasses } from '@/lib/classes';
import type { ClassGroup } from '@/types';

// `optional`: sign-up, where people may join a class later from /pending.
export function ClassPicker({
    id,
    classes,
    value,
    optional = false,
    onChange,
}: {
    id: string;
    classes: ClassGroup[];
    value: string;
    optional?: boolean;
    onChange: (classId: string) => void;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>
                Your class{' '}
                {optional && (
                    <span className="font-normal text-muted-foreground">
                        (optional)
                    </span>
                )}
            </Label>
            <NativeSelect
                id={id}
                value={value}
                onChange={(event) => onChange(event.target.value)}
            >
                <option value="">
                    {optional
                        ? 'No class yet, I’ll choose later'
                        : 'Choose your class…'}
                </option>
                {activeClasses(classes).map((item) => (
                    <option key={item.id} value={item.id}>
                        {item.name}
                    </option>
                ))}
            </NativeSelect>
            <p className="text-xs text-muted-foreground">
                {optional
                    ? 'Someone in that class who manages students will approve you. You can also join a class later, or accept an invite.'
                    : 'Someone in that class who manages students will approve you.'}
            </p>
        </div>
    );
}
