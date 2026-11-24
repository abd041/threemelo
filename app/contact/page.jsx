import {pageMetadata} from '../../lib/seo.mjs';
import ContactForm from '../../components/ContactForm.jsx';
import {directMailto} from '../../lib/contact.mjs';
import {INQUIRY_TYPES, SITE_URL, SUPPORT_EMAIL} from '../../lib/site.mjs';

const title = 'Contact ThreeMelo — Support, Feedback and Inquiries';
const description = `Email ${SUPPORT_EMAIL} for ThreeMelo support, bug reports, tool ideas, and business or privacy questions. You send the message from your own email app.`;

export const metadata = pageMetadata('/contact/', {
  title: {absolute: title},
  description,
  alternates: {canonical: '/contact/'},
  robots: {index: true, follow: true},
  openGraph: {
    title,
    description,
    url: `${SITE_URL}/contact/`,
    type: 'website',
  },
});

const faqs = [
  ['Does this form send the email for me?', `No. Open Email Draft or Open in Gmail prepares a message to ${SUPPORT_EMAIL}. You send it from your email application. ThreeMelo does not store the form or pass it to an email service.`],
  ['What if no email application opens?', 'Copy the email address and the complete message, then paste them into webmail. Open in Gmail starts a Gmail compose tab when the browser allows pop-ups.'],
  ['What should I include with a bug report?', 'Name the tool, your browser and device, what you tried, and what happened. Leave out passwords, payment details and private files.'],
  ['Can I suggest a tool or feature?', 'Yes. Choose Suggest a Tool or Feature Request, prepare the draft, and send it from your email application.'],
  ['Where do business and privacy messages go?', `They go to the same mailbox, ${SUPPORT_EMAIL}. Choose Business Inquiry or Privacy and Legal so the subject identifies the request.`],
  ['Is the message stored on ThreeMelo?', 'No. The draft stays in your email application until you send or discard it. There is no account, database or third-party form provider.'],
];

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'ContactPage',
      '@id': `${SITE_URL}/contact/#webpage`,
      url: `${SITE_URL}/contact/`,
      name: title,
      description,
      isPartOf: {'@id': `${SITE_URL}/#website`},
      about: {'@id': `${SITE_URL}/#organization`},
      mainEntity: {'@id': `${SITE_URL}/#organization`},
    },
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'ThreeMelo',
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}/logo.png`,
      email: SUPPORT_EMAIL,
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: SUPPORT_EMAIL,
        url: `${SITE_URL}/contact/`,
        availableLanguage: 'English',
      },
    },
    {
      '@type': 'FAQPage',
      '@id': `${SITE_URL}/contact/#faq`,
      url: `${SITE_URL}/contact/`,
      mainEntity: faqs.map(([question, answer]) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: {'@type': 'Answer', text: answer},
      })),
    },
  ],
};

export default function Page() {
  return (
    <div className="tm-contact wrap">
      <div className="crumb"><a href="/">Home</a> / Contact</div>
      <header className="tm-contact-hero">
        <span className="tm-kicker"><i /> CONTACT</span>
        <h1 id="contact-title">Contact <em>ThreeMelo.</em></h1>
        <p>Questions, bug reports, tool ideas and business or privacy inquiries go to one mailbox. The form prepares the email. You send it.</p>
      </header>

      <div className="tm-contact-layout">
        <ContactForm />
        <aside className="tm-contact-aside" aria-labelledby="contact-details">
          <h2 id="contact-details">Contact information</h2>
          <article>
            <h3>Email</h3>
            <a className="tm-contact-address" href={directMailto()}>{SUPPORT_EMAIL}</a>
            <p>Use this address for support, feedback, business inquiries, and privacy or legal questions.</p>
          </article>
          <article>
            <h3>Inquiry types</h3>
            <ul>{INQUIRY_TYPES.map(type => <li key={type}>{type}</li>)}</ul>
          </article>
          <article>
            <h3>What stays on your device</h3>
            <p>ThreeMelo does not upload this form, store submissions, or use an external email service. A message reaches the mailbox only after you send it.</p>
          </article>
          <article>
            <p><a href="/tools/">Browse tools</a></p>
            <p><a href="/privacy/">Privacy policy</a></p>
            <p><a href="/terms/">Terms of use</a></p>
          </article>
        </aside>
      </div>

      <section className="tm-home-faq tm-contact-faq" aria-labelledby="contact-faq">
        <div>
          <span className="eyebrow">SUPPORT QUESTIONS</span>
          <h2 id="contact-faq">Before you write</h2>
          <p>How contact on ThreeMelo works.</p>
        </div>
        <div>
          {faqs.map(([question, answer]) => (
            <details key={question}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(structuredData)}} />
    </div>
  );
}
