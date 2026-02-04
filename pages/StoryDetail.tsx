
import React from 'react';
import { Calendar, Clock, ArrowLeft, Twitter, Facebook, Link as LinkIcon, Youtube, Trash2 } from 'lucide-react';
import { Story } from '../types';

interface StoryDetailProps {
  slug: string;
  onNavigate: (route: string) => void;
  stories: Story[];
  brand: { name: string; youtubeHandle: string; initial: string };
  onDeleteStory: (slug: string) => void;
  isAdmin?: boolean;
}

const StoryDetail: React.FC<StoryDetailProps> = ({ slug, onNavigate, stories, brand, onDeleteStory, isAdmin = false }) => {
  const story = stories.find(s => s.slug === slug);
  const relatedStories = stories.filter(s => s.slug !== slug).slice(0, 3);

  const getYoutubeEmbedUrl = (url?: string) => {
    if (!url) return null;
    
    // Robust Regex to extract 11-character Video ID from almost any YouTube URL
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;

    if (!videoId) return null;
    
    return `https://www.youtube.com/embed/${videoId}?rel=0`;
  };

  const handleDelete = () => {
    if (confirm("Permanently delete this story? This action cannot be reversed.")) {
      onDeleteStory(slug);
    }
  };

  if (!story) return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-white text-4xl font-black uppercase italic tracking-tighter">Story Vanished</h1>
    </div>
  );

  const embedUrl = getYoutubeEmbedUrl(story.youtubeUrl);

  return (
    <div className="animate-in fade-in duration-500 pb-32">
      <header className="relative h-[60vh] md:h-[70vh] w-full flex items-end pb-20 overflow-hidden">
        <img 
          src={story.image} 
          alt={story.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
        
        <div className="max-w-5xl mx-auto px-4 relative z-10 w-full">
          <button 
            onClick={() => onNavigate('/stories')}
            className="flex items-center gap-2 text-amber-400 font-black uppercase tracking-widest text-sm mb-8 hover:-translate-x-2 transition-transform"
          >
            <ArrowLeft size={18} /> Back to Stories
          </button>
          <div className="text-rose-500 text-sm md:text-base font-black uppercase tracking-[0.3em] mb-4">
            {story.category || 'Real Incident Case Study'}
          </div>
          <h1 className="text-4xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-[0.9] mb-8">
            {story.title}
          </h1>
          <div className="flex flex-wrap items-center gap-6 md:gap-10 text-zinc-300 font-bold uppercase tracking-wider text-sm">
             <div className="flex items-center gap-2">
                <Calendar size={18} className="text-amber-400" />
                {new Date(story.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
             </div>
             <div className="flex items-center gap-2">
                <Clock size={18} className="text-amber-400" />
                {story.readingTime || '5 min'} read
             </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-16 mt-16">
        <article className="lg:col-span-8">
          {embedUrl ? (
            <div className="mb-16 aspect-video rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-2xl">
              <iframe 
                width="100%" 
                height="100%" 
                src={embedUrl} 
                title="YouTube video player" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerPolicy="strict-origin-when-cross-origin"
                sandbox="allow-forms allow-scripts allow-pointer-lock allow-same-origin allow-top-navigation allow-presentation"
                allowFullScreen
              />
            </div>
          ) : story.youtubeUrl && (
            <div className="mb-16 p-8 bg-zinc-900 border-2 border-dashed border-zinc-800 rounded-3xl text-center">
              <p className="text-zinc-500 font-bold mb-4 uppercase tracking-widest">Video Embed Unavailable</p>
              <a 
                href={story.youtubeUrl} 
                target="_blank" 
                className="inline-flex items-center gap-2 bg-rose-600 text-white px-6 py-3 rounded-xl font-black uppercase text-sm"
              >
                Watch Directly on YouTube <Youtube size={18} />
              </a>
            </div>
          )}

          <div className="prose prose-invert prose-zinc max-w-none">
            {story.body ? (
              <div className="text-zinc-300 text-xl leading-relaxed whitespace-pre-wrap">
                {story.body.split('\n').map((line, i, lines) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < lines.length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>
            ) : (
              <p>Content for this story is coming soon. Stay tuned!</p>
            )}
          </div>

          <div className="mt-20 pt-10 border-t border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
               <span className="text-zinc-500 font-black uppercase tracking-widest text-sm">Spread the word:</span>
               <div className="flex gap-2">
                 <button className="w-12 h-12 bg-zinc-900 hover:bg-sky-500 text-white rounded-xl flex items-center justify-center transition-all">
                    <Twitter size={20} />
                 </button>
                 <button className="w-12 h-12 bg-zinc-900 hover:bg-blue-600 text-white rounded-xl flex items-center justify-center transition-all">
                    <Facebook size={20} />
                 </button>
                 <button className="w-12 h-12 bg-zinc-900 hover:bg-amber-400 hover:text-zinc-950 text-white rounded-xl flex items-center justify-center transition-all">
                    <LinkIcon size={20} />
                 </button>
               </div>
            </div>
            <a 
              href={`https://youtube.com/${brand.youtubeHandle}`}
              target="_blank"
              className="flex items-center gap-2 bg-rose-600 text-white px-8 py-4 rounded-xl font-black uppercase tracking-tighter transition-all hover:scale-105"
            >
              <Youtube size={24} /> Subscribe for More
            </a>
          </div>
        </article>

        <aside className="lg:col-span-4 space-y-12">
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-[2rem] p-8">
            <h3 className="text-2xl font-black text-white uppercase mb-4 italic">The <span className="text-amber-400">Host</span></h3>
            <p className="text-zinc-400 mb-6">{brand.name} is your guide through the absurd. We spend thousands of hours digging through the internet's trash to find these gems.</p>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-amber-400 flex items-center justify-center font-black text-2xl text-zinc-950">{brand.initial}</div>
              <div>
                <div className="text-white font-black uppercase">{brand.name}</div>
                <div className="text-rose-500 text-sm font-bold">{brand.youtubeHandle}</div>
              </div>
            </div>
            <button 
              onClick={() => onNavigate('/about')}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-colors"
            >
              About the Channel
            </button>
          </div>

          <div>
            <h3 className="text-xl font-black text-white uppercase mb-6 tracking-tight">More Absurdity</h3>
            <div className="space-y-6">
              {relatedStories.map(s => (
                <div 
                  key={s.slug} 
                  onClick={() => onNavigate(`/stories/${s.slug}`)}
                  className="group flex gap-4 cursor-pointer"
                >
                  <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700">
                    <img src={s.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt={s.title} />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h4 className="text-white font-bold group-hover:text-amber-400 transition-colors line-clamp-2 leading-tight uppercase text-sm mb-2">{s.title}</h4>
                    <span className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">{s.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {isAdmin && (
            <div className="pt-10 border-t border-zinc-800/50">
              <h3 className="text-xs font-black text-zinc-600 uppercase mb-4 tracking-[0.2em]">Danger Zone</h3>
              <button 
                onClick={handleDelete}
                className="w-full flex items-center justify-center gap-2 border border-zinc-800 hover:border-rose-900 hover:bg-rose-900/10 text-zinc-500 hover:text-rose-500 py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all"
              >
                <Trash2 size={16} /> Delete This Roast
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default StoryDetail;
