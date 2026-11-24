import Script from 'next/script';
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
    icon: [{url: '/icon.png', sizes: '512x512', type: 'image/png'}],
    apple: [{url: '/apple-icon.png', sizes: '180x180', type: 'image/png'}],
  },
  openGraph: {
    siteName: 'ThreeMelo',
    images: [{url: '/logo.png', width: 970, height: 266, alt: 'ThreeMelo'}],
  },
};

const organization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://threemelo.com/#organization',
  name: 'ThreeMelo',
  url: 'https://threemelo.com/',
  logo: 'https://threemelo.com/logo.png',
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
    <html lang="en">
      <body>
        <Script id="threemelo-consent" strategy="beforeInteractive" dangerouslySetInnerHTML={{__html: CONSENT_BOOTSTRAP}} />
        {process.env.NODE_ENV === 'production' && <Script id="threemelo-gtm" strategy="afterInteractive" dangerouslySetInnerHTML={{__html: GTM_LOADER}} />}
        {process.env.NODE_ENV === 'production' && NOSCRIPT_CONSENT_VERIFIED && <noscript><iframe src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`} height="0" width="0" style={{display: 'none', visibility: 'hidden'}} title="Google Tag Manager" /></noscript>}
        <a className="skip-link" href="#main-content">Skip to content</a>
        <header className="nav">
          <a className="brand" href="/"><img src="/logo.png" width="970" height="266" alt="ThreeMelo" /></a>
          <nav>
            <a href="/tools/">Tools</a>
            <a href="/about/">About</a>
            <a href="/contact/">Contact</a>
          </nav>
          <a className="button small" href="/3d-text-generator/">Open studio</a>
        </header>
        <main id="main-content">{children}</main>
        <footer>
          <a className="brand" href="/"><img src="/logo.png" width="970" height="266" alt="ThreeMelo" /></a>
          <p>Free browser-based 3D tools. <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></p>
          <nav>
            <a href="/tools/">Tools</a>
            <a href="/about/">About</a>
            <a href="/contact/">Contact</a>
            <a href="/privacy/">Privacy</a>
            <a href="/terms/">Terms</a>
            <CookieSettingsButton />
          </nav>
        </footer>
        <SiteAnalytics />
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(organization)}} />
      </body>
    </html>
  );
}
