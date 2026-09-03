import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Toggle } from '@/components/ui/toggle';
import { uploadImage } from '@/features/ai/components/cover-image';
import { CharacterCount } from '@tiptap/extension-character-count';
import { FileHandler } from '@tiptap/extension-file-handler';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { TableKit } from '@tiptap/extension-table';
import { TaskItem } from '@tiptap/extension-task-item';
import { TaskList } from '@tiptap/extension-task-list';
import { Markdown } from '@tiptap/markdown';
import { EditorContent, useEditor, useEditorState, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
    BoldIcon,
    CodeIcon,
    Heading2Icon,
    Heading3Icon,
    ImageIcon,
    ItalicIcon,
    LinkIcon,
    ListChecksIcon,
    ListIcon,
    ListOrderedIcon,
    MinusIcon,
    QuoteIcon,
    RedoIcon,
    SquareCodeIcon,
    StrikethroughIcon,
    TableIcon,
    UndoIcon,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'];

async function insertUploaded(editor: Editor, files: File[], pos?: number) {
    for (const file of files) {
        if (!IMAGE_TYPES.includes(file.type)) continue;
        try {
            const src = await uploadImage(file);
            const alt = file.name.replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' ');
            const chain = editor.chain().focus();
            if (pos !== undefined)
                chain.insertContentAt(pos, { type: 'image', attrs: { src, alt } });
            else chain.setImage({ src, alt });
            chain.run();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Upload failed');
        }
    }
}

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
            Image.configure({ inline: false, allowBase64: false }),
            TableKit.configure({ table: { resizable: false } }),
            TaskList,
            TaskItem.configure({ nested: false }),
            CharacterCount,
            FileHandler.configure({
                allowedMimeTypes: IMAGE_TYPES,
                onDrop: (current, files, pos) => void insertUploaded(current, files, pos),
                onPaste: (current, files) => void insertUploaded(current, files),
            }),
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
            {editor ? <Footer editor={editor} /> : null}
        </div>
    );
}

function Footer({ editor }: { editor: Editor }) {
    const words = useEditorState({
        editor,
        selector: ({ editor: e }) => e.storage.characterCount.words() as number,
    });
    return (
        <p className='text-muted-foreground border-t px-3 py-1.5 text-xs'>
            {words} {words === 1 ? 'word' : 'words'} · paste or drop images to add them
        </p>
    );
}

function Toolbar({ editor }: { editor: Editor }) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [linkDraft, setLinkDraft] = useState('');
    const state = useEditorState({
        editor,
        selector: ({ editor: e }) => ({
            bold: e.isActive('bold'),
            italic: e.isActive('italic'),
            strike: e.isActive('strike'),
            code: e.isActive('code'),
            codeBlock: e.isActive('codeBlock'),
            h2: e.isActive('heading', { level: 2 }),
            h3: e.isActive('heading', { level: 3 }),
            bullet: e.isActive('bulletList'),
            ordered: e.isActive('orderedList'),
            task: e.isActive('taskList'),
            quote: e.isActive('blockquote'),
            link: e.isActive('link'),
            table: e.isActive('table'),
            canUndo: e.can().undo(),
            canRedo: e.can().redo(),
        }),
    });

    function applyLink(url: string) {
        const href = url.trim();
        if (!href) {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
    }

    const marks = [
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
            label: 'Strikethrough',
            icon: <StrikethroughIcon />,
            active: state.strike,
            run: () => editor.chain().focus().toggleStrike().run(),
        },
        {
            label: 'Inline code',
            icon: <CodeIcon />,
            active: state.code,
            run: () => editor.chain().focus().toggleCode().run(),
        },
    ];
    const blocks = [
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
            label: 'Checklist',
            icon: <ListChecksIcon />,
            active: state.task,
            run: () => editor.chain().focus().toggleTaskList().run(),
        },
        {
            label: 'Quote',
            icon: <QuoteIcon />,
            active: state.quote,
            run: () => editor.chain().focus().toggleBlockquote().run(),
        },
        {
            label: 'Code block',
            icon: <SquareCodeIcon />,
            active: state.codeBlock,
            run: () => editor.chain().focus().toggleCodeBlock().run(),
        },
    ];

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
            {blocks.map(item => (
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
            <Button
                aria-label='Divider'
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                size='icon-sm'
                title='Divider'
                type='button'
                variant='ghost'>
                <MinusIcon />
            </Button>
            <Separator className='mx-1 h-5!' orientation='vertical' />
            <input
                accept={IMAGE_TYPES.join(',')}
                className='hidden'
                multiple
                onChange={event => {
                    const files = Array.from(event.target.files ?? []);
                    if (files.length) void insertUploaded(editor, files);
                    event.target.value = '';
                }}
                ref={fileRef}
                type='file'
            />
            <Button
                aria-label='Insert image'
                onClick={() => fileRef.current?.click()}
                size='icon-sm'
                title='Insert image'
                type='button'
                variant='ghost'>
                <ImageIcon />
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger
                    render={
                        <Toggle aria-label='Table' pressed={state.table} size='sm' title='Table'>
                            <TableIcon />
                        </Toggle>
                    }
                />
                <DropdownMenuContent align='start'>
                    <DropdownMenuGroup>
                        <DropdownMenuItem
                            onClick={() =>
                                editor
                                    .chain()
                                    .focus()
                                    .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                                    .run()
                            }>
                            Insert 3 × 3 table
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    {state.table ? (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem
                                    onClick={() => editor.chain().focus().addRowAfter().run()}>
                                    Add row below
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => editor.chain().focus().addColumnAfter().run()}>
                                    Add column right
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => editor.chain().focus().deleteRow().run()}>
                                    Delete row
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => editor.chain().focus().deleteColumn().run()}>
                                    Delete column
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => editor.chain().focus().toggleHeaderRow().run()}>
                                    Toggle header row
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => editor.chain().focus().deleteTable().run()}
                                variant='destructive'>
                                Delete table
                            </DropdownMenuItem>
                        </>
                    ) : null}
                </DropdownMenuContent>
            </DropdownMenu>
            <Separator className='mx-1 h-5!' orientation='vertical' />
            <Button
                aria-label='Undo'
                disabled={!state.canUndo}
                onClick={() => editor.chain().focus().undo().run()}
                size='icon-sm'
                title='Undo'
                type='button'
                variant='ghost'>
                <UndoIcon />
            </Button>
            <Button
                aria-label='Redo'
                disabled={!state.canRedo}
                onClick={() => editor.chain().focus().redo().run()}
                size='icon-sm'
                title='Redo'
                type='button'
                variant='ghost'>
                <RedoIcon />
            </Button>
        </div>
    );
}
