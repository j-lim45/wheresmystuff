import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from './api';
import SearchBar from './components/SearchBar';
import ContainerCard from './components/ContainerCard';
import ItemCard from './components/ItemCard';

export default function HomePage() {
  const navigate = useNavigate();
  const [containers, setContainers] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [containersData, favoritesData] = await Promise.all([
        api.getContainers(),
        api.getItems(true),
      ]);
      setContainers(containersData);
      setFavorites(favoritesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const filteredContainers = useMemo(
    () =>
      containers.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
      ),
    [containers, search]
  );

  const filteredFavorites = useMemo(
    () =>
      favorites.filter((i) =>
        i.name.toLowerCase().includes(search.toLowerCase())
      ),
    [favorites, search]
  );

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="app-shell">
      <SearchBar value={search} onChange={setSearch} />

      {error && <div className="error-banner">{error}</div>}

      <section className="section">
        <div className="section-header">
          <h2>Containers</h2>
          <button
            className="add-btn"
            aria-label="Add container"
            onClick={() => navigate('/containers/new')}
          >
            +
          </button>
        </div>

        {filteredContainers.length === 0 ? (
          <div className="empty-state">No containers yet. Add one!</div>
        ) : (
          <div className="card-grid">
            {filteredContainers.map((c) => (
              <ContainerCard container={c} key={c.id} />
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <div className="section-header">
          <h2>Favorited Items</h2>
          <button
            className="add-btn"
            aria-label="Add item"
            onClick={() => navigate('/items/new')}
          >
            +
          </button>
        </div>

        {filteredFavorites.length === 0 ? (
          <div className="empty-state">
            Favorite an item to pin it here.
          </div>
        ) : (
          <div className="card-grid">
            {filteredFavorites.map((i) => (
              <ItemCard item={i} key={i.id} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
