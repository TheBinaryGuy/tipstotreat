import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { Liker } from '@/features/social/server/social.server';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { HeartIcon } from 'lucide-react';
import { type ReactNode, useCallback, useRef, useState } from 'react';

type Props = {
    /** Full liker records (entries). */
    likers?: Liker[];
    /** Names only (comments). */
    names?: string[];
    align?: 'start' | 'end';
    className?: string;
};

/**
 * Author-only peek at who liked something. Opens on hover with a mouse and on tap on touch
 * screens, so it works on a phone where there is no hover.
 */
export function LikesPeek({ likers, names, align = 'start', className }: Props) {
    const [open, setOpen] = useState(false);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const openedByHover = useRef(false);
    const count = likers?.length ?? names?.length ?? 0;

    const cancelClose = () => {
        if (closeTimer.current) clearTimeout(closeTimer.current);
        closeTimer.current = null;
    };
    const hoverOpen = (event: React.PointerEvent) => {
        if (event.pointerType !== 'mouse') return;
        cancelClose();
        openedByHover.current = true;
        setOpen(true);
    };
    const hoverClose = (event: React.PointerEvent) => {
        if (event.pointerType !== 'mouse') return;
        cancelClose();
        closeTimer.current = setTimeout(() => {
            openedByHover.current = false;
            setOpen(false);
        }, 150);
    };

    return (
        <Popover
            onOpenChange={(next, details) => {
                // A click while the card is already open from hovering should keep it open.
                if (!next && details.reason === 'trigger-press' && openedByHover.current) return;
                openedByHover.current = false;
                setOpen(next);
            }}
            open={open}>
            <PopoverTrigger
                aria-label={`${count} ${count === 1 ? 'like' : 'likes'}`}
                className={cn(
                    'text-muted-foreground hover:text-foreground inline-flex h-8 items-center gap-1 rounded-md px-2 text-sm tabular-nums transition-colors',
                    className
                )}
                onPointerEnter={hoverOpen}
                onPointerLeave={hoverClose}
                type='button'>
                <HeartIcon className='size-3.5' />
                {count}
            </PopoverTrigger>
            <PopoverContent
                align={align}
                className='w-64 p-3'
                onPointerEnter={cancelClose}
                onPointerLeave={hoverClose}>
                {likers ? <LikersList likers={likers} /> : <NamesList names={names ?? []} />}
            </PopoverContent>
        </Popover>
    );
}

export type PeekHandlers = {
    ref: (node: HTMLElement | null) => void;
    onPointerEnter: (event: React.PointerEvent) => void;
    onPointerLeave: (event: React.PointerEvent) => void;
    onPointerDown: (event: React.PointerEvent) => void;
    onPointerUp: (event: React.PointerEvent) => void;
    onPointerCancel: (event: React.PointerEvent) => void;
    onContextMenu: (event: React.MouseEvent) => void;
    /** Wrap the button's click handler: a click that ended a long-press is swallowed. */
    guardClick: (handler: () => void) => () => void;
};

const LONG_PRESS_MS = 450;

/**
 * Attaches "who liked this" to an existing button without adding a chip or a number: hover with a
 * mouse, long-press on touch. A plain tap still reaches the button's own click handler.
 */
export function LikePeek({
    likers,
    names,
    children,
}: {
    likers?: Liker[];
    names?: string[];
    children: (peek: PeekHandlers) => ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const longPressed = useRef(false);

    const cancelClose = () => {
        if (closeTimer.current) clearTimeout(closeTimer.current);
        closeTimer.current = null;
    };
    const cancelPress = () => {
        if (pressTimer.current) clearTimeout(pressTimer.current);
        pressTimer.current = null;
    };
    const scheduleClose = () => {
        cancelClose();
        closeTimer.current = setTimeout(() => setOpen(false), 150);
    };

    const ref = useCallback((node: HTMLElement | null) => setAnchor(node), []);
    const peek: PeekHandlers = {
        ref,
        onPointerEnter: event => {
            if (event.pointerType !== 'mouse') return;
            cancelClose();
            setOpen(true);
        },
        onPointerLeave: event => {
            cancelPress();
            if (event.pointerType !== 'mouse') return;
            scheduleClose();
        },
        onPointerDown: event => {
            if (event.pointerType === 'mouse') return;
            cancelPress();
            longPressed.current = false;
            pressTimer.current = setTimeout(() => {
                longPressed.current = true;
                setOpen(true);
            }, LONG_PRESS_MS);
        },
        onPointerUp: cancelPress,
        onPointerCancel: cancelPress,
        // The browser's long-press context menu would fight the peek on phones.
        onContextMenu: event => {
            if (open || pressTimer.current) event.preventDefault();
        },
        guardClick: handler => () => {
            if (longPressed.current) {
                longPressed.current = false;
                return;
            }
            handler();
        },
    };

    return (
        <>
            {children(peek)}
            <Popover
                onOpenChange={(next, details) => {
                    // The tap that ends a long-press lands on the anchor button; it is not "outside".
                    if (
                        !next &&
                        details.reason === 'outside-press' &&
                        anchor?.contains(details.event.target as Node)
                    )
                        return;
                    setOpen(next);
                }}
                open={open}>
                <PopoverContent
                    align='start'
                    anchor={anchor}
                    className='w-64 p-3'
                    onPointerEnter={cancelClose}
                    onPointerLeave={event => {
                        if (event.pointerType === 'mouse') scheduleClose();
                    }}>
                    {likers ? <LikersList likers={likers} /> : <NamesList names={names ?? []} />}
                </PopoverContent>
            </Popover>
        </>
    );
}

function Heading({ count }: { count: number }) {
    return (
        <p className='font-medium'>
            {count} {count === 1 ? 'like' : 'likes'}
        </p>
    );
}

export function LikersList({ likers }: { likers: Liker[] }) {
    if (likers.length === 0) return <p className='text-muted-foreground text-sm'>No likes yet.</p>;
    return (
        <div className='text-sm'>
            <Heading count={likers.length} />
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

function NamesList({ names }: { names: string[] }) {
    if (names.length === 0) return <p className='text-muted-foreground text-sm'>No likes yet.</p>;
    return (
        <div className='text-sm'>
            <Heading count={names.length} />
            <ul className='mt-2 max-h-56 space-y-1 overflow-y-auto'>
                {names.map((name, index) => (
                    <li className='truncate' key={`${name}-${index}`}>
                        {name}
                    </li>
                ))}
            </ul>
        </div>
    );
}
