import {
    adminGetEntryServerFn,
    adminListEntriesServerFn,
    getEntryServerFn,
    getHomeServerFn,
    listEntriesServerFn,
    searchEntriesServerFn,
} from '@/features/entries/server/entries.functions';
import type { EntryKind } from '@/lib/db/schema';
import { queryOptions } from '@tanstack/react-query';

export const entryKeys = {
    all: ['entries'] as const,
    home: () => [...entryKeys.all, 'home'] as const,
    list: (kind?: EntryKind) => [...entryKeys.all, 'list', kind ?? 'all'] as const,
    detail: (slug: string) => [...entryKeys.all, 'detail', slug] as const,
    search: (q: string) => [...entryKeys.all, 'search', q] as const,
    admin: {
        all: ['admin', 'entries'] as const,
        list: () => [...entryKeys.admin.all, 'list'] as const,
        detail: (id: string) => [...entryKeys.admin.all, 'detail', id] as const,
    },
};

export const homeQuery = () =>
    queryOptions({
        queryKey: entryKeys.home(),
        queryFn: () => getHomeServerFn(),
    });

export const entriesQuery = (kind?: EntryKind) =>
    queryOptions({
        queryKey: entryKeys.list(kind),
        queryFn: () => listEntriesServerFn({ data: { kind } }),
    });

export const entryQuery = (slug: string) =>
    queryOptions({
        queryKey: entryKeys.detail(slug),
        queryFn: () => getEntryServerFn({ data: { slug } }),
    });

export const searchQuery = (q: string) =>
    queryOptions({
        queryKey: entryKeys.search(q),
        queryFn: () => searchEntriesServerFn({ data: { q } }),
    });

export const adminEntriesQuery = () =>
    queryOptions({
        queryKey: entryKeys.admin.list(),
        queryFn: () => adminListEntriesServerFn(),
        staleTime: 0,
    });

export const adminEntryQuery = (id: string) =>
    queryOptions({
        queryKey: entryKeys.admin.detail(id),
        queryFn: () => adminGetEntryServerFn({ data: { id } }),
        staleTime: 0,
    });
