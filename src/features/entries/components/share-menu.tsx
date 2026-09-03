import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AiMark } from '@/features/entries/components/ai-marks';
import { cn } from '@/lib/utils';
import {
    CheckIcon,
    ChevronDownIcon,
    CopyIcon,
    FileTextIcon,
    LinkIcon,
    MailIcon,
    Share2Icon,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

type Copied = 'link' | 'markdown' | 'markdownLink' | null;

/**
 * One control for sharing an entry. The main button opens the device share sheet; browsers
 * without one open the menu instead. `markdownUrl` is the entry's `.md` twin.
 */
export function ShareMenu({
    pageUrl,
    markdownUrl,
    title,
    text,
}: {
    pageUrl: string;
    markdownUrl: string;
    title: string;
    text: string;
}) {
    const [canNativeShare, setCanNativeShare] = useState(false);
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState<Copied>(null);
    const timer = useRef<number | null>(null);

    useEffect(() => {
        setCanNativeShare(
            typeof navigator !== 'undefined' && typeof navigator.share === 'function'
        );
        return () => window.clearTimeout(timer.current ?? undefined);
    }, []);

    function flash(kind: Exclude<Copied, null>) {
        setCopied(kind);
        window.clearTimeout(timer.current ?? undefined);
        timer.current = window.setTimeout(() => setCopied(null), 1800);
    }

    async function share() {
        if (!canNativeShare) {
            setOpen(true);
            return;
        }
        try {
            await navigator.share({ title, text, url: pageUrl });
        } catch {
            /* dismissed */
        }
    }

    async function copy(kind: Exclude<Copied, null>) {
        try {
            let value = pageUrl;
            if (kind === 'markdownLink') value = markdownUrl;
            if (kind === 'markdown') {
                const response = await fetch(markdownUrl);
                if (!response.ok) throw new Error('Could not load the Markdown');
                value = await response.text();
            }
            await navigator.clipboard.writeText(value);
            flash(kind);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Copy failed');
        }
    }

    const prompt = encodeURIComponent(`Read ${markdownUrl} and help me with it.`);
    async function openGemini() {
        try {
            await navigator.clipboard.writeText(decodeURIComponent(prompt));
            toast('Prompt copied. Paste it into Gemini.');
        } catch {
            /* clipboard blocked: still open Gemini */
        }
        window.open('https://gemini.google.com/app', '_blank', 'noopener,noreferrer');
    }

    const encodedUrl = encodeURIComponent(pageUrl);
    const targets = [
        {
            label: 'WhatsApp',
            href: `https://wa.me/?text=${encodeURIComponent(`${title}\n${pageUrl}`)}`,
        },
        {
            label: 'Telegram',
            href: `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(title)}`,
        },
        {
            label: 'X',
            href: `https://x.com/intent/post?url=${encodedUrl}&text=${encodeURIComponent(title)}`,
        },
        {
            label: 'Facebook',
            mark: 'facebook' as const,
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        },
    ];

    const CopyState = ({ kind, idle }: { kind: Exclude<Copied, null>; idle: React.ReactNode }) =>
        copied === kind ? <CheckIcon className='text-primary animate-in zoom-in-50' /> : idle;

    return (
        <ButtonGroup>
            <Button onClick={() => void share()} variant='outline'>
                <Share2Icon data-icon='inline-start' /> Share
            </Button>
            <DropdownMenu onOpenChange={setOpen} open={open}>
                <DropdownMenuTrigger
                    render={
                        <Button aria-label='More ways to share' size='icon' variant='outline' />
                    }>
                    <ChevronDownIcon />
                </DropdownMenuTrigger>
                <DropdownMenuContent align='start' className={cn('w-60')}>
                    <DropdownMenuGroup>
                        <DropdownMenuItem closeOnClick={false} onClick={() => void copy('link')}>
                            <CopyState idle={<LinkIcon />} kind='link' />
                            {copied === 'link' ? 'Link copied' : 'Copy link'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            closeOnClick={false}
                            onClick={() => void copy('markdown')}>
                            <CopyState idle={<CopyIcon />} kind='markdown' />
                            {copied === 'markdown' ? 'Page copied' : 'Copy page as Markdown'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            closeOnClick={false}
                            onClick={() => void copy('markdownLink')}>
                            <CopyState idle={<FileTextIcon />} kind='markdownLink' />
                            {copied === 'markdownLink'
                                ? 'Markdown link copied'
                                : 'Copy Markdown link'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            render={<a href={markdownUrl} rel='noopener' target='_blank' />}>
                            <FileTextIcon /> View as Markdown
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuLabel>Ask an AI about this</DropdownMenuLabel>
                        <DropdownMenuItem
                            render={
                                <a
                                    href={`https://chatgpt.com/?q=${prompt}`}
                                    rel='noopener noreferrer'
                                    target='_blank'
                                />
                            }>
                            <AiMark className='size-4' name='chatgpt' /> Open in ChatGPT
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            render={
                                <a
                                    href={`https://claude.ai/new?q=${prompt}`}
                                    rel='noopener noreferrer'
                                    target='_blank'
                                />
                            }>
                            <AiMark className='size-4' name='claude' /> Open in Claude
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => void openGemini()}>
                            <AiMark className='size-4' name='gemini' /> Open in Gemini
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuLabel>Send to</DropdownMenuLabel>
                        {targets.map(target => (
                            <DropdownMenuItem
                                key={target.label}
                                render={
                                    <a
                                        href={target.href}
                                        rel='noopener noreferrer'
                                        target='_blank'
                                    />
                                }>
                                {target.label}
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuItem
                            render={
                                <a
                                    href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${pageUrl}`)}`}
                                />
                            }>
                            <MailIcon /> Email
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </ButtonGroup>
    );
}
