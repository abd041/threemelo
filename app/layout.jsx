import '@fontsource-variable/inter';
import '@fontsource-variable/space-grotesk';
import '@fontsource-variable/jetbrains-mono';
import Script from 'next/script';
import SiteHeader from '../components/SiteHeader.jsx';
import Brand from '../components/Brand.jsx';
import {homeCategories,categoryId} from '../lib/home.mjs';
import './globals.css';
import SiteAnalytics, {CookieSettingsButton} from '../components/SiteAnalytics.jsx';
import {CONSENT_BOOTSTRAP, GTM_ID} from '../lib/analytics.mjs';
import {SUPPORT_EMAIL} from '../lib/site.mjs';

const GTM_LOADER = `(function(){
function load(){
if(window.__threemeloAnalyticsAllowed!==true)return;
if(window.__threemeloGtm)return;
window.__threemeloGtm=true;
window.dataLayer=window.dataLayer||[];
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');
}
window.addEventListener('threemelo-analytics-consent',load);
load();
})();`;

// Static export cannot verify consent with JavaScript disabled. Keep the official
// fallback inert until a deployment can establish consent before serving HTML.
const NOSCRIPT_CONSENT_VERIFIED = false;

export const metadata = {
  metadataBase: new URL('https://threemelo.com'),
  title: {default: 'ThreeMelo — Free Online 3D Tools', template: '%s | ThreeMelo'},
  description: 'Create, visualize and export 3D designs directly in your browser. Free online 3D tools with no account required.',
  icons: {
    icon: [{url: '/brand-mark.svg', type: 'image/svg+xml'}],
    apple: [{url: '/apple-icon.png', sizes: '180x180', type: 'image/png'}],
  },
  openGraph: {
    siteName: 'ThreeMelo',
    images: [{url: '/studio-social.png', width: 1200, height: 630, alt: 'ThreeMelo ? browser-based 3D studio'}],
  },
};

const organization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://threemelo.com/#organization',
  name: 'ThreeMelo',
  url: 'https://threemelo.com/',
  logo: 'https://threemelo.com/brand-mark.svg',
  email: SUPPORT_EMAIL,
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: SUPPORT_EMAIL,
    url: 'https://threemelo.com/contact/',
    availableLanguage: 'English',
  },
};

export default function Layout({children}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body><script dangerouslySetInnerHTML={{__html: `try{document.documentElement.dataset.theme=localStorage.getItem('tm-theme')==='light'?'light':'dark'}catch{document.documentElement.dataset.theme='dark'}`}} />
        <Script id="threemelo-consent" strategy="beforeInteractive" dangerouslySetInnerHTML={{__html: CONSENT_BOOTSTRAP}} />
        {process.env.NODE_ENV === 'production' && <Script id="threemelo-gtm" strategy="afterInteractive" dangerouslySetInnerHTML={{__html: GTM_LOADER}} />}
        {process.env.NODE_ENV === 'production' && NOSCRIPT_CONSENT_VERIFIED && <noscript><iframe src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`} height="0" width="0" style={{display: 'none', visibility: 'hidden'}} title="Google Tag Manager" /></noscript>}
        <a className="skip-link" href="#main-content">Skip to content</a>
        <SiteHeader/>
        <main id="main-content">{children}</main>
        <footer className="studio-footer"><div><a href="/" aria-label="ThreeMelo home"><Brand/></a><p>A little less setup.<br/>A lot more possibility.</p><p>Free 3D tools, built for your browser.</p></div><nav aria-label="Tool categories"><h2>Explore</h2>{homeCategories.map(c=><a key={c} href={`/tools/#${categoryId(c)}`}>{c}</a>)}</nav><nav aria-label="Selected tools"><h2>Start creating</h2><a href="/3d-model-viewer/">3D Model Viewer</a><a href="/3d-text-generator/">3D Text Generator</a><a href="/3d-floor-plan-generator/">Floor Plan Generator</a><a href="/stl-viewer/">STL Viewer</a></nav><nav aria-label="Company and policies"><h2>ThreeMelo</h2><a href="/about/">About</a><a href="/contact/">Contact</a><a href="/privacy/">Privacy Policy</a><a href="/terms/">Terms of Use</a><CookieSettingsButton/></nav><div className="footer-bottom"><span>Made for curious minds and creative work.</span><a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></div></footer>
        <SiteAnalytics />
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(organization)}} />
      </body>
    </html>
  );
}

import './studio.css';
