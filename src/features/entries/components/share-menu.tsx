import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CheckIcon, LinkIcon, MailIcon, Share2Icon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

/** Share an entry: the device share sheet when available, plus the usual destinations. */
export function ShareMenu({ url, title, text }: { url: string; title: string; text: string }) {
    const [canNativeShare, setCanNativeShare] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setCanNativeShare(
            typeof navigator !== 'undefined' && typeof navigator.share === 'function'
        );
    }, []);

    async function nativeShare() {
        try {
            await navigator.share({ title, text, url });
        } catch {
            /* user dismissed the sheet */
        }
    }

    async function copyLink() {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1800);
        } catch {
            toast.error('Copy failed');
        }
    }

    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(`${title} — ${text}`);
    const targets = [
        {
            label: 'WhatsApp',
            href: `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`,
        },
        {
            label: 'Telegram',
            href: `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(title)}`,
        },
        {
            label: 'X',
            href: `https://x.com/intent/post?url=${encodedUrl}&text=${encodeURIComponent(title)}`,
        },
        { label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    ];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant='outline' />}>
                <Share2Icon data-icon='inline-start' /> Share
            </DropdownMenuTrigger>
            <DropdownMenuContent align='start' className='w-52'>
                <DropdownMenuGroup>
                    {canNativeShare ? (
                        <DropdownMenuItem onClick={() => void nativeShare()}>
                            <Share2Icon /> Share…
                        </DropdownMenuItem>
                    ) : null}
                    <DropdownMenuItem onClick={() => void copyLink()}>
                        {copied ? <CheckIcon className='text-primary' /> : <LinkIcon />}
                        {copied ? 'Link copied' : 'Copy link'}
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    {targets.map(target => (
                        <DropdownMenuItem
                            key={target.label}
                            render={
                                <a href={target.href} rel='noopener noreferrer' target='_blank' />
                            }>
                            {target.label}
                        </DropdownMenuItem>
                    ))}
                    <DropdownMenuItem
                        render={
                            <a
                                href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodedText}%0A%0A${encodedUrl}`}
                            />
                        }>
                        <MailIcon /> Email
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
