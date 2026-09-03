import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNavigate } from '@tanstack/react-router';
import { SearchIcon, XIcon } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useId, useRef, useState } from 'react';

const COLLAPSED = 36;
const EXPANDED = 240;

/** A search icon that expands into a text field. Collapses again when it loses focus while empty. */
export function ExpandingSearch({ className }: { className?: string }) {
    const navigate = useNavigate();
    const reduceMotion = useReducedMotion();
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const id = useId();

    useEffect(() => {
        if (open) inputRef.current?.focus();
    }, [open]);

    function submit() {
        const q = value.trim();
        if (!q) return;
        setOpen(false);
        void navigate({ to: '/search', search: { q } });
    }

    const transition = reduceMotion
        ? { duration: 0 }
        : { type: 'spring' as const, stiffness: 420, damping: 34, mass: 0.7 };

    return (
        <motion.form
            animate={{ width: open ? EXPANDED : COLLAPSED }}
            className={cn(
                'bg-background relative flex h-9 items-center overflow-hidden rounded-lg border',
                open ? 'border-input' : 'border-transparent',
                className
            )}
            initial={false}
            onSubmit={event => {
                event.preventDefault();
                submit();
            }}
            role='search'
            style={{ width: COLLAPSED }}
            transition={transition}>
            <Button
                aria-controls={id}
                aria-expanded={open}
                aria-label={open ? 'Search' : 'Open search'}
                className='absolute top-0 left-0 shrink-0'
                onClick={() => {
                    if (open) submit();
                    else setOpen(true);
                }}
                size='icon'
                type='button'
                variant={open ? 'ghost' : 'outline'}>
                <SearchIcon />
            </Button>
            <AnimatePresence initial={false}>
                {open ? (
                    <motion.input
                        animate={{ opacity: 1 }}
                        aria-label='Search remedies, tips and recipes'
                        autoComplete='off'
                        className='placeholder:text-muted-foreground h-full min-w-0 flex-1 bg-transparent pr-9 pl-10 text-sm outline-none'
                        exit={{ opacity: 0 }}
                        id={id}
                        initial={{ opacity: 0 }}
                        name='q'
                        onBlur={() => {
                            if (!value.trim()) setOpen(false);
                        }}
                        onChange={event => setValue(event.target.value)}
                        onKeyDown={event => {
                            if (event.key === 'Escape') {
                                setValue('');
                                setOpen(false);
                            }
                        }}
                        placeholder='Search'
                        ref={inputRef}
                        transition={reduceMotion ? { duration: 0 } : { duration: 0.15 }}
                        type='search'
                        value={value}
                    />
                ) : null}
            </AnimatePresence>
            {open ? (
                <Button
                    aria-label='Close search'
                    className='absolute top-0 right-0'
                    onClick={() => {
                        setValue('');
                        setOpen(false);
                    }}
                    size='icon'
                    type='button'
                    variant='ghost'>
                    <XIcon />
                </Button>
            ) : null}
        </motion.form>
    );
}
