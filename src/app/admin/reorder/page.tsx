'use client';

import { useState, useEffect } from 'react';

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  featuredImage?: string | null;
  category?: { name: string; slug: string };
  publishedAt?: string | null;
}

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

export default function AdminReorderPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Manual sorting toggle
  const [manualSorting, setManualSorting] = useState<'yes' | 'no'>('yes');
  const [overrideOrderby, setOverrideOrderby] = useState<boolean>(false);

  // Range controls
  const [postRangeStart, setPostRangeStart] = useState<number>(1);
  const [postRangeEnd, setPostRangeEnd] = useState<number>(20);
  const [moveToRankInput, setMoveToRankInput] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Drag state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Fetch initial category list & initial news
  useEffect(() => {
    fetchCategoriesAndNews('');
  }, []);

  const fetchCategoriesAndNews = async (catSlug: string) => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/reorder?category=${catSlug || 'top_news'}`);
      const data = await res.json();

      if (res.ok) {
        setCategories(data.categories || []);
        setNewsList(data.news || []);
        if (!selectedCategory && data.categories && data.categories.length > 0) {
          // If no category explicitly selected yet, keep selectedCategory as passed or default
          if (catSlug) {
            setSelectedCategory(catSlug);
          }
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to fetch categories' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error connecting to server' });
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (catSlug: string) => {
    setSelectedCategory(catSlug);
    if (catSlug) {
      fetchCategoriesAndNews(catSlug);
    } else {
      setNewsList([]);
    }
  };

  // Drag and Drop
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const updated = [...newsList];
    const draggedItem = updated[draggedIndex];
    updated.splice(draggedIndex, 1);
    updated.splice(index, 0, draggedItem);

    setDraggedIndex(index);
    setNewsList(updated);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Item Selection
  const toggleSelectItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Move items to a specific rank
  const handleMoveToRank = () => {
    const targetRank = parseInt(moveToRankInput, 10);
    if (isNaN(targetRank) || targetRank < 1 || targetRank > newsList.length) {
      alert(`Please enter a valid rank between 1 and ${newsList.length}`);
      return;
    }

    if (selectedItems.length === 0) {
      alert('Please select one or multiple items to move by clicking on them.');
      return;
    }

    const itemsToMove = newsList.filter((item) => selectedItems.includes(item.id));
    const remainingItems = newsList.filter((item) => !selectedItems.includes(item.id));

    const insertIndex = targetRank - 1;
    const newOrder = [
      ...remainingItems.slice(0, insertIndex),
      ...itemsToMove,
      ...remainingItems.slice(insertIndex),
    ];

    setNewsList(newOrder);
    setMoveToRankInput('');
    setSelectedItems([]);
  };

  // Save Order
  const handleSaveOrder = async () => {
    if (!selectedCategory) return;
    setSaving(true);
    setMessage(null);
    try {
      const newsIds = newsList.map((n) => n.id);
      const res = await fetch('/api/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory,
          newsIds,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: data.message || 'News reordered successfully!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save order' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An error occurred while saving order.' });
    } finally {
      setSaving(false);
    }
  };

  // Reset Order
  const handleResetOrder = () => {
    if (confirm('Are you sure you want to reset order for this category? This cannot be undone!')) {
      if (selectedCategory) {
        fetchCategoriesAndNews(selectedCategory);
      }
    }
  };

  // Get name of selected category
  const selectedCatObj = categories.find((c) => c.slug === selectedCategory);
  const selectedCategoryName = selectedCatObj ? selectedCatObj.name : selectedCategory === 'top_news' ? 'টপ নিউজ (Top News)' : '';

  return (
    <div className="min-h-screen bg-[#f1f1f1] text-[#2c3338] font-sans -m-4 sm:-m-6 lg:-m-8 p-6 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Page Title Header matching WordPress UI */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-normal text-[#1d2327] tracking-tight mb-2">
            Manually rank your &quot;Posts&quot;
          </h1>
          <p className="text-sm text-[#50575e]">
            Select a taxonomy to sort Posts.
          </p>
        </div>

        {/* Taxonomy / Category Dropdown Select */}
        <div className="space-y-1 max-w-md">
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full bg-white border border-[#8c8f94] rounded px-3 py-2 text-sm font-normal text-[#2c3338] focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] shadow-inner"
          >
            <option value="">Select</option>
            <option value="top_news">টপ নিউজ / Top News (Homepage Lead Grid)</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-[#646970]">
            Greyed-out categories contain too few posts and aren&apos;t available for sorting.
          </p>
        </div>

        {/* Dynamic Controls area when a category is selected */}
        {selectedCategory && (
          <div className="space-y-6 pt-2">
            
            {/* Manual Sorting Toggle Options */}
            <div className="bg-white border border-[#c3c4c7] p-5 rounded shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-[#1d2327] mb-1">
                  Use the manual sorting for this category?
                </h3>
                <p className="text-xs text-[#50575e]">
                  This switches the manual sorting on the front-end on or off. You can switch it off and manually sort your posts below until the new order is ready and you can then proceed to switch this on to showcase the new order on the front-end.
                </p>
              </div>

              <div className="space-y-2 text-xs text-[#2c3338]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="manualSorting"
                    value="yes"
                    checked={manualSorting === 'yes'}
                    onChange={() => setManualSorting('yes')}
                    className="text-[#2271b1] focus:ring-[#2271b1]"
                  />
                  <span>Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="manualSorting"
                    value="no"
                    checked={manualSorting === 'no'}
                    onChange={() => setManualSorting('no')}
                    className="text-[#2271b1] focus:ring-[#2271b1]"
                  />
                  <span>No</span>
                </label>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 text-xs text-[#50575e] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={overrideOrderby}
                    onChange={(e) => setOverrideOrderby(e.target.checked)}
                    className="rounded border-[#8c8f94] text-[#2271b1] focus:ring-[#2271b1]"
                  />
                  <span>Override &apos;orderby&apos; query attribute</span>
                </label>
              </div>

              <p className="text-xs text-[#646970]">
                Caution: Overriding &apos;orderby&apos; query attribute can have important consequences on WooCommerce listings where themes can display products ranked on various parameters such as price. This option overrides all other sortings, read <a href="#" className="text-[#2271b1] underline">FAQ #10</a> to see how to gain a finer control over this.
              </p>
            </div>

            {/* Reset Order Box */}
            <div className="bg-white border border-[#c3c4c7] p-5 rounded shadow-sm space-y-3">
              <h3 className="text-sm font-semibold text-[#1d2327]">Reset the order!</h3>
              <label className="flex items-center gap-2 text-xs text-[#50575e] cursor-pointer">
                <input type="checkbox" className="rounded border-[#8c8f94]" />
                <span>reset order for all posts, <strong>careful</strong>, this cannot be undone!</span>
              </label>
              <div>
                <button
                  type="button"
                  onClick={handleResetOrder}
                  className="px-3 py-1.5 bg-[#f6f7f7] text-[#2271b1] border border-[#2271b1] hover:bg-[#f0f0f1] text-xs font-normal rounded transition"
                >
                  Reset order
                </button>
              </div>
            </div>

            {/* Toast Notifications */}
            {message && (
              <div
                className={`p-3 rounded border text-xs font-semibold ${
                  message.type === 'success'
                    ? 'bg-[#d1e7dd] text-[#0f5132] border-[#badbcc]'
                    : 'bg-[#f8d7da] text-[#842029] border-[#f5c2c7]'
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Grid of Posts Section */}
            <div className="space-y-3">
              <h2 className="text-base font-semibold text-[#1d2327]">
                Grid of Posts, classified as <span className="font-bold">{selectedCategoryName}</span>:
              </h2>

              {/* Toolbar Controls */}
              <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-[#50575e] bg-white p-3 border border-[#c3c4c7] rounded">
                <div className="flex items-center gap-2">
                  <span>Post range:</span>
                  <input
                    type="number"
                    value={postRangeStart}
                    onChange={(e) => setPostRangeStart(Number(e.target.value))}
                    className="w-12 border border-[#8c8f94] rounded px-2 py-1 text-center text-xs"
                  />
                  <span>—</span>
                  <input
                    type="number"
                    value={postRangeEnd}
                    onChange={(e) => setPostRangeEnd(Number(e.target.value))}
                    className="w-12 border border-[#8c8f94] rounded px-2 py-1 text-center text-xs"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span>Move items to rank:</span>
                  <input
                    type="text"
                    value={moveToRankInput}
                    onChange={(e) => setMoveToRankInput(e.target.value)}
                    placeholder="e.g. 1"
                    className="w-16 border border-[#8c8f94] rounded px-2 py-1 text-center text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleMoveToRank}
                    className="px-3 py-1 bg-[#2271b1] hover:bg-[#135e96] text-white font-medium rounded text-xs transition"
                  >
                    Apply Rank
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSaveOrder}
                  disabled={saving}
                  className="px-4 py-1.5 bg-[#2271b1] hover:bg-[#135e96] text-white font-bold rounded text-xs transition ml-auto disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Reorder'}
                </button>
              </div>

              <p className="text-xs italic text-[#646970]">
                Select single/multiple items to move out of the current displayed range and insert towards the beginning or end of your list by selecting a suitable rank. Drag items to reposition manually.
              </p>

              {/* Grid Layout Container (7 Columns on large screens matching WP plugin image 2) */}
              {loading ? (
                <div className="bg-white border border-[#c3c4c7] p-12 text-center text-sm text-[#50575e]">
                  Loading category posts...
                </div>
              ) : newsList.length === 0 ? (
                <div className="bg-white border border-[#c3c4c7] p-12 text-center text-sm text-[#50575e]">
                  No published posts found in this category.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2.5 pt-2">
                  {newsList.map((item, index) => {
                    const isSelected = selectedItems.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        onClick={() => toggleSelectItem(item.id)}
                        className={`group relative bg-[#3b4b6b] border border-[#2c3852] cursor-grab active:cursor-grabbing select-none transition-all flex flex-col justify-between aspect-[3/4] overflow-hidden ${
                          isSelected ? 'ring-4 ring-[#2271b1] scale-[1.02]' : 'hover:border-blue-400'
                        }`}
                      >
                        {/* Thumbnail Image Container */}
                        <div className="w-full h-full relative bg-[#2a364f]">
                          {item.featuredImage ? (
                            <img
                              src={item.featuredImage}
                              alt={item.title}
                              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                              No Image
                            </div>
                          )}
                          <div className="absolute top-1 left-1 bg-black/60 text-white font-mono text-[9px] px-1.5 py-0.5 rounded">
                            #{index + 1}
                          </div>
                        </div>

                        {/* Title Overlay Banner (Dark Blue Bottom Block matching image 2) */}
                        <div className="bg-[#2d3a54] text-white p-1.5 w-full border-t border-[#3b4b6b]">
                          <p className="text-[10px] leading-tight line-clamp-3 font-semibold text-center text-slate-100">
                            {item.title}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
