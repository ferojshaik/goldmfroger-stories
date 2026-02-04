
import React, { useState, useEffect } from 'react';
import { Menu, X, Youtube, Instagram, Twitter, ChevronRight, Sparkles, LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  onNavigate: (route: string) => void;
  currentRoute: string;
  brand: { name: string; youtubeHandle: string; initial: string };
  isAdmin?: boolean;
  onAdminLogout?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onNavigate, currentRoute, brand, isAdmin = false, onAdminLogout }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Stories', href: '/stories' },
    { name: 'About', href: '/about' },
  ];

  const handleNavClick = (href: string) => {
    onNavigate(href);
    setIsMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => handleNavClick('/')}
          >
            <div className="w-10 h-10 bg-amber-400 rounded-lg flex items-center justify-center rotate-3 group-hover:rotate-12 transition-transform">
              <span className="text-zinc-950 font-black text-xl">{brand.initial}</span>
            </div>
            <span className="text-2xl font-black tracking-tighter text-white uppercase italic">
              {brand.name.substring(0, brand.name.length - 5)}<span className="text-amber-400">{brand.name.substring(brand.name.length - 5)}</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.href)}
                className={`text-sm font-bold uppercase tracking-widest transition-colors hover:text-amber-400 ${currentRoute === link.href ? 'text-amber-400' : 'text-zinc-400'}`}
              >
                {link.name}
              </button>
            ))}
            {isAdmin && (
              <button
                onClick={() => handleNavClick('/create')}
                className={`flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors hover:text-amber-400 ${currentRoute === '/create' ? 'text-amber-400' : 'text-zinc-400'}`}
              >
                <Sparkles size={16} /> Studio
              </button>
            )}
            <a 
              href={`https://youtube.com/${brand.youtubeHandle}`}
              target="_blank" 
              className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-full text-sm font-black transition-all transform hover:scale-105 rose-glow uppercase"
            >
              <Youtube size={18} />
              Subscribe
            </a>
          </div>

          <button 
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-zinc-900 absolute top-full left-0 w-full border-b border-zinc-800 p-6 flex flex-col gap-6 animate-in slide-in-from-top duration-300">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.href)}
                className="text-xl font-black uppercase text-left hover:text-amber-400"
              >
                {link.name}
              </button>
            ))}
            {isAdmin && (
              <button
                onClick={() => handleNavClick('/create')}
                className="text-xl font-black uppercase text-left hover:text-amber-400 flex items-center gap-2"
              >
                <Sparkles size={24} /> Creator Studio
              </button>
            )}
            <a 
              href={`https://youtube.com/${brand.youtubeHandle}`}
              target="_blank"
              className="flex items-center justify-center gap-2 bg-rose-600 text-white px-6 py-4 rounded-xl font-black uppercase"
            >
              <Youtube size={24} />
              YouTube Channel
            </a>
          </div>
        )}
      </nav>

      <main className="flex-grow pt-20">
        {children}
      </main>

      <footer className="bg-zinc-900 border-t border-zinc-800 py-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
             <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-amber-400 rounded-md flex items-center justify-center">
                  <span className="text-zinc-950 font-black">{brand.initial}</span>
                </div>
                <span className="text-xl font-black tracking-tighter text-white uppercase italic">
                  {brand.name}
                </span>
              </div>
              <p className="text-zinc-400 text-lg leading-relaxed max-w-md">
                Dissecting reality with a satirical scalpel. We tell real stories that shouldn't exist, but unfortunately do. Maximum laughs, zero apologies.
              </p>
          </div>
          <div>
            <h4 className="text-white font-bold uppercase tracking-widest mb-6">Navigation</h4>
            <ul className="space-y-4">
              {navLinks.map(link => (
                <li key={link.name}>
                  <button onClick={() => handleNavClick(link.href)} className="text-zinc-400 hover:text-amber-400 transition-colors flex items-center gap-2 group">
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold uppercase tracking-widest mb-6">Follow the Chaos</h4>
            <div className="flex gap-4">
              <a href={`https://youtube.com/${brand.youtubeHandle}`} className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-rose-600 transition-all">
                <Youtube size={24} />
              </a>
              <a href="#" className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-amber-400 hover:text-zinc-950 transition-all">
                <Instagram size={24} />
              </a>
              <a href="#" className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-sky-500 transition-all">
                <Twitter size={24} />
              </a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4 text-zinc-500 text-sm">
          <p>© {new Date().getFullYear()} {brand.name}. All Rights Reserved.</p>
          <div className="flex flex-wrap items-center gap-6">
            {isAdmin && (
              <button onClick={onAdminLogout} className="flex items-center gap-2 hover:text-rose-500 transition-colors">
                <LogOut size={14} /> Log out
              </button>
            )}
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
