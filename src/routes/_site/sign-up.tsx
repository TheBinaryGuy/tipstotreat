import { AuthForm } from '@/components/admin/auth-form';
import { AuthLayout } from '@/features/auth/components/auth-layout';
import { getAuthMethodsServerFn } from '@/features/auth/server/auth.functions';
import { authClient } from '@/lib/auth-client';
import { Link, createFileRoute, redirect, useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { z } from 'zod';

const search = z.object({ redirect: z.string().optional().catch(undefined) });

function safeRedirect(value: string | undefined) {
    return value && value.startsWith('/') && !value.startsWith('//') ? value : '/';
}

export const Route = createFileRoute('/_site/sign-up')({
    validateSearch: search,
    beforeLoad: async ({ context, search }) => {
        if (context.session) throw redirect({ href: safeRedirect(search.redirect) });
        return {
            methods: await getAuthMethodsServerFn(),
            redirectTo: safeRedirect(search.redirect),
        };
    },
    head: () => ({
        meta: [
            { title: 'Create an account · TipsToTreat' },
            { name: 'robots', content: 'noindex' },
        ],
    }),
    component: SignUpPage,
});

const signUpSchema = z
    .object({
        name: z.string().trim().min(1, 'Tell us what to call you'),
        email: z.email('Enter a valid email'),
        password: z.string().min(10, 'At least 10 characters'),
        confirm: z.string(),
    })
    .refine(values => values.password === values.confirm, {
        message: 'The two passwords do not match',
        path: ['confirm'],
    });

function SignUpPage() {
    const { methods, redirectTo } = Route.useRouteContext();
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    return (
        <AuthLayout
            callbackURL={redirectTo}
            footer={
                <>
                    Already have an account?{' '}
                    <Link
                        className='text-foreground underline underline-offset-4'
                        search={{ redirect: redirectTo }}
                        to='/sign-in'>
                        Sign in
                    </Link>
                    .
                </>
            }
            google={methods.google}
            intro='An account lets you like entries and leave comments.'
            title='Create an account'>
            <AuthForm
                defaultValues={{ name: '', email: '', password: '', confirm: '' }}
                error={error}
                fields={[
                    {
                        name: 'name',
                        label: 'Name',
                        hint: 'Shown next to your comments.',
                        input: { autoComplete: 'name' },
                    },
                    {
                        name: 'email',
                        label: 'Email',
                        input: { type: 'email', autoComplete: 'email' },
                    },
                    {
                        name: 'password',
                        label: 'Password',
                        hint: 'At least 10 characters.',
                        input: { type: 'password', autoComplete: 'new-password' },
                    },
                    {
                        name: 'confirm',
                        label: 'Password again',
                        input: { type: 'password', autoComplete: 'new-password' },
                    },
                ]}
                onSubmit={async values => {
                    setError(null);
                    const result = await authClient.signUp.email({
                        name: values.name ?? '',
                        email: values.email ?? '',
                        password: values.password ?? '',
                    });
                    if (result.error) {
                        setError(result.error.message ?? 'Could not create the account.');
                        return;
                    }
                    await router.invalidate();
                    await router.navigate({ href: redirectTo });
                }}
                pendingLabel='Creating…'
                schema={signUpSchema}
                submitLabel='Create account'
            />
        </AuthLayout>
    );
}
