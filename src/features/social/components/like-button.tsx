import { Button } from '@/components/ui/button';
import { toggleLikeServerFn } from '@/features/social/server/social.functions';
import { socialKeys } from '@/features/social/shared/queries';
import { cn } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation } from '@tanstack/react-router';
import { HeartIcon } from 'lucide-react';

export function LikeButton({
    entryId,
    slug,
    count,
    liked,
    signedIn,
}: {
    entryId: string;
    slug: string;
    count: number;
    liked: boolean;
    signedIn: boolean;
}) {
    const queryClient = useQueryClient();
    const location = useLocation();
    const toggle = useMutation({
        mutationFn: () => toggleLikeServerFn({ data: { entryId } }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: socialKeys.entry(slug) }),
    });

    const label = `${count} ${count === 1 ? 'like' : 'likes'}`;

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

    return (
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
}
