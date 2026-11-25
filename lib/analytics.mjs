import {tools} from './catalog.mjs';
export const GTM_ID = 'GTM-WDSPZP27';
export const CONSENT_STORAGE_KEY = 'threemelo-consent';

export const ANALYTICS_EVENTS = [
  'page_view',
  'tool_open',
  'tool_interaction',
  'file_upload',
  'file_download',
  'model_export',
  'conversion_complete',
  'preset_selected',
  'tool_search',
  'category_selected',
  'tool_error',
  'contact_email_open',
  'room_planner_start',
  'room_dimensions_changed',
  'furniture_added',
  'furniture_removed',
  'room_template_loaded',
  'room_shape_changed',
  'view_mode_changed',
  'measurement_tool_used',
  'project_saved',
  'project_opened',
  'project_imported',
  'project_exported',
  'png_download',
  'pdf_download',
  'json_download',
  'fullscreen_enabled',
  'related_tool_clicked',
  'gcode_viewer_open',
  'gcode_file_open',
  'gcode_demo_load',
  'gcode_parse_success',
  'gcode_parse_error',
  'gcode_parse_cancel',
  'gcode_reset',
  'gcode_view_change',
  'gcode_fit_view',
  'gcode_fullscreen',
  'gcode_layer_change',
  'gcode_color_change',
  'gcode_playback',
  'gcode_source_toggle',
  'gcode_export',
  'gcode_copy_summary',
  'gcode_related_tool',
  'gcode_webgl_fallback',

];

const EVENT_SET = new Set(ANALYTICS_EVENTS);
const MODEL_FORMATS = new Set(['stl', 'obj', 'glb', 'gltf', 'fbx']);
const FORMATS = new Set([...MODEL_FORMATS, 'svg', 'png', 'jpg', 'webp', 'json', 'css', 'csv', 'gcode', 'txt', 'pdf']);
const CONVERTERS = new Set(['glb-to-stl', 'stl-to-obj', 'svg-to-stl', 'obj-to-stl']);
const MIME_FORMATS = {
  'model/stl': 'stl',
  'application/sla': 'stl',
  'application/vnd.ms-pki.stl': 'stl',
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
  'application/json': 'json',
  'text/css': 'css',
  'text/csv': 'csv',
  'model/gltf-binary': 'glb',
  'model/gltf+json': 'gltf',
};

export const CONSENT_DEFAULT = {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'denied',
  personalization_storage: 'denied',
  security_storage: 'granted',
  wait_for_update: 500,
};

export const CONSENT_BOOTSTRAP = `(function(){
window.dataLayer=window.dataLayer||[];
window.gtag=window.gtag||function(){window.dataLayer.push(arguments);};
window.gtag('consent','default',${JSON.stringify(CONSENT_DEFAULT)});
window.gtag('set','ads_data_redaction',true);
window.gtag('set','url_passthrough',false);
window.gtag('set','allow_google_signals',false);
window.gtag('set','allow_ad_personalization_signals',false);
try{
var saved=JSON.parse(localStorage.getItem('${CONSENT_STORAGE_KEY}')||'null');
window.__threemeloAnalyticsAllowed=!!(saved&&saved.analytics===true);
if(window.__threemeloAnalyticsAllowed){
window.gtag('consent','update',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',functionality_storage:'denied',personalization_storage:'denied'});
}
}catch(e){}
})();`;

export function normalizePath(path) {
  const raw = String(path ?? '/').split('?')[0].split('#')[0];
  const collapsed = (raw.startsWith('/') ? raw : `/${raw}`).replace(/\/{2,}/g, '/');
  if (!collapsed || collapsed === '/') return '/';
  return collapsed.endsWith('/') ? collapsed : `${collapsed}/`;
}

export function sanitizePagePath(path) {
  const clean = normalizePath(path).toLowerCase();
  return new Set(['/', '/tools/', '/about/', '/contact/', '/privacy/', '/terms/', ...tools.map(tool => `/${tool.slug}/`)]).has(clean) ? clean : '/';
}

export function toolSlugFromPath(path, slugs) {
  const slug = normalizePath(path).replace(/^\/|\/$/g, '');
  return slugs.has(slug) ? slug : '';
}

export function safeFormat(mime, name) {
  if (mime && MIME_FORMATS[String(mime).toLowerCase()]) return MIME_FORMATS[String(mime).toLowerCase()];
  const match = String(name || '').toLowerCase().match(/\.([a-z0-9]{1,8})$/);
  if (!match) return 'other';
  const value = match[1] === 'jpeg' ? 'jpg' : match[1];
  return FORMATS.has(value) ? value : 'other';
}

export function isSafeToken(value) {
  return typeof value === 'string'
    && value.length > 0
    && value.length <= 40
    && /^[A-Za-z0-9 ._+()&/'°%-]+$/.test(value)
    && !/@|https?:|\\|\/\//i.test(value)
    && !/\.[a-z0-9]{2,5}$/i.test(value);
}

export function isConverter(slug) {
  return CONVERTERS.has(slug);
}

export function isModelFormat(format) {
  return MODEL_FORMATS.has(format);
}

export function readConsent(raw) {
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!parsed || typeof parsed.analytics !== 'boolean') return null;
    return {analytics: parsed.analytics === true};
  } catch {
    return null;
  }
}

export function consentUpdate(analyticsGranted) {
  return {
    analytics_storage: analyticsGranted ? 'granted' : 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    functionality_storage: 'denied',
    personalization_storage: 'denied',
  };
}

export function buildDataLayerEvent(event, params = {}) {
  if (!EVENT_SET.has(event)) return null;
  const payload = {event};
  if (params.page_path !== undefined) payload.page_path = sanitizePagePath(params.page_path);
  if (tools.some(tool => tool.slug === params.tool)) payload.tool = params.tool;
  if (params.format !== undefined && (FORMATS.has(params.format) || params.format === 'other' || params.format === 'multiple')) payload.format = params.format;
  if (['All tools', ...tools.map(tool => tool.category)].includes(params.category)) payload.category = params.category;
  if (params.action !== undefined && (params.action === 'mailto' || params.action === 'gmail')) payload.action = params.action;
  if (Number.isInteger(params.result_count) && params.result_count >= 0 && params.result_count <= 100) payload.result_count = params.result_count;
  if (typeof params.detail === 'string' && /^[a-z0-9-]{1,32}$/.test(params.detail)) payload.detail = params.detail;
  return payload;
}

export function createPageViewTracker() {
  let last = null;
  let started = false;
  return function observe(path) {
    const clean = sanitizePagePath(path);
    if (!started) {
      started = true;
      last = clean;
      return buildDataLayerEvent('page_view', {page_path: clean});
    }
    if (clean === last) return null;
    last = clean;
    return buildDataLayerEvent('page_view', {page_path: clean});
  };
}

export function pushDataLayerEvent(event, params, options = {}) {
  if (typeof window === 'undefined') return false;
  if (!options.production) return false;
  if (!options.analyticsAllowed) return false;
  const payload = buildDataLayerEvent(event, params);
  if (!payload) return false;
  window.dataLayer = window.dataLayer || [];
  const page_path = sanitizePagePath(params?.page_path ?? window.location?.pathname ?? '/');
  window.dataLayer.push({...payload, page_path, page_location: `https://threemelo.com${page_path}`, page_referrer: ''});
  return true;
}

export function track(event, params) {
  let analyticsAllowed = false;
  if (typeof window !== 'undefined') {
    analyticsAllowed = window.__threemeloAnalyticsAllowed === true;
  }
  return pushDataLayerEvent(event, params, {production: process.env.NODE_ENV === 'production', analyticsAllowed});
}

export function applyAnalyticsConsent(analyticsGranted) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag(){window.dataLayer.push(arguments);};
  window.__threemeloAnalyticsAllowed = analyticsGranted === true;
  window.gtag('consent', 'update', consentUpdate(analyticsGranted));
  window.dispatchEvent(new Event('threemelo-analytics-consent'));
}

// Called only after a tool has prepared its downloadable artifact. Never send its name.
export function trackDownload(filename) {
  if (typeof window === 'undefined') return;
  const tool = toolSlugFromPath(window.location.pathname, new Set(tools.map(item => item.slug)));
  if (!tool) return;
  const format = safeFormat('', filename);
  track('file_download', {tool, format});
  if (isModelFormat(format)) track('model_export', {tool, format});
  if (isConverter(tool) && isModelFormat(format)) track('conversion_complete', {tool, format});
}
