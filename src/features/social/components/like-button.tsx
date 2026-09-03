import { Button } from '@/components/ui/button';
import { LikePeek, type PeekHandlers } from '@/features/social/components/likes-peek';
import type { Liker } from '@/features/social/server/social.server';
import { toggleLikeServerFn } from '@/features/social/server/social.functions';
import { socialKeys } from '@/features/social/shared/queries';
import { cn } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation } from '@tanstack/react-router';
import { HeartIcon } from 'lucide-react';

export function LikeButton({
    entryId,
    slug,
    liked,
    signedIn,
    likers,
}: {
    entryId: string;
    slug: string;
    liked: boolean;
    signedIn: boolean;
    /** Authors only: who liked this, revealed on hover or long-press. */
    likers?: Liker[];
}) {
    const queryClient = useQueryClient();
    const location = useLocation();
    const toggle = useMutation({
        mutationFn: () => toggleLikeServerFn({ data: { entryId } }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: socialKeys.entry(slug) }),
    });

    const label = liked ? 'Liked' : 'Like';

    if (!signedIn) {
        return (
            <Button
                render={<Link search={{ redirect: location.href }} to='/sign-in' />}
                title='Sign in to like this'
                variant='outline'>
                <HeartIcon data-icon='inline-start' /> {label}
            </Button>
        );
    }

    const button = (peek?: PeekHandlers) => (
        <Button
            aria-pressed={liked}
            disabled={toggle.isPending}
            onClick={peek ? peek.guardClick(() => toggle.mutate()) : () => toggle.mutate()}
            onContextMenu={peek?.onContextMenu}
            onPointerCancel={peek?.onPointerCancel}
            onPointerDown={peek?.onPointerDown}
            onPointerEnter={peek?.onPointerEnter}
            onPointerLeave={peek?.onPointerLeave}
            onPointerUp={peek?.onPointerUp}
            ref={peek?.ref}
            variant={liked ? 'secondary' : 'outline'}>
            <HeartIcon
                className={cn(liked && 'fill-destructive text-destructive')}
                data-icon='inline-start'
            />
            {label}
        </Button>
    );
    if (!likers) return button();
    return <LikePeek likers={likers}>{button}</LikePeek>;
}
