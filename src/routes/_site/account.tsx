import { Button } from '@/components/ui/button';
import { getAccountOverviewServerFn } from '@/features/auth/server/account.functions';
import { PasskeysCard } from '@/features/account/components/passkeys-card';
import { PasswordCard } from '@/features/account/components/password-card';
import { ProfileCard } from '@/features/account/components/profile-card';
import { SessionsCard } from '@/features/account/components/sessions-card';
import { TwoFactorCard } from '@/features/account/components/two-factor-card';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { Link, createFileRoute, redirect } from '@tanstack/react-router';

export const accountQuery = () =>
    queryOptions({
        queryKey: ['account'],
        queryFn: () => getAccountOverviewServerFn(),
        staleTime: 0,
    });

export const Route = createFileRoute('/_site/account')({
    beforeLoad: ({ context, location }) => {
        if (!context.session)
            throw redirect({ to: '/sign-in', search: { redirect: location.href } });
    },
    loader: ({ context }) => context.queryClient.ensureQueryData(accountQuery()),
    head: () => ({
        meta: [{ title: 'Settings · TipsToTreat' }, { name: 'robots', content: 'noindex' }],
    }),
    component: AccountPage,
});

function AccountPage() {
    const { data } = useSuspenseQuery(accountQuery());
    return (
        <div className='mx-auto max-w-2xl px-5 pt-10 pb-8'>
            <div className='flex flex-wrap items-baseline justify-between gap-3'>
                <h1 className='text-2xl font-semibold tracking-tight'>Settings</h1>
                {data.role === 'admin' ? (
                    <Button render={<Link to='/admin' />} size='sm' variant='outline'>
                        Author panel
                    </Button>
                ) : null}
            </div>
            <div className='mt-6 space-y-6'>
                <ProfileCard email={data.email} image={data.image} name={data.name} />
                <PasswordCard hasPassword={data.hasPassword} providers={data.providers} />
                <TwoFactorCard enabled={data.twoFactorEnabled} hasPassword={data.hasPassword} />
                <PasskeysCard />
                <SessionsCard />
            </div>
        </div>
    );
}
