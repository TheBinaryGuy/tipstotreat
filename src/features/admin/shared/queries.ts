import {
    adminEntryLikesServerFn,
    adminListCommentsServerFn,
    adminListUsersServerFn,
} from '@/features/admin/server/admin.functions';
import { queryOptions } from '@tanstack/react-query';

export const adminKeys = {
    users: ['admin', 'users'] as const,
    comments: ['admin', 'comments'] as const,
    entryLikes: ['admin', 'entry-likes'] as const,
};

export const adminEntryLikesQuery = () =>
    queryOptions({
        queryKey: adminKeys.entryLikes,
        queryFn: () => adminEntryLikesServerFn(),
        staleTime: 0,
    });

export const adminUsersQuery = () =>
    queryOptions({
        queryKey: adminKeys.users,
        queryFn: () => adminListUsersServerFn(),
        staleTime: 0,
    });

export const adminCommentsQuery = () =>
    queryOptions({
        queryKey: adminKeys.comments,
        queryFn: () => adminListCommentsServerFn(),
        staleTime: 0,
    });
