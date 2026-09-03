import { getContext, QueryProvider } from '@/lib/query-provider';
import { routeTree } from '@/routeTree.gen';
import { createRouter } from '@tanstack/react-router';
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query';

export function getRouter() {
    const rqContext = getContext();

    const router = createRouter({
        routeTree,
        context: { ...rqContext },
        scrollRestoration: true,
        defaultPreload: 'intent',
        defaultPreloadStaleTime: 0,
        Wrap: (props: { children: React.ReactNode }) => (
            <QueryProvider {...rqContext}>{props.children}</QueryProvider>
        ),
    });

    setupRouterSsrQueryIntegration({
        router,
        queryClient: rqContext.queryClient,
        wrapQueryClient: false,
    });

    return router;
}

declare module '@tanstack/react-router' {
    interface Register {
        router: ReturnType<typeof getRouter>;
    }
}
