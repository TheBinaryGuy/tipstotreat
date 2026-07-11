import { useRouter } from '@tanstack/react-router';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';

import { setThemeServerFn, type Theme } from '../lib/theme';

type ThemeContextValue = {
    theme: Theme;
    setTheme: (theme: Theme) => Promise<void>;
};

type ThemeProviderProps = PropsWithChildren<{
    theme: Theme;
}>;

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children, theme }: ThemeProviderProps) {
    const router = useRouter();
    const [currentTheme, setCurrentTheme] = useState(theme);

    useEffect(() => {
        setCurrentTheme(theme);
        applyTheme(theme);
    }, [theme]);

    async function setTheme(nextTheme: Theme) {
        setCurrentTheme(nextTheme);
        applyTheme(nextTheme);
        await setThemeServerFn({ data: nextTheme });
        await router.invalidate();
    }

    return <ThemeContext value={{ theme: currentTheme, setTheme }}>{children}</ThemeContext>;
}

export function useTheme() {
    const value = useContext(ThemeContext);

    if (!value) {
        throw new Error('useTheme must be used inside ThemeProvider');
    }

    return value;
}

function applyTheme(theme: Theme) {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    document.documentElement.style.colorScheme = theme;
}
