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

export const Route = createFileRoute('/_site/sign-in')({
    validateSearch: search,
    beforeLoad: async ({ context, search }) => {
        if (context.session) throw redirect({ href: safeRedirect(search.redirect) });
        return {
            methods: await getAuthMethodsServerFn(),
            redirectTo: safeRedirect(search.redirect),
        };
    },
    head: () => ({
        meta: [{ title: 'Sign in · TipsToTreat' }, { name: 'robots', content: 'noindex' }],
    }),
    component: SignInPage,
});

const loginSchema = z.object({
    email: z.email('Enter the email you signed up with'),
    password: z.string().min(1, 'Enter your password'),
});

function SignInPage() {
    const { methods, redirectTo } = Route.useRouteContext();
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    return (
        <AuthLayout
            callbackURL={redirectTo}
            footer={
                <>
                    New here?{' '}
                    <Link
                        className='text-foreground underline underline-offset-4'
                        search={{ redirect: redirectTo }}
                        to='/sign-up'>
                        Create an account
                    </Link>
                    .
                </>
            }
            google={methods.google}
            intro='Sign in to like entries and join the comments.'
            title='Sign in'>
            <AuthForm
                defaultValues={{ email: '', password: '' }}
                error={error}
                fields={[
                    {
                        name: 'email',
                        label: 'Email',
                        input: { type: 'email', autoComplete: 'email' },
                    },
                    {
                        name: 'password',
                        label: 'Password',
                        input: { type: 'password', autoComplete: 'current-password' },
                    },
                ]}
                onSubmit={async values => {
                    setError(null);
                    const result = await authClient.signIn.email({
                        email: values.email ?? '',
                        password: values.password ?? '',
                    });
                    if (result.error) {
                        setError(
                            result.error.message ??
                                'Could not sign in. Check the email and password.'
                        );
                        return;
                    }
                    await router.invalidate();
                    await router.navigate({ href: redirectTo });
                }}
                pendingLabel='Signing in…'
                schema={loginSchema}
                submitLabel='Sign in'
            />
        </AuthLayout>
    );
}
