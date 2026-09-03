import { EntryForm } from '@/components/admin/entry-form';
import { adminCreateEntryServerFn } from '@/features/entries/server/entries.functions';
import { entryKeys } from '@/features/entries/shared/queries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';

export const Route = createFileRoute('/_site/admin/entries/new')({
    component: NewEntry,
});

function NewEntry() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const create = useMutation({
        mutationFn: adminCreateEntryServerFn,
        onSuccess: async entry => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: entryKeys.admin.all }),
                queryClient.invalidateQueries({ queryKey: entryKeys.all }),
            ]);
            toast.success(entry.status === 'published' ? 'Published' : 'Draft saved');
            await navigate({ to: '/admin/entries/$id', params: { id: entry.id } });
        },
    });

    return (
        <div>
            <h1 className='text-2xl font-semibold tracking-tight'>New entry</h1>
            <div className='mt-6'>
                <EntryForm
                    error={create.error?.message}
                    onSubmit={input => create.mutate({ data: input })}
                    pending={create.isPending}
                />
            </div>
        </div>
    );
}
