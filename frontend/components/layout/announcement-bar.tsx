'use client';

import { useEffect, useRef, useState } from 'react';
import { siteConfigApi } from '@/lib/api-client';

const DEFAULT_ANNOUNCEMENT_TEXT = 'Free Delivery on orders of Rs. 2000 or more!';

export function AnnouncementBar() {
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [announcementText, setAnnouncementText] = useState(DEFAULT_ANNOUNCEMENT_TEXT);
  const barRef = useRef<HTMLDivElement | null>(null);

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

  /** Announce height for immersive hero viewport math (0 when hidden). */
  useEffect(() => {
    const root = document.documentElement;
    if (!showAnnouncement) {
      root.style.setProperty('--site-announcement-height', '0px');
      return;
    }
    const el = barRef.current;
    if (!el) {
      root.style.setProperty('--site-announcement-height', '0px');
      return;
    }
    const syncHeight = () => {
      root.style.setProperty('--site-announcement-height', `${el.offsetHeight}px`);
    };
    syncHeight();
    const ro = new ResizeObserver(syncHeight);
    ro.observe(el);
    return () => {
      ro.disconnect();
      root.style.setProperty('--site-announcement-height', '0px');
    };
  }, [showAnnouncement]);

  if (!showAnnouncement || !announcementText.trim()) return null;

  return (
    <div
      ref={barRef}
      className="site-top-bar relative z-[70] w-full border-b border-foreground/10"
      style={{ backgroundColor: 'var(--foreground)', color: 'var(--primary-foreground)' }}
      role="region"
      aria-label="Announcement"
    >
      <div className="mx-auto flex min-h-[2.55rem] w-full max-w-[100rem] items-center justify-center px-4 py-2.5 text-center sm:px-8 lg:px-12">
        <p className="text-[11px] font-medium uppercase leading-4 tracking-[0.14em] text-inherit sm:text-[12px]">
          {announcementText}
        </p>
      </div>
    </div>
  );
}
