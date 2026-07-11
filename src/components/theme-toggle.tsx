import { MoonIcon, SunIcon } from 'lucide-react';
import { useState } from 'react';

import { useTheme } from './theme-provider';

export function ThemeToggle() {
    const { setTheme, theme } = useTheme();
    const [isUpdating, setIsUpdating] = useState(false);
    const nextTheme = theme === 'dark' ? 'light' : 'dark';

    async function toggleTheme() {
        setIsUpdating(true);

        try {
            await setTheme(nextTheme);
        } finally {
            setIsUpdating(false);
        }
    }

    return (
        <button
            aria-label={`Switch to ${nextTheme} mode`}
            className='border-border bg-card/70 text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-primary grid size-10 place-items-center rounded-xl border shadow-sm backdrop-blur transition-[color,background-color,transform] duration-150 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.96] disabled:cursor-wait disabled:opacity-60'
            disabled={isUpdating}
            onClick={toggleTheme}
            title={`Switch to ${nextTheme} mode`}
            type='button'>
            {theme === 'dark' ? (
                <SunIcon aria-hidden='true' className='size-4.5' />
            ) : (
                <MoonIcon aria-hidden='true' className='size-4.5' />
            )}
        </button>
    );
}
