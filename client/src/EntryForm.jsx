import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api } from './api';
import { useInventory } from './Store';
import Modal from './components/Modal';
import Photo from './components/Photo';
import Icon from './components/Icon';

export default function EntryForm({ kind }) {
  const isContainer = kind === 'container';
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const { containers, refresh, setNotice } = useInventory();
  const [form, setForm] = useState({ name: '', description: '', location: '', image_url: '', container_id: params.get('container_id') || '', is_favorited: false });
  const [loading, setLoading] = useState(editing);
  const [loaded, setLoaded] = useState(!editing);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const fileRef = useRef(null);
  const background = location.state?.backgroundLocation;
  const close = () => { if (!busy && !uploading) { if (background) navigate(-1); else navigate('/'); } };
  const update = (key, value) => setForm(current => ({ ...current, [key]: value }));

  useEffect(() => {
    if (!editing) return;
    let active = true;
    (isContainer ? api.getContainer(id) : api.getItem(id)).then(data => {
      if (active) { setForm(current => ({ ...current, ...data, container_id: data.container_id || '' })); setLoaded(true); }
    }).catch(err => { if (active) setError(err.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, editing, isContainer]);

  async function upload(file) {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) { setError('Choose a JPG, PNG, WebP, or GIF image.'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Your image must be 5 MB or smaller.'); return; }
    setUploading(true); setError('');
    try { const result = await api.uploadImage(file, kind); update('image_url', result.url); }
    catch (err) { setError(err.message); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  }

  async function save(event) {
    event.preventDefault();
    if (!form.name.trim()) { setError('Please add a name.'); return; }
    setBusy(true); setError('');
    const payload = { name: form.name.trim(), description: form.description || '', image_url: form.image_url || null,
      ...(isContainer ? { location: form.location || '' } : { container_id: form.container_id || null, is_favorited: Boolean(form.is_favorited) }) };
    try {
      const saved = isContainer ? (editing ? await api.updateContainer(id, payload) : await api.createContainer(payload)) : (editing ? await api.updateItem(id, payload) : await api.createItem(payload));
      await refresh();
      setNotice(`${isContainer ? 'Container' : 'Item'} ${editing ? 'updated' : 'created'}`);
      navigate(isContainer ? `/containers/${saved.id}` : `/items/${saved.id}`, { replace: true, state: isContainer ? undefined : { backgroundLocation: background || { pathname: '/items' } } });
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  async function remove() {
    setBusy(true); setError('');
    try {
      await (isContainer ? api.deleteContainer(id) : api.deleteItem(id));
      await refresh();
      setNotice(`${isContainer ? 'Container' : 'Item'} deleted`);
      navigate(isContainer ? '/' : background?.pathname || '/items', { replace: true });
    } catch (err) { setError(err.message); setConfirmDelete(false); }
    finally { setBusy(false); }
  }

  return <Modal title={`${editing ? 'Edit' : 'New'} ${kind}`} onClose={close}>
    {loading ? <p role="status" className="p-6">Loading details…</p> : <form onSubmit={save} className="space-y-5 p-6">
      {error && <div role="alert" className="rounded-xl border border-red-400/25 bg-red-950/20 p-3 text-sm text-red-200">{error}</div>}
      <fieldset disabled={busy || uploading || !loaded} className="space-y-5 disabled:opacity-70">
        <div>
          <button type="button" onClick={() => fileRef.current?.click()} className="group relative block w-full overflow-hidden rounded-2xl border border-dashed border-outline hover:border-amber" aria-label={form.image_url ? 'Change photo' : `Upload ${kind} photo`} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (!busy && !uploading) upload(e.dataTransfer.files[0]); }}>
            {form.image_url ? <><Photo src={form.image_url} alt={`${kind} preview`} className="h-44"/><span className="absolute inset-x-0 bottom-0 bg-black/60 py-2 text-sm">Change photo</span></> : <span className="flex h-44 flex-col items-center justify-center gap-2 bg-panel/50"><span className="mb-1 rounded-xl bg-bronze/20 p-3 text-[#e8ad65]"><Icon name="upload" size={24}/></span><span className="text-sm font-medium">{uploading ? 'Uploading photo…' : 'Click or drop a photo here'}</span><span className="text-xs text-muted">JPG, PNG, WebP or GIF · up to 5 MB</span></span>}
          </button>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" tabIndex={-1} aria-label="Choose image" onChange={e => upload(e.target.files[0])}/>
          {form.image_url && <button type="button" onClick={() => update('image_url', '')} className="mt-2 text-xs text-muted underline hover:text-white">Remove photo</button>}
          {isContainer && <p className="mt-2 text-xs text-muted">This cover photo appears at the top of your container page.</p>}
        </div>
        <div className="field"><label htmlFor="entry-name">{isContainer ? 'Container' : 'Item'} name <span className="text-[#e8ad65]">*</span></label><input id="entry-name" required maxLength={120} value={form.name} onChange={e => update('name', e.target.value)} placeholder={isContainer ? 'e.g. The everyday drawer' : 'e.g. My favorite headphones'}/></div>
        <div className="field"><label htmlFor="entry-description">Description <span className="font-normal text-muted">(optional)</span></label><textarea id="entry-description" maxLength={2000} value={form.description || ''} onChange={e => update('description', e.target.value)} placeholder={isContainer ? 'What do you keep here?' : 'A few details to help you remember…'}/></div>
        {isContainer ? <div className="field"><label htmlFor="entry-location">Location</label><input id="entry-location" maxLength={200} value={form.location || ''} onChange={e => update('location', e.target.value)} placeholder="e.g. Bedroom · top shelf"/></div> : <>
          <div className="field"><label htmlFor="entry-container">Container</label><select id="entry-container" value={form.container_id} onChange={e => update('container_id', e.target.value)}><option value="">N/A</option>{containers.map(c => <option key={c.id} value={c.id}>{c.name}{c.location ? ` · ${c.location}` : ''}</option>)}</select></div>
          <label className="flex items-center gap-3 text-sm"><input type="checkbox" className="size-4 accent-amber" checked={Boolean(form.is_favorited)} onChange={e => update('is_favorited', e.target.checked)}/>Keep this item in my favorites</label>
        </>}
      </fieldset>
      {uploading && <p role="status" className="text-sm text-[#e8ad65]">Uploading photo. Please wait…</p>}
      {confirmDelete ? <div key="delete-confirmation" className="rounded-xl border border-red-400/30 bg-red-950/20 p-4"><p className="text-sm">Delete this {kind}? This cannot be undone.{isContainer && ' The container must be empty first.'}</p><div className="mt-3 flex gap-2"><button type="button" className="btn border-red-400/40 text-red-200" disabled={busy} onClick={remove}>{busy ? 'Deleting…' : 'Yes, delete'}</button><button type="button" className="btn" disabled={busy} onClick={event => { event.preventDefault(); setConfirmDelete(false); }}>Keep it</button></div></div> : <div key="form-actions" className="flex items-center justify-between gap-3 border-t border-white/10 pt-5">
        <div className="flex gap-2"><button type="button" className="btn" disabled={busy || uploading} onClick={close}>Cancel</button><button type="submit" className="btn btn-primary" disabled={busy || uploading || !loaded}><Icon name="check" size={18}/>{busy ? 'Saving…' : editing ? 'Save changes' : `Create ${kind}`}</button></div>
      </div>}
    </form>}
  </Modal>;
}
