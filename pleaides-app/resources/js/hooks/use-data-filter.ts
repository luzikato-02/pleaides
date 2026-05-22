import { useMemo, useState } from 'react';

export type FilterDef<T> = {
    key: string;
    label: string;
    options: { value: string; label: string }[];
    match: (item: T, value: string) => boolean;
};

export type DataFilterConfig<T> = {
    searchFn: (item: T, query: string) => boolean;
    filters?: FilterDef<T>[];
};

export function useDataFilter<T>(data: T[], config: DataFilterConfig<T>) {
    const [query, setQuery] = useState('');
    const [filterValues, setFilterValues] = useState<Record<string, string>>({});

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return data.filter((item) => {
            if (q && !config.searchFn(item, q)) return false;
            for (const [key, val] of Object.entries(filterValues)) {
                if (!val) continue;
                const def = config.filters?.find((f) => f.key === key);
                if (def && !def.match(item, val)) return false;
            }
            return true;
        });
    }, [data, query, filterValues, config]);

    const setFilter = (key: string, value: string) =>
        setFilterValues((prev) => ({ ...prev, [key]: value }));

    const clearAll = () => {
        setQuery('');
        setFilterValues({});
    };

    const hasActiveFilters =
        query.trim() !== '' || Object.values(filterValues).some(Boolean);

    return {
        filtered,
        query,
        setQuery,
        filterValues,
        setFilter,
        clearAll,
        hasActiveFilters,
    };
}
