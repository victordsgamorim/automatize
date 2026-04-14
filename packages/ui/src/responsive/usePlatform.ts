'use client';

import { useState, useEffect } from 'react';

export interface PlatformInfo {
  isMac: boolean;
  isWindows: boolean;
  isAndroid: boolean;
  isIOS: boolean;
  isDesktop: boolean;
  isWeb: boolean;
}

export function usePlatform(): PlatformInfo {
  // We initialize with a safe default. Since this is mainly used in .web files, isWeb is true.
  const [platform, setPlatform] = useState<PlatformInfo>({
    isMac: false,
    isWindows: false,
    isAndroid: false,
    isIOS: false,
    isDesktop: false,
    isWeb: true,
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined')
      return;

    const nav = navigator as Navigator & {
      userAgentData?: { platform?: string; mobile?: boolean };
    };

    let isMac = false;
    let isWindows = false;
    let isAndroid = false;
    let isIOS = false;
    let isDesktop = true;

    // Use modern userAgentData if available (Chromium based browsers)
    if (nav.userAgentData) {
      const p = nav.userAgentData.platform?.toLowerCase() || '';
      isMac = p.includes('mac');
      isWindows = p.includes('win');
      isAndroid = p.includes('android');
      // For iOS, userAgentData isn't completely reliable as Safari doesn't support it, but just in case
      isIOS = p.includes('ios');
      isDesktop = !nav.userAgentData.mobile;
    } else {
      // Fallback to traditional userAgent string parsing
      const ua = navigator.userAgent.toLowerCase();
      isMac = /mac|ipod|iphone|ipad/.test(ua);
      isWindows = /win/.test(ua);
      isAndroid = /android/.test(ua);
      isIOS =
        /ipad|iphone|ipod/.test(ua) ||
        (ua.includes('mac') && navigator.maxTouchPoints > 1);

      const isMobileString =
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
          ua
        );
      isDesktop = !isMobileString && !isIOS && !isAndroid;
    }

    setPlatform({
      isMac,
      isWindows,
      isAndroid,
      isIOS,
      isDesktop,
      isWeb: true, // Currently always running in a web environment if this hook is used in web components
    });
  }, []);

  return platform;
}
