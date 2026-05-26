/** UA-based browser/OS detection for manual PWA install instructions (V1 parity). */
export interface PwaBrowserInfo {
  isIOS: boolean;
  isMac: boolean;
  isAndroid: boolean;
  isWindows: boolean;
  isLinux: boolean;
  isChrome: boolean;
  isEdge: boolean;
  isSafari: boolean;
  isFirefox: boolean;
  isSamsung: boolean;
  isChromeIOS: boolean;
  isFirefoxIOS: boolean;
  isEdgeIOS: boolean;
  isChromeMobile: boolean;
  isChromeDesktop: boolean;
  isSafariMobile: boolean;
  isSafariDesktop: boolean;
  iOSVersion: number | null;
}

export function getPwaBrowserInfo(userAgent: string): PwaBrowserInfo {
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isMac = /Macintosh|MacIntel|MacPPC|Mac68K/.test(userAgent);
  const isAndroid = /Android/.test(userAgent);
  const isWindows = /Windows/.test(userAgent);
  const isLinux = /Linux/.test(userAgent) && !isAndroid;

  const isChrome =
    /Chrome/.test(userAgent) && !/Edg|OPR|Brave|Samsung|Chromium/.test(userAgent);
  const isEdge = /Edg/.test(userAgent);
  const isSafari = /Safari/.test(userAgent) && !/Chrome|Chromium/.test(userAgent);
  const isFirefox = /Firefox/.test(userAgent);
  const isSamsung = /SamsungBrowser/.test(userAgent);

  const isChromeIOS = isIOS && /CriOS/.test(userAgent);
  const isFirefoxIOS = isIOS && /FxiOS/.test(userAgent);
  const isEdgeIOS = isIOS && /EdgiOS/.test(userAgent);
  const isChromeMobile = isAndroid && isChrome;
  const isChromeDesktop = (isWindows || isMac || isLinux) && isChrome;
  const isSafariMobile = isIOS && isSafari;
  const isSafariDesktop = isMac && isSafari;

  const iOSMatch = userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/);
  const iOSVersion = isIOS && iOSMatch ? parseFloat(iOSMatch[1]) : null;

  return {
    isIOS,
    isMac,
    isAndroid,
    isWindows,
    isLinux,
    isChrome,
    isEdge,
    isSafari,
    isFirefox,
    isSamsung,
    isChromeIOS,
    isFirefoxIOS,
    isEdgeIOS,
    isChromeMobile,
    isChromeDesktop,
    isSafariMobile,
    isSafariDesktop,
    iOSVersion,
  };
}
