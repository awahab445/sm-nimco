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

  /** Signal chrome: transparent header over full-viewport home hero (Kalles-style). */
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

  const stageClass = immersive
    ? 'hero-slider__stage absolute inset-0'
    : hasImage
      ? 'relative w-full overflow-hidden rounded-sm'
      : 'relative aspect-[21/9] min-h-[280px] w-full md:min-h-[320px]';

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

  const contentWrapperClass = immersive
    ? `absolute inset-0 z-[1] flex flex-col ${justifyY} ${alignX} px-4 pb-14 pt-16 sm:px-8 sm:pb-20 sm:pt-24 lg:px-12 xl:px-16`
    : `absolute inset-0 z-[1] flex flex-col ${justifyY} ${alignX} p-5 sm:p-6 md:p-10 lg:p-12`;

  const isLightText = textColor === 'light';
  const headlineTone = isLightText ? 'text-white' : 'text-foreground';
  const subtitleTone = isLightText ? 'text-white/85' : 'text-muted-foreground';

  const headlineClass = immersive
    ? `font-display max-w-2xl text-[1.75rem] font-semibold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl ${headlineTone}`
    : `font-display max-w-xl text-xl font-semibold tracking-tight sm:text-2xl md:text-4xl lg:text-5xl ${headlineTone}`;

  const subtitleClass = immersive
    ? `mt-4 max-w-xl text-base sm:text-lg md:text-xl ${subtitleTone}`
    : `mt-3 max-w-lg text-base md:text-lg ${subtitleTone}`;

  const ctaClass = hasImage
    ? isLightText
      ? `mt-6 inline-flex sm:mt-8 ${storefrontUi.btnPrimaryInverted} ${
          immersive ? 'px-6 py-3 text-sm sm:text-base' : 'px-5 py-2.5'
        }`
      : `mt-6 inline-flex sm:mt-8 ${storefrontUi.btnPrimary} ${
          immersive ? 'px-6 py-3 text-sm sm:text-base' : 'px-5 py-2.5'
        }`
    : `mt-6 inline-flex sm:mt-8 ${storefrontUi.btnPrimary} ${
        immersive ? 'px-6 py-3 text-sm sm:text-base' : 'px-5 py-2.5'
      }`;

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

  const dimW = !immersive && slideWidthPx && slideWidthPx > 0 ? slideWidthPx : 0;
  const dimH = !immersive && slideHeightPx && slideHeightPx > 0 ? slideHeightPx : 0;
  const imgWidth = dimW > 0 ? dimW : dimH > 0 ? Math.round(dimH * (2400 / 1000)) : 2400;
  const imgHeight = dimH > 0 ? dimH : dimW > 0 ? Math.round(dimW * (1000 / 2400)) : 1000;
  const sizesAttr = dimW > 0 ? `(max-width: ${dimW}px) 100vw, ${dimW}px` : '100vw';

  const imgFillBox = dimW > 0 && dimH > 0;
  const altText = title || 'Promotional banner';

  const immersiveBannerImg = resolvedImageUrl ? (
    <StorefrontImage
      src={resolvedImageUrl}
      alt={altText}
      fill
      className="hero-slider__media object-cover object-center"
      sizes="100vw"
      priority={isLcpSlide}
      fetchPriority={isLcpSlide ? 'high' : 'auto'}
      quality={75}
    />
  ) : null;

  const cardBannerImg = resolvedImageUrl ? (
    <StorefrontImage
      src={resolvedImageUrl}
      alt={altText}
      width={imgWidth}
      height={imgHeight}
      className={
        imgFillBox
          ? 'block h-full w-full object-cover object-center'
          : dimW > 0
            ? 'block h-auto w-full max-w-full object-cover object-center'
            : dimH > 0
              ? 'mx-auto block h-auto max-h-full w-full max-w-full object-cover object-center'
              : 'block h-auto w-full object-cover object-center'
      }
      sizes={sizesAttr}
      priority={isLcpSlide}
      fetchPriority={isLcpSlide ? 'high' : 'auto'}
      quality={70}
    />
  ) : null;

  const cardImageStage =
    dimW > 0 && dimH > 0 ? (
      <div
        className="mx-auto w-full overflow-hidden"
        style={{ maxWidth: `${dimW}px`, aspectRatio: `${dimW} / ${dimH}` }}
      >
        {cardBannerImg}
      </div>
    ) : dimW > 0 ? (
      <div className="mx-auto w-full" style={{ maxWidth: `${dimW}px` }}>
        {cardBannerImg}
      </div>
    ) : dimH > 0 ? (
      <div className="mx-auto w-full overflow-hidden" style={{ maxHeight: `${dimH}px` }}>
        {cardBannerImg}
      </div>
    ) : (
      cardBannerImg
    );

  const linkedImmersiveBanner =
    resolvedImageUrl && wrapImageAsLink ? (
      <Link
        href={ctaHref}
        className="absolute inset-0 block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label={ctaLabel || title || 'View offer'}
      >
        {immersiveBannerImg}
      </Link>
    ) : (
      immersiveBannerImg
    );

  const linkedCardBanner =
    resolvedImageUrl && wrapImageAsLink ? (
      <Link
        href={ctaHref}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label={ctaLabel || title || 'View offer'}
      >
        {cardImageStage}
      </Link>
    ) : (
      cardImageStage
    );

  const overlayCopy = showOverlay ? (
    <div className={contentWrapperClass}>
      <div
        className={
          immersive
            ? `w-full max-w-[100rem] ${textAlign === 'center' ? 'flex flex-col items-center' : textAlign === 'right' ? 'flex flex-col items-end' : ''}`
            : `max-w-xl ${textAlign === 'center' ? 'flex flex-col items-center' : textAlign === 'right' ? 'flex flex-col items-end' : ''}`
        }
      >
        {title ? <h1 className={headlineClass}>{title}</h1> : null}
        {subtitle ? <p className={subtitleClass}>{subtitle}</p> : null}
        {hasCtaButton ? (
          <Link href={ctaHref} className={ctaClass}>
            {ctaLabel}
          </Link>
        ) : null}
      </div>
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
          <>
            {immersive ? linkedImmersiveBanner : linkedCardBanner}
            {showOverlay ? <div className={softScrimClass} aria-hidden /> : null}
            {overlayCopy}
          </>
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
            <div
              className={
                immersive
                  ? 'absolute inset-0 z-[1] flex flex-col justify-center px-4 pb-14 pt-16 sm:px-8 sm:pb-20 sm:pt-24 lg:px-12 xl:px-16'
                  : 'absolute inset-0 z-[1] flex flex-col justify-end p-5 sm:p-6 md:p-10 lg:p-12'
              }
            >
              <div className={immersive ? 'mx-auto w-full max-w-[100rem]' : 'max-w-xl'}>
                {title ? (
                  <h1
                    className={
                      immersive
                        ? 'font-display max-w-2xl text-[1.75rem] font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl'
                        : 'font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl md:text-4xl lg:text-5xl'
                    }
                  >
                    {title}
                  </h1>
                ) : null}
                {subtitle ? (
                  <p
                    className={
                      immersive
                        ? 'mt-4 max-w-xl text-base text-muted-foreground sm:text-lg md:text-xl'
                        : 'mt-3 text-base text-muted-foreground md:text-lg'
                    }
                  >
                    {subtitle}
                  </p>
                ) : null}
                {hasCtaButton ? (
                  <Link
                    href={ctaHref}
                    className={`mt-6 inline-flex sm:mt-8 ${storefrontUi.btnPrimary} ${
                      immersive ? 'px-6 py-3 text-sm sm:text-base' : 'px-5 py-2.5'
                    }`}
                  >
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
                ? 'absolute bottom-6 left-1/2 z-[2] flex -translate-x-1/2 gap-2 sm:bottom-8'
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
