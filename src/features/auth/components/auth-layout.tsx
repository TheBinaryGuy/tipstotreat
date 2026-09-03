import { Card, CardContent } from '@/components/ui/card';
import { FieldSeparator } from '@/components/ui/field';
import { GoogleButton } from '@/features/auth/components/google-button';
import { LastUsed } from '@/features/auth/components/last-used';

export function AuthLayout({
    title,
    intro,
    google,
    callbackURL,
    footer,
    children,
}: {
    title: string;
    intro: string;
    google: boolean;
    callbackURL: string;
    footer: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className='mx-auto max-w-sm px-5 pt-12 pb-6'>
            <h1 className='text-2xl font-semibold tracking-tight'>{title}</h1>
            <p className='text-muted-foreground mt-2'>{intro}</p>
            <Card className='mt-6'>
                <CardContent className='space-y-5'>
                    {google ? (
                        <>
                            <div className='flex items-center'>
                                <GoogleButton callbackURL={callbackURL} />
                                <LastUsed method='google' />
                            </div>
                            <FieldSeparator>or with email</FieldSeparator>
                        </>
                    ) : null}
                    <div>
                        {children}
                        <div className='mt-2 text-right'>
                            <LastUsed method='email' />
                        </div>
                    </div>
                </CardContent>
            </Card>
            <p className='text-muted-foreground mt-4 text-sm'>{footer}</p>
        </div>
    );
}
