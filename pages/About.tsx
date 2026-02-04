
import React from 'react';
import { Youtube, Instagram, Twitter, MessageSquare, Award, Flame, Users } from 'lucide-react';

interface AboutProps {
  brand: { name: string; youtubeHandle: string };
}

const About: React.FC<AboutProps> = ({ brand }) => {
  return (
    <div className="animate-in fade-in duration-700 pb-32">
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl md:text-8xl font-black text-white uppercase italic tracking-tighter mb-8">
            Behind the <span className="text-amber-400">Mask</span>
          </h1>
          <p className="text-2xl text-zinc-400 font-medium leading-relaxed">
            {brand.name} was born from a simple realization: Reality is far more ridiculous than fiction. We're just here to document it with some spicy commentary.
          </p>
        </div>
      </section>

      <section className="py-10 px-4">
        <div className="max-w-5xl mx-auto bg-zinc-900 rounded-[3rem] p-4 border border-zinc-800 shadow-2xl overflow-hidden">
          <div className="aspect-video rounded-[2.5rem] overflow-hidden">
            <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                title="Channel Intro" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowFullScreen
              />
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic mb-8">Our <span className="text-rose-600">Manifesto</span></h2>
            <p className="text-xl text-zinc-300 leading-relaxed mb-8">
              We believe that laughter is the best weapon against stupidity. In a world full of 'serious' news, we offer the 'unfiltered' version. 
            </p>
            <p className="text-xl text-zinc-300 leading-relaxed">
              Every story we tell on {brand.name} is based on real events. We research every detail to ensure that even though the humor is exaggerated, the facts remain painfully true.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800">
               <Flame className="text-rose-500 mb-4" size={32} />
               <h3 className="text-xl font-black text-white uppercase mb-2">Unfiltered</h3>
               <p className="text-zinc-500 text-sm font-medium">No corporate sponsors, no PR filtering. Just the truth.</p>
            </div>
            <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800">
               <Award className="text-amber-400 mb-4" size={32} />
               <h3 className="text-xl font-black text-white uppercase mb-2">Researched</h3>
               <p className="text-zinc-500 text-sm font-medium">Fact-checked absurdity is the best kind of absurdity.</p>
            </div>
            <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800">
               <Users className="text-sky-400 mb-4" size={32} />
               <h3 className="text-xl font-black text-white uppercase mb-2">Community</h3>
               <p className="text-zinc-500 text-sm font-medium">Join the fast-growing family of satire lovers.</p>
            </div>
            <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800">
               <MessageSquare className="text-green-400 mb-4" size={32} />
               <h3 className="text-xl font-black text-white uppercase mb-2">Interactive</h3>
               <p className="text-zinc-500 text-sm font-medium">We tell the stories our fans send in via {brand.youtubeHandle}.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-zinc-900/50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black text-white uppercase mb-12 italic">Connect with the <span className="text-amber-400">Chaos</span></h2>
          <div className="flex flex-wrap justify-center gap-6">
             <a href={`https://youtube.com/${brand.youtubeHandle}`} className="flex items-center gap-3 bg-rose-600 text-white px-8 py-4 rounded-2xl font-black uppercase transition-all hover:-translate-y-1">
               <Youtube size={24} /> YouTube
             </a>
             <a href="#" className="flex items-center gap-3 bg-gradient-to-tr from-orange-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-black uppercase transition-all hover:-translate-y-1">
               <Instagram size={24} /> Instagram
             </a>
             <a href="#" className="flex items-center gap-3 bg-sky-500 text-white px-8 py-4 rounded-2xl font-black uppercase transition-all hover:-translate-y-1">
               <Twitter size={24} /> Twitter
             </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
