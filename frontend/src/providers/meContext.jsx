import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api.js';

const MeContext = createContext({
  me: null,
  loading: true,
  reload: async () => {},
  loginAs: async (_user) => {},
});

export function UserProvider({ children }) {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchMe() {
    try {
      const res = await api.get('/api/me');
      setMe(res.data || null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!localStorage.getItem('demoUser')) localStorage.setItem('demoUser', 'demo-1');
    fetchMe();
  }, []);

  const reload = async () => {
    setLoading(true);
    await fetchMe();
  };

  const loginAs = async (user) => {
    localStorage.setItem('demoUser', user);
    await reload();
  };

  return (
    <MeContext.Provider value={{ me, loading, reload, loginAs }}>{children}</MeContext.Provider>
  );
}

export function useMe() {
  return useContext(MeContext);
}
