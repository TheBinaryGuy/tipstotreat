import { ThemeToggle } from '@/components/theme-toggle';

export function SiteFooter() {
    return (
        <footer className='mt-24 border-t'>
            <div className='text-muted-foreground mx-auto flex max-w-4xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-8 text-sm'>
                <p className='max-w-md'>
                    Household practices, not medical advice. For anything serious, or anything that
                    does not improve, please see a doctor.
                </p>
                <div className='sm:hidden'>
                    <ThemeToggle />
                </div>
            </div>
        </footer>
    );
}
