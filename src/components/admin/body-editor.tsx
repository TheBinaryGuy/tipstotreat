import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Toggle } from '@/components/ui/toggle';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor, useEditorState, type Editor } from '@tiptap/react';
import { Markdown } from '@tiptap/markdown';
import StarterKit from '@tiptap/starter-kit';
import {
    BoldIcon,
    Heading2Icon,
    Heading3Icon,
    ItalicIcon,
    LinkIcon,
    ListIcon,
    ListOrderedIcon,
    MinusIcon,
    QuoteIcon,
    RedoIcon,
    UndoIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export function BodyEditor({
    initial,
    onChange,
}: {
    /** Markdown. */
    initial: string;
    onChange: (markdown: string) => void;
}) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: { levels: [2, 3] },
                link: false,
            }),
            Link.configure({ openOnClick: false, autolink: true, defaultProtocol: 'https' }),
            Markdown,
            Placeholder.configure({
                placeholder: 'Why it works, what you have learnt, notes for children or elders…',
            }),
        ],
        content: initial,
        contentType: 'markdown',
        editorProps: {
            attributes: {
                class: 'prose prose-zinc dark:prose-invert max-w-none px-4 py-3 min-h-64',
            },
        },
        onUpdate: ({ editor: e }) => {
            onChange(e.getMarkdown());
        },
    });

    useEffect(() => () => editor?.destroy(), [editor]);

    return (
        <div className='border-input focus-within:border-ring rounded-md border'>
            {editor ? <Toolbar editor={editor} /> : null}
            <EditorContent editor={editor} />
        </div>
    );
}

function Toolbar({ editor }: { editor: Editor }) {
    const state = useEditorState({
        editor,
        selector: ({ editor: e }) => ({
            bold: e.isActive('bold'),
            italic: e.isActive('italic'),
            h2: e.isActive('heading', { level: 2 }),
            h3: e.isActive('heading', { level: 3 }),
            bullet: e.isActive('bulletList'),
            ordered: e.isActive('orderedList'),
            quote: e.isActive('blockquote'),
            link: e.isActive('link'),
            canUndo: e.can().undo(),
            canRedo: e.can().redo(),
        }),
    });

    const [linkDraft, setLinkDraft] = useState('');

    function applyLink(url: string) {
        const href = url.trim();
        if (!href) {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
    }

    const items: {
        label: string;
        icon: React.ReactNode;
        active?: boolean;
        disabled?: boolean;
        run: () => void;
    }[] = [
        {
            label: 'Bold',
            icon: <BoldIcon />,
            active: state.bold,
            run: () => editor.chain().focus().toggleBold().run(),
        },
        {
            label: 'Italic',
            icon: <ItalicIcon />,
            active: state.italic,
            run: () => editor.chain().focus().toggleItalic().run(),
        },
        {
            label: 'Heading',
            icon: <Heading2Icon />,
            active: state.h2,
            run: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        },
        {
            label: 'Subheading',
            icon: <Heading3Icon />,
            active: state.h3,
            run: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        },
        {
            label: 'Bullet list',
            icon: <ListIcon />,
            active: state.bullet,
            run: () => editor.chain().focus().toggleBulletList().run(),
        },
        {
            label: 'Numbered list',
            icon: <ListOrderedIcon />,
            active: state.ordered,
            run: () => editor.chain().focus().toggleOrderedList().run(),
        },
        {
            label: 'Quote',
            icon: <QuoteIcon />,
            active: state.quote,
            run: () => editor.chain().focus().toggleBlockquote().run(),
        },
        {
            label: 'Divider',
            icon: <MinusIcon />,
            run: () => editor.chain().focus().setHorizontalRule().run(),
        },
        {
            label: 'Undo',
            icon: <UndoIcon />,
            disabled: !state.canUndo,
            run: () => editor.chain().focus().undo().run(),
        },
        {
            label: 'Redo',
            icon: <RedoIcon />,
            disabled: !state.canRedo,
            run: () => editor.chain().focus().redo().run(),
        },
    ];

    const marks = items.filter(item => item.active !== undefined);
    const actions = items.filter(item => item.active === undefined);

    return (
        <div
            aria-label='Formatting'
            className='bg-muted/50 flex flex-wrap items-center gap-0.5 border-b p-1'
            role='toolbar'>
            {marks.map(item => (
                <Toggle
                    aria-label={item.label}
                    key={item.label}
                    onPressedChange={item.run}
                    pressed={item.active}
                    size='sm'
                    title={item.label}>
                    {item.icon}
                </Toggle>
            ))}
            <Popover
                onOpenChange={open => {
                    if (open)
                        setLinkDraft(
                            (editor.getAttributes('link').href as string | undefined) ?? ''
                        );
                }}>
                <PopoverTrigger
                    render={
                        <Toggle aria-label='Link' pressed={state.link} size='sm' title='Link'>
                            <LinkIcon />
                        </Toggle>
                    }
                />
                <PopoverContent align='start' className='w-72'>
                    <form
                        className='flex gap-2'
                        onSubmit={event => {
                            event.preventDefault();
                            applyLink(linkDraft);
                        }}>
                        <Input
                            aria-label='Link address'
                            autoFocus
                            onChange={event => setLinkDraft(event.target.value)}
                            placeholder='https://'
                            type='url'
                            value={linkDraft}
                        />
                        <Button size='sm' type='submit'>
                            {linkDraft.trim() ? 'Apply' : 'Remove'}
                        </Button>
                    </form>
                </PopoverContent>
            </Popover>
            <Separator className='mx-1 h-5!' orientation='vertical' />
            {actions.map(item => (
                <Button
                    aria-label={item.label}
                    disabled={item.disabled}
                    key={item.label}
                    onClick={item.run}
                    size='icon-sm'
                    title={item.label}
                    type='button'
                    variant='ghost'>
                    {item.icon}
                </Button>
            ))}
        </div>
    );
}
