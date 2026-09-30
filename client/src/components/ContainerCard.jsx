import { Link, useLocation } from 'react-router-dom';
import Icon from './Icon';
import Photo from './Photo';

export default function ContainerCard({ container, items = [] }) {
  const location = useLocation();
  const previews = items.filter(item => String(item.container_id) === String(container.id) && item.image_url).slice(0, 3);
  return <Link to={`/containers/${container.id}`} state={{ from: location.pathname }} className="card card-link group relative bg-gradient-to-br from-[#44301f] to-surface p-4 sm:p-5">
    <div className="mb-5 flex items-center justify-between"><span className="flex size-10 items-center justify-center rounded-xl border border-amber/25 bg-brown/60 text-[#e8ad65]"><Icon name="box" /></span><Icon name="chevron" size={18} className="text-muted transition group-hover:translate-x-1 group-hover:text-white" /></div>
    <h3 className="truncate text-xl font-semibold">{container.name}</h3>
    <p className="mt-1 text-xs text-muted">{container.item_count || 0} {(container.item_count || 0) === 1 ? 'item' : 'items'}</p>
    <div className="my-4 grid grid-cols-3 gap-2">
      {Array.from({ length: 3 }, (_, index) => <Photo key={index} src={previews[index]?.image_url} alt={previews[index]?.name || ''} icon="box" className="aspect-square rounded-xl border border-white/5" />)}
    </div>
    <p className="flex items-center gap-2 truncate border-t border-white/10 pt-3 text-xs text-muted"><Icon name="pin" size={14} /><span className="truncate">{container.location || 'No location set'}</span></p>
  </Link>;
}
