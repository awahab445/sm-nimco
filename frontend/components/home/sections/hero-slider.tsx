'use client';

import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import Link from 'next/link';
import type {
  HeroSlide,
  HeroSlideTextAlign,
  HeroSlideTextColor,
  HeroSlideTextPosition,
} from '@/lib/cms/home-page-types';
import { resolveImageUrl } from '@/lib/resolve-image-url';
import { storefrontUi } from '@/lib/storefront-ui';
import { useHydrated } from '@/lib/use-hydrated';
import { StorefrontImage } from '@/components/ui/storefront-image';

export type HeroSliderLayout = 'card' | 'immersive';

/** Responsive sizes — full viewport width at every breakpoint. */
const HERO_IMAGE_SIZES =
  '(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw';

const IS_MEHFIL_THEME =
  typeof process !== 'undefined' &&
  process.env.NEXT_PUBLIC_STORE_THEME?.trim().toLowerCase() === 'mehfil_shereen';

interface HeroSliderProps {
  slides: HeroSlide[];
  autoplayMs?: number;
  /** CMS slider setting: same max width in px for every slide; unset = full container width */
  slideWidthPx?: number;
  /** CMS slider: same height in px; used with width for CLS aspect reservation */
  slideHeightPx?: number;
  /** `immersive` = edge-to-edge banner (default). `card` = inset rounded block (legacy). */
  layout?: HeroSliderLayout;
}

function hasOverlayCopy(slide: HeroSlide): boolean {
  return Boolean(
    slide.title?.trim() ||
      slide.subtitle?.trim() ||
      (slide.ctaLabel?.trim() && slide.ctaHref?.trim()),
  );
}

function normalizeAlign(value?: HeroSlideTextAlign): HeroSlideTextAlign {
  return value === 'center' || value === 'right' ? value : 'left';
}

function normalizePosition(value?: HeroSlideTextPosition): HeroSlideTextPosition {
  return value === 'top' || value === 'bottom' ? value : 'middle';
}

function normalizeColor(value?: HeroSlideTextColor): HeroSlideTextColor {
  return value === 'dark' ? 'dark' : 'light';
}

export function HeroSlider({
  slides,
  autoplayMs = 0,
  slideWidthPx,
  slideHeightPx,
  layout = 'immersive',
}: HeroSliderProps) {
  const hydrated = useHydrated();
  const [index, setIndex] = useState(0);
  const n = slides.length;
  const safeIndex = n === 0 ? 0 : index % n;
  const immersive = layout === 'immersive';

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

  /** Transparent header over the top of the home hero (when present). */
  useLayoutEffect(() => {
    if (!immersive || n === 0) return;
    const root = document.documentElement;
    root.setAttribute('data-immersive-hero', 'true');
    return () => {
      root.removeAttribute('data-immersive-hero');
    };
  }, [immersive, n]);

  if (n === 0) return null;

  const slide = slides[safeIndex];
  const mehfil = IS_MEHFIL_THEME;
  const resolvedImageUrl = resolveImageUrl(slide.imageUrl);
  const hasImage = Boolean(resolvedImageUrl);
  const showOverlay = hasOverlayCopy(slide);
  const imageOnly = hasImage && !showOverlay;
  const isLcpSlide = safeIndex === 0;
  const textAlign = normalizeAlign(slide.textAlign);
  const textPosition = normalizePosition(slide.textPosition);
  const textColor = normalizeColor(slide.textColor);
  const title = slide.title?.trim() || '';
  const subtitle = slide.subtitle?.trim() || '';
  const ctaLabel = slide.ctaLabel?.trim() || '';
  const ctaHref = slide.ctaHref?.trim() || '';
  const hasCtaButton = Boolean(ctaLabel && ctaHref);
  /** Full-bleed image link only when there is a href but no overlay CTA button (avoids nested links). */
  const wrapImageAsLink = Boolean(ctaHref && !hasCtaButton);

  const shellClass = [
    immersive
      ? 'hero-slider--immersive relative w-full overflow-hidden bg-background'
      : hasImage
        ? 'relative overflow-hidden rounded-sm border border-border bg-background'
        : 'relative overflow-hidden rounded-sm border border-border bg-card',
    mehfil && !hasImage ? 'hero-slider-mehfil-shell' : '',
    imageOnly ? 'hero-slider--image-only' : '',
  ]
    .filter(Boolean)
    .join(' ');

  /** Fluid stage: height comes from the image (or fallback aspect when no image). */
  const stageClass = hasImage
    ? 'hero-slider__stage relative w-full'
    : immersive
      ? 'hero-slider__stage @container relative aspect-[21/9] min-h-[240px] w-full overflow-hidden sm:min-h-[280px]'
      : '@container relative aspect-[21/9] min-h-[280px] w-full overflow-hidden md:min-h-[320px]';

  const justifyY =
    textPosition === 'top'
      ? 'justify-start'
      : textPosition === 'bottom'
        ? 'justify-end'
        : 'justify-center';

  const alignX =
    textAlign === 'center'
      ? 'items-center text-center'
      : textAlign === 'right'
        ? 'items-end text-right'
        : 'items-start text-left';

  const contentWrapperClass = `absolute inset-0 z-[1] flex flex-col ${justifyY} ${alignX} p-[clamp(0.75rem,3cqw,2.5rem)] ${
    immersive ? 'pt-[clamp(2.5rem,8cqw,5rem)]' : ''
  }`;

  const isLightText = textColor === 'light';
  const headlineTone = isLightText ? 'text-white' : 'text-foreground';
  const subtitleTone = isLightText ? 'text-white/85' : 'text-muted-foreground';
  /** Soft shadow keeps dark/light copy readable over busy product photography. */
  const headlineShadow = isLightText
    ? '[text-shadow:0_1px_2px_rgba(0,0,0,0.45)]'
    : '[text-shadow:0_1px_1px_rgba(255,255,255,0.55)]';
  const subtitleShadow = isLightText
    ? '[text-shadow:0_1px_2px_rgba(0,0,0,0.35)]'
    : '';

  /** Fluid type scales with banner width (container queries), not fixed rem breakpoints. */
  const headlineClass = `font-display text-[clamp(0.85rem,3.2cqw,2.75rem)] font-semibold leading-[1.1] tracking-tight ${headlineTone} ${headlineShadow}`;

  const subtitleClass = `max-w-prose text-[clamp(0.65rem,1.8cqw,1.125rem)] leading-[1.25] ${subtitleTone} ${subtitleShadow}`;

  const ctaFluid =
    'shrink-0 px-[clamp(0.5rem,3cqw,1.5rem)] py-[clamp(0.25rem,1.2cqw,0.75rem)] text-[clamp(0.6rem,1.5cqw,0.875rem)] leading-none';
  const ctaClass = hasImage
    ? isLightText
      ? `inline-flex ${storefrontUi.btnPrimaryInverted} ${ctaFluid}`
      : `inline-flex ${storefrontUi.btnPrimary} ${ctaFluid}`
    : `inline-flex ${storefrontUi.btnPrimary} ${ctaFluid}`;

  /**
   * Text column stays in the copy half of the banner so it doesn't collide with product art.
   * Flex + fluid gap keeps title / subtitle / CTA proportional as the banner scales.
   */
  const overlayColumnClass = [
    'flex flex-col gap-[clamp(0.35rem,1.5cqw,1.25rem)]',
    textAlign === 'center'
      ? 'w-full max-w-[60%] items-center'
      : textAlign === 'right'
        ? 'w-full max-w-[55%] items-end'
        : 'w-full max-w-[55%]',
  ].join(' ');

  const softScrimClass = isLightText
    ? [
        'pointer-events-none absolute inset-0 z-[1]',
        textAlign === 'center'
          ? 'bg-gradient-to-t from-black/45 via-black/20 to-black/25'
          : textAlign === 'right'
            ? 'bg-gradient-to-l from-black/55 via-black/20 to-transparent'
            : 'bg-gradient-to-r from-black/55 via-black/20 to-transparent',
      ].join(' ')
    : [
        'pointer-events-none absolute inset-0 z-[1]',
        textAlign === 'center'
          ? 'bg-gradient-to-t from-white/50 via-white/25 to-white/20'
          : textAlign === 'right'
            ? 'bg-gradient-to-l from-white/55 via-white/20 to-transparent'
            : 'bg-gradient-to-r from-white/55 via-white/20 to-transparent',
      ].join(' ');

  const gradientFallbackOverlay = [
    'absolute inset-0',
    immersive
      ? mehfil
        ? 'hero-slider-mehfil-overlay'
        : 'bg-gradient-to-r from-background/95 via-background/50 to-transparent sm:via-background/35'
      : mehfil
        ? 'hero-slider-mehfil-overlay-card'
        : 'bg-gradient-to-t from-background/90 via-background/35 to-transparent md:via-background/20',
  ].join(' ');

  const navBtnClass = hasImage
    ? 'absolute top-1/2 hidden -translate-y-1/2 border-0 bg-transparent p-2 text-3xl leading-none text-foreground/70 transition-colors hover:text-foreground md:block'
    : immersive
      ? 'absolute top-1/2 hidden -translate-y-1/2 border-0 bg-transparent p-2 text-3xl leading-none text-foreground/70 transition-colors hover:text-foreground md:block'
      : 'absolute top-1/2 hidden -translate-y-1/2 border-0 bg-transparent p-2 text-2xl text-foreground/70 transition-colors hover:text-foreground md:block';

  /** Intrinsic dims for next/image CLS reservation; CSS scales to full width. */
  const imgWidth =
    slideWidthPx && slideWidthPx > 0
      ? slideWidthPx
      : slideHeightPx && slideHeightPx > 0
        ? Math.round(slideHeightPx * (1920 / 800))
        : 1920;
  const imgHeight =
    slideHeightPx && slideHeightPx > 0
      ? slideHeightPx
      : slideWidthPx && slideWidthPx > 0
        ? Math.round(slideWidthPx * (800 / 1920))
        : 800;
  const maxWidthStyle =
    !immersive && slideWidthPx && slideWidthPx > 0
      ? { maxWidth: `${slideWidthPx}px` }
      : undefined;

  const altText = title || 'Promotional banner';

  const bannerImg = resolvedImageUrl ? (
    <StorefrontImage
      src={resolvedImageUrl}
      alt={altText}
      width={imgWidth}
      height={imgHeight}
      className="hero-slider__media h-auto w-full"
      sizes={HERO_IMAGE_SIZES}
      priority={isLcpSlide}
      fetchPriority={isLcpSlide ? 'high' : 'auto'}
      quality={80}
    />
  ) : null;

  const imageBlock = bannerImg ? (
    <div
      className="@container relative mx-auto w-full overflow-hidden"
      style={maxWidthStyle}
    >
      {wrapImageAsLink ? (
        <Link
          href={ctaHref}
          className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label={ctaLabel || title || 'View offer'}
        >
          {bannerImg}
        </Link>
      ) : (
        bannerImg
      )}
      {showOverlay ? <div className={softScrimClass} aria-hidden /> : null}
      {showOverlay ? (
        <div className={contentWrapperClass}>
          <div className={overlayColumnClass}>
            {title ? <h1 className={headlineClass}>{title}</h1> : null}
            {subtitle ? <p className={subtitleClass}>{subtitle}</p> : null}
            {hasCtaButton ? (
              <Link href={ctaHref} className={ctaClass}>
                {ctaLabel}
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  ) : null;

  return (
    <section
      className={shellClass}
      data-hero-layout={immersive ? 'immersive' : 'card'}
      data-hero-visual={imageOnly ? 'image' : hasImage ? 'image-text' : 'gradient'}
      aria-roledescription="carousel"
      aria-label="Featured promotions"
    >
      <div className={stageClass}>
        {hasImage ? (
          imageBlock
        ) : (
          <>
            <div
              className={
                mehfil
                  ? 'hero-slider-mehfil-fallback absolute inset-0'
                  : 'absolute inset-0 bg-gradient-to-br from-secondary via-background to-muted/40'
              }
              aria-hidden
            />
            <div className={gradientFallbackOverlay} />
            <div className={`${contentWrapperClass} justify-center`}>
              <div className={overlayColumnClass}>
                {title ? <h1 className={headlineClass}>{title}</h1> : null}
                {subtitle ? <p className={subtitleClass}>{subtitle}</p> : null}
                {hasCtaButton ? (
                  <Link href={ctaHref} className={ctaClass}>
                    {ctaLabel}
                  </Link>
                ) : null}
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
                ? 'absolute bottom-4 left-1/2 z-[2] flex -translate-x-1/2 gap-2 sm:bottom-6'
                : 'absolute bottom-4 left-1/2 z-[2] flex -translate-x-1/2 gap-2 md:bottom-6'
            }
          >
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === safeIndex}
                onClick={() => setIndex(i)}
                className={`rounded-full transition-all ${
                  i === safeIndex
                    ? 'h-2 w-2 bg-foreground'
                    : hasImage
                      ? 'h-1.5 w-1.5 bg-foreground/35 hover:bg-foreground/55'
                      : immersive
                        ? 'h-1.5 w-1.5 bg-foreground/30 hover:bg-foreground/50'
                        : 'h-1.5 w-1.5 bg-muted-foreground/40 hover:bg-muted-foreground/65'
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => go(-1)}
            className={`${navBtnClass} left-3 z-[2] sm:left-6 lg:left-8`}
          >
            <span aria-hidden className="block leading-none">
              ‹
            </span>
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => go(1)}
            className={`${navBtnClass} right-3 z-[2] sm:right-6 lg:right-8`}
          >
            <span aria-hidden className="block leading-none">
              ›
            </span>
          </button>
        </>
      ) : null}
    </section>
  );
}
