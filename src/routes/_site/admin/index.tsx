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
import { adminEntriesQuery } from '@/features/entries/shared/queries';
import type { EntryKind, EntryStatus } from '@/lib/db/schema';
import { formatDate, kindMeta } from '@/lib/format';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { FileTextIcon, PlusIcon } from 'lucide-react';
import { z } from 'zod';

export const Route = createFileRoute('/_site/admin/')({
    validateSearch: z.object({
        kind: z.enum(['remedy', 'tip', 'recipe']).optional().catch(undefined),
        status: z.enum(['draft', 'published']).optional().catch(undefined),
    }),
    loader: ({ context }) => context.queryClient.ensureQueryData(adminEntriesQuery()),
    component: AdminIndex,
});

function AdminIndex() {
    const { kind, status } = Route.useSearch();
    const { data: all } = useSuspenseQuery(adminEntriesQuery());
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
                <Table className='mt-2'>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead className='hidden sm:table-cell'>Kind</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className='hidden md:table-cell'>Updated</TableHead>
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
                                <TableCell className='hidden sm:table-cell'>
                                    {kindMeta[entry.kind].label}
                                </TableCell>
                                <TableCell>
                                    <StatusPill status={entry.status} />
                                </TableCell>
                                <TableCell className='text-muted-foreground hidden tabular-nums md:table-cell'>
                                    {formatDate(entry.updatedAt)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
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
        <div className='flex items-center gap-2'>
            <span className='text-muted-foreground text-sm'>{label}</span>
            <ToggleGroup
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
