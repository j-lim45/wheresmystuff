import { useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { InventoryProvider } from './Store';
import { useInventory } from './Store';
import HomePage from './HomePage';
import ContainerPage from './ContainerPage';
import ItemPage from './ItemPage';
import EntryForm from './EntryForm';
import Icon from './components/Icon';
import SearchBar from './components/SearchBar';
import './App.css';

function Shell() {
  const [search, setSearch] = useState('');
  const location = useLocation();
  const { error, refresh, notice } = useInventory();
  const isDialog = /^\/(items|containers)\/(new|[^/]+\/edit)$/.test(location.pathname) || /^\/items\/[^/]+$/.test(location.pathname);
  const background = isDialog ? location.state?.backgroundLocation || { pathname: '/' } : location;
  const navigation = <div>
    <NavLink to="/" end className="nav-link"><Icon name="box"/><span>Overview</span>
    </NavLink><NavLink to="/items" end className="nav-link"><Icon name="grid"/><span>All items</span></NavLink>
    <NavLink to="/favorites" className="nav-link"><Icon name="heart"/><span>Favorites</span></NavLink>
  </div>;
  return <div className="min-h-dvh">
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col border-r border-white/10 bg-[#201f1d] p-6 lg:flex">
      <Link to="/" className="flex items-center gap-3 py-3"><span className="flex size-10 items-center justify-center rounded-xl bg-amber text-white"><Icon name="box" size={24}/></span><span className="text-lg font-bold tracking-tight">WheresMyStuff<span className="text-amber">.</span></span></Link>
      <p className="eyebrow mb-3 mt-8 px-4 text-muted">My space</p>
      <nav aria-label="Main navigation" className="space-y-2">{navigation}</nav>
    </aside>
    <div className="lg:pl-60">
      <header className="border-b border-white/10 bg-ink/90 px-5 sm:px-8">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-4">
            <span className="shrink-0 text-sm font-semibold">
              {background.pathname === '/' ? 'Overview' : background.pathname === '/favorites' ? 'Favorites' : background.pathname.startsWith('/containers/') ? 'Containers' : 'All items'}
            </span>
          <SearchBar value={search} onChange={setSearch}/>
        </div>
        <nav aria-label="Mobile navigation" className="flex gap-1 overflow-x-auto pb-3 lg:hidden">{navigation}</nav>
      </header>
      <main id="main-content" className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-8">
        {error && <div role="alert" className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-400/30 bg-red-950/20 p-4"><div><p className="font-semibold">Couldn't load your inventory</p><p className="mt-1 text-sm text-red-200">{error}</p></div><button className="btn" onClick={refresh}>Try again</button></div>}
        <Routes location={background}>
          <Route path="/" element={<HomePage search={search}/>}/>
          <Route path="/items" element={<HomePage key="items" view="items" search={search}/>}/>
          <Route path="/favorites" element={<HomePage key="favorites" view="favorites" search={search}/>}/>
          <Route path="/containers/:id" element={<ContainerPage search={search}/>}/>
          <Route path="*" element={<div className="empty"><h1>Page not found</h1><Link to="/" className="btn mt-4">Back to overview</Link></div>}/>
        </Routes>
      </main>
      {isDialog && <Routes><Route path="/containers/new" element={<EntryForm key="new-container" kind="container"/>}/><Route path="/containers/:id/edit" element={<EntryForm key={location.pathname} kind="container"/>}/><Route path="/items/new" element={<EntryForm key="new-item" kind="item"/>}/><Route path="/items/:id/edit" element={<EntryForm key={location.pathname} kind="item"/>}/><Route path="/items/:id" element={<ItemPage/>}/></Routes>}
    </div>
    {notice && <div role="status" className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl border border-amber/40 bg-panel px-5 py-3 text-sm shadow-xl"><Icon name="check" className="text-[#e8ad65]"/>{notice}</div>}
  </div>;
}

export default function App() {
  return <InventoryProvider>
    <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-ink focus:p-4">
      Skip to content
      </a>
    <Shell/>
  </InventoryProvider>;
}
