'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Link } from '@tiptap/extension-link';
import { TextAlign } from '@tiptap/extension-text-align';
import { Underline } from '@tiptap/extension-underline';
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon,
  List, 
  ListOrdered, 
  Heading1,
  Heading2, 
  Heading3, 
  Undo, 
  Redo, 
  Quote,
  CheckCheck,
  X,
  AlertTriangle,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  Unlink,
  Loader2,
  Check,
  Search,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Strikethrough,
  Minus,
  Palette,
  Eraser,
  HelpCircle,
  MoreHorizontal,
  SlidersHorizontal,
  Code
} from 'lucide-react';
import { useEffect, useState } from 'react';
import MediaModal from '@/components/media-modal';
import { checkBanglaTextSpelling, checkBanglaWordSpelling, SpellCheckResult, BANGLA_COMMON_TYPOS } from '@/lib/bangla-spellchecker';

// ProseMirror Real-Time Live Red Squiggly Underline Plugin for Bangla
const BanglaSpellCheckPluginKey = new PluginKey('banglaSpellCheckLive');

function getDecorations(doc: any) {
  const decorations: Decoration[] = [];
  doc.descendants((node: any, pos: number) => {
    if (!node.isText) return;

    const text = node.text || '';
    const regex = /[\u0980-\u09FF]+/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const word = match[0];
      const start = pos + match.index;
      const end = start + word.length;

      const result = checkBanglaWordSpelling(word);
      if (!result.isCorrect && result.suggestions.length > 0 && BANGLA_COMMON_TYPOS[word]) {
        decorations.push(
          Decoration.inline(start, end, {
            class: 'bangla-spell-error',
            'data-word': word,
          })
        );
      }
    }
  });

  return DecorationSet.create(doc, decorations);
}

export const BanglaSpellCheckLiveExtension = Extension.create({
  name: 'banglaSpellCheckLive',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: BanglaSpellCheckPluginKey,
        state: {
          init(_, { doc }) {
            return getDecorations(doc);
          },
          apply(tr, oldState) {
            return tr.docChanged ? getDecorations(tr.doc) : oldState;
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },
});

interface TiptapProps {
  value: string;
  onChange: (val: string) => void;
}

const WORDPRESS_COLOR_PALETTE = [
  '#000000', '#843c0c', '#333300', '#003300', '#003366', '#000080', '#333399', '#333333',
  '#800000', '#ff6600', '#808000', '#008000', '#008080', '#0000ff', '#666699', '#808080',
  '#ff0000', '#ff9900', '#99cc00', '#339966', '#33cccc', '#3366ff', '#800080', '#999999',
  '#ff00ff', '#ffcc00', '#ffff00', '#00ff00', '#00ffff', '#00ccff', '#993366', '#ffffff',
  '#ff99cc', '#ffcc99', '#ffff99', '#ccffcc', '#ccffff', '#99ccff', '#cc99ff',
];

const SPECIAL_SYMBOLS = [
  '©', '®', '™', '€', '£', '¥', '°', '±', 'µ', '¶', '•', '–', '—', '«', '»', '“', '”', '…', 'Ω', '৳'
];

export default function TiptapEditor({ value, onChange }: TiptapProps) {
  const [spellCheckResults, setSpellCheckResults] = useState<SpellCheckResult[]>([]);
  const [showSpellModal, setShowSpellModal] = useState(false);
  const [spellStatusMessage, setSpellStatusMessage] = useState('');
  const [spellLoading, setSpellLoading] = useState(false);

  // WordPress Style Media Modal States
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [editorMode, setEditorMode] = useState<'visual' | 'code'>('visual');
  const [showKitchenSink, setShowKitchenSink] = useState(true);

  // Popovers
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showSymbolPicker, setShowSymbolPicker] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto my-4 shadow-sm border border-gray-200 mx-auto block',
        },
      }),
      BanglaSpellCheckLiveExtension,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[350px] px-4 py-3 bg-white text-gray-800 text-sm leading-relaxed',
        spellcheck: 'true',
        lang: 'bn',
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return <div className="border border-gray-300 rounded p-4 text-center text-xs text-gray-400">অপেক্ষা করুন...</div>;
  }

  const handleRunSpellCheck = async () => {
    if (!editor) return;
    const plainText = editor.getText();
    if (!plainText.trim()) return;

    setSpellLoading(true);
    setShowSpellModal(true);
    setSpellStatusMessage('বানান পরীক্ষা চলছে...');

    try {
      const results = checkBanglaTextSpelling(plainText);
      setSpellCheckResults(results);
      if (results.length === 0) {
        setSpellStatusMessage('সব শব্দ সঠিক মনে হচ্ছে!');
      } else {
        setSpellStatusMessage(`${results.length}টি শব্দের সম্ভাব্য সংশোধনী পাওয়া গেছে`);
      }
    } catch (e) {
      setSpellStatusMessage('পরীক্ষা করতে ব্যর্থ হয়েছে');
    } finally {
      setSpellLoading(false);
    }
  };

  const handleReplaceWord = (originalWord: string, replacement: string) => {
    if (!editor) return;
    const currentHtml = editor.getHTML();
    const updatedHtml = currentHtml.replace(new RegExp(originalWord, 'g'), replacement);
    editor.commands.setContent(updatedHtml);
    onChange(updatedHtml);
    setSpellCheckResults((prev) => prev.filter((r) => r.word !== originalWord));
  };

  const setParagraphFormat = (fmt: string) => {
    if (!editor) return;
    if (fmt === 'p') editor.chain().focus().setParagraph().run();
    else if (fmt === 'h1') editor.chain().focus().toggleHeading({ level: 1 }).run();
    else if (fmt === 'h2') editor.chain().focus().toggleHeading({ level: 2 }).run();
    else if (fmt === 'h3') editor.chain().focus().toggleHeading({ level: 3 }).run();
  };

  const getCurrentFormat = () => {
    if (!editor) return 'p';
    if (editor.isActive('heading', { level: 1 })) return 'h1';
    if (editor.isActive('heading', { level: 2 })) return 'h2';
    if (editor.isActive('heading', { level: 3 })) return 'h3';
    return 'p';
  };

  const MenuBar = () => {
    return (
      <div className="border-b border-gray-300 bg-gray-100/80 text-gray-700 font-sans select-none relative">
        {/* Row 1: Authentic WordPress Classic Toolbar */}
        <div className="p-1.5 flex flex-wrap items-center gap-1 border-b border-gray-200">
          {/* Paragraph Dropdown */}
          <select
            value={getCurrentFormat()}
            onChange={(e) => setParagraphFormat(e.target.value)}
            className="border border-gray-300 bg-white text-gray-700 rounded px-2 py-1 text-xs outline-none focus:border-blue-600 font-medium cursor-pointer shadow-2xs"
          >
            <option value="p">Paragraph</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
          </select>

          <div className="w-[1px] h-4 bg-gray-300 mx-0.5" />

          {/* Bold */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1 rounded border transition ${
              editor.isActive('bold')
                ? 'bg-gray-300 text-black border-gray-400 font-bold'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-200'
            }`}
            title="Bold (Ctrl+B)"
          >
            <Bold size={14} strokeWidth={2.5} />
          </button>

          {/* Italic */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1 rounded border transition ${
              editor.isActive('italic')
                ? 'bg-gray-300 text-black border-gray-400'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-200'
            }`}
            title="Italic (Ctrl+I)"
          >
            <Italic size={14} />
          </button>

          {/* Underline */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-1 rounded border transition ${
              editor.isActive('underline')
                ? 'bg-gray-300 text-black border-gray-400 font-bold'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-200'
            }`}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon size={14} />
          </button>

          <div className="w-[1px] h-4 bg-gray-300 mx-0.5" />

          {/* Bulleted List */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1 rounded border transition ${
              editor.isActive('bulletList')
                ? 'bg-gray-300 text-black border-gray-400'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-200'
            }`}
            title="Bulleted list"
          >
            <List size={14} />
          </button>

          {/* Numbered List */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1 rounded border transition ${
              editor.isActive('orderedList')
                ? 'bg-gray-300 text-black border-gray-400'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-200'
            }`}
            title="Numbered list"
          >
            <ListOrdered size={14} />
          </button>

          {/* Blockquote */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1 rounded border transition ${
              editor.isActive('blockquote')
                ? 'bg-gray-300 text-black border-gray-400'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-200'
            }`}
            title="Blockquote"
          >
            <Quote size={14} />
          </button>

          <div className="w-[1px] h-4 bg-gray-300 mx-0.5" />

          {/* Alignments */}
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-1 rounded border transition ${
              editor.isActive({ textAlign: 'left' })
                ? 'bg-gray-300 text-black border-gray-400'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-200'
            }`}
            title="Align left"
          >
            <AlignLeft size={14} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-1 rounded border transition ${
              editor.isActive({ textAlign: 'center' })
                ? 'bg-gray-300 text-black border-gray-400'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-200'
            }`}
            title="Align center"
          >
            <AlignCenter size={14} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-1 rounded border transition ${
              editor.isActive({ textAlign: 'right' })
                ? 'bg-gray-300 text-black border-gray-400'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-200'
            }`}
            title="Align right"
          >
            <AlignRight size={14} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={`p-1 rounded border transition ${
              editor.isActive({ textAlign: 'justify' })
                ? 'bg-gray-300 text-black border-gray-400'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-200'
            }`}
            title="Align justify"
          >
            <AlignJustify size={14} />
          </button>

          <div className="w-[1px] h-4 bg-gray-300 mx-0.5" />

          {/* Insert / Edit Link */}
          <button
            type="button"
            onClick={() => {
              const previousUrl = editor.getAttributes('link').href || '';
              const url = prompt('Enter link URL:', previousUrl);
              if (url === null) return;
              if (url === '') {
                editor.chain().focus().extendMarkRange('link').unsetLink().run();
                return;
              }
              editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
            }}
            className={`p-1 rounded border transition ${
              editor.isActive('link')
                ? 'bg-gray-300 text-black border-gray-400'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-200'
            }`}
            title="Insert/edit link"
          >
            <LinkIcon size={14} />
          </button>

          {/* Remove Link */}
          {editor.isActive('link') && (
            <button
              type="button"
              onClick={() => editor.chain().focus().unsetLink().run()}
              className="p-1 rounded border border-red-300 bg-red-50 hover:bg-red-100 text-red-600 transition"
              title="Remove link"
            >
              <Unlink size={14} />
            </button>
          )}

          {/* Read More / Horizontal line */}
          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-200 transition text-gray-700"
            title="Insert Read More tag"
          >
            <MoreHorizontal size={14} />
          </button>

          {/* Toolbar Toggle (Kitchen Sink) */}
          <button
            type="button"
            onClick={() => setShowKitchenSink((s) => !s)}
            className={`p-1 rounded border transition ${
              showKitchenSink
                ? 'bg-gray-300 text-black border-gray-400 shadow-inner'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-200'
            }`}
            title="Toolbar Toggle"
          >
            <SlidersHorizontal size={14} />
          </button>
        </div>

        {/* Row 2: Secondary Kitchen Sink Row */}
        {showKitchenSink && (
          <div className="p-1.5 flex flex-wrap items-center gap-1 bg-gray-100">
            {/* Strikethrough */}
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`p-1 rounded border transition ${
                editor.isActive('strike')
                  ? 'bg-gray-300 text-black border-gray-400'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-200'
              }`}
              title="Strikethrough"
            >
              <Strikethrough size={14} />
            </button>

            {/* Horizontal line */}
            <button
              type="button"
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-200 transition text-gray-700"
              title="Horizontal line"
            >
              <Minus size={14} />
            </button>

            {/* Text Color Picker Toggle (WordPress Style) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowColorPicker((prev) => !prev);
                  setShowSymbolPicker(false);
                }}
                className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-200 transition text-gray-700 flex items-center gap-0.5"
                title="Text color"
              >
                <div className="flex flex-col items-center leading-none px-0.5">
                  <span className="font-bold text-xs font-serif leading-none">A</span>
                  <span className="w-3.5 h-0.5 bg-gray-900 rounded-full mt-0.5" />
                </div>
                <span className="text-[9px] text-gray-400">▼</span>
              </button>

              {showColorPicker && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-2xl p-2.5 z-50 animate-in fade-in duration-100 w-[215px] space-y-2">
                  <div className="grid grid-cols-8 gap-1">
                    {WORDPRESS_COLOR_PALETTE.map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        onClick={() => {
                          editor.chain().focus().setColor(hex).run();
                          setShowColorPicker(false);
                        }}
                        className="w-5 h-5 rounded-xs border border-gray-300 hover:scale-110 transition shadow-2xs cursor-pointer"
                        style={{ backgroundColor: hex }}
                        title={hex}
                      />
                    ))}
                    {/* Clear / Reset X box */}
                    <button
                      type="button"
                      onClick={() => {
                        editor.chain().focus().unsetColor().run();
                        setShowColorPicker(false);
                      }}
                      className="w-5 h-5 rounded-xs border border-gray-300 bg-gray-50 hover:bg-gray-200 transition flex items-center justify-center text-gray-500 font-bold text-xs"
                      title="Clear Color"
                    >
                      <X size={12} />
                    </button>
                  </div>

                  <div className="border-t border-gray-200 pt-1.5 flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-700 cursor-pointer flex items-center gap-1.5 hover:text-blue-600">
                      <span>Custom...</span>
                      <input
                        type="color"
                        onChange={(e) => {
                          editor.chain().focus().setColor(e.target.value).run();
                          setShowColorPicker(false);
                        }}
                        className="w-5 h-5 border-none bg-transparent cursor-pointer rounded overflow-hidden"
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Clear formatting */}
            <button
              type="button"
              onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
              className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-200 transition text-gray-700"
              title="Clear formatting"
            >
              <Eraser size={14} />
            </button>

            <div className="w-[1px] h-4 bg-gray-300 mx-0.5" />

            {/* Special Character Picker Toggle */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowSymbolPicker((prev) => !prev);
                  setShowColorPicker(false);
                }}
                className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-200 transition text-gray-700 font-serif font-bold text-xs min-w-[26px] text-center"
                title="Special character"
              >
                Ω
              </button>

              {showSymbolPicker && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg p-2 z-50 grid grid-cols-5 gap-1 animate-in fade-in duration-100 w-44">
                  {SPECIAL_SYMBOLS.map((sym) => (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => {
                        editor.chain().focus().insertContent(sym).run();
                        setShowSymbolPicker(false);
                      }}
                      className="p-1 hover:bg-blue-50 hover:text-blue-600 rounded text-center text-xs font-semibold"
                    >
                      {sym}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-[1px] h-4 bg-gray-300 mx-0.5" />

            {/* Undo */}
            <button
              type="button"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-200 transition text-gray-700 disabled:opacity-40"
              title="Undo"
            >
              <Undo size={14} />
            </button>

            {/* Redo */}
            <button
              type="button"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-200 transition text-gray-700 disabled:opacity-40"
              title="Redo"
            >
              <Redo size={14} />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {/* WordPress Header Bar: Add Media + Spell Check (Left) & Visual / Code Tabs (Right) */}
      <div className="flex items-center justify-between pb-1 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {/* Add Media Button */}
          <button
            type="button"
            onClick={() => setShowMediaModal(true)}
            className="tiptap-media-btn inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-50 text-blue-700 font-semibold text-xs border border-blue-600 rounded shadow-2xs transition"
          >
            <ImageIcon size={15} className="text-blue-600" />
            <span>Add Media</span>
          </button>

          {/* Prominent Bangla Spell Check Button */}
          <button
            type="button"
            onClick={handleRunSpellCheck}
            className="inline-flex items-center gap-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs px-3 py-1.5 rounded border border-purple-300 transition shadow-2xs"
            title="বাংলা বানান পরীক্ষা ও অটো-সংশোধন"
          >
            <CheckCheck size={16} className="text-purple-600" />
            <span>বানান পরীক্ষা (Spell Check)</span>
          </button>
        </div>

        {/* Visual / Text (Code) Mode Switch */}
        <div className="flex text-xs font-semibold border border-gray-300 rounded overflow-hidden shadow-2xs">
          <button
            type="button"
            onClick={() => setEditorMode('visual')}
            className={`px-3 py-1 transition ${
              editorMode === 'visual' ? 'bg-blue-600 text-white font-bold' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Visual
          </button>
          <button
            type="button"
            onClick={() => setEditorMode('code')}
            className={`px-3 py-1 transition ${
              editorMode === 'code' ? 'bg-blue-600 text-white font-bold' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Code
          </button>
        </div>
      </div>

      {/* Main Editor Body */}
      <div className="border border-gray-300 rounded overflow-hidden bg-white shadow-2xs relative">
        {editorMode === 'visual' ? (
          <>
            <MenuBar />
            <EditorContent editor={editor} />
          </>
        ) : (
          <textarea
            rows={16}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              if (editor) editor.commands.setContent(e.target.value);
            }}
            className="w-full font-mono text-xs p-4 bg-gray-900 text-green-400 focus:outline-none leading-relaxed"
            placeholder="<html>Enter raw HTML or code...</html>"
          />
        )}
      </div>

      {/* Media Modal Component for Tiptap */}
      <MediaModal
        isOpen={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        mode="insert"
        title="Add media"
        actionButtonText="Insert into post"
        onSelectMedia={(data) => {
          if (data.url && editor) {
            editor
              .chain()
              .focus()
              .setImage({ src: data.url, alt: data.alt || data.caption || 'সংবাদ চিত্র' })
              .run();
          }
        }}
      />

      {/* Bangla Contextual Spell Check Modal */}
      {showSpellModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="bg-purple-700 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm sm:text-base">
                <CheckCheck size={20} />
                <span>বাংলা বানান পরীক্ষা ও অটো-সাজেশন</span>
              </div>
              <button
                type="button"
                onClick={() => setShowSpellModal(false)}
                className="hover:bg-purple-800 p-1 rounded transition text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 max-h-[70vh] overflow-y-auto space-y-4">
              {spellLoading ? (
                <div className="flex items-center justify-center py-8 text-gray-500 gap-2">
                  <Loader2 size={24} className="animate-spin text-purple-600" />
                  <span className="text-xs font-semibold">বানান পরীক্ষা করা হচ্ছে...</span>
                </div>
              ) : spellCheckResults.length === 0 ? (
                <div className="text-center py-6 text-green-700 bg-green-50 rounded-lg border border-green-200 space-y-2">
                  <CheckCheck size={36} className="mx-auto text-green-600" />
                  <p className="font-bold text-sm">চমৎকার! কোনো বানান ভুল পাওয়া যায়নি।</p>
                  <p className="text-xs text-gray-600">আপনার সংবাদের সব বাংলা শব্দ সঠিক মনে হচ্ছে।</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-gray-600 font-semibold border-b border-gray-100 pb-2">
                    {spellStatusMessage}:
                  </p>

                  <div className="space-y-2">
                    {spellCheckResults.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-red-600 text-sm bg-red-100 px-2 py-0.5 rounded">
                            {item.word}
                          </span>
                          <span className="text-[11px] text-gray-500">ভুল বানান হতে পারে</span>
                        </div>

                        {item.suggestions.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[11px] text-gray-500 font-medium">সাজেশন (ক্লিক করে প্রতিস্থাপন করুন):</span>
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {item.suggestions.map((sug, sIdx) => (
                                <button
                                  key={sIdx}
                                  type="button"
                                  onClick={() => handleReplaceWord(item.word, sug)}
                                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-2.5 py-1 rounded text-xs transition shadow-2xs flex items-center gap-1"
                                >
                                  <span>{sug}</span>
                                  <Check size={12} />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-100 px-4 py-3 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSpellModal(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold px-4 py-1.5 rounded text-xs transition"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
