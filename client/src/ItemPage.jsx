import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useInventory } from './InventoryContext';
import Modal from './components/Modal';
import Photo from './components/Photo';
import Icon from './components/Icon';

export default function ItemPage() {
  const { id } = useParams();
  const { items, loading, error: loadError, favorite } = useInventory();
  const navigate = useNavigate();
  const location = useLocation();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const item = items.find(entry => String(entry.id) === id);
  const background = location.state?.backgroundLocation;
  const close = () => background ? navigate(-1) : navigate('/items');
  async function toggle() {
    setBusy(true);
    try { await favorite(item); setError(''); } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  return <Modal title={item?.name || 'Item details'} onClose={close}>
    {loading ? <p className="p-6" role="status">Loading item…</p> : !item ? <p className="p-6" role="alert">{loadError || 'This item could not be found.'}</p> : <div className="space-y-6 p-6">
      <div className="relative"><Photo src={item.image_url} alt={item.name} className="aspect-[16/10] rounded-2xl"/><button onClick={toggle} disabled={busy} aria-label={item.is_favorited ? 'Remove from favorites' : 'Add to favorites'} aria-pressed={Boolean(item.is_favorited)} className="icon-btn absolute right-3 top-3 bg-ink/80 text-[#e8ad65]"><Icon name="heart" fill={item.is_favorited ? 'currentColor' : 'none'}/></button></div>
      <div><p className="eyebrow mb-2">The little details</p><h1 className="break-words italic">{item.name}</h1><p className="mt-3 whitespace-pre-wrap break-words leading-7 text-muted">{item.description || 'No description added yet.'}</p></div>
      {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-ink/50 p-4"><Icon name="pin" className="text-[#e8ad65]"/><div><p className="text-xs text-muted">You'll find it in</p>{item.container_id ? <Link to={`/containers/${item.container_id}`} className="mt-1 inline-block text-sm font-medium hover:text-[#e8ad65]">{item.container_name || 'View container'} →</Link> : <p className="mt-1 text-sm">Not assigned to a container</p>}</div></div>
      <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-4"><p className="text-xs text-muted">{item.created_at && !Number.isNaN(Date.parse(item.created_at)) ? `Added ${new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}` : 'Your personal inventory'}</p><Link to={`/items/${id}/edit`} replace state={{ backgroundLocation: background || { pathname: '/items' } }} className="btn"><Icon name="edit" size={16}/>Edit item</Link></div>
    </div>}
  </Modal>;
}
