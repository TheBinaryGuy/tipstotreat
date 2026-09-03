import { Mark } from '@/components/site/mark';
import { kindMeta } from '@/lib/format';
import { Link } from '@tanstack/react-router';
import { RssIcon } from 'lucide-react';

const KINDS = ['remedy', 'tip', 'recipe', 'article'] as const;

export function SiteFooter() {
    const year = new Date().getFullYear();
    return (
        <footer className='mt-24 border-t'>
            <div className='mx-auto grid max-w-4xl gap-8 px-5 py-10 text-sm sm:grid-cols-[1.5fr_1fr_1fr]'>
                <div>
                    <p className='flex items-center gap-2 font-semibold tracking-tight'>
                        <Mark className='text-primary size-4' /> TipsToTreat
                    </p>
                    <p className='text-muted-foreground mt-3 max-w-md'>
                        Household practices, not medical advice. For anything serious, or anything
                        that does not improve, please see a doctor.
                    </p>
                    <p className='text-muted-foreground mt-3'>
                        © {year} TipsToTreat. All rights reserved. Recipes, remedies, and
                        photographs may not be republished without permission.
                    </p>
                </div>
                <nav aria-label='Sections'>
                    <p className='font-medium'>Sections</p>
                    <ul className='text-muted-foreground mt-2 space-y-1.5'>
                        {KINDS.map(kind => (
                            <li key={kind}>
                                <Link
                                    className='hover:text-foreground transition-colors'
                                    params={{ kind: kindMeta[kind].path }}
                                    to='/$kind'>
                                    {kindMeta[kind].plural}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
                <nav aria-label='Feeds and tools'>
                    <p className='font-medium'>Follow</p>
                    <ul className='text-muted-foreground mt-2 space-y-1.5'>
                        <li>
                            <a
                                className='hover:text-foreground inline-flex items-center gap-1.5 transition-colors'
                                href='/feed.xml'>
                                <RssIcon className='size-3.5' /> RSS feed
                            </a>
                        </li>
                        <li>
                            <a
                                className='hover:text-foreground transition-colors'
                                href='/sitemap.xml'>
                                Sitemap
                            </a>
                        </li>
                        <li>
                            <a className='hover:text-foreground transition-colors' href='/llms.txt'>
                                llms.txt
                            </a>
                        </li>
                        <li>
                            <Link className='hover:text-foreground transition-colors' to='/sign-in'>
                                Sign in
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </footer>
    );
}
