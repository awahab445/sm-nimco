'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperClass } from 'swiper';
import { FreeMode, Navigation } from 'swiper/modules';
import { resolveImageUrl } from '@/lib/resolve-image-url';
import type { ProductImage } from '@/lib/api-client';

import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';

type Props = {
  images: ProductImage[];
  productName: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
};

function useFinePointerHover() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const apply = () => setOk(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);
  return ok;
}

export function ProductImageGallery({ images, productName, selectedId, onSelect }: Props) {
  const swiperRef = useRef<SwiperClass | null>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const allowHoverZoom = useFinePointerHover();

  const activeIndex = Math.max(
    0,
    images.findIndex((i) => i.id === selectedId),
  );
  const active = images[activeIndex] ?? images[0];
  const imageUrl = resolveImageUrl(active?.url);

  const [zoomOrigin, setZoomOrigin] = useState('50% 50%');
  const [zoomHover, setZoomHover] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    const idx = images.findIndex((i) => i.id === selectedId);
    const s = swiperRef.current;
    if (idx >= 0 && s && !s.destroyed) {
      s.slideTo(idx, 280);
    }
  }, [selectedId, images]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [lightboxOpen]);

  const onMainMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = mainRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setZoomOrigin(`${Math.min(100, Math.max(0, x))}% ${Math.min(100, Math.max(0, y))}%`);
  }, []);

  if (images.length === 0) {
    return (
      <div className="aspect-[4/5] overflow-hidden rounded-lg border border-border bg-muted sm:aspect-square">
        <div className="flex h-full w-full items-center justify-center text-muted-foreground">No image</div>
      </div>
    );
  }

  const zoomed = allowHoverZoom && zoomHover && imageUrl;
  const mainAlt = active?.alt ?? productName;

  return (
    <div className="product-image-gallery">
      <div className="relative">
        <div
          ref={mainRef}
          role="img"
          aria-label={mainAlt}
          className="relative aspect-[4/5] overflow-hidden rounded-lg border border-border bg-muted sm:aspect-square"
          onMouseMove={onMainMouseMove}
          onMouseEnter={() => setZoomHover(true)}
          onMouseLeave={() => {
            setZoomHover(false);
            setZoomOrigin('50% 50%');
          }}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={mainAlt}
              className="h-full w-full object-cover object-center transition-transform duration-200 ease-out will-change-transform"
              style={{
                transformOrigin: zoomOrigin,
                transform: zoomed ? 'scale(2.25)' : 'scale(1)',
              }}
              sizes="(min-width: 1024px) 50vw, 100vw"
              decoding="async"
              fetchPriority="high"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">No image</div>
          )}

          {imageUrl ? (
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="absolute right-3 top-3 rounded-full border border-border/80 bg-background/90 p-2 text-foreground shadow-sm backdrop-blur-sm transition-opacity hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Open full-size product image"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ) : null}

          {allowHoverZoom && imageUrl ? (
            <span className="pointer-events-none absolute bottom-3 left-3 rounded-md bg-background/85 px-2 py-1 text-[10px] font-medium text-muted-foreground backdrop-blur-sm sm:text-xs">
              Hover to zoom · icon for full view
            </span>
          ) : null}
        </div>
      </div>

      {images.length > 1 ? (
        <div className="relative mt-4 px-9 sm:px-11">
          <Swiper
            modules={[FreeMode, Navigation]}
            spaceBetween={10}
            slidesPerView="auto"
            freeMode={{ enabled: true, momentum: true, momentumRatio: 0.85 }}
            navigation
            watchSlidesProgress
            className="product-thumbs-swiper !px-0 !pb-1 pt-1 [&_.swiper-button-next]:right-0 [&_.swiper-button-next]:mt-0 [&_.swiper-button-next]:h-8 [&_.swiper-button-next]:w-8 [&_.swiper-button-next]:rounded-full [&_.swiper-button-next]:border [&_.swiper-button-next]:border-border [&_.swiper-button-next]:bg-background/95 [&_.swiper-button-next]:text-foreground [&_.swiper-button-next]:shadow-sm [&_.swiper-button-next]:after:text-sm [&_.swiper-button-prev]:left-0 [&_.swiper-button-prev]:mt-0 [&_.swiper-button-prev]:h-8 [&_.swiper-button-prev]:w-8 [&_.swiper-button-prev]:rounded-full [&_.swiper-button-prev]:border [&_.swiper-button-prev]:border-border [&_.swiper-button-prev]:bg-background/95 [&_.swiper-button-prev]:text-foreground [&_.swiper-button-prev]:shadow-sm [&_.swiper-button-prev]:after:text-sm"
            onSwiper={(s) => {
              swiperRef.current = s;
            }}
          >
            {images.map((img, idx) => {
              const thumbUrl = resolveImageUrl(img.url);
              const isActive = img.id === active?.id;
              return (
                <SwiperSlide key={img.id} className="!w-auto">
                  <button
                    type="button"
                    onClick={() => onSelect(img.id)}
                    className={`relative h-[4.5rem] w-[4.5rem] overflow-hidden rounded-lg border-2 transition-all sm:h-20 sm:w-20 ${
                      isActive
                        ? 'border-primary ring-2 ring-primary/25 shadow-sm'
                        : 'border-border opacity-90 hover:border-primary/50 hover:opacity-100'
                    }`}
                    aria-label={`Show image ${idx + 1} of ${images.length}`}
                    aria-current={isActive}
                  >
                    {thumbUrl ? (
                      <img
                        src={thumbUrl}
                        alt={img.alt ?? productName}
                        className="h-full w-full object-cover object-center"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[9px] text-muted-foreground">
                        —
                      </div>
                    )}
                  </button>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      ) : null}

      {lightboxOpen && imageUrl ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/88 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-label="Product image preview"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full border border-white/30 bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            aria-label="Close preview"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxOpen(false);
            }}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={mainAlt}
            className="max-h-[min(92vh,1200px)] max-w-full object-contain object-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}
    </div>
  );
}
