'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { siteConfigApi } from '@/lib/api-client';

const DEFAULT_ANNOUNCEMENT_TEXT = 'Free Delivery on orders of Rs. 2000 or more!';

export function AnnouncementBar() {
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [announcementText, setAnnouncementText] = useState(DEFAULT_ANNOUNCEMENT_TEXT);

  useEffect(() => {
    let cancelled = false;
    siteConfigApi
      .getSiteConfig()
      .then((res) => {
        if (cancelled) return;
        const text = res.data.announcementText?.trim() || DEFAULT_ANNOUNCEMENT_TEXT;
        setAnnouncementText(text);
        setShowAnnouncement(Boolean(res.data.showAnnouncement) && text.length > 0);
      })
      .catch(() => {
        if (cancelled) return;
        setAnnouncementText(DEFAULT_ANNOUNCEMENT_TEXT);
        setShowAnnouncement(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!showAnnouncement || !announcementText.trim()) return null;

  const durationSeconds = Math.max(
    12,
    Math.min(28, 28 - Math.floor(announcementText.length / 12)),
  );

  const trackStyle = { '--marquee-duration': `${durationSeconds}s` } as CSSProperties;

  return (
    <div className="group relative left-1/2 right-1/2 z-[70] -ml-[50vw] -mr-[50vw] w-screen max-w-[100vw] overflow-hidden border-b border-secondary/80 bg-secondary py-2 text-primary">
      <div className="flex min-w-full whitespace-nowrap">
        <div
          className="flex min-w-full shrink-0 animate-marquee justify-around gap-4 pr-4 group-hover:[animation-play-state:paused]"
          style={trackStyle}
        >
          <span className="ticker-chunk shrink-0 text-sm font-semibold">{announcementText}</span>
          <span className="ticker-chunk shrink-0 text-sm font-semibold">{announcementText}</span>
        </div>
        <div
          className="flex min-w-full shrink-0 animate-marquee justify-around gap-4 pr-4 group-hover:[animation-play-state:paused]"
          style={trackStyle}
          aria-hidden
        >
          <span className="ticker-chunk shrink-0 text-sm font-semibold">{announcementText}</span>
          <span className="ticker-chunk shrink-0 text-sm font-semibold">{announcementText}</span>
        </div>
      </div>
    </div>
  );
}
