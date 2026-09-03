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
import { Trash2Icon } from 'lucide-react';
import { LikesPeek } from '@/features/social/components/likes-peek';
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
                <>
                    <ul className='mt-6 space-y-3 md:hidden'>
                        {comments.map(comment => (
                            <li className='bg-card rounded-lg border p-4' key={comment.id}>
                                <div className='flex items-start justify-between gap-3'>
                                    <div className='min-w-0'>
                                        <p className='flex flex-wrap items-center gap-x-2 text-sm'>
                                            <span className='font-medium'>
                                                {comment.author.name}
                                            </span>
                                            {comment.author.banned ? (
                                                <Badge variant='destructive'>Banned</Badge>
                                            ) : null}
                                        </p>
                                        <p className='text-muted-foreground truncate text-xs'>
                                            {comment.author.email}
                                        </p>
                                    </div>
                                    <Button
                                        aria-label='Delete comment'
                                        className='-mt-1 -mr-2'
                                        disabled={remove.isPending}
                                        onClick={() => remove.mutate({ data: { id: comment.id } })}
                                        size='icon-sm'
                                        variant='ghost'>
                                        <Trash2Icon />
                                    </Button>
                                </div>
                                <p className='mt-2 line-clamp-4 text-sm'>{comment.body}</p>
                                <div className='text-muted-foreground mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm'>
                                    <Link
                                        className='hover:text-foreground truncate hover:underline hover:underline-offset-4'
                                        params={{
                                            kind: kindMeta[comment.entry.kind].path,
                                            slug: comment.entry.slug,
                                        }}
                                        to='/$kind/$slug'>
                                        {comment.entry.title}
                                    </Link>
                                    <span aria-hidden>·</span>
                                    <LikesPeek align='end' names={comment.likers} />
                                    <span aria-hidden>·</span>
                                    <span className='tabular-nums'>
                                        {formatDate(comment.createdAt)}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <Table className='mt-6 hidden md:table'>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Comment</TableHead>
                                <TableHead>On</TableHead>
                                <TableHead className='text-right'>Likes</TableHead>
                                <TableHead>When</TableHead>
                                <TableHead className='text-right'>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {comments.map(comment => (
                                <TableRow key={comment.id}>
                                    <TableCell className='max-w-md whitespace-normal'>
                                        <p className='flex flex-wrap items-center gap-x-2 text-sm'>
                                            <span className='font-medium'>
                                                {comment.author.name}
                                            </span>
                                            <span className='text-muted-foreground'>
                                                {comment.author.email}
                                            </span>
                                            {comment.author.banned ? (
                                                <Badge variant='destructive'>Banned</Badge>
                                            ) : null}
                                        </p>
                                        <p className='mt-1 line-clamp-3'>{comment.body}</p>
                                    </TableCell>
                                    <TableCell>
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
                                        <LikesPeek align='end' names={comment.likers} />
                                    </TableCell>
                                    <TableCell className='text-muted-foreground tabular-nums'>
                                        {formatDate(comment.createdAt)}
                                    </TableCell>
                                    <TableCell className='text-right'>
                                        <Button
                                            aria-label='Delete comment'
                                            disabled={remove.isPending}
                                            onClick={() =>
                                                remove.mutate({ data: { id: comment.id } })
                                            }
                                            size='icon-sm'
                                            variant='ghost'>
                                            <Trash2Icon />
                                        </Button>
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
