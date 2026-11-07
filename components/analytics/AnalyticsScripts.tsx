"use client"

import Script from "next/script"
import { useFirstInteraction } from "./useFirstInteraction"
import { useTrackingConsent } from "./useTrackingConsent"
import {
  UMAMI_URL,
  UMAMI_WEBSITE_ID,
  META_PIXEL_ID,
  TIKTOK_PIXEL_ID,
  GOOGLE_ADS_ID,
} from "@/lib/analytics"

/**
 * Umami (self-hosted, privacy-first) + optional Meta / TikTok Pixel / Google Ads.
 * Scripts only load when env vars are set — dev/staging stay clean.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * QUÉ CARGA CUÁNDO, Y POR QUÉ
 *
 * Umami va inmediato: son 2,7 KB comprimidos, mismo origen, y es la medición
 * que de verdad se usa. No compite con nada.
 *
 * Los tres píxeles publicitarios (~472 KB y cuatro tareas largas de más de
 * 50 ms) esperan al primer gesto de la visitante. No hacen falta para pintar
 * la página y sacarlos de la ruta crítica fue, junto con el vídeo del hero, el
 * cambio de mayor efecto sobre el LCP de móvil.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * EL DETALLE QUE NO SE PUEDE TOCAR: EL `init` DE GOOGLE ADS VA EAGER
 *
 * Meta y TikTok tienen cola propia en `lib/analytics.ts`
 * (`window.__fbqPending`, `window.__ttqPending`) y sus scripts de arranque la
 * vacían al cargar, así que un clic a WhatsApp anterior a la carga no se
 * pierde.
 *
 * Google Ads NO tiene esa cola: `gtag()` en `lib/analytics.ts` comprueba
 * `typeof window.gtag === "function"` y, si no existe, DESCARTA el evento en
 * silencio. Escenario real: una paciente entra y lo primero que hace es tocar
 * «Agendar por WhatsApp». Ese gesto es a la vez la primera interacción y la
 * conversión, así que si el `init` esperara, `gadsConversion()` correría antes
 * de que `gtag` existiera y la conversión se perdería sin ningún error visible.
 *
 * La solución es separar las dos piezas: el `init` —tres líneas que definen
 * `gtag()` empujando a `dataLayer`, que ES la cola— se queda inmediato, y lo
 * que espera es el script externo de 160 KB. Cuando llega, drena `dataLayer`.
 *
 * NO fusionar estos dos `<Script>` ni mover el `init` detrás de la
 * interacción.
 */
export function AnalyticsScripts() {
  const interactuado = useFirstInteraction()
  const { aceptado } = useTrackingConsent()

  // Dos condiciones, no una. El consentimiento decide SI se cargan; la primera
  // interacción decide CUÁNDO. Quien acepta y no toca nada sigue sin pagar los
  // ~472 KB durante el primer pintado.
  const cargarPublicidad = aceptado && interactuado

  return (
    <>
      {UMAMI_URL && UMAMI_WEBSITE_ID && (
        <Script
          defer
          // Mismo origen: ver rewrites en next.config.mjs y app/api/send.
          src="/script.js"
          data-website-id={UMAMI_WEBSITE_ID}
          strategy="afterInteractive"
        />
      )}

      {META_PIXEL_ID && cargarPublicidad && (
        <>
          {/* Tras la primera interacción. Los eventos anteriores esperan en
              window.__fbqPending (lib/analytics.ts) y se vacían abajo. */}
          <Script id="meta-pixel-init" strategy="lazyOnload">
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
              (window.__fbqPending||[]).forEach(function(a){fbq.apply(null,a)});
              window.__fbqPending=[];
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

      {TIKTOK_PIXEL_ID && cargarPublicidad && (
        <Script id="tiktok-pixel-init" strategy="lazyOnload">
          {`
            !function (w, d, t) {
              w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
              ttq.load('${TIKTOK_PIXEL_ID}');
              ttq.page();
              (w.__ttqPending||[]).forEach(function(a){ttq.track(a[0],a[1])});
              w.__ttqPending=[];
            }(window, document, 'ttq');
          `}
        </Script>
      )}

      {GOOGLE_ADS_ID && aceptado && (
        <>
          {/* EAGER a propósito. Define `window.gtag` y la cola `dataLayer`
              antes de que nadie pueda pulsar nada. Son ~100 bytes inline, sin
              petición de red. Si esto esperara, la conversión de la paciente
              que entra y toca WhatsApp de inmediato se perdería en silencio
              (ver la cabecera de este archivo). */}
          <Script id="google-ads-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GOOGLE_ADS_ID}');
            `}
          </Script>
          {/* Los 160 KB sí esperan. Al cargar, drena lo que haya en
              `dataLayer`, incluidas las conversiones ya encoladas. */}
          {cargarPublicidad && (
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
              strategy="lazyOnload"
            />
          )}
        </>
      )}
    </>
  )
}
