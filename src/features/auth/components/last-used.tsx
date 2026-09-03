import { Badge } from '@/components/ui/badge';
import { authClient } from '@/lib/auth-client';
import { useEffect, useState } from 'react';

/** "Last used" hint for a sign-in method; reads a cookie, so it renders only after hydration. */
export function LastUsed({ method }: { method: 'google' | 'email' }) {
    const [last, setLast] = useState<string | null>(null);
    useEffect(() => {
        setLast(authClient.getLastUsedLoginMethod());
    }, []);
    if (last !== method) return null;
    return (
        <Badge className='ml-2' variant='secondary'>
            Last used
        </Badge>
    );
}
