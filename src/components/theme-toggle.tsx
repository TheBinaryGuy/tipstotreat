import { Button } from '@/components/ui/button';
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
        <Button
            aria-label={`Switch to ${nextTheme} mode`}
            disabled={isUpdating}
            onClick={toggleTheme}
            size='icon'
            title={`Switch to ${nextTheme} mode`}
            type='button'
            variant='outline'>
            {theme === 'dark' ? <SunIcon aria-hidden='true' /> : <MoonIcon aria-hidden='true' />}
        </Button>
    );
}
