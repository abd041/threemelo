import RelatedTools, {ToolContext} from '../../components/RelatedTools.jsx';
import {pageMetadata} from '../../lib/seo.mjs';
import {categoryId} from '../../lib/home.mjs';
import RoomPlanner from '../../components/RoomPlanner.jsx';
import RoomContent, {faqs} from '../../components/room/Content.jsx';
import AdPlacement from '../../components/AdPlacement.jsx';
import './room.css';

const title = 'Free 3D Room Planner Online – Design Your Room | ThreeMelo';
const description = 'Design your room online with our free 3D room planner. Arrange furniture, customize dimensions and colors, and export your layout. No signup required.';
export const metadata = pageMetadata('/3d-room-planner/', {title: {absolute: title}, description: description, alternates: {canonical:'/3d-room-planner/'}, openGraph: {title, description}, twitter: {card: 'summary_large_image', title, description, images: ['/social/3d-room-planner.png']}});
const schema = {'@context': 'https://schema.org', '@graph': [
  {'@type': 'WebPage', name: title, description, url: 'https://threemelo.com/3d-room-planner/'},
  {'@type': 'WebApplication', name: 'ThreeMelo 3D Room Planner', description, url: 'https://threemelo.com/3d-room-planner/', applicationCategory: 'DesignApplication', operatingSystem: 'Any', browserRequirements: 'JavaScript. WebGL for the 3D view; dimensions and the object list work without WebGL.', featureList: ['Feet, inches and metric dimensions', 'Rectangle, square, L-shaped and custom polygon rooms', 'Procedural furniture library', 'Doors and windows cut into walls', 'Local multi-project saving', 'PNG, PDF, JSON and CSV export'], offers: {'@type': 'Offer', price: '0', priceCurrency: 'USD'}},
  {'@type': 'FAQPage', mainEntity: faqs.map(([name, text]) => ({'@type': 'Question', name, acceptedAnswer: {'@type': 'Answer', text}}))},
]};

export default function Page() {
  return <div className="wrap toolpage rp-page"><nav className="crumb" aria-label="Breadcrumb"><a href="/">Home</a> / <a href={`/tools/#${categoryId('Home & layout')}`}>Home & layout</a> / 3D Room Planner</nav><div className="rp-heading"><div><h1>Free Online 3D Room Planner</h1><p className="intro">Design your room in 3D, arrange furniture, customize dimensions and colors, and visualize your ideal layout directly in your browser. Free to use, with no signup required.</p><ul className="rp-trust"><li>Free to use</li><li>No signup required</li><li>Interactive 3D preview</li><li>Private by design</li><li>Download your room layout</li></ul></div><ToolContext slug="3d-room-planner"/></div><RoomPlanner/><AdPlacement/><RoomContent/><AdPlacement/><RelatedTools slug="3d-room-planner"/><script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(schema)}}/></div>;
}
