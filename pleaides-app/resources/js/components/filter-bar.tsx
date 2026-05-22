import { Download, Search, X } from 'lucide-react';
import { type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type SelectFilter = {
    key: string;
    label: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
    width?: string;
};

type FilterBarProps = {
    search: {
        value: string;
        onChange: (value: string) => void;
        placeholder?: string;
    };
    selects?: SelectFilter[];
    extra?: ReactNode;
    resultCount: number;
    totalCount: number;
    onClear: () => void;
    hasActiveFilters: boolean;
    onExport?: () => void;
};

export function FilterBar({
    search,
    selects = [],
    extra,
    resultCount,
    totalCount,
    onClear,
    hasActiveFilters,
    onExport,
}: FilterBarProps) {
    return (
        <div className="mb-4 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
                {/* Search */}
                <div className="relative min-w-[200px] flex-1">
                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        className="pl-8 h-9 text-sm"
                        placeholder={search.placeholder ?? 'Search…'}
                        value={search.value}
                        onChange={(e) => search.onChange(e.target.value)}
                    />
                </div>

                {/* Selects */}
                {selects.map((s) => (
                    <Select key={s.key} value={s.value || '__all__'} onValueChange={(v) => s.onChange(v === '__all__' ? '' : v)}>
                        <SelectTrigger className={`h-9 text-sm ${s.width ?? 'w-[150px]'}`}>
                            <SelectValue placeholder={`All ${s.label}`} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__all__">All {s.label}</SelectItem>
                            {s.options.map((o) => (
                                <SelectItem key={o.value} value={o.value}>
                                    {o.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ))}

                {/* Extra filters (e.g. date pickers) */}
                {extra}

                {/* Clear + count */}
                {hasActiveFilters && (
                    <>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClear}
                            className="h-9 gap-1 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-3.5 w-3.5" />
                            Clear
                        </Button>
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                            {resultCount} of {totalCount}
                        </span>
                    </>
                )}

                {/* Export */}
                {onExport && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onExport}
                        className="ml-auto h-9 gap-1.5"
                    >
                        <Download className="h-3.5 w-3.5" />
                        Export CSV
                    </Button>
                )}
            </div>
        </div>
    );
}
