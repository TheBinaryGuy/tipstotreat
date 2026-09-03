import { Badge } from '@/components/ui/badge';
import type { Entry, EntryKind, Ingredient } from '@/lib/db/schema';
import { kindMeta, minutesLabel } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Link } from '@tanstack/react-router';
import { CookingPotIcon, LeafIcon, LightbulbIcon } from 'lucide-react';

export const kindIcon: Record<EntryKind, typeof LeafIcon> = {
    remedy: LeafIcon,
    tip: LightbulbIcon,
    recipe: CookingPotIcon,
};

export function KindMark({ kind, className }: { kind: EntryKind; className?: string }) {
    const Icon = kindIcon[kind];
    return (
        <span
            aria-hidden='true'
            className={cn(
                'bg-primary/10 text-primary grid size-9 shrink-0 place-items-center rounded-lg',
                className
            )}>
            <Icon className='size-4.5' />
        </span>
    );
}

export function IngredientList({
    ingredients,
    className,
}: {
    ingredients: Ingredient[];
    className?: string;
}) {
    if (ingredients.length === 0) return null;
    return (
        <ul className={cn('divide-y', className)}>
            {ingredients.map((item, index) => (
                <li className='flex justify-between gap-4 py-2' key={`${item.name}-${index}`}>
                    <span>{item.name}</span>
                    {item.quantity ? (
                        <span className='text-muted-foreground shrink-0 tabular-nums'>
                            {item.quantity}
                        </span>
                    ) : null}
                </li>
            ))}
        </ul>
    );
}

export function StepList({ steps, className }: { steps: string[]; className?: string }) {
    if (steps.length === 0) return null;
    return (
        <ol className={cn('space-y-4', className)}>
            {steps.map((step, index) => (
                <li className='flex gap-4' key={index}>
                    <span className='bg-primary/10 text-primary grid size-7 shrink-0 place-items-center rounded-full text-sm font-semibold tabular-nums'>
                        {index + 1}
                    </span>
                    <p className='pt-0.5'>{step}</p>
                </li>
            ))}
        </ol>
    );
}

export function metaLine(entry: Entry) {
    const time = minutesLabel(entry.prepMinutes, entry.cookMinutes);
    return [
        entry.useFor ? `${kindMeta[entry.kind].lead} ${entry.useFor.toLowerCase()}` : null,
        time || null,
        entry.servings ? `serves ${entry.servings}` : null,
    ]
        .filter(Boolean)
        .join(' · ');
}

/** One entry in a list: title, context line, summary, and the first few ingredients as chips. */
export function EntryRow({ entry, showKind = false }: { entry: Entry; showKind?: boolean }) {
    const meta = kindMeta[entry.kind];
    const line = metaLine(entry);
    const chips = entry.ingredients.slice(0, 4);
    return (
        <li>
            <Link
                className='group hover:bg-muted/60 -mx-3 flex gap-4 rounded-xl px-3 py-4 transition-colors'
                params={{ kind: meta.path, slug: entry.slug }}
                to='/$kind/$slug'>
                {showKind ? <KindMark className='mt-0.5' kind={entry.kind} /> : null}
                <div className='min-w-0 flex-1'>
                    <h3 className='text-lg font-medium tracking-tight group-hover:underline group-hover:underline-offset-4'>
                        {entry.title}
                    </h3>
                    {line ? <p className='text-muted-foreground mt-0.5 text-sm'>{line}</p> : null}
                    <p className='mt-1.5 max-w-prose'>{entry.summary}</p>
                    {chips.length > 0 ? (
                        <ul className='mt-2.5 flex flex-wrap gap-1.5' aria-label='Ingredients'>
                            {chips.map(item => (
                                <li key={item.name}>
                                    <Badge variant='outline'>{item.name}</Badge>
                                </li>
                            ))}
                            {entry.ingredients.length > chips.length ? (
                                <li>
                                    <Badge variant='ghost'>
                                        +{entry.ingredients.length - chips.length}
                                    </Badge>
                                </li>
                            ) : null}
                        </ul>
                    ) : null}
                </div>
            </Link>
        </li>
    );
}
