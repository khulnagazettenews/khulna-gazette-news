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
  // 1. Strictly return authorTitle from DB if present (and not generic placeholder)
  if (news.authorTitle && news.authorTitle.trim() && news.authorTitle.trim() !== 'সম্পাদক ও প্রকাশক') {
    return news.authorTitle.trim();
  }

  // 2. Return reporterName if custom (not 'সম্পাদক ও প্রকাশক' or 'স্টাফ রিপোর্টার')
  if (
    news.reporterName &&
    news.reporterName.trim() &&
    news.reporterName.trim() !== 'সম্পাদক ও প্রকাশক' &&
    news.reporterName.trim() !== 'স্টাফ রিপোর্টার'
  ) {
    return news.reporterName.trim();
  }

  // 3. Return author name if custom
  if (
    news.author?.name &&
    news.author.name.trim() &&
    news.author.name.trim() !== 'সম্পাদক ও প্রকাশক' &&
    news.author.name.trim() !== 'স্টাফ রিপোর্টার'
  ) {
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
