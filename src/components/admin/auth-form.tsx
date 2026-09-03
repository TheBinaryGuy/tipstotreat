import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useForm } from '@tanstack/react-form';
import type { ComponentProps } from 'react';
import type { z } from 'zod';

type Issue = { message?: string };
export function issues(errors: unknown[]): Issue[] {
    return errors.map(error => (typeof error === 'string' ? { message: error } : (error as Issue)));
}

type Values = Record<string, string>;

export type AuthFieldSpec = {
    name: string;
    label: string;
    hint?: string;
    input: Omit<ComponentProps<typeof Input>, 'name' | 'value' | 'onChange' | 'onBlur' | 'id'>;
};

/** A small vertical form for sign-in and first-run setup. */
export function AuthForm({
    schema,
    defaultValues,
    fields,
    submitLabel,
    pendingLabel,
    onSubmit,
    error,
}: {
    schema: z.ZodType<Values, Values>;
    defaultValues: Values;
    fields: AuthFieldSpec[];
    submitLabel: string;
    pendingLabel: string;
    onSubmit: (values: Values) => Promise<void>;
    error?: string | null;
}) {
    const form = useForm({
        defaultValues,
        validators: { onSubmit: schema },
        onSubmit: ({ value }) => onSubmit(value),
    });

    return (
        <form
            noValidate
            onSubmit={event => {
                event.preventDefault();
                void form.handleSubmit();
            }}>
            <FieldGroup>
                {fields.map(spec => (
                    <form.Field key={spec.name} name={spec.name}>
                        {field => (
                            <Field data-invalid={field.state.meta.errors.length > 0}>
                                <FieldLabel htmlFor={field.name}>{spec.label}</FieldLabel>
                                <Input
                                    aria-invalid={field.state.meta.errors.length > 0}
                                    id={field.name}
                                    name={field.name}
                                    onBlur={field.handleBlur}
                                    onChange={event => field.handleChange(event.target.value)}
                                    value={field.state.value ?? ''}
                                    {...spec.input}
                                />
                                {spec.hint ? (
                                    <FieldDescription>{spec.hint}</FieldDescription>
                                ) : null}
                                <FieldError errors={issues(field.state.meta.errors)} />
                            </Field>
                        )}
                    </form.Field>
                ))}
                {error ? (
                    <Alert variant='destructive'>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                ) : null}
                <form.Subscribe selector={state => state.isSubmitting}>
                    {isSubmitting => (
                        <Button className='w-full' disabled={isSubmitting} size='lg' type='submit'>
                            {isSubmitting ? pendingLabel : submitLabel}
                        </Button>
                    )}
                </form.Subscribe>
            </FieldGroup>
        </form>
    );
}
