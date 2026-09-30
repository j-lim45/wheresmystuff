import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useInventory } from '../Store';
import Icon from './Icon';
import Photo from './Photo';

export default function ItemCard({ item }) {
  const location = useLocation();
  const { favorite } = useInventory();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function toggle() {
    setBusy(true);
    try { await favorite(item); setError(''); } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  return <article className="card relative overflow-hidden">
    <Link to={`/items/${item.id}`} state={{ backgroundLocation: location }} className="card-link group p-3">
      <Photo src={item.image_url} alt={item.name} className="aspect-[4/3] rounded-xl" />
      <div className="px-1 pb-1 pt-3">
        <h3 className="truncate text-xl font-semibold">{item.name}</h3>
        <p className="mt-2 flex items-center gap-1.5 text-xs italic text-muted"><Icon name="box" size={14}/><span className="truncate">{item.container_name || 'Unassigned'}</span></p>
      </div>
    </Link>
    <button aria-label={`${item.is_favorited ? 'Unfavorite' : 'Favorite'} ${item.name}`} aria-pressed={Boolean(item.is_favorited)} disabled={busy} onClick={toggle} className={`absolute right-5 top-5 flex size-9 items-center justify-center rounded-full border border-white/10 bg-ink/80 backdrop-blur-sm hover:scale-110 ${item.is_favorited ? 'text-red-500' : 'text-stone-200'}`}><Icon name="heart" size={18} fill={item.is_favorited ? 'currentColor' : 'none'} />
    </button>
    {error && <p role="alert" className="px-4 pb-3 text-xs text-red-300">{error}</p>}
  </article>;
}
