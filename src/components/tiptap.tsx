'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Heading2, 
  Heading3, 
  Undo, 
  Redo, 
  Quote 
} from 'lucide-react';
import { useEffect } from 'react';

interface TiptapProps {
  value: string;
  onChange: (val: string) => void;
}

export default function TiptapEditor({ value, onChange }: TiptapProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[300px] px-4 py-3',
      },
    },
  });

  // Sync external value changes if needed (useful during edit load)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return <div className="border border-gray-300 rounded-lg p-4 text-center text-sm text-gray-400">অপেক্ষা করুন...</div>;
  }

  const MenuBar = () => {
    return (
      <div className="border-b border-gray-300 bg-gray-50 p-2 flex flex-wrap gap-1 rounded-t-lg items-center">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded hover:bg-gray-200 transition ${editor.isActive('bold') ? 'bg-gray-300 text-gray-900' : 'text-gray-600'}`}
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded hover:bg-gray-200 transition ${editor.isActive('italic') ? 'bg-gray-300 text-gray-900' : 'text-gray-600'}`}
          title="Italic"
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded hover:bg-gray-200 transition ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-300 text-gray-900' : 'text-gray-600'}`}
          title="Heading 2"
        >
          <Heading2 size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-1.5 rounded hover:bg-gray-200 transition ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-300 text-gray-900' : 'text-gray-600'}`}
          title="Heading 3"
        >
          <Heading3 size={16} />
        </button>
        <div className="w-[1px] h-5 bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded hover:bg-gray-200 transition ${editor.isActive('bulletList') ? 'bg-gray-300 text-gray-900' : 'text-gray-600'}`}
          title="Bullet List"
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded hover:bg-gray-200 transition ${editor.isActive('orderedList') ? 'bg-gray-300 text-gray-900' : 'text-gray-600'}`}
          title="Ordered List"
        >
          <ListOrdered size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded hover:bg-gray-200 transition ${editor.isActive('blockquote') ? 'bg-gray-300 text-gray-900' : 'text-gray-600'}`}
          title="Quote"
        >
          <Quote size={16} />
        </button>
        <div className="w-[1px] h-5 bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded hover:bg-gray-200 transition text-gray-600 disabled:opacity-30"
          title="Undo"
        >
          <Undo size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded hover:bg-gray-200 transition text-gray-600 disabled:opacity-30"
          title="Redo"
        >
          <Redo size={16} />
        </button>
      </div>
    );
  };

  return (
    <div className="border border-gray-300 rounded-lg focus-within:ring-1 focus-within:ring-red-600 focus-within:border-red-600 overflow-hidden bg-white">
      <MenuBar />
      <EditorContent editor={editor} />
    </div>
  );
}
