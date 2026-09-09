/**
 * Blocking boot: set html lang/dir from the URL path before first paint.
 * Safe with suppressHydrationWarning on <html>.
 */
export const LOCALE_HTML_BOOT = `(function(){try{var p=location.pathname.split('/');var loc=(p[1]==='ar'||p[1]==='en')?p[1]:'en';var h=document.documentElement;h.lang=loc;h.dir=loc==='ar'?'rtl':'ltr';h.setAttribute('data-locale',loc);h.classList.toggle('locale-ar',loc==='ar');h.classList.toggle('locale-en',loc==='en');}catch(e){}})();`;
