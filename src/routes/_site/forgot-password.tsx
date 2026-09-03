import { AuthForm } from '@/components/admin/auth-form';
import { Card, CardContent } from '@/components/ui/card';
import { authClient } from '@/lib/auth-client';
import { Link, createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { z } from 'zod';

export const Route = createFileRoute('/_site/forgot-password')({
    head: () => ({
        meta: [{ title: 'Forgot password · TipsToTreat' }, { name: 'robots', content: 'noindex' }],
    }),
    component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);
    return (
        <div className='mx-auto max-w-sm px-5 pt-12 pb-6'>
            <h1 className='text-2xl font-semibold tracking-tight'>Forgot your password?</h1>
            <p className='text-muted-foreground mt-2'>We'll email you a link to set a new one.</p>
            <Card className='mt-6'>
                <CardContent>
                    {sent ? (
                        <p className='text-sm'>
                            If that address has an account, a reset link is on its way. It works for
                            one hour. Check your spam folder if it doesn't arrive.
                        </p>
                    ) : (
                        <AuthForm
                            defaultValues={{ email: '' }}
                            error={error}
                            fields={[
                                {
                                    name: 'email',
                                    label: 'Email',
                                    input: { type: 'email', autoComplete: 'email' },
                                },
                            ]}
                            onSubmit={async values => {
                                setError(null);
                                const result = await authClient.requestPasswordReset({
                                    email: values.email ?? '',
                                    redirectTo: '/reset-password',
                                });
                                if (result.error) {
                                    setError(result.error.message ?? 'Could not send the email.');
                                    return;
                                }
                                setSent(true);
                            }}
                            pendingLabel='Sending…'
                            schema={z.object({ email: z.email('Enter your email') })}
                            submitLabel='Email me a reset link'
                        />
                    )}
                </CardContent>
            </Card>
            <p className='text-muted-foreground mt-4 text-sm'>
                <Link className='text-foreground underline underline-offset-4' to='/sign-in'>
                    Back to sign in
                </Link>
            </p>
        </div>
    );
}
