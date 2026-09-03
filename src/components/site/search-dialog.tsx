import { Button } from '@/components/ui/button';
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { KindMark } from '@/components/site/entry-parts';
import { searchQuery } from '@/features/entries/shared/queries';
import { kindMeta } from '@/lib/format';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { ArrowRightIcon, SearchIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

function useDebounced<T>(value: T, ms: number) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const timer = window.setTimeout(() => setDebounced(value), ms);
        return () => window.clearTimeout(timer);
    }, [value, ms]);
    return debounced;
}

/** Search as a command palette: the header icon or Cmd/Ctrl+K opens it, results appear as you type. */
export function SearchDialog() {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState('');
    const q = useDebounced(value.trim(), 200);
    const results = useQuery({ ...searchQuery(q), enabled: q.length > 0, staleTime: 60_000 });

    useEffect(() => {
        function onKey(event: KeyboardEvent) {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                setOpen(current => !current);
            }
        }
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    function go(to: () => Promise<void>) {
        setOpen(false);
        setValue('');
        void to();
    }

    return (
        <>
            <Button
                aria-label='Search'
                onClick={() => setOpen(true)}
                size='icon'
                title='Search (⌘K)'
                type='button'
                variant='outline'>
                <SearchIcon />
            </Button>
            <CommandDialog
                description='Search remedies, tips and recipes'
                onOpenChange={setOpen}
                open={open}
                title='Search'>
                <Command shouldFilter={false}>
                    <CommandInput
                        onValueChange={setValue}
                        placeholder='A complaint, an ingredient, or a dish…'
                        value={value}
                    />
                    <CommandList>
                        {q.length === 0 ? (
                            <CommandEmpty>Try “cough”, “ajwain”, or “khichdi”.</CommandEmpty>
                        ) : results.isPending ? (
                            <CommandEmpty>Searching…</CommandEmpty>
                        ) : results.data && results.data.length > 0 ? (
                            <>
                                <CommandGroup heading='Entries'>
                                    {results.data.slice(0, 8).map(entry => (
                                        <CommandItem
                                            key={entry.id}
                                            onSelect={() =>
                                                go(() =>
                                                    navigate({
                                                        to: '/$kind/$slug',
                                                        params: {
                                                            kind: kindMeta[entry.kind].path,
                                                            slug: entry.slug,
                                                        },
                                                    })
                                                )
                                            }
                                            value={entry.id}>
                                            <KindMark
                                                className='size-7 rounded-md [&_svg]:size-3.5'
                                                kind={entry.kind}
                                            />
                                            <span className='min-w-0 flex-1'>
                                                <span className='block truncate font-medium'>
                                                    {entry.title}
                                                </span>
                                                {entry.useFor ? (
                                                    <span className='text-muted-foreground block truncate text-xs'>
                                                        {kindMeta[entry.kind].lead}{' '}
                                                        {entry.useFor.toLowerCase()}
                                                    </span>
                                                ) : null}
                                            </span>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                                <CommandGroup>
                                    <CommandItem
                                        onSelect={() =>
                                            go(() => navigate({ to: '/search', search: { q } }))
                                        }
                                        value='__all'>
                                        <ArrowRightIcon /> See all results for “{q}”
                                    </CommandItem>
                                </CommandGroup>
                            </>
                        ) : (
                            <CommandEmpty>Nothing matched “{q}”.</CommandEmpty>
                        )}
                    </CommandList>
                </Command>
            </CommandDialog>
        </>
    );
}
