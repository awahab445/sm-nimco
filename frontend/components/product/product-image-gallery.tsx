'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperClass } from 'swiper';
import { FreeMode, Navigation } from 'swiper/modules';
import { resolveImageUrl } from '@/lib/resolve-image-url';
import { imageAlt } from '@/lib/seo';
import type { ProductImage } from '@/lib/api-client';
import { StorefrontImage } from '@/components/ui/storefront-image';

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

function ThumbButton({
  img,
  productName,
  isActive,
  index,
  total,
  onSelect,
  className,
}: {
  img: ProductImage;
  productName: string;
  isActive: boolean;
  index: number;
  total: number;
  onSelect: (id: string) => void;
  className?: string;
}) {
  const thumbUrl = resolveImageUrl(img.url);
  return (
    <button
      type="button"
      onClick={() => onSelect(img.id)}
      className={`relative overflow-hidden bg-muted/20 transition-opacity duration-200 ${
        isActive ? 'opacity-100 ring-1 ring-foreground/30' : 'opacity-50 hover:opacity-100'
      } ${className ?? ''}`}
      aria-label={`Show image ${index + 1} of ${total}`}
      aria-current={isActive}
    >
      {thumbUrl ? (
        <StorefrontImage
          src={thumbUrl}
          alt={imageAlt(img, productName)}
          fill
          sizes="96px"
          className="object-contain object-center"
          loading="lazy"
          quality={60}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[9px] text-muted-foreground">—</div>
      )}
    </button>
  );
}

function MainImage({
  imageUrl,
  alt,
  allowHoverZoom,
  onOpenLightbox,
}: {
  imageUrl: string | null;
  alt: string;
  allowHoverZoom: boolean;
  onOpenLightbox: () => void;
}) {
  const mainRef = useRef<HTMLDivElement>(null);
  const [zoomOrigin, setZoomOrigin] = useState('50% 50%');
  const [zoomHover, setZoomHover] = useState(false);

  const onMainMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = mainRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setZoomOrigin(`${Math.min(100, Math.max(0, x))}% ${Math.min(100, Math.max(0, y))}%`);
  }, []);

  const zoomed = allowHoverZoom && zoomHover && imageUrl;

  return (
    <div
      ref={mainRef}
      role="img"
      aria-label={alt}
      className="relative aspect-square w-full max-w-full overflow-hidden bg-muted/20"
      onMouseMove={onMainMouseMove}
      onMouseEnter={() => setZoomHover(true)}
      onMouseLeave={() => {
        setZoomHover(false);
        setZoomOrigin('50% 50%');
      }}
    >
      {imageUrl ? (
        <StorefrontImage
          src={imageUrl}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="object-contain object-center transition-transform duration-200 ease-out will-change-transform"
          style={{
            transformOrigin: zoomOrigin,
            transform: zoomed ? 'scale(2.25)' : 'scale(1)',
          }}
          priority
          fetchPriority="high"
          quality={75}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-muted-foreground">No image</div>
      )}

      {imageUrl ? (
        <button
          type="button"
          onClick={onOpenLightbox}
          className="absolute right-3 top-3 bg-background/90 p-2 text-foreground transition-opacity hover:opacity-95 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring/40"
          aria-label="Open full-size product image"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}

export function ProductImageGallery({ images, productName, selectedId, onSelect }: Props) {
  const swiperRef = useRef<SwiperClass | null>(null);
  const allowHoverZoom = useFinePointerHover();

  const activeIndex = Math.max(
    0,
    images.findIndex((i) => i.id === selectedId),
  );
  const active = images[activeIndex] ?? images[0];
  const imageUrl = resolveImageUrl(active?.url) ?? null;

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

  if (images.length === 0) {
    return (
      <div className="aspect-square w-full overflow-hidden bg-muted/20">
        <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">No image</div>
      </div>
    );
  }

  const mainAlt = imageAlt(active, productName);

  return (
    <div className="product-image-gallery w-full">
      {/* Desktop: thumbs left (Kalles thumbnail_left) */}
      <div className="hidden gap-4 lg:flex lg:flex-row-reverse">
        <div className="min-w-0 flex-[1_1_85%]">
          <MainImage
            imageUrl={imageUrl}
            alt={mainAlt}
            allowHoverZoom={allowHoverZoom}
            onOpenLightbox={() => setLightboxOpen(true)}
          />
        </div>
        {images.length > 1 ? (
          <div className="flex w-[14%] max-w-[5.5rem] shrink-0 flex-col gap-3">
            {images.map((img, idx) => (
              <ThumbButton
                key={img.id}
                img={img}
                productName={productName}
                isActive={img.id === active?.id}
                index={idx}
                total={images.length}
                onSelect={onSelect}
                className="aspect-square w-full"
              />
            ))}
          </div>
        ) : null}
      </div>

      {/* Mobile / tablet: edge-to-edge main + horizontal thumbs (Kalles) */}
      <div className="w-full lg:hidden">
        <MainImage
          imageUrl={imageUrl}
          alt={mainAlt}
          allowHoverZoom={false}
          onOpenLightbox={() => setLightboxOpen(true)}
        />
        {images.length > 1 ? (
          <div className="relative mt-3 px-4 sm:mt-4 sm:px-6">
            <Swiper
              modules={[FreeMode, Navigation]}
              spaceBetween={8}
              slidesPerView="auto"
              freeMode={{ enabled: true, momentum: true, momentumRatio: 0.85 }}
              navigation
              watchSlidesProgress
              className="product-thumbs-swiper !overflow-visible !px-0 [&_.swiper-button-next]:-right-1 [&_.swiper-button-next]:mt-0 [&_.swiper-button-next]:h-7 [&_.swiper-button-next]:w-7 [&_.swiper-button-next]:text-foreground [&_.swiper-button-next]:after:text-xs [&_.swiper-button-prev]:-left-1 [&_.swiper-button-prev]:mt-0 [&_.swiper-button-prev]:h-7 [&_.swiper-button-prev]:w-7 [&_.swiper-button-prev]:text-foreground [&_.swiper-button-prev]:after:text-xs"
              onSwiper={(s) => {
                swiperRef.current = s;
              }}
            >
              {images.map((img, idx) => (
                <SwiperSlide key={img.id} className="!w-auto">
                  <ThumbButton
                    img={img}
                    productName={productName}
                    isActive={img.id === active?.id}
                    index={idx}
                    total={images.length}
                    onSelect={onSelect}
                    className="aspect-square h-[4rem] w-[4rem] sm:h-[4.25rem] sm:w-[4.25rem]"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        ) : null}
      </div>

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
            className="absolute right-4 top-4 p-2 text-white transition-colors hover:text-white/80"
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
          {/* eslint-disable-next-line @next/next/no-img-element -- full-res lightbox; avoid optimizer constraints */}
          <img
            src={imageUrl}
            alt={mainAlt}
            className="max-h-[min(92vh,1200px)] max-w-full object-contain object-center"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}
    </div>
  );
}
