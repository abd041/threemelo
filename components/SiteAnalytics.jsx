'use client';
import {useEffect, useId, useRef, useState} from 'react';
import {usePathname} from 'next/navigation';
import {tools} from '../lib/catalog.mjs';
import {CONSENT_STORAGE_KEY, applyAnalyticsConsent, createPageViewTracker, readConsent, safeFormat, toolSlugFromPath, track} from '../lib/analytics.mjs';

const slugs = new Set(tools.map(tool => tool.slug));

function currentTool() {
  return toolSlugFromPath(window.location.pathname, slugs);
}

export function CookieSettingsButton() {
  return <button type="button" className="cookie-settings" onClick={() => window.dispatchEvent(new Event('threemelo-consent'))}>Cookie preferences</button>;
}

export default function SiteAnalytics() {
  const pathname = usePathname();
  const titleId = useId();
  const pages = useRef(null);
  const dialogRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [choice, setChoice] = useState(null);
  const [open, setOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    let saved = null;
    try { saved = readConsent(localStorage.getItem(CONSENT_STORAGE_KEY)); } catch { saved = null; }
    applyAnalyticsConsent(saved?.analytics === true);
    setChoice(saved);
    setAnalytics(saved?.analytics === true);
    setReady(true);
    const openPreferences = () => setOpen(true);
    const syncConsent = event => {
      if (event.key !== CONSENT_STORAGE_KEY && event.key !== null) return;
      let next = null;
      try { next = readConsent(localStorage.getItem(CONSENT_STORAGE_KEY)); } catch {}
      applyAnalyticsConsent(next?.analytics === true);
      setChoice(next);
      setAnalytics(next?.analytics === true);
    };
    window.addEventListener('storage', syncConsent);
    window.addEventListener('threemelo-consent', openPreferences);
    return () => {
      window.removeEventListener('storage', syncConsent);
      window.removeEventListener('threemelo-consent', openPreferences);
    };
  }, []);

  useEffect(() => {
    if (!ready || !choice?.analytics) { pages.current = null; return; }
    if (!pages.current) pages.current = createPageViewTracker();
    const payload = pages.current(pathname);
    if (!payload) return;
    track('page_view', {page_path: payload.page_path});
    const slug = toolSlugFromPath(pathname, slugs);
    if (slug) track('tool_open', {tool: slug});
  }, [pathname, ready, choice]);

  useEffect(() => {
    let lastUpload = 0;
    let lastError = 0;
    function reportUpload(files) {
      const tool = currentTool();
      if (!tool || !files?.length) return;
      const now = Date.now();
      if (now - lastUpload < 500) return;
      lastUpload = now;
      const format = files.length > 1 ? 'multiple' : safeFormat(files[0].type, files[0].name);
      track('file_upload', {tool, format});
    }
    function onChange(event) {
      const target = event.target;
      const tool = currentTool();
      if (!tool || !target?.closest?.('main')) return;
      if (target instanceof HTMLInputElement && target.type === 'file') {
        reportUpload(target.files);
        return;
      }
      if (target instanceof HTMLSelectElement) track('preset_selected', {tool});
      else if (target.matches?.('input, textarea')) track('tool_interaction', {tool});
    }
    function onDrop(event) {
      reportUpload(event.dataTransfer?.files);
    }
    function onClick(event) {
      if (event.target?.closest?.('a[href^="mailto:"]:not([data-analytics-tracked])')) {
        track('contact_email_open', {action: 'mailto'});
      }
      const tool = currentTool();
      if (!tool) return;
      const button = event.target?.closest?.('button');
      if (!button || button.closest('.tm-cookie, .tm-cookie-dialog, footer, .nav')) return;
      if (button.closest('.presets')) {
        track('preset_selected', {tool});
        return;
      }
      track('tool_interaction', {tool});
    }
    const seen = new WeakSet();
    const observer = new MutationObserver(() => {
      const tool = currentTool();
      if (!tool) return;
      for (const alert of document.querySelectorAll('main [role="alert"]')) {
        if (seen.has(alert) || !alert.textContent.trim()) continue;
        seen.add(alert);
        const now = Date.now();
        if (now - lastError < 2000) continue;
        lastError = now;
        track('tool_error', {tool});
      }
    });
    document.addEventListener('change', onChange, true);
    document.addEventListener('drop', onDrop, true);
    document.addEventListener('click', onClick, true);
    observer.observe(document.body, {childList: true, subtree: true, characterData: true});
    return () => {
      document.removeEventListener('change', onChange, true);
      document.removeEventListener('drop', onDrop, true);
      document.removeEventListener('click', onClick, true);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (open) dialogRef.current?.querySelector('button, input')?.focus();
  }, [open]);

  function save(analyticsGranted) {
    const next = {analytics: analyticsGranted === true};
    try { localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(next)); } catch { /* preference stays for this view */ }
    applyAnalyticsConsent(next.analytics);
    setChoice(next);
    setAnalytics(next.analytics);
    setOpen(false);
  }

  if (!ready) return null;
  const showBanner = choice === null && !open;

  return (
    <>
      {showBanner && (
        <div className="tm-cookie" role="region" aria-label="Cookie preferences">
          <p>ThreeMelo uses Google Tag Manager. Analytics stays off until you allow it. Advertising and remarketing stay off. Files, names, search text and contact details are not sent.</p>
          <div>
            <button type="button" className="button" onClick={() => save(true)}>Allow analytics</button>
            <button type="button" className="tm-outline" onClick={() => save(false)}>Reject non-essential</button>
            <button type="button" className="tm-outline" onClick={() => setOpen(true)}>Manage choices</button>
          </div>
        </div>
      )}
      {open && (
        <div className="tm-cookie-backdrop" onClick={() => setOpen(false)}>
          <div className="tm-cookie-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId} ref={dialogRef} onClick={event => event.stopPropagation()} onKeyDown={event => {
            if (event.key === 'Escape') { setOpen(false); return; }
            if (event.key !== 'Tab') return;
            const items = [...dialogRef.current.querySelectorAll('button, input:not(:disabled)')];
            const first = items[0];
            const last = items[items.length - 1];
            if (!first) return;
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
          }}>
            <h2 id={titleId}>Cookie preferences</h2>
            <p>Your choice is stored in this browser. It does not include your name, files or messages.</p>
            <label className="tm-cookie-row"><input type="checkbox" checked disabled /> <span><strong>Necessary</strong> Remembers this preference on this device.</span></label>
            <label className="tm-cookie-row"><input type="checkbox" checked={analytics} onChange={event => setAnalytics(event.target.checked)} /> <span><strong>Analytics</strong> Allows measurement tags in Google Tag Manager to use analytics storage. No measurement tag is included in the site code.</span></label>
            <label className="tm-cookie-row"><input type="checkbox" checked={false} disabled /> <span><strong>Advertising</strong> Not used. Remarketing and ad storage stay denied.</span></label>
            <div>
              <button type="button" className="button" onClick={() => save(analytics)}>Save choices</button>
              <button type="button" className="tm-outline" onClick={() => setOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
