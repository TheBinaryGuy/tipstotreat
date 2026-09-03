import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import type { Liker } from '@/features/social/server/social.server';
import { formatDate } from '@/lib/format';
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
    /** Present only for the author: who liked this, newest first. */
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

    const button = (
        <Button
            aria-pressed={liked}
            disabled={toggle.isPending}
            onClick={() => toggle.mutate()}
            variant={liked ? 'secondary' : 'outline'}>
            <HeartIcon
                className={cn(liked && 'fill-destructive text-destructive')}
                data-icon='inline-start'
            />
            {label}
        </Button>
    );
    if (!likers) return button;

    // Authors see who liked the entry on hover; readers never see counts.
    return (
        <HoverCard>
            <HoverCardTrigger render={button} />
            <HoverCardContent align='start' className='w-64 p-3'>
                <LikersList likers={likers} />
            </HoverCardContent>
        </HoverCard>
    );
}

export function LikersList({ likers }: { likers: Liker[] }) {
    if (likers.length === 0) return <p className='text-muted-foreground text-sm'>No likes yet.</p>;
    return (
        <div className='text-sm'>
            <p className='font-medium'>
                {likers.length} {likers.length === 1 ? 'like' : 'likes'}
            </p>
            <ul className='mt-2 max-h-56 space-y-1.5 overflow-y-auto'>
                {likers.map(liker => (
                    <li className='flex items-center gap-2' key={liker.id}>
                        <Avatar className='size-5'>
                            {liker.image ? <AvatarImage alt='' src={liker.image} /> : null}
                            <AvatarFallback className='text-[10px]'>
                                {liker.name.slice(0, 1).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <span className='truncate'>{liker.name}</span>
                        <span className='text-muted-foreground ml-auto shrink-0 text-xs'>
                            {formatDate(liker.at)}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
