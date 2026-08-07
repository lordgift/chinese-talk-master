'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initAnalytics, trackEvent } from '@/lib/firebase';

export function FirebaseAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Initialize analytics on component mount
    initAnalytics();
  }, []);

  useEffect(() => {
    if (pathname) {
      const url = searchParams?.toString() ? `${pathname}?${searchParams.toString()}` : pathname;
      trackEvent('page_view', {
        page_path: url,
        page_location: typeof window !== 'undefined' ? window.location.href : url,
      });
    }
  }, [pathname, searchParams]);

  return null;
}
