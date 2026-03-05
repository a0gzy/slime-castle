'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { Bold, Italic, List, ListOrdered, Image as ImageIcon, Link2, AlignLeft, AlignCenter, AlignRight, Table as TableIcon } from 'lucide-react';
import { forwardRef, useImperativeHandle, useEffect } from 'react';

export interface RichTextEditorRef {
    insertImage: (url: string) => void;
}

interface Props {
    content: string;
    onChange: (html: string) => void;
}

export const RichTextEditor = forwardRef<RichTextEditorRef, Props>(({ content, onChange }, ref) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Image,
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
            Link.configure({ openOnClick: false }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            TextStyle,
            TextStyle,
            Color,
        ],
        content,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-invert prose-emerald max-w-none focus:outline-none min-h-[400px] p-6'
            }
        }
    });

    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            // Update editor content if parent content changes (e.g. initial load)
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    useImperativeHandle(ref, () => ({
        insertImage: (url: string) => {
            if (editor) {
                editor.chain().focus().setImage({ src: url }).run();
            }
        }
    }));

    if (!editor) {
        return <div className="min-h-[400px] bg-zinc-900/50 animate-pulse rounded-lg" />;
    }

    const toggleLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);
        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    return (
        <div className="flex flex-col border border-zinc-800 bg-[#0c0c0e] rounded-xl overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 border-b border-zinc-800 bg-zinc-900/80">
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-2 rounded hover:bg-zinc-800 ${editor.isActive('bold') ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-400'}`}
                >
                    <Bold className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-2 rounded hover:bg-zinc-800 ${editor.isActive('italic') ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-400'}`}
                >
                    <Italic className="w-4 h-4" />
                </button>

                <div className="w-px h-6 bg-zinc-800 mx-1" />

                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`px-3 py-1 text-sm font-bold rounded hover:bg-zinc-800 ${editor.isActive('heading', { level: 2 }) ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-400'}`}
                >
                    H2
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={`px-3 py-1 text-sm font-bold rounded hover:bg-zinc-800 ${editor.isActive('heading', { level: 3 }) ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-400'}`}
                >
                    H3
                </button>

                <div className="w-px h-6 bg-zinc-800 mx-1" />

                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-2 rounded hover:bg-zinc-800 ${editor.isActive('bulletList') ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-400'}`}
                >
                    <List className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`p-2 rounded hover:bg-zinc-800 ${editor.isActive('orderedList') ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-400'}`}
                >
                    <ListOrdered className="w-4 h-4" />
                </button>

                <div className="w-px h-6 bg-zinc-800 mx-1" />

                <button
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    className={`p-2 rounded hover:bg-zinc-800 ${editor.isActive({ textAlign: 'left' }) ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-400'}`}
                >
                    <AlignLeft className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    className={`p-2 rounded hover:bg-zinc-800 ${editor.isActive({ textAlign: 'center' }) ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-400'}`}
                >
                    <AlignCenter className="w-4 h-4" />
                </button>

                <div className="w-px h-6 bg-zinc-800 mx-1" />

                <button
                    onClick={toggleLink}
                    className={`p-2 rounded hover:bg-zinc-800 ${editor.isActive('link') ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-400'}`}
                >
                    <Link2 className="w-4 h-4" />
                </button>

                <div className="w-px h-6 bg-zinc-800 mx-1" />

                <button
                    onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                    className="p-2 rounded hover:bg-zinc-800 text-zinc-400"
                    title="Insert Table"
                >
                    <TableIcon className="w-4 h-4" />
                </button>

                {editor.isActive('table') && (
                    <div className="flex items-center gap-1 bg-zinc-800/50 rounded-lg px-1">
                        <button onClick={() => editor.chain().focus().addColumnAfter().run()} className="px-2 py-1 text-xs text-zinc-300 hover:text-white">+ Col</button>
                        <button onClick={() => editor.chain().focus().addRowAfter().run()} className="px-2 py-1 text-xs text-zinc-300 hover:text-white">+ Row</button>
                        <button onClick={() => editor.chain().focus().deleteColumn().run()} className="px-2 py-1 text-xs text-red-400 hover:text-red-300">- Col</button>
                        <button onClick={() => editor.chain().focus().deleteRow().run()} className="px-2 py-1 text-xs text-red-400 hover:text-red-300">- Row</button>
                        <button onClick={() => editor.chain().focus().deleteTable().run()} className="px-2 py-1 text-xs font-bold text-red-500 hover:text-red-400">Del</button>
                    </div>
                )}
            </div>

            {/* Editor Area */}
            <div className="flex-1 overflow-y-auto bg-[#0a0a0c]">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
});
RichTextEditor.displayName = 'RichTextEditor';
