import {pageMetadata} from '../../lib/seo.mjs';
import {SUPPORT_EMAIL} from '../../lib/site.mjs';

export const metadata = pageMetadata('/privacy/', {
  title: 'Privacy Policy',
  description: 'How ThreeMelo handles local files, consent, Google Tag Manager and hosting logs. Analytics storage stays denied until you allow it.',
  alternates: {canonical: '/privacy/'},
});

export default function Page() {
  return (
    <article className="wrap prose">
      <h1>Privacy policy</h1>
      <p>The 3D tools process your text and geometry in the browser. Saved projects stay in this browser until you clear site data. Uploaded files are not sent to ThreeMelo.</p>
      <h2>Measurement</h2>
      <p>Production pages load Google Tag Manager, container GTM-WDSPZP27, only after you allow analytics. Google Consent Mode v2 runs before that container. Analytics storage, advertising storage, ad user data, ad personalization, functionality storage and personalization storage start as denied. Security storage is granted. Advertising and remarketing are not enabled, and the preference control cannot turn them on.</p>
      <p>This site does not include a Google Analytics 4 tag, an advertising tag or AdSense. A measurement tag would have to be added in the Google Tag Manager dashboard and would still have to respect the consent state. Until a GA4 tag is configured and verified there, this policy does not claim that Google Analytics is collecting data.</p>
      <p>If you allow analytics, events may include the page path, tool name, file format, the fact that a preset was selected, a search result count, the fact that an email draft was opened, and the fact that a tool showed an error. Events do not include personal information, file contents, filenames, custom text, search words or contact form fields.</p>
      <h2>Your choice</h2>
      <p>The choice is stored in this browser under the local storage key threemelo-consent. It records only whether analytics storage is allowed. Use Cookie preferences in the footer to change it, or choose Reject non-essential when the banner appears. Rejecting keeps analytics storage denied and stops new site analytics events. Withdrawing consent does not erase previously collected data. If browser storage is unavailable, your choice lasts for the current page only.</p>
      <p>With JavaScript disabled, tracking stays off: this static website cannot verify consent, so the Google Tag Manager noscript fallback is withheld. Measurement tags configured in the container must require analytics consent. After consent, Google requests may expose ordinary connection information such as your IP address to Google; uploaded files and form content are never included in site events. Hosting providers may still process ordinary request logs.</p>
      <h2>Accounts and contact</h2>
      <p>There are no user accounts. The contact form does not store or transmit the message. It opens a draft to <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> in your email application. Use the <a href="/contact/">contact page</a> and choose Privacy and Legal for privacy requests.</p>
    </article>
  );
}
