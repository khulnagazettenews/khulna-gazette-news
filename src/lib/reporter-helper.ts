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

  // 2. Strictly return reporterName from DB if present
  if (news.reporterName && news.reporterName.trim()) {
    return news.reporterName.trim();
  }

  // 3. Strictly return author name from DB if present
  if (news.author?.name && news.author.name.trim()) {
    return news.author.name.trim();
  }

  // 4. Default fallback if database has literally no author info
  return news.category?.name ? `${news.category.name} ডেস্ক` : 'খুলনা গেজেট';
}
