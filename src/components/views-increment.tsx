'use client';

import { useEffect } from 'react';

interface ViewsIncrementProps {
  newsId: string;
}

export default function ViewsIncrement({ newsId }: ViewsIncrementProps) {
  useEffect(() => {
    const incrementViews = async () => {
      try {
        await fetch(`/api/news/${newsId}/views`, { method: 'POST' }).catch(() => {});
      } catch (err) {
        // Silent background view tracking error handle
      }
    };
    incrementViews();
  }, [newsId]);

  return null;
}
