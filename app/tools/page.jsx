import {pageMetadata} from '../../lib/seo.mjs';
import ToolDirectory from '../../components/ToolDirectory.jsx';
import {SUPPORT_EMAIL} from '../../lib/site.mjs';
export const metadata = pageMetadata('/tools/', {title:'Free Online 3D Tools – All 30 Utilities',description:'Browse 30 free browser-based 3D viewers, converters, mockup generators, printing utilities and design planners.',alternates:{canonical:'/tools/'}});
export default function Tools(){return <div className="wrap"><h1>Free online 3D tools</h1><p className="intro">Explore 30 tools for creating, viewing, converting and planning in 3D. No account required.</p><p className="intro">Questions or feedback: <a href="/contact/">contact ThreeMelo</a> at <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.</p><h2>Browse by category</h2><ToolDirectory/></div>}
