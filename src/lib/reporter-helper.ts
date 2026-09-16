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
  const isDefaultPortalName = (str?: string | null) => {
    if (!str) return true;
    const s = str.trim().toLowerCase();
    return s === 'খুলনা গেজেট' || s === 'khulna gazette';
  };

  // 1. Strictly return authorTitle from DB if present and not portal name
  if (news.authorTitle && !isDefaultPortalName(news.authorTitle)) {
    return news.authorTitle.trim();
  }

  // 2. Return reporterName if saved in DB and not portal name
  if (news.reporterName && !isDefaultPortalName(news.reporterName)) {
    return news.reporterName.trim();
  }

  // 3. Return author name if available and not portal name
  if (news.author?.name && !isDefaultPortalName(news.author.name)) {
    return news.author.name.trim();
  }

  // 4. Default fallback rule:
  return 'স্টাফ রিপোর্টার';
}

