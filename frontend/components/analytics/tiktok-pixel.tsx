import Script from 'next/script';

// Strict allow-list: the id is interpolated into an inline script.
const TIKTOK_PIXEL_ID_REGEX = /^[A-Z0-9]{16,24}$/;

type Props = {
  pixelId?: string | null;
};

/**
 * TikTok base pixel. `ttq.page()` is intentionally omitted — AnalyticsPageView
 * fires it on every SPA route change (avoids a double count on first load).
 */
export function TikTokPixel({ pixelId }: Props) {
  const id = pixelId?.trim();
  if (!id || !TIKTOK_PIXEL_ID_REGEX.test(id)) {
    return null;
  }

  return (
    <Script id="tiktok-pixel" strategy="lazyOnload">
      {`!function (w, d, t) {
w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=d.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=d.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
ttq.load('${id}');
}(window, document, 'ttq');`}
    </Script>
  );
}
