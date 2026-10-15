import { Search } from 'lucide-react';

export function SearchInput({
    value,
    onChange,
    label,
    placeholder = 'Search first or last name',
}: {
    value: string;
    onChange: (value: string) => void;
    label: string;
    placeholder?: string;
}) {
    return (
        <div className="relative sm:max-w-xs sm:flex-1">
            <Search
                className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
            />
            <input
                type="search"
                placeholder={placeholder}
                aria-label={label}
                className="h-9 w-full min-w-0 rounded-md border border-input bg-transparent py-1 pr-3 pl-8 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
                value={value}
                onChange={(event) => onChange(event.target.value)}
            />
        </div>
    );
}
