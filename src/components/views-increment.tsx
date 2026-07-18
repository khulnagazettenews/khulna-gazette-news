'use client';

import { useEffect } from 'react';

interface ViewsIncrementProps {
  newsId: string;
}

export default function ViewsIncrement({ newsId }: ViewsIncrementProps) {
  useEffect(() => {
    const incrementViews = async () => {
      try {
        await fetch(`/api/news/${newsId}/views`, { method: 'POST' });
      } catch (err) {
        console.error('Failed to increment view counter client-side:', err);
      }
    };
    incrementViews();
  }, [newsId]);

  return null;
}
