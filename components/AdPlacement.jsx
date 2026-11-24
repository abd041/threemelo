/** Reserved only when a real placement is explicitly enabled. No ad scripts are loaded. */
export default function AdPlacement({enabled=false,children}){if(!enabled||!children)return null;return <aside className="ad-placement" aria-label="Advertisement"><small>Advertisement</small>{children}</aside>;}
