import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../api';

export default function CreateEditItemPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [containerId, setContainerId] = useState(
    searchParams.get('container_id') || ''
  );
  const [containers, setContainers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(isEdit);

  async function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const { url } = await api.uploadImage(file);
      setImageUrl(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  useEffect(() => {
    api.getContainers().then(setContainers).catch((err) => setError(err.message));

    if (isEdit) {
      api
        .getItem(id)
        .then((item) => {
          setName(item.name);
          setDescription(item.description || '');
          setImageUrl(item.image_url || '');
          setContainerId(item.container_id || '');
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Item name is required');
      return;
    }
    setSaving(true);
    setError(null);

    const payload = {
      name: name.trim(),
      description,
      image_url: imageUrl,
      container_id: containerId || null,
    };

    try {
      const saved = isEdit
        ? await api.updateItem(id, payload)
        : await api.createItem(payload);
      navigate(`/items/${saved.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this item?')) return;
    try {
      await api.deleteItem(id);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="app-shell">
      <div className="page-header">
        <button
          className="icon-btn"
          aria-label="Back"
          onClick={() => navigate(-1)}
        >
          ←
        </button>
        <h1 style={{ fontSize: 'var(--font-section)', margin: 0 }}>
          Create New/Edit Item
        </h1>
        {isEdit ? (
          <button
            className="delete-btn"
            aria-label="Delete item"
            onClick={handleDelete}
          >
            🗑
          </button>
        ) : (
          <span style={{ width: 20 }} />
        )}
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        <label className="image-placeholder" htmlFor="item-image-file" style={{ cursor: 'pointer' }}>
          {uploading ? (
            'Uploading...'
          ) : imageUrl ? (
            <img src={imageUrl} alt="Item" />
          ) : (
            '🖼'
          )}
          <input
            id="item-image-file"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />
        </label>

        {error && <div className="form-error">{error}</div>}

        <div className="field">
          <label htmlFor="item-name">Input Item Name</label>
          <input
            id="item-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Passport"
          />
        </div>

        <div className="field">
          <label htmlFor="item-description">Input Item Description</label>
          <textarea
            id="item-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A short description..."
          />
        </div>

        <div className="field">
          <label htmlFor="item-container">Dropdown Container Location</label>
          <select
            id="item-container"
            value={containerId}
            onChange={(e) => setContainerId(e.target.value)}
          >
            <option value="">No container</option>
            {containers.map((c) => (
              <option value={c.id} key={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <button className="primary-btn" type="submit" disabled={saving || uploading}>
          {saving ? 'Saving...' : 'Create/Save'}
        </button>
      </form>
    </div>
  );
}
