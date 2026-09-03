import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldLabel } from '@/components/ui/field';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { aiExtractEntryServerFn, aiGenerateEntryServerFn } from '@/features/ai/server/ai.functions';
import type { AiDraft } from '@/features/ai/shared/schema';
import { ENTRY_KINDS, type EntryKind } from '@/lib/db/schema';
import { kindMeta } from '@/lib/format';
import { useMutation } from '@tanstack/react-query';
import { ClipboardPasteIcon, SparklesIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const kindItems = ENTRY_KINDS.map(value => ({ value, label: kindMeta[value].label }));

/** Generate a whole entry from a brief, or fill the form from pasted text. */
export function AiAssist({
    kind,
    onDraft,
}: {
    kind: EntryKind;
    onDraft: (draft: AiDraft) => void;
}) {
    const [mode, setMode] = useState<'generate' | 'paste'>('generate');
    const [brief, setBrief] = useState('');
    const [draftKind, setDraftKind] = useState<EntryKind>(kind);
    const [pasted, setPasted] = useState('');

    const generate = useMutation({
        mutationFn: aiGenerateEntryServerFn,
        onSuccess: draft => {
            onDraft(draft);
            toast.success('Draft written. Read it through before publishing.');
        },
        onError: error => toast.error(error.message),
    });
    const extract = useMutation({
        mutationFn: aiExtractEntryServerFn,
        onSuccess: draft => {
            onDraft(draft);
            toast.success('Form filled from your text. Check the details.');
        },
        onError: error => toast.error(error.message),
    });
    const busy = generate.isPending || extract.isPending;

    return (
        <Card size='sm'>
            <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                    <SparklesIcon className='text-primary size-4' /> Write with AI
                </CardTitle>
                <CardDescription>
                    A first draft in your voice. It replaces what is in the form.
                </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
                <ToggleGroup
                    aria-label='AI mode'
                    className='w-full'
                    onValueChange={value => {
                        const next = value[0];
                        if (next === 'generate' || next === 'paste') setMode(next);
                    }}
                    size='sm'
                    value={[mode]}
                    variant='outline'>
                    <ToggleGroupItem className='flex-1' value='generate'>
                        <SparklesIcon /> Generate
                    </ToggleGroupItem>
                    <ToggleGroupItem className='flex-1' value='paste'>
                        <ClipboardPasteIcon /> From text
                    </ToggleGroupItem>
                </ToggleGroup>

                {mode === 'generate' ? (
                    <>
                        <Field>
                            <FieldLabel htmlFor='ai-kind'>Kind</FieldLabel>
                            <Select
                                items={kindItems}
                                onValueChange={value => {
                                    if (value) setDraftKind(value as EntryKind);
                                }}
                                value={draftKind}>
                                <SelectTrigger className='w-full' id='ai-kind'>
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
                        <Field>
                            <FieldLabel htmlFor='ai-brief'>What do you want?</FieldLabel>
                            <Textarea
                                id='ai-brief'
                                onChange={event => setBrief(event.target.value)}
                                placeholder={
                                    draftKind === 'recipe'
                                        ? 'Moong dal khichdi the way I make it for sick days'
                                        : draftKind === 'article'
                                          ? 'What we eat in the first week of monsoon, and why'
                                          : 'Ajwain water for gas after a heavy meal'
                                }
                                rows={3}
                                value={brief}
                            />
                        </Field>
                        <Button
                            className='w-full'
                            disabled={busy || brief.trim().length < 3}
                            onClick={() => generate.mutate({ data: { brief, kind: draftKind } })}
                            type='button'>
                            <SparklesIcon data-icon='inline-start' />
                            {generate.isPending ? 'Writing…' : 'Write a draft'}
                        </Button>
                    </>
                ) : (
                    <>
                        <Field>
                            <FieldLabel htmlFor='ai-paste'>Paste anything</FieldLabel>
                            <Textarea
                                id='ai-paste'
                                onChange={event => setPasted(event.target.value)}
                                placeholder='A WhatsApp message, a note, a recipe from a book…'
                                rows={6}
                                value={pasted}
                            />
                        </Field>
                        <Button
                            className='w-full'
                            disabled={busy || pasted.trim().length < 20}
                            onClick={() => extract.mutate({ data: { text: pasted } })}
                            type='button'>
                            <ClipboardPasteIcon data-icon='inline-start' />
                            {extract.isPending ? 'Reading…' : 'Fill the form'}
                        </Button>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
