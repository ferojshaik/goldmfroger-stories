
import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import StoriesList from './pages/StoriesList';
import StoryDetail from './pages/StoryDetail';
import About from './pages/About';
import Creator from './pages/Creator';
import AdminLogin from './pages/AdminLogin';
import { Story } from './types';

const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState(window.location.hash.replace('#', '') || '/');
  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const checkAdmin = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      const data = await res.json().catch(() => ({}));
      setIsAdmin(res.ok && data.admin === true);
    } catch {
      setIsAdmin(false);
    } finally {
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    checkAdmin();
  }, [checkAdmin]);

  const [brand, setBrand] = useState({
    name: localStorage.getItem('brand_name') || 'GoldMFroger',
    youtubeHandle: localStorage.getItem('brand_handle') || '@goldmfroger',
    initial: localStorage.getItem('brand_initial') || 'G'
  });

  const [stories, setStories] = useState<Story[]>(() => {
    try {
      const saved = localStorage.getItem('custom_stories');
      const raw = saved ? JSON.parse(saved) : [];
      if (!Array.isArray(raw)) return [];
      return raw
        .filter((s: unknown): s is Story => s != null && typeof s === 'object' && typeof (s as Story).slug === 'string' && (s as Story).slug.length > 0)
        .map((s: Story) => ({
          title: typeof s.title === 'string' ? s.title : 'Untitled',
          slug: String(s.slug),
          date: typeof s.date === 'string' ? s.date : new Date().toISOString().slice(0, 10),
          description: typeof s.description === 'string' ? s.description : '',
          body: typeof s.body === 'string' ? s.body : '',
          image: typeof s.image === 'string' && s.image ? s.image : 'https://placehold.co/1200x630/18181b/fbbf24?text=Story',
          readingTime: typeof s.readingTime === 'string' ? s.readingTime : '5 min',
          category: typeof s.category === 'string' ? s.category : undefined,
          youtubeUrl: typeof s.youtubeUrl === 'string' ? s.youtubeUrl : undefined,
          images: Array.isArray(s.images) ? s.images : undefined,
        }));
    } catch (e) {
      console.error("Storage Error:", e);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('custom_stories', JSON.stringify(stories));
  }, [stories]);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(window.location.hash.replace('#', '') || '/');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const path = window.location.hash.replace('#', '') || '/';
    if (path === '/create' && authChecked && !isAdmin) {
      window.location.hash = '/';
    }
  }, [currentPath, isAdmin, authChecked]);

  const navigate = (path: string) => {
    window.location.hash = path;
  };

  const handleAdminLogin = () => {
    setIsAdmin(true);
  };

  const handleAdminLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } finally {
      setIsAdmin(false);
      if (currentPath === '/create' || currentPath === '/owner') navigate('/');
    }
  };

  const updateBrand = (newName: string, newHandle: string) => {
    const initial = newName.charAt(0).toUpperCase();
    setBrand({ name: newName, youtubeHandle: newHandle, initial });
    localStorage.setItem('brand_name', newName);
    localStorage.setItem('brand_handle', newHandle);
    localStorage.setItem('brand_initial', initial);
  };

  const addStory = (story: Story) => {
    setStories(prev => [story, ...prev]);
  };

  const deleteStory = (slug: string) => {
    const decodedSlug = decodeURIComponent(slug);
    setStories(prev => prev.filter(s => s.slug !== decodedSlug));
    const currentHash = decodeURIComponent(window.location.hash);
    if (currentHash.includes(decodedSlug)) {
      navigate('/stories');
    }
  };

  const renderPage = () => {
    // Owner-only: no link on site. Use yoursite.com/#/owner to log in.
    if (currentPath === '/owner') {
      return <AdminLogin onNavigate={navigate} onLoginSuccess={handleAdminLogin} />;
    }

    if (currentPath === '/create') {
      return (
        <Creator
          onNavigate={navigate}
          onAddStory={addStory}
          onDeleteStory={deleteStory}
          customStories={stories}
          brand={brand}
          onUpdateBrand={updateBrand}
        />
      );
    }

    if (currentPath === '/') return <Home onNavigate={navigate} brand={brand} stories={stories} isAdmin={isAdmin} />;
    if (currentPath === '/stories') return <StoriesList onNavigate={navigate} stories={stories} onDeleteStory={deleteStory} isAdmin={isAdmin} />;
    if (currentPath === '/about') return <About brand={brand} />;

    if (currentPath.startsWith('/stories/')) {
      const slug = decodeURIComponent(currentPath.split('/stories/')[1]);
      return <StoryDetail slug={slug} onNavigate={navigate} stories={stories} brand={brand} onDeleteStory={deleteStory} isAdmin={isAdmin} />;
    }

    return <Home onNavigate={navigate} brand={brand} stories={stories} isAdmin={isAdmin} />;
  };

  return (
    <Layout onNavigate={navigate} currentRoute={currentPath} brand={brand} isAdmin={isAdmin} onAdminLogout={handleAdminLogout}>
      {renderPage()}
    </Layout>
  );
};

export default App;
