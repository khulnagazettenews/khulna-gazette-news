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
  Loader2,
  Check,
  Search
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

  // WordPress Style Media Modal States
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [activeMediaTab, setActiveMediaTab] = useState<'upload' | 'library'>('upload');
  const [activeSidebarMenu, setActiveSidebarMenu] = useState<'add_media' | 'gallery' | 'featured'>('add_media');
  const [mediaList, setMediaList] = useState<{ id: string; url: string; name: string }[]>([]);
  const [loadingMediaList, setLoadingMediaList] = useState(false);
  const [selectedMediaUrl, setSelectedMediaUrl] = useState<string>('');
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaCaptionInput, setMediaCaptionInput] = useState('');
  const [mediaAltInput, setMediaAltInput] = useState('');

  const fetchMediaLibrary = async () => {
    setLoadingMediaList(true);
    try {
      const res = await fetch('/api/media');
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setMediaList(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMediaList(false);
    }
  };

  const handleOpenMediaModal = () => {
    setImageUploadError('');
    setSelectedMediaUrl('');
    setMediaCaptionInput('');
    setMediaAltInput('');
    setShowMediaModal(true);
    fetchMediaLibrary();
  };

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

  // Image Upload Handler inside WordPress Modal
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
        setSelectedMediaUrl(data.url);
        // Add to media list & switch tab to media library
        setMediaList((prev) => [{ id: data.url, url: data.url, name: file.name }, ...prev]);
        setActiveMediaTab('library');
      } else {
        setImageUploadError(data.error || 'ছবি আপলোড করতে সমস্যা হয়েছে।');
      }
    } catch (err) {
      setImageUploadError('নেটওয়ার্ক ত্রুটি। আবার চেষ্টা করুন।');
    } finally {
      setImageUploading(false);
    }
  };

  const insertSelectedMediaIntoPost = () => {
    if (!selectedMediaUrl || !editor) return;
    editor
      .chain()
      .focus()
      .setImage({ src: selectedMediaUrl, alt: mediaAltInput || mediaCaptionInput || 'সংবাদ চিত্র' })
      .run();
    setShowMediaModal(false);
    setSelectedMediaUrl('');
  };

  const filteredMediaList = mediaList.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    <div className="space-y-2">
      {/* WordPress Exact "Add Media" Button Above Editor Toolbar */}
      <div className="flex items-center justify-between pb-1">
        <button
          type="button"
          onClick={handleOpenMediaModal}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-gray-50 text-blue-700 font-medium text-xs sm:text-sm border border-blue-600 hover:border-blue-700 rounded shadow-2xs transition group"
        >
          <span className="flex items-center text-blue-600 group-hover:text-blue-700">
            <ImageIcon size={16} className="mr-0.5" />
          </span>
          <span className="font-semibold">Add Media</span>
        </button>
      </div>

      <div className="border border-gray-300 rounded-lg focus-within:ring-1 focus-within:ring-red-600 focus-within:border-red-600 overflow-hidden bg-white relative">
        <MenuBar />
        <EditorContent editor={editor} />
      </div>

      {/* WordPress Authentic Modal Window */}
      {showMediaModal && (
        <div className="fixed inset-0 z-50 bg-black/65 flex items-center justify-center p-2 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-md shadow-2xl border border-gray-400 w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden text-gray-800 font-sans">
            {/* Modal Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0">
              <h2 className="text-xl font-bold text-gray-800">Add media</h2>
              <button
                type="button"
                onClick={() => setShowMediaModal(false)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded hover:bg-gray-100 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body Grid */}
            <div className="flex flex-1 overflow-hidden">
              {/* Left Sidebar Menu */}
              <div className="w-48 bg-gray-50 border-r border-gray-200 py-3 shrink-0 hidden md:block">
                <div className="text-xs font-semibold text-gray-500 px-4 mb-2 uppercase tracking-wider">Actions</div>
                <button
                  type="button"
                  onClick={() => setActiveSidebarMenu('add_media')}
                  className={`w-full text-left px-4 py-2 text-xs font-semibold transition flex items-center justify-between ${
                    activeSidebarMenu === 'add_media'
                      ? 'text-blue-700 bg-white border-l-4 border-blue-600 shadow-2xs'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Add media
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSidebarMenu('gallery')}
                  className={`w-full text-left px-4 py-2 text-xs font-semibold transition ${
                    activeSidebarMenu === 'gallery'
                      ? 'text-blue-700 bg-white border-l-4 border-blue-600 shadow-2xs'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Create gallery
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSidebarMenu('featured')}
                  className={`w-full text-left px-4 py-2 text-xs font-semibold transition ${
                    activeSidebarMenu === 'featured'
                      ? 'text-blue-700 bg-white border-l-4 border-blue-600 shadow-2xs'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Featured image
                </button>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col overflow-hidden bg-white">
                {/* Top Tabs Bar */}
                <div className="border-b border-gray-200 px-4 flex items-center justify-between bg-white shrink-0">
                  <div className="flex space-x-1 font-medium text-sm">
                    <button
                      type="button"
                      onClick={() => setActiveMediaTab('upload')}
                      className={`px-4 py-3 border-b-2 text-xs sm:text-sm font-semibold transition ${
                        activeMediaTab === 'upload'
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Upload files
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveMediaTab('library')}
                      className={`px-4 py-3 border-b-2 text-xs sm:text-sm font-semibold transition ${
                        activeMediaTab === 'library'
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Media Library
                    </button>
                  </div>

                  {activeMediaTab === 'library' && (
                    <div className="relative py-2">
                      <Search size={14} className="absolute left-2.5 top-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search media items..."
                        className="pl-8 pr-3 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 w-48 sm:w-64"
                      />
                    </div>
                  )}
                </div>

                {/* Tab 1: Upload Files */}
                {activeMediaTab === 'upload' && (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white text-center">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 max-w-lg w-full flex flex-col items-center justify-center space-y-4 bg-gray-50/50">
                      <div className="p-4 bg-blue-50 text-blue-600 rounded-full">
                        <Upload size={36} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg font-bold text-gray-800">Drop files to upload</h3>
                        <p className="text-xs text-gray-500">or click button below to select files from your computer</p>
                      </div>

                      <label className="bg-white hover:bg-gray-100 text-blue-700 font-semibold border border-blue-600 px-5 py-2 rounded text-xs sm:text-sm cursor-pointer shadow-2xs transition inline-block">
                        {imageUploading ? 'Uploading Image...' : 'Select Files'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileUpload}
                          disabled={imageUploading}
                          className="hidden"
                        />
                      </label>

                      {imageUploadError && (
                        <p className="text-xs text-red-600 font-semibold">{imageUploadError}</p>
                      )}

                      <p className="text-[11px] text-gray-400 pt-4 border-t border-gray-200 w-full">
                        Maximum upload file size: 64 MB.
                      </p>
                    </div>
                  </div>
                )}

                {/* Tab 2: Media Library */}
                {activeMediaTab === 'library' && (
                  <div className="flex-1 flex overflow-hidden">
                    {/* Media Grid */}
                    <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                      {loadingMediaList ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                          <Loader2 size={24} className="animate-spin text-blue-600" />
                          <span className="text-xs font-semibold">Loading Media Library...</span>
                        </div>
                      ) : filteredMediaList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                          <ImageIcon size={40} className="mb-2 opacity-50" />
                          <p className="text-xs font-semibold">No media items found in library.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                          {filteredMediaList.map((item) => {
                            const isSelected = selectedMediaUrl === item.url;
                            return (
                              <div
                                key={item.id}
                                onClick={() => setSelectedMediaUrl(item.url)}
                                className={`relative aspect-square rounded border-2 overflow-hidden cursor-pointer group transition bg-gray-200 ${
                                  isSelected ? 'border-blue-600 ring-2 ring-blue-600/30' : 'border-gray-200 hover:border-gray-400'
                                }`}
                              >
                                <img
                                  src={item.url}
                                  alt={item.name}
                                  className="w-full h-full object-cover transition transform group-hover:scale-105"
                                  loading="lazy"
                                />
                                {isSelected && (
                                  <div className="absolute top-1 right-1 bg-blue-600 text-white rounded-full p-1 shadow-md">
                                    <Check size={12} strokeWidth={3} />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Right Attachment Details Sidebar */}
                    {selectedMediaUrl && (
                      <div className="w-72 bg-gray-100 border-l border-gray-200 p-4 overflow-y-auto shrink-0 space-y-4 text-xs">
                        <h4 className="font-bold text-gray-700 uppercase tracking-wider text-[11px] border-b border-gray-300 pb-2">
                          Attachment Details
                        </h4>

                        <div className="aspect-video w-full rounded border border-gray-300 overflow-hidden bg-white shadow-2xs">
                          <img src={selectedMediaUrl} alt="Selected" className="w-full h-full object-cover" />
                        </div>

                        <div className="space-y-3 pt-2">
                          <div>
                            <label className="block font-semibold text-gray-700 mb-1">Alt Text</label>
                            <input
                              type="text"
                              value={mediaAltInput}
                              onChange={(e) => setMediaAltInput(e.target.value)}
                              placeholder="Alternative text for image"
                              className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
                            />
                          </div>

                          <div>
                            <label className="block font-semibold text-gray-700 mb-1">Caption</label>
                            <textarea
                              value={mediaCaptionInput}
                              onChange={(e) => setMediaCaptionInput(e.target.value)}
                              placeholder="Image caption"
                              rows={2}
                              className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
                            />
                          </div>

                          <div>
                            <label className="block font-semibold text-gray-700 mb-1">File URL</label>
                            <input
                              type="text"
                              readOnly
                              value={selectedMediaUrl}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-[11px] bg-gray-200 text-gray-600 select-all"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-100 border-t border-gray-200 px-4 py-3 flex items-center justify-between shrink-0">
              <div className="text-xs text-gray-500 font-medium">
                {selectedMediaUrl ? '1 item selected' : 'Select an image to insert into post'}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowMediaModal(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!selectedMediaUrl}
                  onClick={insertSelectedMediaIntoPost}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded text-xs transition disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                >
                  Insert into post
                </button>
              </div>
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
