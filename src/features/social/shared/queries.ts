import { getEntrySocialServerFn } from '@/features/social/server/social.functions';
import { queryOptions } from '@tanstack/react-query';

export const socialKeys = {
    entry: (slug: string) => ['social', 'entry', slug] as const,
};

export const entrySocialQuery = (slug: string) =>
    queryOptions({
        queryKey: socialKeys.entry(slug),
        queryFn: () => getEntrySocialServerFn({ data: { slug } }),
        staleTime: 0,
    });
