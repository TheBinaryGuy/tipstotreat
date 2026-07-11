import { TanStackDevtools } from '@tanstack/react-devtools';
import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';

import { ThemeProvider } from '../components/theme-provider';
import { getThemeServerFn } from '../lib/theme';
import appCss from '../styles.css?url';

export const Route = createRootRoute({
    loader: async () => {
        const theme = await getThemeServerFn();
        return { theme };
    },
    head: () => ({
        meta: [
            {
                charSet: 'utf-8',
            },
            {
                name: 'viewport',
                content: 'width=device-width, initial-scale=1',
            },
            {
                title: 'TipsToTreat',
            },
            {
                name: 'apple-mobile-web-app-title',
                content: 'TipsToTreat',
            },
        ],
        links: [
            {
                rel: 'stylesheet',
                href: appCss,
            },
            {
                rel: 'icon',
                type: 'image/png',
                href: '/favicon-96x96.png',
                sizes: '96x96',
            },
            {
                rel: 'icon',
                type: 'image/svg+xml',
                href: '/favicon.svg',
            },
            {
                rel: 'shortcut icon',
                href: '/favicon.ico',
            },
            {
                rel: 'apple-touch-icon',
                type: 'image/png',
                href: '/apple-touch-icon.png',
                sizes: '180x180',
            },
            {
                rel: 'manifest',
                href: '/manifest.json',
                content: 'TipsToTreat',
            },
        ],
    }),
    notFoundComponent: () => (
        <main className='container mx-auto p-4 pt-16'>
            <h1>404</h1>
            <p>The requested page could not be found.</p>
        </main>
    ),
    shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
    const { theme } = Route.useLoaderData();

    return (
        <html className={theme} lang='en' suppressHydrationWarning>
            <head>
                <HeadContent />
            </head>
            <body>
                <ThemeProvider theme={theme}>{children}</ThemeProvider>
                <TanStackDevtools
                    config={{
                        position: 'bottom-right',
                    }}
                    plugins={[
                        {
                            name: 'Tanstack Router',
                            render: <TanStackRouterDevtoolsPanel />,
                        },
                    ]}
                />
                <Scripts />
            </body>
        </html>
    );
}
