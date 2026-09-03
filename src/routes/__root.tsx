import { ThemeProvider } from '@/components/theme-provider';
import { PwaRegister } from '@/components/pwa-register';
import { Toaster } from '@/components/ui/sonner';
import { SITE_DESCRIPTION, SITE_NAME, getOriginServerFn } from '@/lib/site';
import { getThemeServerFn } from '@/lib/theme';
import appCss from '@/styles.css?url';
import { TanStackDevtools } from '@tanstack/react-devtools';
import type { QueryClient } from '@tanstack/react-query';
import { FormDevtoolsPanel } from '@tanstack/react-form-devtools';
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools';
import { HeadContent, Scripts, createRootRouteWithContext } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';

const description = SITE_DESCRIPTION;

export const Route = createRootRouteWithContext<{
    queryClient: QueryClient;
}>()({
    loader: async () => {
        const [theme, origin] = await Promise.all([getThemeServerFn(), getOriginServerFn()]);
        return { theme, origin };
    },
    head: ({ loaderData }) => ({
        meta: [
            { charSet: 'utf-8' },
            { name: 'viewport', content: 'width=device-width, initial-scale=1' },
            { title: 'TipsToTreat · Home remedies, tips and recipes from an Indian kitchen' },
            { name: 'description', content: description },
            { name: 'apple-mobile-web-app-title', content: 'TipsToTreat' },
            { name: 'mobile-web-app-capable', content: 'yes' },
            { name: 'apple-mobile-web-app-capable', content: 'yes' },
            { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
            { name: 'theme-color', content: '#ffffff', media: '(prefers-color-scheme: light)' },
            { name: 'theme-color', content: '#09090b', media: '(prefers-color-scheme: dark)' },
            { property: 'og:site_name', content: SITE_NAME },
            { property: 'og:type', content: 'website' },
            { name: 'twitter:card', content: 'summary_large_image' },
            ...(loaderData
                ? [
                      { property: 'og:url', content: loaderData.origin },
                      { property: 'og:locale', content: 'en_IN' },
                      { property: 'og:title', content: SITE_NAME },
                      { property: 'og:description', content: description },
                      { property: 'og:image', content: `${loaderData.origin}/og/site.png` },
                      {
                          property: 'og:image:secure_url',
                          content: `${loaderData.origin}/og/site.png`,
                      },
                      { property: 'og:image:type', content: 'image/png' },
                      { property: 'og:image:width', content: '1200' },
                      { property: 'og:image:height', content: '630' },
                      {
                          property: 'og:image:alt',
                          content: `${SITE_NAME}: home remedies, health tips and recipes`,
                      },
                      { name: 'twitter:title', content: SITE_NAME },
                      { name: 'twitter:description', content: description },
                      { name: 'twitter:image', content: `${loaderData.origin}/og/site.png` },
                      {
                          name: 'twitter:image:alt',
                          content: `${SITE_NAME}: home remedies, health tips and recipes`,
                      },
                  ]
                : []),
        ],
        links: [
            { rel: 'stylesheet', href: appCss },
            { rel: 'icon', type: 'image/png', href: '/favicon-96x96.png', sizes: '96x96' },
            { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
            { rel: 'shortcut icon', href: '/favicon.ico' },
            {
                rel: 'apple-touch-icon',
                type: 'image/png',
                href: '/apple-touch-icon.png',
                sizes: '180x180',
            },
            { rel: 'manifest', href: '/manifest.json' },
        ],
        scripts: loaderData
            ? [
                  {
                      type: 'application/ld+json',
                      children: JSON.stringify({
                          '@context': 'https://schema.org',
                          '@type': 'WebSite',
                          name: SITE_NAME,
                          url: loaderData.origin,
                          description,
                          potentialAction: {
                              '@type': 'SearchAction',
                              target: `${loaderData.origin}/search?q={search_term_string}`,
                              'query-input': 'required name=search_term_string',
                          },
                      }),
                  },
              ]
            : [],
    }),
    notFoundComponent: () => (
        <main className='mx-auto max-w-6xl px-4 py-16 sm:px-6'>
            <h1 className='mt-2 text-5xl'>Page not found</h1>
            <p className='text-muted-foreground mt-4 max-w-prose'>
                The address may have changed, or the entry was taken down. Try the search box or go
                back to the front page.
            </p>
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
            <body className='min-h-svh'>
                <ThemeProvider theme={theme}>
                    {children}
                    <Toaster position='bottom-center' />
                </ThemeProvider>
                <TanStackDevtools
                    config={{ position: 'bottom-right' }}
                    plugins={[
                        { name: 'Tanstack Router', render: <TanStackRouterDevtoolsPanel /> },
                        { name: 'Tanstack Query', render: <ReactQueryDevtoolsPanel /> },
                        { name: 'Tanstack Form', render: <FormDevtoolsPanel /> },
                    ]}
                />
                <Scripts />
            </body>
        </html>
    );
}
