import Script from "next/script"
import { UMAMI_URL, UMAMI_WEBSITE_ID, META_PIXEL_ID } from "@/lib/analytics"

/**
 * Umami (self-hosted, privacy-first) + optional Meta Pixel.
 * Scripts only load when env vars are set — dev/staging stay clean.
 */
export function AnalyticsScripts() {
  return (
    <>
      {UMAMI_URL && UMAMI_WEBSITE_ID && (
        <Script
          defer
          src={`${UMAMI_URL}/script.js`}
          data-website-id={UMAMI_WEBSITE_ID}
          strategy="afterInteractive"
        />
      )}

      {META_PIXEL_ID && (
        <>
          <Script id="meta-pixel-init" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${META_PIXEL_ID}');
              fbq('track', 'PageView');
            `}
          </Script>
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              alt=""
              src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            />
          </noscript>
        </>
      )}
    </>
  )
}
