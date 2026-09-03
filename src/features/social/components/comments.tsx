import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LikePeek, type PeekHandlers } from '@/features/social/components/likes-peek';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import type { SessionUser } from '@/features/auth/shared/types';
import {
    addCommentServerFn,
    commentBodySchema,
    deleteCommentServerFn,
    toggleCommentLikeServerFn,
} from '@/features/social/server/social.functions';
import type { CommentView } from '@/features/social/server/social.server';
import { socialKeys } from '@/features/social/shared/queries';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useForm } from '@tanstack/react-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation } from '@tanstack/react-router';
import { HeartIcon, ReplyIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';
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

function issues(errors: unknown[]) {
    return errors.map(error =>
        typeof error === 'string' ? { message: error } : (error as { message?: string })
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
    const location = useLocation();
    const roots = comments.filter(comment => comment.parentId === null);
    const repliesFor = (id: string) => comments.filter(comment => comment.parentId === id);

    return (
        <section aria-labelledby='comments-heading' className='mt-14 border-t pt-8'>
            <h2 className='text-2xl font-semibold tracking-tight' id='comments-heading'>
                Comments{comments.length > 0 ? ` (${comments.length})` : ''}
            </h2>

            {roots.length === 0 ? (
                <p className='text-muted-foreground mt-2'>
                    No comments yet. Tried it? Say how it went.
                </p>
            ) : (
                <ul className='mt-4 divide-y'>
                    {roots.map(comment => (
                        <li className='py-4' key={comment.id}>
                            <CommentItem
                                comment={comment}
                                entryId={entryId}
                                slug={slug}
                                viewer={viewer}
                            />
                            {repliesFor(comment.id).length > 0 ? (
                                <ul className='mt-3 ml-11 space-y-3 border-l pl-4'>
                                    {repliesFor(comment.id).map(reply => (
                                        <li key={reply.id}>
                                            <CommentItem
                                                comment={reply}
                                                entryId={entryId}
                                                isReply
                                                slug={slug}
                                                viewer={viewer}
                                            />
                                        </li>
                                    ))}
                                </ul>
                            ) : null}
                        </li>
                    ))}
                </ul>
            )}

            {viewer ? (
                <CommentForm className='mt-6' entryId={entryId} slug={slug} />
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

function CommentItem({
    comment,
    entryId,
    slug,
    viewer,
    isReply = false,
}: {
    comment: CommentView;
    entryId: string;
    slug: string;
    viewer: SessionUser | null;
    isReply?: boolean;
}) {
    const queryClient = useQueryClient();
    const location = useLocation();
    const [replying, setReplying] = useState(false);
    const invalidate = () => queryClient.invalidateQueries({ queryKey: socialKeys.entry(slug) });

    const like = useMutation({
        mutationFn: () => toggleCommentLikeServerFn({ data: { commentId: comment.id } }),
        onSuccess: invalidate,
        onError: error => toast.error(error.message),
    });
    const remove = useMutation({
        mutationFn: () => deleteCommentServerFn({ data: { id: comment.id } }),
        onSuccess: invalidate,
        onError: error => toast.error(error.message),
    });

    const canDelete =
        viewer !== null && (viewer.id === comment.author.id || viewer.role === 'admin');

    return (
        <div className='flex gap-3'>
            <Avatar className={cn('mt-0.5', isReply ? 'size-7' : 'size-8')}>
                {comment.author.image ? <AvatarImage alt='' src={comment.author.image} /> : null}
                <AvatarFallback className='text-xs'>{initials(comment.author.name)}</AvatarFallback>
            </Avatar>
            <div className='min-w-0 flex-1'>
                <p className='flex flex-wrap items-center gap-x-2 text-sm'>
                    <span className='font-medium'>{comment.author.name}</span>
                    {comment.author.role === 'admin' ? (
                        <Badge variant='secondary'>Author</Badge>
                    ) : null}
                    <span className='text-muted-foreground'>{formatDate(comment.createdAt)}</span>
                </p>
                <p className='mt-1 whitespace-pre-line'>{comment.body}</p>
                <div className='mt-1.5 -ml-2 flex items-center gap-1'>
                    {viewer ? (
                        <CommentLikeButton
                            comment={comment}
                            onToggle={() => like.mutate()}
                            pending={like.isPending}
                        />
                    ) : (
                        <Button
                            render={<Link search={{ redirect: location.href }} to='/sign-in' />}
                            size='sm'
                            title='Sign in to like'
                            variant='ghost'>
                            <HeartIcon data-icon='inline-start' /> Like
                        </Button>
                    )}
                    {viewer ? (
                        <Button
                            onClick={() => setReplying(open => !open)}
                            size='sm'
                            variant='ghost'>
                            <ReplyIcon data-icon='inline-start' /> Reply
                        </Button>
                    ) : null}
                    {canDelete ? (
                        <Button
                            aria-label='Delete comment'
                            disabled={remove.isPending}
                            onClick={() => remove.mutate()}
                            size='icon-sm'
                            variant='ghost'>
                            <Trash2Icon />
                        </Button>
                    ) : null}
                </div>
                {replying ? (
                    <CommentForm
                        autoFocus
                        className='mt-3'
                        entryId={entryId}
                        onDone={() => setReplying(false)}
                        parentId={comment.parentId ?? comment.id}
                        replyingTo={comment.author.name}
                        slug={slug}
                    />
                ) : null}
            </div>
        </div>
    );
}

function CommentForm({
    entryId,
    slug,
    parentId = null,
    replyingTo,
    autoFocus = false,
    onDone,
    className,
}: {
    entryId: string;
    slug: string;
    parentId?: string | null;
    replyingTo?: string;
    autoFocus?: boolean;
    onDone?: () => void;
    className?: string;
}) {
    const queryClient = useQueryClient();
    const add = useMutation({
        mutationFn: (body: string) => addCommentServerFn({ data: { entryId, body, parentId } }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: socialKeys.entry(slug) });
            form.reset();
            onDone?.();
        },
        onError: error => toast.error(error.message),
    });
    const form = useForm({
        defaultValues: { body: '' },
        validators: { onSubmit: z.object({ body: commentBodySchema }) },
        onSubmit: async ({ value }) => {
            await add.mutateAsync(value.body);
        },
    });
    const fieldId = parentId ? `reply-${parentId}` : 'comment-body';

    return (
        <form
            className={className}
            noValidate
            onSubmit={event => {
                event.preventDefault();
                void form.handleSubmit();
            }}>
            <form.Field name='body'>
                {field => (
                    <Field data-invalid={field.state.meta.errors.length > 0}>
                        <FieldLabel htmlFor={fieldId}>
                            {replyingTo ? `Reply to ${replyingTo}` : 'Add a comment'}
                        </FieldLabel>
                        <Textarea
                            aria-invalid={field.state.meta.errors.length > 0}
                            autoFocus={autoFocus}
                            id={fieldId}
                            name={field.name}
                            onBlur={field.handleBlur}
                            onChange={event => field.handleChange(event.target.value)}
                            placeholder={
                                replyingTo ? 'Write a reply' : 'Did it work for you? Any tweaks?'
                            }
                            rows={replyingTo ? 2 : 3}
                            value={field.state.value}
                        />
                        {!replyingTo ? (
                            <FieldDescription>
                                Be kind and specific. Comments are public and show your name.
                            </FieldDescription>
                        ) : null}
                        <FieldError errors={issues(field.state.meta.errors)} />
                    </Field>
                )}
            </form.Field>
            <div className='mt-3 flex gap-2'>
                <form.Subscribe selector={state => state.isSubmitting}>
                    {isSubmitting => (
                        <Button
                            disabled={isSubmitting}
                            size={replyingTo ? 'sm' : 'default'}
                            type='submit'>
                            {isSubmitting ? 'Posting…' : replyingTo ? 'Post reply' : 'Post comment'}
                        </Button>
                    )}
                </form.Subscribe>
                {onDone ? (
                    <Button onClick={onDone} size='sm' type='button' variant='ghost'>
                        Cancel
                    </Button>
                ) : null}
            </div>
        </form>
    );
}

/** Readers see Like/Liked; the author also gets who liked it on hover or long-press. */
function CommentLikeButton({
    comment,
    onToggle,
    pending,
}: {
    comment: CommentView;
    onToggle: () => void;
    pending: boolean;
}) {
    const button = (peek?: PeekHandlers) => (
        <Button
            aria-pressed={comment.liked}
            className={cn(comment.liked && 'text-destructive')}
            disabled={pending}
            onClick={peek ? peek.guardClick(onToggle) : onToggle}
            onContextMenu={peek?.onContextMenu}
            onPointerCancel={peek?.onPointerCancel}
            onPointerDown={peek?.onPointerDown}
            onPointerEnter={peek?.onPointerEnter}
            onPointerLeave={peek?.onPointerLeave}
            onPointerUp={peek?.onPointerUp}
            ref={peek?.ref}
            size='sm'
            variant='ghost'>
            <HeartIcon className={cn(comment.liked && 'fill-current')} data-icon='inline-start' />
            {comment.liked ? 'Liked' : 'Like'}
        </Button>
    );
    if (!comment.likers) return button();
    return <LikePeek names={comment.likers}>{button}</LikePeek>;
}
