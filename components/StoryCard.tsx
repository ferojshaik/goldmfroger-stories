
import React from 'react';
import { Calendar, Clock, PlayCircle, Trash2 } from 'lucide-react';
import { Story } from '../types';

interface StoryCardProps {
  story: Story;
  onClick: (slug: string) => void;
  onDelete?: (e: React.MouseEvent, slug: string) => void;
  isFeatured?: boolean;
}

const StoryCard: React.FC<StoryCardProps> = ({ story, onClick, onDelete, isFeatured }) => {
  if (isFeatured) {
    return (
      <div 
        onClick={() => onClick(story.slug)}
        className="group relative w-full h-[500px] md:h-[600px] overflow-hidden rounded-3xl cursor-pointer shadow-2xl transition-transform hover:scale-[1.01]"
      >
        <img 
          src={story.image} 
          alt={story.title} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16">
          <div className="flex justify-between items-start mb-6">
            <div className="flex gap-3">
              <span className="bg-amber-400 text-zinc-950 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
                Featured Story
              </span>
              {story.category && (
                <span className="bg-rose-600 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
                  {story.category}
                </span>
              )}
            </div>
            {onDelete && (
              <button 
                onClick={(e) => onDelete(e, story.slug)}
                className="bg-zinc-900/80 hover:bg-rose-600 text-white p-3 rounded-xl transition-all"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight max-w-4xl group-hover:text-amber-400 transition-colors">
            {story.title}
          </h2>
          <p className="text-zinc-300 text-lg md:text-xl max-w-2xl mb-8 line-clamp-2 md:line-clamp-none">
            {story.description}
          </p>
          <div className="flex flex-wrap items-center gap-8 text-zinc-400 font-bold uppercase tracking-widest text-sm mb-10">
            <div className="flex items-center gap-2">
              <Calendar size={20} className="text-amber-400" />
              {new Date(story.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
            <div className="flex items-center gap-2">
              <Clock size={20} className="text-amber-400" />
              {story.readingTime}
            </div>
          </div>
          <button className="flex items-center gap-3 bg-white text-zinc-950 hover:bg-amber-400 transition-all px-8 py-4 rounded-full font-black uppercase tracking-wider text-lg w-fit group/btn">
            <PlayCircle size={28} className="fill-current group-hover/btn:scale-110 transition-transform" />
            Watch & Read
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={() => onClick(story.slug)}
      className="group flex flex-col bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden cursor-pointer transition-all hover:-translate-y-2 hover:border-amber-400/50 gold-glow relative"
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <img 
          src={story.image} 
          alt={story.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-zinc-950/20 group-hover:bg-zinc-950/0 transition-colors" />
        <div className="absolute bottom-4 right-4 bg-zinc-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-bold text-white uppercase">
           <Clock size={14} className="text-amber-400" />
           {story.readingTime}
        </div>
        {onDelete && (
          <button 
            onClick={(e) => onDelete(e, story.slug)}
            className="absolute top-4 right-4 bg-zinc-950/80 hover:bg-rose-600 text-white p-2.5 rounded-xl transition-all opacity-0 group-hover:opacity-100"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <div className="text-xs font-black text-rose-500 uppercase tracking-widest mb-3">
          {story.category || 'Real Incident'}
        </div>
        <h3 className="text-xl font-black text-white mb-4 leading-tight group-hover:text-amber-400 transition-colors line-clamp-2">
          {story.title}
        </h3>
        <p className="text-zinc-400 text-sm mb-6 line-clamp-3 leading-relaxed">
          {story.description}
        </p>
        <div className="mt-auto pt-6 border-t border-zinc-800 flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
            {new Date(story.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
          <span className="text-sm font-black text-white group-hover:text-amber-400 flex items-center gap-1 uppercase italic tracking-tighter">
            Read Story <ChevronRight size={16} />
          </span>
        </div>
      </div>
    </div>
  );
};

const ChevronRight: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
);

export default StoryCard;
