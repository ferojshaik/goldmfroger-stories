
import React, { useState } from 'react';
import { Search, Settings, Trash2, X } from 'lucide-react';
import StoryCard from '../components/StoryCard';
import { Story } from '../types';

interface StoriesListProps {
  onNavigate: (route: string) => void;
  stories: Story[];
  onDeleteStory: (slug: string) => void;
  isAdmin?: boolean;
}

const StoriesList: React.FC<StoriesListProps> = ({ onNavigate, stories, onDeleteStory, isAdmin = false }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isManageMode, setIsManageMode] = useState(false);
  
  const filteredStories = stories.filter(story => 
    story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    story.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    story.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (e: React.MouseEvent, slug: string) => {
    e.stopPropagation();
    if (window.confirm("ARE YOU SURE? This story will be deleted forever.")) {
      onDeleteStory(slug);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-screen">
      <section className="pt-20 pb-16 px-4 bg-zinc-900/20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <h1 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter mb-6">
                All <span className="text-amber-400">Stories</span>
              </h1>
              <p className="text-xl text-zinc-400 font-medium leading-relaxed mb-6">
                The complete archive of human incompetence, roasted to perfection. Browse by category, date, or just keep scrolling until you feel better about your own life.
              </p>
              
              {isAdmin && (
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setIsManageMode(!isManageMode)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-lg ${isManageMode ? 'bg-rose-600 text-white ring-4 ring-rose-600/20' : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:border-zinc-700'}`}
                  >
                    {isManageMode ? <X size={16} /> : <Settings size={16} />}
                    {isManageMode ? 'Exit Management' : 'Manage Posts'}
                  </button>
                  
                  {isManageMode && (
                    <span className="text-rose-500 text-[10px] font-black uppercase animate-pulse tracking-widest">
                      Danger Mode Active
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="w-full md:w-96 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
              <input 
                type="text" 
                placeholder="Search the archives..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-amber-400 transition-colors shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          {filteredStories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredStories.map(story => (
                <StoryCard 
                  key={story.slug} 
                  story={story} 
                  onClick={(slug) => onNavigate(`/stories/${slug}`)} 
                  onDelete={isAdmin && isManageMode ? handleDelete : undefined}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-32 bg-zinc-900/30 rounded-[3rem] border-2 border-dashed border-zinc-800">
              <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6 text-zinc-500">
                <Search size={40} />
              </div>
              <h3 className="text-3xl font-black text-white uppercase mb-4 tracking-tighter">No Witnesses Found</h3>
              <p className="text-zinc-500 text-lg max-w-md mx-auto">
                We couldn't find any stories matching "{searchQuery}". Maybe it's so stupid we haven't even found it yet.
              </p>
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-8 bg-amber-400 text-zinc-950 px-8 py-3 rounded-xl font-black uppercase shadow-xl hover:scale-105 transition-transform"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default StoriesList;
