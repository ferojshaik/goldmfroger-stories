
import React from 'react';
import { Youtube, ArrowRight, Mic2, Laugh, Zap, FileText } from 'lucide-react';
import StoryCard from '../components/StoryCard';
import { Story } from '../types';

interface HomeProps {
  onNavigate: (route: string) => void;
  brand: { name: string; youtubeHandle: string };
  stories: Story[];
  isAdmin?: boolean;
}

const Home: React.FC<HomeProps> = ({ onNavigate, brand, stories, isAdmin = false }) => {
  const safeStories = Array.isArray(stories) ? stories : [];
  const featuredStory = safeStories[0];
  const latestStories = safeStories.slice(1, 4).filter(s => s && typeof s.slug === 'string');

  return (
    <div className="animate-in fade-in duration-700">
      <section className="relative py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 px-6 py-2 rounded-full mb-8 animate-bounce">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-white">Live from the Underworld</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-8 italic uppercase leading-none">
              Real Incidents. <span className="text-amber-400">Satirical</span> Twists.
            </h1>
            <p className="text-xl md:text-2xl text-zinc-400 mb-12 font-medium leading-relaxed">
              We take the world's most absurd real-life events and give them the roasting they deserve. Grab your popcorn, it's about to get brutally funny.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
              <a 
                href={`https://youtube.com/${brand.youtubeHandle}`}
                target="_blank"
                className="flex items-center justify-center gap-3 bg-rose-600 hover:bg-rose-700 text-white px-10 py-5 rounded-2xl font-black uppercase text-lg transition-all transform hover:scale-105 rose-glow"
              >
                <Youtube size={28} />
                Sub to {brand.youtubeHandle}
              </a>
              {isAdmin && (
                <button 
                  onClick={() => onNavigate('/create')}
                  className="flex items-center justify-center gap-3 bg-zinc-100 hover:bg-amber-400 text-zinc-950 px-10 py-5 rounded-2xl font-black uppercase text-lg transition-all transform hover:scale-105"
                >
                  Create First Story
                  <ArrowRight size={28} />
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-amber-400/10 blur-[120px] -z-10 rounded-full"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-rose-600/10 blur-[150px] -z-10 rounded-full"></div>
      </section>

      {safeStories.length > 0 ? (
        <>
          <section className="py-20 bg-zinc-950 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-end justify-between mb-12">
                <div>
                  <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-4">
                    The <span className="text-amber-400">Headliner</span>
                  </h2>
                  <div className="h-1.5 w-32 bg-amber-400 rounded-full"></div>
                </div>
              </div>
              {featuredStory && <StoryCard story={featuredStory} onClick={(slug) => onNavigate(`/stories/${encodeURIComponent(slug)}`)} isFeatured />}
            </div>
          </section>

          {latestStories.length > 0 && (
            <section className="py-24 bg-zinc-900/30 px-4">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1 flex flex-col justify-center gap-6">
                    <h2 className="text-5xl font-black text-white uppercase leading-[0.9] tracking-tighter">
                      Latest <br />
                      <span className="text-rose-500">Carnage</span>
                    </h2>
                    <p className="text-zinc-400 text-lg leading-relaxed">
                      Fresh out of the satirical oven. These stories are verified real, verified ridiculous, and verified hilarious.
                    </p>
                    <button 
                      onClick={() => onNavigate('/stories')}
                      className="flex items-center gap-2 text-amber-400 font-black uppercase tracking-widest text-sm hover:translate-x-2 transition-transform w-fit"
                    >
                      View all stories <ArrowRight size={20} />
                    </button>
                  </div>
                  {latestStories.map(story => (
                    <StoryCard key={story.slug} story={story} onClick={(slug) => onNavigate(`/stories/${encodeURIComponent(slug)}`)} />
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      ) : (
        <section className="py-32 px-4 text-center">
          <div className="max-w-xl mx-auto bg-zinc-900/50 border border-zinc-800 rounded-[3rem] p-16">
            <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-8 text-zinc-600">
               <FileText size={40} />
            </div>
            <h2 className="text-3xl font-black text-white uppercase italic mb-4">The Archives are Empty</h2>
            <p className="text-zinc-400 mb-10 leading-relaxed font-medium">
              {isAdmin
                ? "We're currently scouring the globe for the most embarrassing human moments. Check back soon or start writing your own satire in the Creator Studio."
                : "We're currently scouring the globe for the most embarrassing human moments. Check back soon."}
            </p>
            {isAdmin && (
              <button 
                onClick={() => onNavigate('/create')}
                className="bg-amber-400 text-zinc-950 px-8 py-4 rounded-xl font-black uppercase tracking-wider hover:bg-amber-500 transition-colors"
              >
                Start Your First Post
              </button>
            )}
          </div>
        </section>
      )}

      <section className="py-20 border-y border-zinc-800 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center text-amber-400 mb-2">
              <Zap size={32} />
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight">Rapid Roast</h3>
            <p className="text-zinc-500 font-medium">Fast-paced commentary that cuts through the corporate BS.</p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center text-rose-500 mb-2">
              <Laugh size={32} />
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight">Zero Mercy</h3>
            <p className="text-zinc-500 font-medium">We call out the stupidity exactly as we see it. No filters.</p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center text-sky-400 mb-2">
              <Mic2 size={32} />
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight">Podcast Ready</h3>
            <p className="text-zinc-500 font-medium">Written to be heard. Every story is a potential stand-up bit.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
