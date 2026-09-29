
import {adminText} from '@/lib/admin/translate';
import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';
export function OpsMetrics({items}) {
  return <div className="ops-metrics">{items.map((item) => <div className={`ops-metric ${item.tone || ''}`} key={item.label}><span>{adminText(item.label)}</span><strong>{item.value}</strong><small>{adminText(item.hint)}</small></div>)}</div>;
}
export function OpsSection({eyebrow, title, children, href, action = 'View all'}) {
  return <section className="ops-panel"><header className="ops-panel-head"><div>{eyebrow && <span className="ops-eyebrow">{adminText(eyebrow)}</span>}<h2>{adminText(title)}</h2></div>{href && <Link href={href}>{adminText(action)}<ArrowUpRight size={15}/></Link>}</header>{children}</section>;
}
export function OpsEmpty({title = 'No matching records', description = 'Try another search or adjust your filters.'}) {
  return <div className="ops-empty"><strong>{adminText(title)}</strong><p>{adminText(description)}</p></div>;
}
export function OpsAvatar({name = ''}) {
  return <span className="ops-avatar" aria-hidden="true">{adminText(name.split(/\s+/).filter(Boolean).slice(0, 2).map((s) => s[0]).join(''))}</span>;
}
