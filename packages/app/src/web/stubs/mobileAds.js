import React, {useEffect, useId, useMemo, useRef} from 'react';

const DEFAULT_WEB_AD_UNIT_ID = 'ca-pub-6098454400067335/4250943648';
const WEB_ADS_DISABLED = true;

const mobileAds = () => ({
  initialize: async () => {},
});

const parseAdUnitId = unitId => {
  const normalizedUnitId =
    typeof unitId === 'string' && unitId.includes('/')
      ? unitId
      : DEFAULT_WEB_AD_UNIT_ID;
  const [client, slot] = normalizedUnitId.split('/');

  return {
    client,
    slot,
  };
};

const shouldLogAdSense = () =>
  typeof console !== 'undefined';

const getAdDiagnostics = adElement => {
  const iframe = adElement?.querySelector('iframe');
  const adRect = adElement?.getBoundingClientRect();
  const iframeRect = iframe?.getBoundingClientRect();

  return {
    hasElement: Boolean(adElement),
    hasScript: Boolean(window.adsbygoogle),
    hasScriptTag: Boolean(
      document.querySelector(
        'script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]',
      ),
    ),
    hasIframe: Boolean(iframe),
    width: adRect?.width ?? 0,
    height: adRect?.height ?? 0,
    iframeWidth: iframeRect?.width ?? 0,
    iframeHeight: iframeRect?.height ?? 0,
    status: adElement?.getAttribute('data-ad-status'),
    iframeDisplay: iframe ? window.getComputedStyle(iframe).display : null,
    iframeVisibility: iframe ? window.getComputedStyle(iframe).visibility : null,
  };
};

const EnabledBannerAd = ({unitId, size}) => {
  const adId = useId();
  const pushedRef = useRef(false);
  const retryTimeoutRef = useRef(null);
  const loggedRef = useRef({
    mounted: false,
    missingElement: false,
    zeroWidth: false,
    missingScriptTag: false,
  });
  const {client, slot} = useMemo(() => parseAdUnitId(unitId), [unitId]);
  const minHeight = size === BannerAdSize.ANCHORED_ADAPTIVE_BANNER ? 90 : 50;

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const log = (type, message, payload) => {
      if (!shouldLogAdSense()) {
        return;
      }

      const logger = type === 'warn' ? console.warn : console.info;
      logger(`[AdSense] ${message}`, payload);
    };

    if (!loggedRef.current.mounted) {
      loggedRef.current.mounted = true;
      log('info', 'banner mounted', {client, slot, adId});
    }

    const pushAd = () => {
      if (pushedRef.current) {
        return;
      }

      const adElement = document.getElementById(adId);
      if (!adElement) {
        if (!loggedRef.current.missingElement) {
          loggedRef.current.missingElement = true;
          log('warn', 'ad element not found yet', {adId});
        }
        retryTimeoutRef.current = window.setTimeout(pushAd, 100);
        return;
      }

      const width = adElement.getBoundingClientRect().width;
      if (width <= 0) {
        if (!loggedRef.current.zeroWidth) {
          loggedRef.current.zeroWidth = true;
          log('warn', 'ad element width is zero', {adId});
        }
        retryTimeoutRef.current = window.setTimeout(pushAd, 100);
        return;
      }

      const hasScriptTag = Boolean(
        document.querySelector(
          'script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]',
        ),
      );
      if (!hasScriptTag && !loggedRef.current.missingScriptTag) {
        loggedRef.current.missingScriptTag = true;
        log('warn', 'adsbygoogle script tag is missing', {
            adId,
            client,
            slot,
        });
      }

      pushedRef.current = true;
      window.adsbygoogle = window.adsbygoogle || [];

      try {
        window.adsbygoogle.push({});
        log('info', 'push called', {
          adId,
          client,
          slot,
          width,
          status: adElement.getAttribute('data-ad-status'),
        });
      } catch (error) {
        pushedRef.current = false;
        console.warn('[AdSense] banner render failed', error);
      }
    };

    const animationFrameId = window.requestAnimationFrame(pushAd);
    const logStatus = label => {
      const adElement = document.getElementById(adId);
      const diagnostics = {
        ...getAdDiagnostics(adElement),
        client,
        slot,
      };

      const hasBlankAd =
        diagnostics.status === 'unfilled' ||
        (diagnostics.hasIframe && diagnostics.iframeHeight <= 1);

      log(
        hasBlankAd ? 'warn' : 'info',
        `${label}: status=${diagnostics.status ?? 'null'}, height=${diagnostics.height}, iframeHeight=${diagnostics.iframeHeight}, hasIframe=${diagnostics.hasIframe}`,
        diagnostics,
      );
    };

    let observer = null;
    const observerTimeoutId = window.setTimeout(() => {
      const adElement = document.getElementById(adId);

      if (!adElement || typeof MutationObserver === 'undefined') {
        return;
      }

      observer = new MutationObserver(() => {
        logStatus('banner changed');
      });
      observer.observe(adElement, {
        attributes: true,
        attributeFilter: ['data-ad-status', 'style'],
        childList: true,
        subtree: true,
      });
    }, 0);

    const statusTimeoutId = window.setTimeout(() => {
      logStatus('banner status after 2.5s');
    }, 2500);
    const lateStatusTimeoutId = window.setTimeout(() => {
      logStatus('banner status after 8s');
    }, 8000);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.clearTimeout(observerTimeoutId);
      window.clearTimeout(statusTimeoutId);
      window.clearTimeout(lateStatusTimeoutId);
      observer?.disconnect();

      if (retryTimeoutRef.current) {
        window.clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
  }, [adId, client, slot]);

  return React.createElement(
    'div',
    {
      'data-trio-web-ad': 'banner',
      style: {
        width: '100%',
        minHeight,
        height: minHeight,
        display: 'block',
      },
    },
    React.createElement('ins', {
      id: adId,
      className: 'adsbygoogle',
      style: {
        display: 'block',
        width: '100%',
        minWidth: 320,
        minHeight,
        height: minHeight,
      },
      'data-ad-client': client,
      'data-ad-slot': slot,
      'data-ad-format': 'auto',
      'data-full-width-responsive': 'true',
      'data-adtest': typeof __DEV__ !== 'undefined' && __DEV__ ? 'on' : undefined,
    }),
  );
};

export const BannerAd = props => {
  if (WEB_ADS_DISABLED) {
    // Temporarily disable web ads while keeping native ad imports intact.
    return null;
  }

  return React.createElement(EnabledBannerAd, props);
};
export const BannerAdSize = {
  BANNER: 'BANNER',
  ANCHORED_ADAPTIVE_BANNER: 'ANCHORED_ADAPTIVE_BANNER',
};
export const TestIds = {
  BANNER: DEFAULT_WEB_AD_UNIT_ID,
};

export default mobileAds;
