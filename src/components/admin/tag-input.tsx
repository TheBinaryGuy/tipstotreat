import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { XIcon } from 'lucide-react';
import { useState } from 'react';

/** Chips plus a text box. Enter or comma adds a tag; Backspace on an empty box removes the last. */
export function TagInput({
    id,
    value,
    onChange,
    onBlur,
    placeholder,
    className,
}: {
    id?: string;
    value: string[];
    onChange: (tags: string[]) => void;
    onBlur?: () => void;
    placeholder?: string;
    className?: string;
}) {
    const [draft, setDraft] = useState('');

    function commit(raw: string) {
        const next = raw
            .split(',')
            .map(tag => tag.trim().toLowerCase())
            .filter(tag => tag && !value.includes(tag));
        if (next.length > 0) onChange([...value, ...next]);
        setDraft('');
    }

    return (
        <div
            className={cn(
                'border-input focus-within:border-ring focus-within:ring-ring/50 flex min-h-8 w-full flex-wrap items-center gap-1.5 rounded-lg border px-2 py-1 transition-colors focus-within:ring-3 dark:bg-input/30',
                className
            )}>
            {value.map(tag => (
                <Badge key={tag} variant='secondary'>
                    {tag}
                    <button
                        aria-label={`Remove ${tag}`}
                        className='hover:text-foreground -mr-0.5 grid place-items-center rounded-full opacity-70 hover:opacity-100'
                        onClick={() => onChange(value.filter(item => item !== tag))}
                        type='button'>
                        <XIcon className='size-3' />
                    </button>
                </Badge>
            ))}
            <input
                className='placeholder:text-muted-foreground min-w-24 flex-1 bg-transparent py-0.5 text-sm outline-none'
                id={id}
                onBlur={() => {
                    if (draft.trim()) commit(draft);
                    onBlur?.();
                }}
                onChange={event => {
                    if (event.target.value.includes(',')) commit(event.target.value);
                    else setDraft(event.target.value);
                }}
                onKeyDown={event => {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        commit(draft);
                    } else if (event.key === 'Backspace' && draft === '' && value.length > 0) {
                        onChange(value.slice(0, -1));
                    }
                }}
                placeholder={value.length === 0 ? placeholder : undefined}
                value={draft}
            />
        </div>
    );
}
