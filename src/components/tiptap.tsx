'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
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
  Loader2
} from 'lucide-react';
import { useEffect, useState } from 'react';
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
      // Only flag words as typos if they are known typos in dictionary
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

export default function TiptapEditor({ value, onChange }: TiptapProps) {
  const [spellCheckResults, setSpellCheckResults] = useState<SpellCheckResult[]>([]);
  const [showSpellModal, setShowSpellModal] = useState(false);
  const [spellStatusMessage, setSpellStatusMessage] = useState('');
  const [spellLoading, setSpellLoading] = useState(false);

  // Image Upload Modal State
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageCaptionInput, setImageCaptionInput] = useState('');
  const [imageUploadError, setImageUploadError] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit,
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
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[300px] px-4 py-3',
        spellcheck: 'true',
        lang: 'bn',
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

  const handleRunSpellCheck = async () => {
    if (!editor) return;
    const plainText = editor.getText();
    if (!plainText.trim()) return;

    setSpellLoading(true);
    setShowSpellModal(true);
    setSpellStatusMessage('বাংলাদেশ সরকার (spell.bangla.gov.bd) ও এআই মডেলের মাধ্যমে পরীক্ষা করা হচ্ছে...');

    try {
      const res = await fetch('/api/bangla-spellcheck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: plainText }),
      });
      const data = await res.json();

      let results: SpellCheckResult[] = [];
      if (data.results) {
        results = data.results;
      } else {
        results = checkBanglaTextSpelling(plainText);
      }

      setSpellCheckResults(results);
      if (results.length === 0) {
        setSpellStatusMessage('সবগুলো বাংলা শব্দ সঠিক মনে হচ্ছে! কোনো ভুল পাওয়া যায়নি।');
      } else {
        setSpellStatusMessage(`${results.length} টি ভুল বানান চিহ্নিত করা হয়েছে:`);
      }
    } catch (e) {
      const results = checkBanglaTextSpelling(plainText);
      setSpellCheckResults(results);
      setSpellStatusMessage(`${results.length} টি ভুল বানান চিহ্নিত করা হয়েছে:`);
    } finally {
      setSpellLoading(false);
    }
  };

  const handleApplySuggestion = (originalWord: string, replacement: string) => {
    if (!editor) return;
    const currentHTML = editor.getHTML();
    const updatedHTML = currentHTML.replaceAll(originalWord, replacement);
    editor.commands.setContent(updatedHTML);
    onChange(updatedHTML);

    setSpellCheckResults((prev) => prev.filter((r) => r.word !== originalWord));
  };

  // Image Upload Handlers
  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    setImageUploadError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        insertImageToEditor(data.url, imageCaptionInput);
        setShowImageModal(false);
        setImageUrlInput('');
        setImageCaptionInput('');
      } else {
        setImageUploadError(data.error || 'ছবি আপলোড করতে সমস্যা হয়েছে।');
      }
    } catch (err) {
      setImageUploadError('নেটওয়ার্ক ত্রুটি। আবার চেষ্টা করুন।');
    } finally {
      setImageUploading(false);
    }
  };

  const handleInsertUrlImage = () => {
    if (!imageUrlInput.trim()) {
      setImageUploadError('একটি বৈধ ইমেজের URL লিখুন');
      return;
    }
    insertImageToEditor(imageUrlInput.trim(), imageCaptionInput);
    setShowImageModal(false);
    setImageUrlInput('');
    setImageCaptionInput('');
  };

  const insertImageToEditor = (src: string, alt?: string) => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .setImage({ src, alt: alt || 'সংবাদ চিত্র' })
      .run();
  };

  const MenuBar = () => {
    return (
      <div className="border-b border-gray-300 bg-gray-50 p-2 flex flex-wrap gap-1 rounded-t-lg items-center justify-between">
        <div className="flex items-center gap-1 flex-wrap">
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

          {/* Add Image Button */}
          <button
            type="button"
            onClick={() => {
              setImageUploadError('');
              setShowImageModal(true);
            }}
            className="flex items-center gap-1 p-1.5 px-2 rounded hover:bg-blue-50 text-blue-700 font-medium text-xs border border-blue-200 transition"
            title="খবরের ভেতরে ছবি যোগ করুন"
          >
            <ImageIcon size={15} />
            <span>ছবি যোগ করুন</span>
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

        {/* Live Bangla Spell Check Action Button */}
        <button
          type="button"
          onClick={handleRunSpellCheck}
          className="inline-flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1.5 rounded border border-red-200 transition shadow-2xs"
          title="বাংলা বানান পরীক্ষা ও সংশোধন"
        >
          <CheckCheck size={15} />
          <span>বানান পরীক্ষা (Spell Check)</span>
        </button>
      </div>
    );
  };

  return (
    <div className="border border-gray-300 rounded-lg focus-within:ring-1 focus-within:ring-red-600 focus-within:border-red-600 overflow-hidden bg-white relative">
      <MenuBar />
      <EditorContent editor={editor} />

      {/* Image Insert / Upload Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm sm:text-base">
                <ImageIcon size={20} className="text-blue-400" />
                <span>খবরের ভেতরে ছবি যোগ করুন</span>
              </div>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-full hover:bg-gray-800 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {imageUploadError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-2.5 rounded-lg flex items-center gap-2">
                  <AlertTriangle size={16} className="shrink-0" />
                  <span>{imageUploadError}</span>
                </div>
              )}

              {/* Option A: Direct Device Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700">১. ডিভাইস থেকে ছবি আপলোড করুন</label>
                <label className="border-2 border-dashed border-blue-200 hover:border-blue-500 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer bg-blue-50/40 transition">
                  {imageUploading ? (
                    <div className="flex items-center gap-2 text-blue-700 text-xs font-bold py-2">
                      <Loader2 size={18} className="animate-spin" />
                      <span>ছবি আপলোড হচ্ছে...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-center py-1">
                      <Upload size={22} className="text-blue-600 mb-1" />
                      <span className="text-xs font-bold text-gray-800">ছবি নির্বাচন করতে ক্লিক করুন</span>
                      <span className="text-[11px] text-gray-500">JPG, PNG, WEBP ইত্যাদি সাপোর্টেড</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    disabled={imageUploading}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex items-center gap-2 my-2 text-gray-400 text-xs font-medium">
                <div className="h-[1px] bg-gray-200 flex-1" />
                <span>অথবা</span>
                <div className="h-[1px] bg-gray-200 flex-1" />
              </div>

              {/* Option B: Image URL */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700">২. ছবি ওয়েবসাইট লিংক (URL)</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon size={14} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="url"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleInsertUrlImage}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition shrink-0"
                  >
                    যোগ করুন
                  </button>
                </div>
              </div>

              {/* Optional Caption Field */}
              <div className="pt-2 border-t border-gray-100">
                <label className="block text-xs font-medium text-gray-600 mb-1">ছবি বিবরণ / ক্যাপশন (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={imageCaptionInput}
                  onChange={(e) => setImageCaptionInput(e.target.value)}
                  placeholder="ইমেজের বর্ণনা লিখুন"
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
              </div>
            </div>

            <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold px-4 py-2 rounded-lg transition"
              >
                বাতিল করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bangla Contextual Spell Check Modal */}
      {showSpellModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="bg-red-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm sm:text-base">
                <CheckCheck size={20} />
                <span>বাংলা বানান পরীক্ষা ও অটো-সাজেশন</span>
              </div>
              <button
                type="button"
                onClick={() => setShowSpellModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-full hover:bg-red-700 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[420px] overflow-y-auto">
              <p className="text-xs sm:text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2 flex items-center gap-1.5">
                <AlertTriangle size={16} className="text-amber-500 shrink-0" />
                <span>{spellStatusMessage}</span>
              </p>

              {spellCheckResults.length > 0 ? (
                <div className="space-y-3">
                  {spellCheckResults.map((item, idx) => (
                    <div key={idx} className="p-3 bg-red-50/60 rounded-lg border border-red-100 space-y-2">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="font-bold text-red-600">
                          ভুল শব্দ: &quot;{item.word}&quot;
                        </span>
                        <span className="text-gray-400 text-[11px]">লেভেনস্টাইন মডেল সাজেশন</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-xs text-gray-600 font-medium">প্রস্তাবিত সঠিক রূপ:</span>
                        {item.suggestions.length > 0 ? (
                          item.suggestions.map((sug, sIdx) => (
                            <button
                              key={sIdx}
                              type="button"
                              onClick={() => handleApplySuggestion(item.word, sug)}
                              className="bg-white hover:bg-green-600 hover:text-white text-gray-800 text-xs font-bold px-2.5 py-1 rounded border border-gray-300 hover:border-green-600 transition shadow-2xs"
                            >
                              {sug} ✓
                            </button>
                          ))
                        ) : (
                          <span className="text-xs text-amber-600 font-medium">অপরিচিত শব্দ</span>
                        )}
                        <button
                          type="button"
                          onClick={() => setSpellCheckResults((prev) => prev.filter((r) => r.word !== item.word))}
                          className="text-xs text-gray-500 hover:text-gray-700 underline ml-auto"
                        >
                          উপেক্ষা করুন
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 text-sm">
                  সবগুলো শব্দই সঠিক পাওয়া গেছে।
                </div>
              )}
            </div>

            <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSpellModal(false)}
                className="bg-gray-800 hover:bg-gray-900 text-white text-xs font-bold px-4 py-2 rounded-lg transition"
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
