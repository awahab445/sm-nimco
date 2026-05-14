'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import type { HeroSlide } from '@/lib/cms/home-page-types';
import { useHydrated } from '@/lib/use-hydrated';

export type HeroSliderLayout = 'card' | 'immersive';

const IS_MEHFIL_THEME =
  typeof process !== 'undefined' &&
  process.env.NEXT_PUBLIC_STORE_THEME?.trim().toLowerCase() === 'mehfil_shereen';

interface HeroSliderProps {
  slides: HeroSlide[];
  autoplayMs?: number;
  /** CMS slider setting: same max width in px for every slide; unset = full container width */
  slideWidthPx?: number;
  /** CMS slider: same height in px; with width fixes aspect ratio for all slides */
  slideHeightPx?: number;
  /** `immersive` = edge-to-edge, tall viewport banner (homepage lead). `card` = inset rounded block. */
  layout?: HeroSliderLayout;
}

export function HeroSlider({
  slides,
  autoplayMs = 0,
  slideWidthPx,
  slideHeightPx,
  layout = 'card',
}: HeroSliderProps) {
  const hydrated = useHydrated();
  const [index, setIndex] = useState(0);
  const n = slides.length;
  const safeIndex = n === 0 ? 0 : index % n;

  const go = useCallback(
    (dir: -1 | 1) => {
      if (n === 0) return;
      setIndex((i) => (i + dir + n) % n);
    },
    [n],
  );

  useEffect(() => {
    if (!autoplayMs || n < 2) return;
    const t = setInterval(() => go(1), autoplayMs);
    return () => clearInterval(t);
  }, [autoplayMs, n, go]);

  if (n === 0) return null;

  const slide = slides[safeIndex];
  const immersive = layout === 'immersive';
  const mehfil = IS_MEHFIL_THEME;
  const hasImage = Boolean(slide.imageUrl);

  const shellClass = [
    immersive
      ? 'relative w-full overflow-hidden bg-background'
      : hasImage
        ? 'relative overflow-hidden rounded-2xl border border-border bg-background shadow-sm'
        : 'relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm',
    mehfil && !hasImage ? 'hero-slider-mehfil-shell' : '',
    hasImage ? 'hero-slider--image-only' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const stageClass = hasImage
    ? immersive
      ? 'relative w-full'
      : 'relative w-full overflow-hidden rounded-2xl'
    : immersive
      ? 'relative min-h-[clamp(20rem,82dvh,56rem)] w-full'
      : 'relative aspect-[21/9] min-h-[280px] w-full md:min-h-[320px]';

  const overlayClass = [
    'absolute inset-0',
    immersive
      ? mehfil
        ? 'hero-slider-mehfil-overlay'
        : 'bg-gradient-to-r from-background/95 via-background/55 to-background/20 sm:via-background/40'
      : mehfil
        ? 'hero-slider-mehfil-overlay-card'
        : 'bg-gradient-to-t from-background/90 via-background/40 to-transparent md:via-background/25',
  ].join(' ');

  const contentWrapperClass = immersive
    ? 'absolute inset-0 flex flex-col justify-center px-4 pb-16 pt-20 sm:px-8 sm:pb-20 sm:pt-24 lg:px-12 xl:px-16'
    : 'absolute inset-0 flex flex-col justify-end p-6 md:p-10 lg:p-12';

  const headlineClass = immersive
    ? 'max-w-2xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl'
    : 'text-2xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl';

  const navBtnClass = hasImage
    ? 'absolute top-1/2 hidden -translate-y-1/2 rounded-full border border-foreground/15 bg-background/90 p-3 text-2xl leading-none text-foreground shadow-lg backdrop-blur-md transition-colors hover:bg-background md:block md:p-3.5'
    : immersive
      ? 'absolute top-1/2 hidden -translate-y-1/2 rounded-full border border-border/60 bg-background/90 p-3 text-2xl leading-none text-foreground shadow-lg backdrop-blur-md transition-colors hover:bg-background md:block md:p-3.5'
      : 'absolute top-1/2 hidden -translate-y-1/2 rounded-full border border-border bg-background/80 p-2 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-background md:block';

  const dimW = slideWidthPx && slideWidthPx > 0 ? slideWidthPx : 0;
  const dimH = slideHeightPx && slideHeightPx > 0 ? slideHeightPx : 0;
  const imgWidth = dimW > 0 ? dimW : dimH > 0 ? Math.round(dimH * (2400 / 1000)) : 2400;
  const imgHeight = dimH > 0 ? dimH : dimW > 0 ? Math.round(dimW * (1000 / 2400)) : 1000;
  const sizesAttr = dimW > 0 ? `(max-width: ${dimW}px) 100vw, ${dimW}px` : '100vw';

  const imgFillBox = dimW > 0 && dimH > 0;

  const bannerImg = slide.imageUrl ? (
    <img
      src={slide.imageUrl}
      alt={slide.title || 'Promotional banner'}
      width={imgWidth}
      height={imgHeight}
      className={
        imgFillBox
          ? 'block h-full w-full object-contain object-center'
          : dimW > 0
            ? 'block h-auto w-full max-w-full object-contain object-center'
            : dimH > 0
              ? 'mx-auto block h-auto max-h-full w-full max-w-full object-contain object-center'
              : 'block h-auto w-full object-contain object-center'
      }
      loading={safeIndex === 0 ? 'eager' : 'lazy'}
      decoding="async"
      sizes={sizesAttr}
    />
  ) : null;

  const imageStage =
    dimW > 0 && dimH > 0 ? (
      <div
        className="mx-auto w-full overflow-hidden"
        style={{ maxWidth: `${dimW}px`, aspectRatio: `${dimW} / ${dimH}` }}
      >
        {bannerImg}
      </div>
    ) : dimW > 0 ? (
      <div className="mx-auto w-full" style={{ maxWidth: `${dimW}px` }}>
        {bannerImg}
      </div>
    ) : dimH > 0 ? (
      <div className="mx-auto w-full overflow-hidden" style={{ maxHeight: `${dimH}px` }}>
        {bannerImg}
      </div>
    ) : (
      bannerImg
    );

  const linkedBanner =
    slide.imageUrl && slide.ctaHref ? (
      <Link
        href={slide.ctaHref}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label={slide.ctaLabel || slide.title || 'View offer'}
      >
        {imageStage}
      </Link>
    ) : (
      imageStage
    );

  return (
    <section
      className={shellClass}
      data-hero-layout={immersive ? 'immersive' : 'card'}
      data-hero-visual={hasImage ? 'image' : 'gradient'}
      aria-roledescription="carousel"
      aria-label="Featured promotions"
    >
      <div className={stageClass}>
        {hasImage ? (
          linkedBanner
        ) : (
          <>
            <div
              className={
                mehfil
                  ? 'hero-slider-mehfil-fallback absolute inset-0'
                  : 'absolute inset-0 bg-gradient-to-br from-primary/35 via-primary/10 to-muted'
              }
              aria-hidden
            />
            <div className={overlayClass} />
            <div className={contentWrapperClass}>
              <div className={immersive ? 'mx-auto w-full max-w-[100rem]' : 'max-w-xl'}>
                <h1 className={headlineClass}>{slide.title}</h1>
                {slide.subtitle && (
                  <p
                    className={
                      immersive
                        ? 'mt-4 max-w-xl text-base text-muted-foreground sm:text-lg md:text-xl'
                        : 'mt-3 text-base text-muted-foreground md:text-lg'
                    }
                  >
                    {slide.subtitle}
                  </p>
                )}
                {slide.ctaLabel && slide.ctaHref && (
                  <Link
                    href={slide.ctaHref}
                    className={
                      immersive
                        ? 'mt-8 inline-flex rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-opacity hover:opacity-90 sm:text-base'
                        : 'mt-6 inline-flex rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90'
                    }
                  >
                    {slide.ctaLabel}
                  </Link>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {hydrated && n > 1 ? (
        <>
          <div
            className={
              immersive
                ? 'absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2 sm:bottom-8'
                : 'absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 md:bottom-6'
            }
          >
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === safeIndex}
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === safeIndex
                    ? 'w-8 bg-primary'
                    : hasImage
                      ? 'w-2 bg-foreground/35 hover:bg-foreground/55 ring-1 ring-background/60'
                      : immersive
                        ? 'w-2 bg-background/70 hover:bg-background'
                        : 'w-2 bg-muted-foreground/40 hover:bg-muted-foreground/70'
                } ${immersive && !hasImage ? 'ring-1 ring-foreground/10' : ''}`}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => go(-1)}
            className={`${navBtnClass} left-3 sm:left-6 lg:left-8`}
          >
            <span aria-hidden className="block leading-none">‹</span>
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => go(1)}
            className={`${navBtnClass} right-3 sm:right-6 lg:right-8`}
          >
            <span aria-hidden className="block leading-none">›</span>
          </button>
        </>
      ) : null}
    </section>
  );
}
