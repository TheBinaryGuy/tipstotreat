import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AiMark } from '@/features/entries/components/ai-marks';
import { cn } from '@/lib/utils';
import { CheckIcon, ChevronDownIcon, CopyIcon, FileTextIcon, LinkIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

type Copied = 'markdown' | 'link' | null;

/**
 * "Copy page" for readers and AI tools. `markdownUrl` is the entry's `.md` twin, which is also
 * what ChatGPT and Claude are pointed at.
 */
export function CopyPageMenu({ pageUrl, markdownUrl }: { pageUrl: string; markdownUrl: string }) {
    const [copied, setCopied] = useState<Copied>(null);
    const timer = useRef<number | null>(null);

    useEffect(() => () => window.clearTimeout(timer.current ?? undefined), []);

    function flash(kind: Exclude<Copied, null>) {
        setCopied(kind);
        window.clearTimeout(timer.current ?? undefined);
        timer.current = window.setTimeout(() => setCopied(null), 1800);
    }

    async function copyMarkdown() {
        try {
            const response = await fetch(markdownUrl);
            if (!response.ok) throw new Error('Could not load the Markdown');
            await navigator.clipboard.writeText(await response.text());
            flash('markdown');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Copy failed');
        }
    }

    async function copyLink() {
        try {
            await navigator.clipboard.writeText(markdownUrl);
            flash('link');
        } catch {
            toast.error('Copy failed');
        }
    }

    const prompt = encodeURIComponent(`Read ${markdownUrl} and help me with it.`);
    const chatgpt = `https://chatgpt.com/?q=${prompt}`;
    const claude = `https://claude.ai/new?q=${prompt}`;
    const gemini = 'https://gemini.google.com/app';

    // Gemini has no prompt query parameter: copy the prompt, then open it.
    async function openGemini() {
        try {
            await navigator.clipboard.writeText(decodeURIComponent(prompt));
            toast('Prompt copied. Paste it into Gemini.');
        } catch {
            /* clipboard blocked: still open Gemini */
        }
        window.open(gemini, '_blank', 'noopener,noreferrer');
    }

    return (
        <ButtonGroup>
            <Button onClick={() => void copyMarkdown()} size='sm' variant='outline'>
                <span className='relative grid size-4 place-items-center'>
                    <CopyIcon
                        className={cn(
                            'absolute transition-all duration-200',
                            copied === 'markdown' ? 'scale-50 opacity-0' : 'scale-100 opacity-100'
                        )}
                    />
                    <CheckIcon
                        className={cn(
                            'absolute text-primary transition-all duration-200',
                            copied === 'markdown'
                                ? 'animate-in zoom-in-50 scale-100 opacity-100'
                                : 'scale-50 opacity-0'
                        )}
                    />
                </span>
                {copied === 'markdown' ? 'Copied' : 'Copy page'}
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger
                    render={
                        <Button
                            aria-label='More ways to use this page'
                            size='icon-sm'
                            variant='outline'
                        />
                    }>
                    <ChevronDownIcon />
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-60'>
                    <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => void copyMarkdown()}>
                            <CopyIcon /> Copy as Markdown
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => void copyLink()}>
                            {copied === 'link' ? (
                                <CheckIcon className='text-primary' />
                            ) : (
                                <LinkIcon />
                            )}
                            Copy Markdown link
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            render={<a href={markdownUrl} rel='noopener' target='_blank' />}>
                            <FileTextIcon /> View as Markdown
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem
                            render={<a href={chatgpt} rel='noopener noreferrer' target='_blank' />}>
                            <AiMark className='size-4' name='chatgpt' /> Open in ChatGPT
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            render={<a href={claude} rel='noopener noreferrer' target='_blank' />}>
                            <AiMark className='size-4' name='claude' /> Open in Claude
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => void openGemini()}>
                            <AiMark className='size-4' name='gemini' /> Open in Gemini
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className='text-muted-foreground text-xs'
                        render={
                            <a
                                href={`${new URL(pageUrl).origin}/llms.txt`}
                                rel='noopener'
                                target='_blank'
                            />
                        }>
                        llms.txt for the whole site
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </ButtonGroup>
    );
}
