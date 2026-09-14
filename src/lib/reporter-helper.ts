/**
 * Helper to strictly show whatever News Author / Reporter title is saved in the Database for that news.
 */
export function getReporterTitle(news: {
  authorTitle?: string | null;
  reporterName?: string | null;
  author?: { name?: string | null } | null;
  category?: { name?: string; slug?: string } | null;
  subCategory?: { name?: string; slug?: string } | null;
}): string {
  // 1. Strictly return authorTitle from DB if present
  if (news.authorTitle && news.authorTitle.trim()) {
    return news.authorTitle.trim();
  }

  // 2. Return reporterName if saved in DB
  if (news.reporterName && news.reporterName.trim()) {
    return news.reporterName.trim();
  }

  // 3. Return author name if available
  if (news.author?.name && news.author.name.trim()) {
    return news.author.name.trim();
  }

  // 4. Custom fallback rules:
  // For sports/khela category -> "ক্রীড়া প্রতিবেদক"
  const catSlug = news.category?.slug?.toLowerCase() || '';
  const catName = news.category?.name || '';
  if (catSlug === 'sports' || catSlug === 'khela' || catName === 'খেলা') {
    return 'ক্রীড়া প্রতিবেদক';
  }

  // Clean category desk fallback (e.g., "বাংলাদেশ ডেস্ক", "খুলনাঞ্চল ডেস্ক", "বিনোদন ডেস্ক")
  return catName ? `${catName} ডেস্ক` : 'খুলনা গেজেট';
}
