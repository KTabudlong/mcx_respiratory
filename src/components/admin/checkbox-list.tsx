import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export type CheckboxItem = {
    id: string;
    label: string;
    hint?: string;
    disabled?: boolean;
};

export function CheckboxList({
    name,
    items,
    selectedIds,
    onChange,
    emptyMessage,
}: {
    name: string;
    items: CheckboxItem[];
    selectedIds: string[];
    onChange: (selectedIds: string[]) => void;
    emptyMessage: string;
}) {
    if (items.length === 0) {
        return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
    }

    function toggle(id: string, checked: boolean) {
        onChange(
            checked
                ? [...selectedIds, id]
                : selectedIds.filter((selectedId) => selectedId !== id),
        );
    }

    return (
        <ul className="grid gap-2 sm:grid-cols-2">
            {items.map((item) => {
                const inputId = `${name}-${item.id}`;

                return (
                    <li key={item.id} className="flex items-start gap-2">
                        <Checkbox
                            id={inputId}
                            className="mt-0.5"
                            checked={selectedIds.includes(item.id)}
                            disabled={item.disabled}
                            onCheckedChange={(checked) =>
                                toggle(item.id, checked === true)
                            }
                        />
                        <Label
                            htmlFor={inputId}
                            className="grid gap-0.5 leading-snug font-normal"
                        >
                            <span>{item.label}</span>
                            {item.hint && (
                                <span className="text-xs text-muted-foreground">
                                    {item.hint}
                                </span>
                            )}
                        </Label>
                    </li>
                );
            })}
        </ul>
    );
}
