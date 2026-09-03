import { passkeyClient } from '@better-auth/passkey/client';
import { adminClient, lastLoginMethodClient, twoFactorClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
    plugins: [
        adminClient(),
        lastLoginMethodClient(),
        twoFactorClient({
            onTwoFactorRedirect() {
                // A second factor is required: the sign-in page hands over to /two-factor.
                const redirect = new URLSearchParams(window.location.search).get('redirect') ?? '/';
                window.location.assign(`/two-factor?redirect=${encodeURIComponent(redirect)}`);
            },
        }),
        passkeyClient(),
    ],
});
