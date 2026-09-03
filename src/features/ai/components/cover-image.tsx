import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { aiGenerateImageServerFn } from '@/features/ai/server/ai.functions';
import {
    ModelPicker,
    defaultImageModel,
    imageModelCatalog,
    useRememberedModel,
} from '@/features/ai/components/model-picker';
import type { ImageModelId } from '@/features/ai/shared/schema';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import type { EntryKind } from '@/lib/db/schema';
import { useMutation } from '@tanstack/react-query';
import { ImageIcon, SparklesIcon, Trash2Icon, UploadIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

export async function uploadImage(
    file: File,
    purpose: 'cover' | 'inline' | 'avatar' = 'inline'
): Promise<string> {
    const body = new FormData();
    body.append('file', file);
    body.append('purpose', purpose);
    const response = await fetch('/api/media', { method: 'POST', body });
    const json = (await response.json()) as { url?: string; error?: string };
    if (!response.ok || !json.url) throw new Error(json.error ?? 'Upload failed');
    return json.url;
}

/** Cover image: upload your own, or let AI paint one from the entry. */
export function CoverImageField({
    value,
    onChange,
    title,
    kind,
    ingredients,
    useFor,
    summary,
}: {
    value: string | null;
    onChange: (url: string | null) => void;
    title: string;
    kind: EntryKind;
    ingredients: string[];
    useFor?: string;
    summary?: string;
}) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [prompt, setPrompt] = useState('');
    const [model, setModel] = useRememberedModel<ImageModelId>(
        'ai.imageModel',
        imageModelCatalog,
        defaultImageModel
    );
    const upload = useMutation({
        mutationFn: (file: File) => uploadImage(file, 'cover'),
        onSuccess: url => onChange(url),
        onError: error => toast.error(error.message),
    });
    const generate = useMutation({
        mutationFn: aiGenerateImageServerFn,
        onSuccess: result => onChange(result.url),
        onError: error => toast.error(error.message),
    });
    const busy = upload.isPending || generate.isPending;

    return (
        <Card size='sm'>
            <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                    <ImageIcon className='size-4' /> Cover image
                </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
                {value ? (
                    <img
                        alt=''
                        className='aspect-[1.91/1] w-full rounded-md border object-cover'
                        src={value}
                    />
                ) : (
                    <div className='text-muted-foreground bg-muted/40 grid aspect-[1.91/1] place-items-center rounded-md border border-dashed text-sm'>
                        {busy ? 'Working…' : 'No image yet'}
                    </div>
                )}
                <input
                    accept='image/png,image/jpeg,image/webp,image/gif,image/avif'
                    className='hidden'
                    onChange={event => {
                        const file = event.target.files?.[0];
                        if (file) upload.mutate(file);
                        event.target.value = '';
                    }}
                    ref={fileRef}
                    type='file'
                />
                <Field>
                    <FieldLabel htmlFor='cover-prompt'>Describe the picture</FieldLabel>
                    <Textarea
                        id='cover-prompt'
                        onChange={event => setPrompt(event.target.value)}
                        placeholder={
                            title.trim()
                                ? `Leave empty to picture "${title.trim()}" from the entry`
                                : 'What should the image show?'
                        }
                        rows={2}
                        value={prompt}
                    />
                    <FieldDescription>
                        Photographic, no people or text. Empty means it is drawn from the title and
                        summary.
                    </FieldDescription>
                </Field>
                <ModelPicker
                    catalog={imageModelCatalog}
                    id='cover-model'
                    label='Image model'
                    onChange={next => setModel(next as ImageModelId)}
                    value={model}
                />
                <div className='grid grid-cols-2 gap-2'>
                    <Button
                        disabled={busy}
                        onClick={() => fileRef.current?.click()}
                        size='sm'
                        type='button'
                        variant='outline'>
                        <UploadIcon data-icon='inline-start' />{' '}
                        {upload.isPending ? 'Uploading…' : 'Upload'}
                    </Button>
                    <Button
                        disabled={busy || (title.trim().length < 2 && prompt.trim().length < 3)}
                        onClick={() =>
                            generate.mutate({ data: { title, kind, ingredients, useFor, summary } })
                        }
                        size='sm'
                        title={
                            title.trim().length < 2 && prompt.trim().length < 3
                                ? 'Add a title or describe the picture first'
                                : 'Generate with AI'
                        }
                        type='button'
                        variant='outline'>
                        <SparklesIcon data-icon='inline-start' />{' '}
                        {generate.isPending ? 'Painting…' : 'Generate'}
                    </Button>
                </div>
                {value ? (
                    <Button
                        className='w-full'
                        disabled={busy}
                        onClick={() => onChange(null)}
                        size='sm'
                        type='button'
                        variant='ghost'>
                        <Trash2Icon data-icon='inline-start' /> Remove image
                    </Button>
                ) : null}
            </CardContent>
        </Card>
    );
}
