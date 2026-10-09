import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from './api';
import { InventoryContext } from './InventoryContext';

export function InventoryProvider({ children }) {
  const [containers, setContainers] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const noticeTimer = useRef(null);

  const refresh = useCallback(async () => {
    try {
      const [nextContainers, nextItems] = await Promise.all([api.getContainers(), api.getItems()]);
      setContainers(nextContainers);
      setItems(nextItems);
      setError('');
      return true;
    } catch (err) {
      setError(err.message || 'Could not connect to your inventory.');
      return false;
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => () => clearTimeout(noticeTimer.current), []);

  const showNotice = useCallback((message) => {
    setNotice(message);
    clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(''), 4000);
  }, []);

  async function favorite(item) {
    const updated = await api.toggleFavorite(item.id, !item.is_favorited);
    setItems(current => current.map(entry => entry.id === item.id ? { ...entry, ...updated } : entry));
    showNotice(updated.is_favorited ? 'Added to favorites' : 'Removed from favorites');
  }

  return <InventoryContext.Provider value={{containers, items, loading, error, refresh, favorite, notice, setNotice: showNotice}}>{children}</InventoryContext.Provider>;
}
