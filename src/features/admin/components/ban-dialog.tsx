import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { adminBanUserServerFn, banInputSchema } from '@/features/admin/server/admin.functions';
import type { AdminUser } from '@/features/admin/server/admin.functions';
import { adminKeys } from '@/features/admin/shared/queries';
import { useForm } from '@tanstack/react-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BanIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const durations = [
    { value: 'permanent', label: 'Until unbanned' },
    { value: 'day', label: '1 day' },
    { value: 'week', label: '7 days' },
    { value: 'month', label: '30 days' },
] as const;

export function BanDialog({ user }: { user: AdminUser }) {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();
    const ban = useMutation({
        mutationFn: adminBanUserServerFn,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: adminKeys.users });
            toast.success(`${user.name} is banned`);
            setOpen(false);
        },
        onError: error => toast.error(error.message),
    });

    const form = useForm({
        defaultValues: {
            userId: user.id,
            reason: '',
            duration: 'permanent' as 'permanent' | 'day' | 'week' | 'month',
        },
        validators: { onSubmit: banInputSchema },
        onSubmit: async ({ value }) => {
            await ban.mutateAsync({ data: value });
        },
    });

    return (
        <Dialog onOpenChange={setOpen} open={open}>
            <DialogTrigger render={<Button size='sm' variant='outline' />}>
                <BanIcon data-icon='inline-start' /> Ban
            </DialogTrigger>
            <DialogContent>
                <form
                    noValidate
                    onSubmit={event => {
                        event.preventDefault();
                        void form.handleSubmit();
                    }}>
                    <DialogHeader>
                        <DialogTitle>Ban {user.name}?</DialogTitle>
                        <DialogDescription>
                            They are signed out everywhere and cannot sign in, like, or comment
                            until the ban ends. They will see the reason.
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup className='my-6'>
                        <form.Field name='reason'>
                            {field => (
                                <Field data-invalid={field.state.meta.errors.length > 0}>
                                    <FieldLabel htmlFor='ban-reason'>Reason</FieldLabel>
                                    <Textarea
                                        aria-invalid={field.state.meta.errors.length > 0}
                                        autoFocus
                                        id='ban-reason'
                                        onBlur={field.handleBlur}
                                        onChange={event => field.handleChange(event.target.value)}
                                        placeholder='Repeated spam links in comments'
                                        rows={3}
                                        value={field.state.value}
                                    />
                                    <FieldDescription>
                                        Shown to the person when they try to sign in.
                                    </FieldDescription>
                                    <FieldError
                                        errors={field.state.meta.errors.map(e =>
                                            typeof e === 'string'
                                                ? { message: e }
                                                : (e as unknown as { message?: string })
                                        )}
                                    />
                                </Field>
                            )}
                        </form.Field>
                        <form.Field name='duration'>
                            {field => (
                                <Field>
                                    <FieldLabel htmlFor='ban-duration'>Duration</FieldLabel>
                                    <Select
                                        items={durations}
                                        onValueChange={value => {
                                            if (value)
                                                field.handleChange(
                                                    value as typeof field.state.value
                                                );
                                        }}
                                        value={field.state.value}>
                                        <SelectTrigger className='w-full' id='ban-duration'>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {durations.map(item => (
                                                <SelectItem key={item.value} value={item.value}>
                                                    {item.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>
                            )}
                        </form.Field>
                    </FieldGroup>
                    <DialogFooter>
                        <Button onClick={() => setOpen(false)} type='button' variant='outline'>
                            Cancel
                        </Button>
                        <form.Subscribe selector={state => state.isSubmitting}>
                            {isSubmitting => (
                                <Button disabled={isSubmitting} type='submit' variant='destructive'>
                                    {isSubmitting ? 'Banning…' : 'Ban user'}
                                </Button>
                            )}
                        </form.Subscribe>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
