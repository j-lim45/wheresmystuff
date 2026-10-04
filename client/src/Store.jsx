import { useCallback, useEffect, useState } from 'react';
import { createContext, useContext } from 'react';
import { api } from './api';

export const InventoryContext = createContext(null);
export const useInventory = () => useContext(InventoryContext);

export function InventoryProvider({ children }) {
  const [containers, setContainers] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

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

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  async function favorite(item) {
    const updated = await api.toggleFavorite(item.id, !item.is_favorited);
    setItems(current => current.map(entry => entry.id === item.id ? { ...entry, ...updated } : entry));
    setNotice(updated.is_favorited ? 'Added to favorites' : 'Removed from favorites');
  }

  return <InventoryContext.Provider value={{containers, items, loading, error, refresh, favorite, notice, setNotice}}>{children}</InventoryContext.Provider>;
}
