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

  // 2. Return reporterName if custom (not default 'স্টাফ রিপোর্টার')
  if (news.reporterName && news.reporterName.trim() && news.reporterName.trim() !== 'স্টাফ রিপোর্টার') {
    return news.reporterName.trim();
  }

  // 3. Return author name if custom
  if (news.author?.name && news.author.name.trim() && news.author.name.trim() !== 'স্টাফ রিপোর্টার') {
    return news.author.name.trim();
  }

  // 4. Default fallback: Category Desk or reporterName
  if (news.reporterName && news.reporterName.trim()) {
    return news.reporterName.trim();
  }

  return news.category?.name ? `${news.category.name} ডেস্ক` : 'খুলনা গেজেট';
}
