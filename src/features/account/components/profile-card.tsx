import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { uploadImage } from '@/features/ai/components/cover-image';
import { authClient } from '@/lib/auth-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { Trash2Icon, UploadIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

export function ProfileCard({
    name,
    email,
    image,
}: {
    name: string;
    email: string;
    image: string | null;
}) {
    const [draftName, setDraftName] = useState(name);
    const fileRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();
    const router = useRouter();

    async function refresh() {
        await queryClient.invalidateQueries({ queryKey: ['account'] });
        await router.invalidate();
    }

    const save = useMutation({
        mutationFn: async (patch: { name?: string; image?: string | null }) => {
            const result = await authClient.updateUser(patch);
            if (result.error) throw new Error(result.error.message ?? 'Could not save');
        },
        onSuccess: async () => {
            await refresh();
            toast.success('Profile saved');
        },
        onError: error => toast.error(error.message),
    });
    const upload = useMutation({
        mutationFn: async (file: File) => {
            if (file.size > 2 * 1024 * 1024) throw new Error('Pictures must be under 2 MB.');
            return uploadImage(file, 'avatar');
        },
        onSuccess: url => save.mutate({ image: url }),
        onError: error => toast.error(error.message),
    });
    const initials = name
        .split(/\s+/)
        .map(part => part[0] ?? '')
        .join('')
        .slice(0, 2)
        .toUpperCase();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>
                    Your name and picture appear next to your comments.
                </CardDescription>
            </CardHeader>
            <CardContent className='space-y-5'>
                <div className='flex items-center gap-4'>
                    <Avatar className='size-16'>
                        {image ? <AvatarImage alt='' src={image} /> : null}
                        <AvatarFallback className='text-lg'>{initials || '?'}</AvatarFallback>
                    </Avatar>
                    <div className='flex flex-wrap gap-2'>
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
                        <Button
                            disabled={upload.isPending || save.isPending}
                            onClick={() => fileRef.current?.click()}
                            size='sm'
                            type='button'
                            variant='outline'>
                            <UploadIcon data-icon='inline-start' />
                            {upload.isPending ? 'Uploading…' : 'Change picture'}
                        </Button>
                        {image ? (
                            <Button
                                disabled={save.isPending}
                                onClick={() => save.mutate({ image: null })}
                                size='sm'
                                type='button'
                                variant='ghost'>
                                <Trash2Icon data-icon='inline-start' /> Remove
                            </Button>
                        ) : null}
                    </div>
                </div>
                <form
                    className='flex flex-col gap-3 sm:flex-row sm:items-end'
                    onSubmit={event => {
                        event.preventDefault();
                        if (draftName.trim().length > 0 && draftName.trim() !== name) {
                            save.mutate({ name: draftName.trim() });
                        }
                    }}>
                    <Field className='flex-1'>
                        <FieldLabel htmlFor='profile-name'>Name</FieldLabel>
                        <Input
                            id='profile-name'
                            onChange={event => setDraftName(event.target.value)}
                            value={draftName}
                        />
                    </Field>
                    <Field className='flex-1'>
                        <FieldLabel htmlFor='profile-email'>Email</FieldLabel>
                        <Input disabled id='profile-email' readOnly value={email} />
                    </Field>
                    <Button
                        disabled={save.isPending || draftName.trim() === name || !draftName.trim()}
                        type='submit'>
                        Save
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
