import { EntryForm } from '@/components/admin/entry-form';
import {
    adminDeleteEntryServerFn,
    adminUpdateEntryServerFn,
} from '@/features/entries/server/entries.functions';
import { adminEntryQuery, entryKeys } from '@/features/entries/shared/queries';
import { kindMeta } from '@/lib/format';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { ExternalLinkIcon } from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/_site/admin/entries/$id')({
    loader: ({ context, params }) =>
        context.queryClient.ensureQueryData(adminEntryQuery(params.id)),
    component: EditEntry,
});

function EditEntry() {
    const { id } = Route.useParams();
    const { data: entry } = useSuspenseQuery(adminEntryQuery(id));
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    async function invalidate() {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: entryKeys.admin.all }),
            queryClient.invalidateQueries({ queryKey: entryKeys.all }),
        ]);
    }

    const update = useMutation({
        mutationFn: adminUpdateEntryServerFn,
        onSuccess: async () => {
            await invalidate();
            toast.success('Saved');
        },
    });
    const remove = useMutation({
        mutationFn: adminDeleteEntryServerFn,
        onSuccess: async () => {
            await invalidate();
            await navigate({ to: '/admin' });
        },
    });

    return (
        <div>
            <div className='flex flex-wrap items-baseline justify-between gap-3'>
                <h1 className='text-2xl font-semibold tracking-tight'>{entry.title}</h1>
                {entry.status === 'published' ? (
                    <Link
                        className='text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors'
                        params={{ kind: kindMeta[entry.kind].path, slug: entry.slug }}
                        to='/$kind/$slug'>
                        View on site <ExternalLinkIcon className='size-3.5' />
                    </Link>
                ) : null}
            </div>
            <div className='mt-6'>
                <EntryForm
                    entry={entry}
                    error={update.error?.message ?? remove.error?.message}
                    key={entry.updatedAt.getTime()}
                    onDelete={() => remove.mutate({ data: { id } })}
                    onSubmit={input => update.mutate({ data: { id, input } })}
                    pending={update.isPending || remove.isPending}
                />
            </div>
        </div>
    );
}
