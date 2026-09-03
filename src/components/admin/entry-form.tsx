import { BodyEditor } from '@/components/admin/body-editor';
import { AiAssist } from '@/features/ai/components/ai-assist';
import { CoverImageField } from '@/features/ai/components/cover-image';
import type { AiDraft } from '@/features/ai/shared/schema';
import { TagInput } from '@/components/admin/tag-input';
import { adminSlugAvailableServerFn } from '@/features/entries/server/entries.functions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSet,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { EntryInput } from '@/features/entries/shared/schema';
import { ENTRY_KINDS, type Entry, type EntryStatus } from '@/lib/db/schema';
import { kindMeta, slugify } from '@/lib/format';
import { useForm, useStore } from '@tanstack/react-form';
import { cn } from '@/lib/utils';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { z } from 'zod';

const minutes = z.string().trim().regex(/^\d*$/, 'Whole minutes only').max(4);

const slugSchema = z
    .string()
    .trim()
    .min(2, 'The address needs at least two characters')
    .max(160, 'Keep the address under 160 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Lowercase letters, numbers and hyphens only');

export const entryFormSchema = z
    .object({
        kind: z.enum(ENTRY_KINDS),
        title: z
            .string()
            .trim()
            .min(2, 'Give it a title')
            .max(140, 'Keep the title under 140 characters'),
        slug: slugSchema,
        useFor: z.string().trim().max(160, 'Keep this under 160 characters'),
        summary: z
            .string()
            .trim()
            .min(10, 'Write a one or two line summary')
            .max(400, 'Keep the summary under 400 characters'),
        ingredients: z.array(
            z.object({
                name: z.string().trim().max(80),
                quantity: z.string().trim().max(40),
            })
        ),
        stepsText: z.string(),
        body: z.string().max(50_000, 'Notes are too long'),
        caution: z.string().trim().max(600, 'Keep the caution under 600 characters'),
        tags: z.array(z.string().trim().min(1).max(40)).max(20, 'Twenty tags is plenty'),
        prepMinutes: minutes,
        cookMinutes: minutes,
        servings: z.string().trim().max(40),
        coverImage: z.string().nullable(),
    })
    .superRefine((values, ctx) => {
        const ingredients = values.ingredients.filter(item => item.name.trim());
        const steps = values.stepsText.split('\n').filter(line => line.trim());
        if (values.kind === 'recipe') {
            if (ingredients.length === 0)
                ctx.addIssue({
                    code: 'custom',
                    path: ['ingredients'],
                    message: 'A recipe needs its ingredients',
                });
            if (steps.length === 0)
                ctx.addIssue({
                    code: 'custom',
                    path: ['stepsText'],
                    message: 'A recipe needs its method',
                });
        }
        if (values.kind === 'remedy') {
            if (steps.length === 0)
                ctx.addIssue({
                    code: 'custom',
                    path: ['stepsText'],
                    message: 'Say what to do, step by step',
                });
            if (!values.caution.trim())
                ctx.addIssue({
                    code: 'custom',
                    path: ['caution'],
                    message: 'Say when to see a doctor',
                });
        }
        if (values.kind === 'article' && values.body.trim().length < 200) {
            ctx.addIssue({
                code: 'custom',
                path: ['body'],
                message: 'An article needs a bit more than that',
            });
        }
    });

export type EntryFormValues = z.infer<typeof entryFormSchema>;

const kindItems = ENTRY_KINDS.map(value => ({ value, label: kindMeta[value].label }));

/** What each kind asks for, in the author's words. */
const kindForm = {
    remedy: {
        useFor: {
            label: 'What it treats',
            hint: 'The complaint, e.g. "Dry cough, scratchy throat". Shown under the title.',
        },
        ingredients: 'What you need',
        steps: { label: 'Method', hint: 'One step per line, in order.' },
        body: {
            label: 'Notes',
            hint: 'Why it works, what you have learnt, notes for children or elders.',
        },
        summary: 'One or two lines: what it is and what to expect.',
        caution: true,
        timings: false,
    },
    tip: {
        useFor: { label: 'Helps with', hint: 'e.g. "Digestion, joint stiffness".' },
        ingredients: 'What you need (if anything)',
        steps: { label: 'How to do it', hint: 'One step per line.' },
        body: { label: 'Notes', hint: 'Why it is worth doing and how to keep it up.' },
        summary: 'One or two lines: the habit and why.',
        caution: true,
        timings: false,
    },
    recipe: {
        useFor: { label: 'Good for', hint: 'The occasion, e.g. "Sick days, light dinners".' },
        ingredients: 'Ingredients',
        steps: { label: 'Method', hint: 'One step per line, in cooking order.' },
        body: { label: 'Notes', hint: 'Variations, serving ideas, what to watch for.' },
        summary: 'One or two lines: the dish and what makes your version yours.',
        caution: false,
        timings: true,
    },
    article: {
        useFor: { label: 'About', hint: 'The topic in a few words, e.g. "Monsoon eating".' },
        ingredients: '',
        steps: { label: '', hint: '' },
        body: {
            label: 'Article',
            hint: 'The full piece. Use headings to break it up; add images from the toolbar.',
        },
        summary: 'A standfirst: one or two lines that make someone want to read on.',
        caution: false,
        timings: false,
    },
} as const;

const fieldNames: Record<string, string> = {
    title: 'Title',
    slug: 'Address',
    useFor: 'What it is for',
    summary: 'Summary',
    ingredients: 'Ingredients',
    stepsText: 'Method',
    caution: 'Caution',
    prepMinutes: 'Prep minutes',
    cookMinutes: 'Cook minutes',
    servings: 'Serves',
};

function toValues(entry?: Entry): EntryFormValues {
    return {
        kind: entry?.kind ?? 'remedy',
        title: entry?.title ?? '',
        slug: entry?.slug ?? '',
        useFor: entry?.useFor ?? '',
        summary: entry?.summary ?? '',
        ingredients: (entry?.ingredients ?? []).map(item => ({
            name: item.name,
            quantity: item.quantity ?? '',
        })),
        stepsText: entry?.steps.join('\n') ?? '',
        body: entry?.body ?? '',
        caution: entry?.caution ?? '',
        tags: entry?.tags ?? [],
        prepMinutes: entry?.prepMinutes?.toString() ?? '',
        cookMinutes: entry?.cookMinutes?.toString() ?? '',
        servings: entry?.servings ?? '',
        coverImage: entry?.coverImage ?? null,
    };
}

function toInput(values: EntryFormValues, status: EntryStatus): EntryInput {
    const isRecipe = values.kind === 'recipe';
    return {
        kind: values.kind,
        status,
        title: values.title,
        slug: values.slug,
        useFor: values.useFor || undefined,
        summary: values.summary,
        body: values.body,
        ingredients: values.ingredients
            .filter(item => item.name.trim())
            .map(item => ({ name: item.name.trim(), quantity: item.quantity.trim() || undefined })),
        steps: values.stepsText
            .split('\n')
            .map(line => line.replace(/^\s*\d+[.)]\s*/, '').trim())
            .filter(Boolean),
        tags: [...new Set(values.tags.map(tag => tag.trim().toLowerCase()).filter(Boolean))],
        caution: isRecipe ? undefined : values.caution || undefined,
        prepMinutes: isRecipe && values.prepMinutes ? Number(values.prepMinutes) : null,
        cookMinutes: isRecipe && values.cookMinutes ? Number(values.cookMinutes) : null,
        servings: isRecipe ? values.servings || undefined : undefined,
        coverImage: values.coverImage,
    };
}

type Issue = { message?: string };
function issues(errors: unknown[]): Issue[] {
    return errors.map(error => (typeof error === 'string' ? { message: error } : (error as Issue)));
}

export function EntryForm({
    entry,
    pending,
    error,
    onSubmit,
    onDelete,
}: {
    entry?: Entry;
    pending: boolean;
    error?: string | null;
    onSubmit: (input: EntryInput) => void;
    onDelete?: () => void;
}) {
    const [slugTouched, setSlugTouched] = useState(Boolean(entry));
    const [editorKey, setEditorKey] = useState(0);

    const form = useForm({
        defaultValues: toValues(entry),
        validators: { onSubmit: entryFormSchema },
        onSubmitMeta: { status: (entry?.status ?? 'draft') as EntryStatus },
        onSubmit: ({ value, meta }) =>
            onSubmit(toInput(value, meta?.status ?? entry?.status ?? 'draft')),
    });

    const isDirty = useStore(form.store, state => state.isDirty);
    const attempted = useStore(form.store, state => state.submissionAttempts > 0);
    const kind = useStore(form.store, state => state.values.kind);
    const invalidFields = useStore(form.store, state =>
        Object.entries(state.fieldMeta)
            .filter(([, meta]) => (meta?.errors.length ?? 0) > 0)
            .map(([name]) => fieldNames[name.split(/[.[]/)[0] ?? name] ?? name)
    );
    const uniqueInvalid = [...new Set(invalidFields)];

    useEffect(() => {
        if (!isDirty || pending) return;
        const warn = (event: BeforeUnloadEvent) => {
            event.preventDefault();
        };
        window.addEventListener('beforeunload', warn);
        return () => window.removeEventListener('beforeunload', warn);
    }, [isDirty, pending]);

    const meta = kindMeta[kind];
    const isRecipe = kind === 'recipe';
    const isArticle = kind === 'article';
    const copy = kindForm[kind];
    const title = useStore(form.store, state => state.values.title);
    const ingredientNames = useStore(form.store, state =>
        state.values.ingredients.map(item => item.name).filter(Boolean)
    );

    function applyDraft(draft: AiDraft) {
        form.setFieldValue('kind', draft.kind);
        form.setFieldValue('title', draft.title);
        if (!slugTouched) form.setFieldValue('slug', slugify(draft.title));
        form.setFieldValue('useFor', draft.useFor);
        form.setFieldValue('summary', draft.summary);
        form.setFieldValue(
            'ingredients',
            draft.ingredients.map(item => ({ name: item.name, quantity: item.quantity }))
        );
        form.setFieldValue('stepsText', draft.steps.join('\n'));
        form.setFieldValue('body', draft.body);
        form.setFieldValue('tags', draft.tags);
        form.setFieldValue('caution', draft.caution);
        form.setFieldValue('prepMinutes', draft.prepMinutes?.toString() ?? '');
        form.setFieldValue('cookMinutes', draft.cookMinutes?.toString() ?? '');
        form.setFieldValue('servings', draft.servings);
        setEditorKey(key => key + 1);
    }
    const currentStatus = entry?.status ?? 'draft';

    function submit(status: EntryStatus) {
        void form.handleSubmit({ status }).then(() => {
            const first = document.querySelector('[data-invalid="true"]');
            first?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    }

    return (
        <form
            className='grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]'
            noValidate
            onSubmit={event => {
                event.preventDefault();
                submit(currentStatus);
            }}>
            <FieldGroup>
                <div className='grid gap-5 sm:grid-cols-[11rem_1fr]'>
                    <form.Field name='kind'>
                        {field => (
                            <Field>
                                <FieldLabel htmlFor={field.name}>Kind</FieldLabel>
                                <Select
                                    items={kindItems}
                                    onValueChange={value => {
                                        if (value) field.handleChange(value);
                                    }}
                                    value={field.state.value}>
                                    <SelectTrigger className='w-full' id={field.name}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {kindItems.map(item => (
                                            <SelectItem key={item.value} value={item.value}>
                                                {item.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>
                        )}
                    </form.Field>
                    <form.Field
                        listeners={{
                            onChange: ({ value }) => {
                                if (!slugTouched) form.setFieldValue('slug', slugify(value));
                            },
                        }}
                        name='title'>
                        {field => (
                            <Field data-invalid={field.state.meta.errors.length > 0}>
                                <FieldLabel htmlFor={field.name}>Title</FieldLabel>
                                <Input
                                    aria-invalid={field.state.meta.errors.length > 0}
                                    autoFocus={!entry}
                                    id={field.name}
                                    name={field.name}
                                    onBlur={field.handleBlur}
                                    onChange={event => field.handleChange(event.target.value)}
                                    placeholder={
                                        isArticle
                                            ? 'What we eat in the first week of monsoon'
                                            : 'Haldi doodh for a dry cough'
                                    }
                                    value={field.state.value}
                                />
                                <FieldError errors={issues(field.state.meta.errors)} />
                            </Field>
                        )}
                    </form.Field>
                </div>

                <form.Field name='useFor'>
                    {field => (
                        <Field data-invalid={field.state.meta.errors.length > 0}>
                            <FieldLabel htmlFor={field.name}>{copy.useFor.label}</FieldLabel>
                            <Input
                                aria-invalid={field.state.meta.errors.length > 0}
                                id={field.name}
                                name={field.name}
                                onBlur={field.handleBlur}
                                onChange={event => field.handleChange(event.target.value)}
                                placeholder={
                                    isRecipe
                                        ? 'Sick days, light dinners'
                                        : 'Dry cough, scratchy throat'
                                }
                                value={field.state.value}
                            />
                            <FieldDescription>
                                The complaint, habit, or occasion. Shown as “{meta.lead} …” under
                                the title.
                            </FieldDescription>
                            <FieldError errors={issues(field.state.meta.errors)} />
                        </Field>
                    )}
                </form.Field>

                <form.Field name='summary'>
                    {field => (
                        <Field data-invalid={field.state.meta.errors.length > 0}>
                            <FieldLabel htmlFor={field.name}>Summary</FieldLabel>
                            <Textarea
                                aria-invalid={field.state.meta.errors.length > 0}
                                id={field.name}
                                name={field.name}
                                onBlur={field.handleBlur}
                                onChange={event => field.handleChange(event.target.value)}
                                rows={2}
                                value={field.state.value}
                            />
                            <FieldDescription>
                                {copy.summary} Search engines and lists show it.
                            </FieldDescription>
                            <FieldError errors={issues(field.state.meta.errors)} />
                        </Field>
                    )}
                </form.Field>

                {isArticle ? null : (
                    <form.Field mode='array' name='ingredients'>
                        {field => (
                            <FieldSet>
                                <FieldLegend variant='label'>{copy.ingredients}</FieldLegend>
                                {field.state.value.length === 0 ? (
                                    <FieldDescription>
                                        Optional. Add what the reader needs to have at hand.
                                    </FieldDescription>
                                ) : null}
                                <div
                                    className={cn(
                                        'divide-y rounded-lg border',
                                        field.state.value.length === 0 && 'hidden'
                                    )}>
                                    {field.state.value.map((_, index) => (
                                        <div
                                            className='grid grid-cols-[1fr_8rem_2.25rem] items-center gap-2 p-2'
                                            key={index}>
                                            <form.Field name={`ingredients[${index}].name`}>
                                                {sub => (
                                                    <Input
                                                        aria-label='Ingredient name'
                                                        name={sub.name}
                                                        onBlur={sub.handleBlur}
                                                        onChange={event =>
                                                            sub.handleChange(event.target.value)
                                                        }
                                                        placeholder='Turmeric powder'
                                                        value={sub.state.value}
                                                    />
                                                )}
                                            </form.Field>
                                            <form.Field name={`ingredients[${index}].quantity`}>
                                                {sub => (
                                                    <Input
                                                        aria-label='Quantity'
                                                        name={sub.name}
                                                        onBlur={sub.handleBlur}
                                                        onChange={event =>
                                                            sub.handleChange(event.target.value)
                                                        }
                                                        placeholder='¼ tsp'
                                                        value={sub.state.value}
                                                    />
                                                )}
                                            </form.Field>
                                            <Button
                                                aria-label='Remove ingredient'
                                                onClick={() => field.removeValue(index)}
                                                size='icon'
                                                type='button'
                                                variant='ghost'>
                                                <Trash2Icon />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                <Button
                                    className='w-fit'
                                    onClick={() => field.pushValue({ name: '', quantity: '' })}
                                    size='sm'
                                    type='button'
                                    variant='outline'>
                                    <PlusIcon data-icon='inline-start' /> Add ingredient
                                </Button>
                                <FieldError errors={issues(field.state.meta.errors)} />
                            </FieldSet>
                        )}
                    </form.Field>
                )}

                {isArticle ? null : (
                    <form.Field name='stepsText'>
                        {field => (
                            <Field data-invalid={field.state.meta.errors.length > 0}>
                                <FieldLabel htmlFor={field.name}>{copy.steps.label}</FieldLabel>
                                <Textarea
                                    id={field.name}
                                    name={field.name}
                                    onBlur={field.handleBlur}
                                    onChange={event => field.handleChange(event.target.value)}
                                    placeholder={
                                        'Warm the milk until it steams.\nStir in the turmeric and pepper.'
                                    }
                                    rows={5}
                                    value={field.state.value}
                                />
                                <FieldDescription>
                                    {copy.steps.hint} Numbers are added automatically.
                                </FieldDescription>
                            </Field>
                        )}
                    </form.Field>
                )}

                <form.Field name='body'>
                    {field => (
                        <Field data-invalid={field.state.meta.errors.length > 0}>
                            <FieldLabel>{copy.body.label}</FieldLabel>
                            <BodyEditor
                                key={editorKey}
                                initial={field.state.value}
                                onChange={markdown => field.handleChange(markdown)}
                            />
                            <FieldDescription>{copy.body.hint}</FieldDescription>
                            <FieldError errors={issues(field.state.meta.errors)} />
                        </Field>
                    )}
                </form.Field>

                {copy.caution ? (
                    <form.Field name='caution'>
                        {field => (
                            <Field data-invalid={field.state.meta.errors.length > 0}>
                                <FieldLabel htmlFor={field.name}>Caution</FieldLabel>
                                <Textarea
                                    aria-invalid={field.state.meta.errors.length > 0}
                                    id={field.name}
                                    name={field.name}
                                    onBlur={field.handleBlur}
                                    onChange={event => field.handleChange(event.target.value)}
                                    rows={2}
                                    value={field.state.value}
                                />
                                <FieldDescription>When to stop and see a doctor.</FieldDescription>
                                <FieldError errors={issues(field.state.meta.errors)} />
                            </Field>
                        )}
                    </form.Field>
                ) : null}
            </FieldGroup>

            <aside className='flex flex-col gap-5 lg:sticky lg:top-6 lg:self-start'>
                <Card className='order-2 lg:order-1' size='sm'>
                    <CardContent className='space-y-3'>
                        <p className='text-sm'>
                            <span className='text-muted-foreground'>
                                {entry ? 'Editing' : 'New entry'} ·{' '}
                            </span>
                            <span
                                className={
                                    currentStatus === 'published'
                                        ? 'text-primary font-medium'
                                        : 'text-muted-foreground'
                                }>
                                {currentStatus === 'published' ? 'Published' : 'Draft'}
                            </span>
                        </p>
                        {error ? (
                            <Alert variant='destructive'>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        ) : null}
                        {attempted && uniqueInvalid.length > 0 ? (
                            <Alert variant='destructive'>
                                <AlertDescription>
                                    Fix before saving: {uniqueInvalid.join(', ')}.
                                </AlertDescription>
                            </Alert>
                        ) : null}
                        <div className='grid gap-2'>
                            <Button
                                disabled={pending}
                                onClick={() => submit('published')}
                                size='lg'
                                type='button'>
                                {pending
                                    ? 'Saving…'
                                    : currentStatus === 'published'
                                      ? 'Save changes'
                                      : 'Publish'}
                            </Button>
                            <Button
                                disabled={pending}
                                onClick={() => submit('draft')}
                                size='lg'
                                type='button'
                                variant='outline'>
                                {currentStatus === 'published'
                                    ? 'Unpublish, keep as draft'
                                    : 'Save as draft'}
                            </Button>
                        </div>
                        {onDelete ? (
                            <AlertDialog>
                                <AlertDialogTrigger
                                    render={
                                        <Button
                                            className='w-full'
                                            disabled={pending}
                                            size='sm'
                                            type='button'
                                            variant='destructive'
                                        />
                                    }>
                                    <Trash2Icon data-icon='inline-start' /> Delete entry
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            It will be removed from the site straight away. This
                                            cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Keep it</AlertDialogCancel>
                                        <AlertDialogAction onClick={onDelete} variant='destructive'>
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        ) : null}
                    </CardContent>
                </Card>

                <div className='order-3 lg:order-2'>
                    <AiAssist kind={kind} onDraft={applyDraft} />
                </div>

                <form.Field name='coverImage'>
                    {field => (
                        <div className='order-4 lg:order-3'>
                            <CoverImageField
                                ingredients={ingredientNames}
                                kind={kind}
                                onChange={url => field.handleChange(url)}
                                title={title}
                                value={field.state.value}
                            />
                        </div>
                    )}
                </form.Field>

                <div className='order-1 flex flex-col gap-5 lg:order-4'>
                    <form.Field
                        name='slug'
                        validators={{
                            onChange: slugSchema,
                            onChangeAsyncDebounceMs: 350,
                            onChangeAsync: async ({ value }) => {
                                const available = await adminSlugAvailableServerFn({
                                    data: { slug: value, exceptId: entry?.id },
                                });
                                return available ? undefined : 'That address is already in use';
                            },
                        }}>
                        {field => (
                            <Field data-invalid={field.state.meta.errors.length > 0}>
                                <FieldLabel htmlFor={field.name}>Address</FieldLabel>
                                <Input
                                    aria-invalid={field.state.meta.errors.length > 0}
                                    className='font-mono'
                                    id={field.name}
                                    name={field.name}
                                    onBlur={field.handleBlur}
                                    onChange={event => {
                                        setSlugTouched(true);
                                        field.handleChange(event.target.value);
                                    }}
                                    value={field.state.value}
                                />
                                <FieldDescription>
                                    /{meta.path}/{field.state.value || '…'}
                                </FieldDescription>
                                <FieldError errors={issues(field.state.meta.errors)} />
                            </Field>
                        )}
                    </form.Field>

                    <form.Field name='tags'>
                        {field => (
                            <Field data-invalid={field.state.meta.errors.length > 0}>
                                <FieldLabel htmlFor={field.name}>Tags</FieldLabel>
                                <TagInput
                                    id={field.name}
                                    onBlur={field.handleBlur}
                                    onChange={tags => field.handleChange(tags)}
                                    placeholder='cough, winter, bedtime'
                                    value={field.state.value}
                                />
                                <FieldDescription>
                                    Press Enter or a comma after each one. Used for search.
                                </FieldDescription>
                                <FieldError errors={issues(field.state.meta.errors)} />
                            </Field>
                        )}
                    </form.Field>

                    {isRecipe ? (
                        <div className='grid grid-cols-3 gap-3'>
                            {(
                                [
                                    ['prepMinutes', 'Prep min', ''],
                                    ['cookMinutes', 'Cook min', ''],
                                    ['servings', 'Serves', '3 to 4'],
                                ] as const
                            ).map(([name, label, placeholder]) => (
                                <form.Field key={name} name={name}>
                                    {field => (
                                        <Field data-invalid={field.state.meta.errors.length > 0}>
                                            <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
                                            <Input
                                                aria-invalid={field.state.meta.errors.length > 0}
                                                id={field.name}
                                                inputMode={name === 'servings' ? 'text' : 'numeric'}
                                                name={field.name}
                                                onBlur={field.handleBlur}
                                                onChange={event =>
                                                    field.handleChange(event.target.value)
                                                }
                                                placeholder={placeholder}
                                                value={field.state.value}
                                            />
                                            <FieldError errors={issues(field.state.meta.errors)} />
                                        </Field>
                                    )}
                                </form.Field>
                            ))}
                        </div>
                    ) : null}
                </div>
            </aside>
        </form>
    );
}
