import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import type { SessionUser } from '@/features/auth/shared/types';
import {
    addCommentServerFn,
    commentBodySchema,
    deleteCommentServerFn,
} from '@/features/social/server/social.functions';
import type { CommentView } from '@/features/social/server/social.server';
import { socialKeys } from '@/features/social/shared/queries';
import { formatDate } from '@/lib/format';
import { useForm } from '@tanstack/react-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation } from '@tanstack/react-router';
import { Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

function initials(name: string) {
    return (
        name
            .split(/\s+/)
            .map(part => part[0] ?? '')
            .join('')
            .slice(0, 2)
            .toUpperCase() || '?'
    );
}

export function Comments({
    entryId,
    slug,
    comments,
    viewer,
}: {
    entryId: string;
    slug: string;
    comments: CommentView[];
    viewer: SessionUser | null;
}) {
    const queryClient = useQueryClient();
    const location = useLocation();
    const invalidate = () => queryClient.invalidateQueries({ queryKey: socialKeys.entry(slug) });

    const add = useMutation({
        mutationFn: (body: string) => addCommentServerFn({ data: { entryId, body } }),
        onSuccess: async () => {
            await invalidate();
            form.reset();
        },
        onError: error => toast.error(error.message),
    });
    const remove = useMutation({
        mutationFn: (id: string) => deleteCommentServerFn({ data: { id } }),
        onSuccess: invalidate,
        onError: error => toast.error(error.message),
    });

    const form = useForm({
        defaultValues: { body: '' },
        validators: { onSubmit: z.object({ body: commentBodySchema }) },
        onSubmit: async ({ value }) => {
            await add.mutateAsync(value.body);
        },
    });

    return (
        <section aria-labelledby='comments-heading' className='mt-14 border-t pt-8'>
            <h2 className='text-2xl font-semibold tracking-tight' id='comments-heading'>
                Comments{comments.length > 0 ? ` (${comments.length})` : ''}
            </h2>

            {comments.length === 0 ? (
                <p className='text-muted-foreground mt-2'>
                    No comments yet. Tried it? Say how it went.
                </p>
            ) : (
                <ul className='mt-4 divide-y'>
                    {comments.map(comment => {
                        const canDelete =
                            viewer !== null &&
                            (viewer.id === comment.author.id || viewer.role === 'admin');
                        return (
                            <li className='flex gap-3 py-4' key={comment.id}>
                                <Avatar className='mt-0.5 size-8'>
                                    {comment.author.image ? (
                                        <AvatarImage alt='' src={comment.author.image} />
                                    ) : null}
                                    <AvatarFallback className='text-xs'>
                                        {initials(comment.author.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className='min-w-0 flex-1'>
                                    <p className='flex flex-wrap items-center gap-x-2 text-sm'>
                                        <span className='font-medium'>{comment.author.name}</span>
                                        {comment.author.role === 'admin' ? (
                                            <Badge variant='secondary'>Author</Badge>
                                        ) : null}
                                        <span className='text-muted-foreground'>
                                            {formatDate(comment.createdAt)}
                                        </span>
                                    </p>
                                    <p className='mt-1 whitespace-pre-line'>{comment.body}</p>
                                </div>
                                {canDelete ? (
                                    <Button
                                        aria-label='Delete comment'
                                        disabled={remove.isPending}
                                        onClick={() => remove.mutate(comment.id)}
                                        size='icon-sm'
                                        variant='ghost'>
                                        <Trash2Icon />
                                    </Button>
                                ) : null}
                            </li>
                        );
                    })}
                </ul>
            )}

            {viewer ? (
                <form
                    className='mt-6'
                    noValidate
                    onSubmit={event => {
                        event.preventDefault();
                        void form.handleSubmit();
                    }}>
                    <form.Field name='body'>
                        {field => (
                            <Field data-invalid={field.state.meta.errors.length > 0}>
                                <FieldLabel htmlFor='comment-body'>Add a comment</FieldLabel>
                                <Textarea
                                    aria-invalid={field.state.meta.errors.length > 0}
                                    id='comment-body'
                                    name={field.name}
                                    onBlur={field.handleBlur}
                                    onChange={event => field.handleChange(event.target.value)}
                                    placeholder='Did it work for you? Any tweaks?'
                                    rows={3}
                                    value={field.state.value}
                                />
                                <FieldDescription>
                                    Be kind and specific. Comments are public and show your name.
                                </FieldDescription>
                                <FieldError
                                    errors={field.state.meta.errors.map(error =>
                                        typeof error === 'string'
                                            ? { message: error }
                                            : (error as { message?: string })
                                    )}
                                />
                            </Field>
                        )}
                    </form.Field>
                    <form.Subscribe selector={state => state.isSubmitting}>
                        {isSubmitting => (
                            <Button className='mt-3' disabled={isSubmitting} type='submit'>
                                {isSubmitting ? 'Posting…' : 'Post comment'}
                            </Button>
                        )}
                    </form.Subscribe>
                </form>
            ) : (
                <p className='text-muted-foreground mt-6 text-sm'>
                    <Link
                        className='text-foreground underline underline-offset-4'
                        search={{ redirect: location.href }}
                        to='/sign-in'>
                        Sign in
                    </Link>{' '}
                    to like this entry or leave a comment.
                </p>
            )}
        </section>
    );
}
