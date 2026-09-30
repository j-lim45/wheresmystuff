import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useInventory } from './Store';
import Icon from './components/Icon';
import ContainerCard from './components/ContainerCard';
import ItemCard from './components/ItemCard';

export function Empty({ icon = 'box', title, children, action }) {
  return <div className="empty"><span className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-bronze/15 text-[#dca463]"><Icon name={icon} size={26} /></span><h3 className="text-lg font-semibold">{title}</h3><p className="mt-2 max-w-sm text-sm leading-6 text-muted">{children}</p>{action && <div className="mt-5">{action}</div>}</div>;
}

export default function HomePage({ view = 'home', search = '' }) {
  const {containers, items, loading, error} = useInventory();
  const location = useLocation();
  const [sort, setSort] = useState('newest');
  const query = search.trim().toLowerCase();
  
  const matches = value => [value.name, value.description, value.location, value.container_name].filter(Boolean).join(' ').toLowerCase().includes(query);
  const sortEntries = entries => [...entries].sort((a, b) => sort === 'name' ? a.name.localeCompare(b.name) : String(b.created_at || '').localeCompare(String(a.created_at || '')));
  const filteredContainers = sortEntries(containers.filter(matches));
  const displayedItems = sortEntries(items.filter(item => matches(item) && (view === 'favorites' || (view === 'home' && !query) ? item.is_favorited : true)));
  const modalState = { backgroundLocation: location };
  const newLink = (type, label) => <Link className="btn btn-primary" to={`/${type}/new`} state={modalState}><Icon name="plus" size={18}/>{label}</Link>;
  return <div className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="eyebrow mb-2">Your personal inventory</p>
        <h1>WheresMyStuff?</h1>
        <p className="mt-2 text-sm text-muted">Keep your items close to you.</p></div>
      {newLink('items', 'Add item')}
    </div>
    {view === 'home' && <div className="grid grid-cols-3 gap-3 sm:gap-4">
      {[['box', containers.length, 'Containers'], ['grid', items.length, ' items'], ['heart', items.filter(i => i.is_favorited).length, 'Favorites']].map(([icon, count, label]) => <div key={label} className="card flex items-center gap-3 p-3 sm:p-5"><span className="hidden size-11 items-center justify-center rounded-xl bg-bronze/15 text-[#dca463] sm:flex"><Icon name={icon}/></span><div><p className="text-2xl font-semibold">{loading ? '—' : count}</p><p className="mt-1 text-xs text-muted">{label}</p></div></div>)}
    </div>}
    <div className="flex justify-end"><select aria-label="Sort inventory" className="text-sm sm:w-44" value={sort} onChange={e => setSort(e.target.value)}><option value="newest">Newest first</option><option value="name">Name: A–Z</option></select></div>
    {loading ? <div role="status" className="grid animate-pulse grid-cols-2 gap-4 lg:grid-cols-4">{[1,2,3,4].map(i => <div key={i} className="card h-64 bg-panel"/>)}<span className="sr-only">Loading inventory</span></div> : error ? null : <>
      {view === 'home' && <section className="space-y-4">
        <div className="flex items-center justify-between gap-3"><h2 className="flex items-center gap-3">Containers <span className="rounded-lg bg-white/5 px-2 py-1 text-xs font-normal text-muted">{filteredContainers.length}</span></h2>{newLink('containers', 'Add container')}</div>
        {filteredContainers.length ? <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">{filteredContainers.map(c => <ContainerCard key={c.id} container={c} items={items}/>)}</div> : <Empty title={query ? 'No matching containers' : 'Give your things a home'} action={!query && newLink('containers', 'Create your first container')}>{query ? 'Try another name or location.' : 'Add a drawer, a box, or a shelf. A little organization goes a long way.'}</Empty>}
      </section>}
      <section className="space-y-4">
        <div className="flex items-center justify-between"><h2 className="flex items-center gap-3">{view === 'items' || (view === 'home' && query) ? 'All items' : 'Favorited items'} <span className="rounded-lg bg-white/5 px-2 py-1 text-xs font-normal text-muted">{displayedItems.length}</span></h2>{view === 'home' && <Link to="/items" className="flex items-center gap-1 text-sm text-[#e8ad65] hover:text-white">View all <Icon name="chevron" size={16}/></Link>}</div>
        {displayedItems.length ? <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">{displayedItems.map(item => <ItemCard key={item.id} item={item}/>)}</div> : <Empty icon={query ? 'search' : view === 'items' ? 'grid' : 'heart'} title={query ? 'Nothing found just yet' : view === 'items' ? 'Start with your first item' : 'Your essentials, one click away'} action={view === 'items' && !query && newLink('items', 'Add an item')}>{query ? 'Try a different name, description, or container.' : view === 'items' ? 'Add a photo and a location so you can always find it again.' : 'Tap the heart on any item to keep it right here.'}</Empty>}
      </section>
    </>}
    <p className="flex items-center justify-center gap-2 py-4 text-xs text-muted"></p>
  </div>;
}
