import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { adminCommentsQuery, adminKeys } from '@/features/admin/shared/queries';
import { deleteCommentServerFn } from '@/features/social/server/social.functions';
import { formatDate, kindMeta } from '@/lib/format';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { Link, createFileRoute } from '@tanstack/react-router';
import { HeartIcon, Trash2Icon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';

export const Route = createFileRoute('/_site/admin/comments')({
    loader: ({ context }) => context.queryClient.ensureQueryData(adminCommentsQuery()),
    head: () => ({ meta: [{ title: 'Comments · Author · TipsToTreat' }] }),
    component: CommentsPage,
});

function CommentsPage() {
    const { data: comments } = useSuspenseQuery(adminCommentsQuery());
    const queryClient = useQueryClient();
    const remove = useMutation({
        mutationFn: deleteCommentServerFn,
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: adminKeys.comments }),
                queryClient.invalidateQueries({ queryKey: ['social'] }),
            ]);
            toast.success('Comment deleted');
        },
        onError: error => toast.error(error.message),
    });

    return (
        <div>
            <h1 className='text-2xl font-semibold tracking-tight'>Comments</h1>
            <p className='text-muted-foreground mt-1 text-sm'>
                {comments.length} {comments.length === 1 ? 'comment' : 'comments'} across the site,
                newest first.
            </p>
            {comments.length === 0 ? (
                <p className='text-muted-foreground mt-8'>No comments yet.</p>
            ) : (
                <Table className='mt-6'>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Comment</TableHead>
                            <TableHead className='hidden md:table-cell'>On</TableHead>
                            <TableHead className='text-right'>Likes</TableHead>
                            <TableHead className='hidden sm:table-cell'>When</TableHead>
                            <TableHead className='text-right'>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {comments.map(comment => (
                            <TableRow key={comment.id}>
                                <TableCell className='max-w-md whitespace-normal'>
                                    <p className='flex flex-wrap items-center gap-x-2 text-sm'>
                                        <span className='font-medium'>{comment.author.name}</span>
                                        <span className='text-muted-foreground'>
                                            {comment.author.email}
                                        </span>
                                        {comment.author.banned ? (
                                            <Badge variant='destructive'>Banned</Badge>
                                        ) : null}
                                    </p>
                                    <p className='mt-1 line-clamp-3'>{comment.body}</p>
                                </TableCell>
                                <TableCell className='hidden md:table-cell'>
                                    <Link
                                        className='hover:underline hover:underline-offset-4'
                                        params={{
                                            kind: kindMeta[comment.entry.kind].path,
                                            slug: comment.entry.slug,
                                        }}
                                        to='/$kind/$slug'>
                                        {comment.entry.title}
                                    </Link>
                                </TableCell>
                                <TableCell className='text-right tabular-nums'>
                                    <Tooltip>
                                        <TooltipTrigger
                                            render={
                                                <span className='text-muted-foreground inline-flex cursor-default items-center gap-1' />
                                            }>
                                            <HeartIcon className='size-3.5' />
                                            {comment.likers.length}
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            {comment.likers.length === 0
                                                ? 'No likes yet'
                                                : comment.likers.join(', ')}
                                        </TooltipContent>
                                    </Tooltip>
                                </TableCell>
                                <TableCell className='text-muted-foreground hidden tabular-nums sm:table-cell'>
                                    {formatDate(comment.createdAt)}
                                </TableCell>
                                <TableCell className='text-right'>
                                    <Button
                                        aria-label='Delete comment'
                                        disabled={remove.isPending}
                                        onClick={() => remove.mutate({ data: { id: comment.id } })}
                                        size='icon-sm'
                                        variant='ghost'>
                                        <Trash2Icon />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    );
}
