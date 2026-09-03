import { Badge } from '@/components/ui/badge';
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { adminEntryLikesQuery } from '@/features/admin/shared/queries';
import { adminEntriesQuery } from '@/features/entries/shared/queries';
import { LikesPeek } from '@/features/social/components/likes-peek';
import type { EntryKind, EntryStatus } from '@/lib/db/schema';
import { formatDate, kindMeta } from '@/lib/format';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { FileTextIcon, PlusIcon } from 'lucide-react';
import { z } from 'zod';

export const Route = createFileRoute('/_site/admin/')({
    validateSearch: z.object({
        kind: z.enum(['remedy', 'tip', 'recipe', 'article']).optional().catch(undefined),
        status: z.enum(['draft', 'published']).optional().catch(undefined),
    }),
    loader: ({ context }) =>
        Promise.all([
            context.queryClient.ensureQueryData(adminEntriesQuery()),
            context.queryClient.ensureQueryData(adminEntryLikesQuery()),
        ]),
    component: AdminIndex,
});

function AdminIndex() {
    const { kind, status } = Route.useSearch();
    const { data: all } = useSuspenseQuery(adminEntriesQuery());
    const { data: entryLikes } = useSuspenseQuery(adminEntryLikesQuery());
    const rows = all.filter(e => (!kind || e.kind === kind) && (!status || e.status === status));

    const counts = {
        drafts: all.filter(e => e.status === 'draft').length,
        published: all.filter(e => e.status === 'published').length,
    };

    return (
        <div>
            <div className='flex flex-wrap items-end justify-between gap-4'>
                <div>
                    <h1 className='text-2xl font-semibold tracking-tight'>Entries</h1>
                    <p className='text-muted-foreground mt-1 text-sm'>
                        {counts.published} published · {counts.drafts}{' '}
                        {counts.drafts === 1 ? 'draft' : 'drafts'}
                    </p>
                </div>
                <Button render={<Link to='/admin/entries/new' />}>
                    <PlusIcon data-icon='inline-start' /> New entry
                </Button>
            </div>

            <div className='mt-6 flex flex-wrap gap-x-6 gap-y-2 border-y py-2'>
                <FilterGroup
                    active={kind}
                    label='Kind'
                    options={[
                        ['remedy', 'Remedies'],
                        ['tip', 'Tips'],
                        ['recipe', 'Recipes'],
                        ['article', 'Articles'],
                    ]}
                    param='kind'
                />
                <FilterGroup
                    active={status}
                    label='Status'
                    options={[
                        ['published', 'Published'],
                        ['draft', 'Drafts'],
                    ]}
                    param='status'
                />
            </div>

            {rows.length === 0 ? (
                <Empty className='mt-6 border border-dashed'>
                    <EmptyHeader>
                        <EmptyMedia variant='icon'>
                            <FileTextIcon />
                        </EmptyMedia>
                        <EmptyTitle>Nothing here yet</EmptyTitle>
                        <EmptyDescription>
                            {all.length === 0
                                ? 'Write your first remedy, tip, or recipe.'
                                : 'No entries match this filter.'}
                        </EmptyDescription>
                    </EmptyHeader>
                    {all.length === 0 ? (
                        <EmptyContent>
                            <Button render={<Link to='/admin/entries/new' />}>
                                <PlusIcon data-icon='inline-start' /> New entry
                            </Button>
                        </EmptyContent>
                    ) : null}
                </Empty>
            ) : (
                <>
                    {/* Phones: one card per entry. */}
                    <ul className='mt-4 space-y-3 md:hidden'>
                        {rows.map(entry => (
                            <li className='bg-card rounded-lg border p-4' key={entry.id}>
                                <div className='flex items-start justify-between gap-3'>
                                    <div className='min-w-0'>
                                        <Link
                                            className='block font-medium hover:underline hover:underline-offset-4'
                                            params={{ id: entry.id }}
                                            to='/admin/entries/$id'>
                                            {entry.title}
                                        </Link>
                                        {entry.useFor ? (
                                            <p className='text-muted-foreground mt-0.5 text-sm'>
                                                {entry.useFor}
                                            </p>
                                        ) : null}
                                    </div>
                                    <StatusPill status={entry.status} />
                                </div>
                                <div className='text-muted-foreground mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm'>
                                    <span>{kindMeta[entry.kind].label}</span>
                                    <span aria-hidden>·</span>
                                    <LikesPeek align='end' likers={entryLikes[entry.id] ?? []} />
                                    <span aria-hidden>·</span>
                                    <span className='tabular-nums'>
                                        {formatDate(entry.updatedAt)}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <Table className='mt-2 hidden md:table'>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Kind</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className='text-right'>Likes</TableHead>
                                <TableHead>Updated</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.map(entry => (
                                <TableRow key={entry.id}>
                                    <TableCell>
                                        <Link
                                            className='block font-medium hover:underline hover:underline-offset-4'
                                            params={{ id: entry.id }}
                                            to='/admin/entries/$id'>
                                            {entry.title}
                                        </Link>
                                        {entry.useFor ? (
                                            <span className='text-muted-foreground text-sm'>
                                                {entry.useFor}
                                            </span>
                                        ) : null}
                                    </TableCell>
                                    <TableCell>{kindMeta[entry.kind].label}</TableCell>
                                    <TableCell>
                                        <StatusPill status={entry.status} />
                                    </TableCell>
                                    <TableCell className='text-right tabular-nums'>
                                        <LikesPeek
                                            align='end'
                                            likers={entryLikes[entry.id] ?? []}
                                        />
                                    </TableCell>
                                    <TableCell className='text-muted-foreground tabular-nums'>
                                        {formatDate(entry.updatedAt)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </>
            )}
        </div>
    );
}

function StatusPill({ status }: { status: EntryStatus }) {
    return (
        <Badge variant={status === 'published' ? 'default' : 'secondary'}>
            {status === 'published' ? 'Published' : 'Draft'}
        </Badge>
    );
}

function FilterGroup<T extends EntryKind | EntryStatus>({
    label,
    param,
    options,
    active,
}: {
    label: string;
    param: 'kind' | 'status';
    options: [T, string][];
    active?: T;
}) {
    const navigate = useNavigate({ from: '/admin' });
    const choices: [string, string][] = [['all', 'All'], ...options];
    return (
        <div className='flex flex-wrap items-center gap-2'>
            <span className='text-muted-foreground text-sm'>{label}</span>
            <ToggleGroup
                className='flex-wrap'
                aria-label={`Filter by ${label.toLowerCase()}`}
                onValueChange={value => {
                    const next = value[0];
                    if (!next) return;
                    void navigate({
                        search: prev => ({ ...prev, [param]: next === 'all' ? undefined : next }),
                    });
                }}
                size='sm'
                value={[active ?? 'all']}
                variant='outline'>
                {choices.map(([value, text]) => (
                    <ToggleGroupItem key={value} value={value}>
                        {text}
                    </ToggleGroupItem>
                ))}
            </ToggleGroup>
        </div>
    );
}
