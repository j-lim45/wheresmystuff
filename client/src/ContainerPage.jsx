import { Link, useLocation, useParams } from 'react-router-dom';
import { useInventory } from './Store';
import { Empty } from './HomePage';
import Photo from './components/Photo';
import Icon from './components/Icon';
import ItemCard from './components/ItemCard';

export default function ContainerPage({search = ''}) {
  const { id } = useParams();
  const location = useLocation();
  const { containers, items, loading, error } = useInventory();
  const container = containers.find(c => String(c.id) === id);
  if (loading) return <p role="status" className="py-12 text-muted">Loading your container…</p>;
  if (error) return null;
  if (!container) return <Empty title="Container not found" action={<Link className="btn" to="/">Back to overview</Link>}>It may have been removed.</Empty>;
  const contained = items.filter(item => String(item.container_id) === id);
  const filtered = contained.filter(item => `${item.name} ${item.description || ''}`.toLowerCase().includes(search.toLowerCase()));
  const modalState = { backgroundLocation: location };
  return <div className="space-y-6">
    <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted hover:text-white"><Icon name="arrow" size={18}/>All containers</Link>
    <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="eyebrow mb-2">Container</p><h1>{container.name}</h1></div><Link className="btn" to={`/containers/${id}/edit`} state={modalState}><Icon name="edit" size={18}/>Edit container</Link></div>
    <section className="card overflow-hidden md:grid md:grid-cols-2">
      <Photo src={container.image_url} alt={container.name} icon="box" className="h-56 sm:h-72 md:h-full md:min-h-72"/>
      <div className="flex flex-col justify-center p-6 sm:p-8"><p className="eyebrow mb-3">Description</p><p className="whitespace-pre-wrap break-words text-base leading-7 text-stone-300">{container.description || 'Every thing has a place. Add a description to make this container easier to recognize.'}</p><div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-6"><div><p className="mb-2 flex items-center gap-2 text-xs text-muted"><Icon name="pin" size={15}/>Location</p><p className="break-words font-medium">{container.location || 'Not set'}</p></div><div><p className="mb-2 flex items-center gap-2 text-xs text-muted"><Icon name="grid" size={15}/>Stored inside</p><p className="font-medium">{contained.length} {contained.length === 1 ? 'item' : 'items'}</p></div></div></div>
    </section>
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3"><h2>What's inside <span className="ml-2 text-sm font-normal text-muted">{contained.length}</span></h2><Link className="btn btn-primary" to={`/items/new?container_id=${id}`} state={modalState}><Icon name="plus" size={18}/>Add item</Link></div>
      {filtered.length ? <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">{filtered.map(item => <ItemCard key={item.id} item={item}/>)}</div> : <Empty icon={search ? 'search' : 'box'} title={search ? 'No matching items' : 'No Items'}>{search ? 'Try another name or description.' : 'Add an item to this container to fill it.'}</Empty>}
    </section>
  </div>;
}
