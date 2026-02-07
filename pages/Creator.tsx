
import React, { useState, useRef, useEffect } from 'react';
import { Trash2, Settings, Youtube, CheckCircle2, PlayCircle, PenTool, Image as ImageIcon, Upload, FileText, Pencil } from 'lucide-react';
import { Story } from '../types';

interface CreatorProps {
  onNavigate: (route: string) => void;
  onAddStory: (story: Story) => void;
  onUpdateStory?: (slug: string, story: Story) => void;
  onDeleteStory: (slug: string) => void;
  customStories: Story[];
  brand: { name: string; youtubeHandle: string };
  onUpdateBrand: (name: string, handle: string) => void;
}

const Creator: React.FC<CreatorProps> = ({ onNavigate, onAddStory, onUpdateStory, onDeleteStory, customStories, brand, onUpdateBrand }) => {
  // Manual Story State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    body: '',
    slug: '',
    image: '',
    youtubeUrl: ''
  });

  const [showBrandSettings, setShowBrandSettings] = useState(false);
  const [view, setView] = useState<'create' | 'manage'>('create');
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [tempBrandName, setTempBrandName] = useState(brand.name);
  const [tempBrandHandle, setTempBrandHandle] = useState(brand.youtubeHandle);
  const [imageError, setImageError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLocalPath = (value: string) => /^[A-Za-z]:\\|^\/[^/]|^file:\/\//i.test((value || '').trim());

  const handlePublish = () => {
    if (!formData.title || !formData.body) {
      alert("Please provide at least a Title and a Story Body!");
      return;
    }
    if (formData.image && isLocalPath(formData.image)) {
      setImageError('That\'s a file path, not a web URL. Use "Choose Local File" above to upload the image.');
      alert("Cover image: use \"Choose Local File\" to upload your image, or paste a web URL (e.g. https://...). File paths like C:\\... don't work in the browser.");
      return;
    }
    setImageError('');

    const slug = editingSlug || formData.slug || formData.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Date.now();
    const newStory: Story = {
      ...formData,
      slug,
      date: editingSlug ? (customStories.find(s => s.slug === editingSlug)?.date ?? new Date().toISOString().split('T')[0]) : new Date().toISOString().split('T')[0],
      readingTime: `${Math.ceil(formData.body.length / 800) + 1} min`,
      image: formData.image || `https://picsum.photos/seed/${Date.now()}/1200/600`
    };

    try {
      if (editingSlug && onUpdateStory) {
        onUpdateStory(editingSlug, newStory);
        alert("Story updated!");
        setEditingSlug(null);
        clearForm();
        setView('manage');
      } else {
        onAddStory(newStory);
        alert("Story Published! It's now live in your local feed.");
        onNavigate('/stories');
      }
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : String(err);
      if (/quota|size|storage/i.test(msg)) {
        alert("Story is too large to save (cover image may be too big). Try a smaller image or use a web image URL instead.");
      } else {
        alert("Something went wrong saving the story. Try a smaller cover image or clear the draft and try again.");
      }
    }
  };

  const handleSaveBrand = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateBrand(tempBrandName, tempBrandHandle);
    setShowBrandSettings(false);
  };

  const updateField = (field: string, value: string) => {
    if (field === 'image') setImageError('');
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      let dataUrl = reader.result as string;
      if (dataUrl.length > 1_200_000) {
        const img = new Image();
        img.onload = () => {
          const maxW = 1200;
          const scale = img.width > maxW ? maxW / img.width : 1;
          const w = Math.round(img.width * scale);
          const h = Math.round(img.height * scale);
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            const resized = canvas.toDataURL('image/jpeg', 0.85);
            updateField('image', resized);
          } else {
            updateField('image', dataUrl);
          }
        };
        img.onerror = () => updateField('image', dataUrl);
        img.src = dataUrl;
      } else {
        updateField('image', dataUrl);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const clearForm = () => {
    if (!formData.title && !formData.body && !editingSlug) return;
    if (confirm("Are you sure you want to clear your current draft?")) {
      setFormData({
        title: '',
        description: '',
        category: '',
        body: '',
        slug: '',
        image: '',
        youtubeUrl: ''
      });
      setEditingSlug(null);
      setImageError('');
    }
  };

  const startEditing = (story: Story) => {
    setFormData({
      title: story.title ?? '',
      description: story.description ?? '',
      category: story.category ?? '',
      body: story.body ?? '',
      slug: story.slug ?? '',
      image: story.image ?? '',
      youtubeUrl: story.youtubeUrl ?? ''
    });
    setEditingSlug(story.slug ?? null);
    setImageError('');
    setView('create');
  };

  useEffect(() => {
    const editSlug = sessionStorage.getItem('creator_edit_slug');
    if (editSlug && customStories.length > 0) {
      sessionStorage.removeItem('creator_edit_slug');
      const story = customStories.find(s => s.slug === editSlug || decodeURIComponent(s.slug) === editSlug);
      if (story) startEditing(story);
    }
  }, [customStories]);

  const handleDelete = (e: React.MouseEvent, slug: string) => {
    e.stopPropagation(); // Prevent navigation if parent has click handler
    if (confirm("Permanently delete this story? This cannot be undone.")) {
      onDeleteStory(slug);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
        <div>
          <h1 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter mb-4 leading-none">
            Creator <span className="text-amber-400">Studio</span>
          </h1>
          <p className="text-zinc-400 text-xl max-w-2xl font-medium">
            Manage your channel and craft your satirical masterpieces.
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setView(view === 'create' ? 'manage' : 'create')}
            className={`flex items-center gap-2 border border-zinc-800 transition-colors px-6 py-3 rounded-xl font-black uppercase text-sm ${view === 'manage' ? 'bg-amber-400 text-zinc-950' : 'bg-zinc-900 text-zinc-400 hover:border-amber-400'}`}
          >
            {view === 'create' ? <FileText size={20} /> : <PenTool size={20} />}
            {view === 'create' ? 'Manage Posts' : 'Create Post'}
          </button>
          <button 
            onClick={() => setShowBrandSettings(!showBrandSettings)}
            className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 hover:border-amber-400 transition-colors px-6 py-3 rounded-xl font-black uppercase text-sm"
          >
            <Settings size={20} /> Identity
          </button>
        </div>
      </div>

      {showBrandSettings && (
        <div className="mb-12 bg-zinc-900 border border-amber-400/50 rounded-3xl p-8 animate-in slide-in-from-top-4 duration-300 shadow-2xl">
          <h2 className="text-2xl font-black text-white uppercase mb-6 flex items-center gap-2 italic">
            <Youtube className="text-rose-500" /> Channel Brand
          </h2>
          <form onSubmit={handleSaveBrand} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">Channel Name</label>
              <input 
                value={tempBrandName}
                onChange={(e) => setTempBrandName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-400 text-white font-bold transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">YouTube Handle</label>
              <input 
                value={tempBrandHandle}
                onChange={(e) => setTempBrandHandle(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-400 text-white font-bold transition-all"
              />
            </div>
            <button type="submit" className="md:col-span-2 bg-amber-400 text-zinc-950 font-black uppercase py-4 rounded-xl hover:bg-amber-500 transition-all transform hover:scale-[1.01]">
              Apply Identity
            </button>
          </form>
        </div>
      )}

      {view === 'create' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Editor Side */}
          <div className="lg:col-span-7">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <PenTool size={20} className="text-amber-400" />
                <h2 className="text-xl font-black text-white uppercase italic">Draft Story</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Headline</label>
                  <input 
                    value={formData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white font-bold focus:border-amber-400 transition-all"
                    placeholder="e.g. The CEO Who Fired Reality"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Category</label>
                  <input 
                    value={formData.category}
                    onChange={(e) => updateField('category', e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white font-bold focus:border-amber-400 transition-all"
                    placeholder="e.g. Corporate Chaos"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Cover Image (Upload Local)</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-zinc-950 border-2 border-dashed border-zinc-800 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-amber-400 transition-all group"
                  >
                    <Upload className="text-zinc-600 group-hover:text-amber-400 transition-colors mb-2" size={24} />
                    <span className="text-xs font-bold text-zinc-500 group-hover:text-white uppercase tracking-tighter">Choose Local File</span>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Or Image URL</label>
                  <div className="relative h-[84px]">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                    <input 
                      value={typeof formData.image === 'string' && formData.image.startsWith('data:') ? '(uploaded image)' : (formData.image || '')}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === '(uploaded image)') return;
                        updateField('image', v);
                      }}
                      className={`w-full h-full bg-zinc-950 border rounded-xl py-3 pl-10 pr-3 text-white text-xs font-mono ${imageError ? 'border-rose-500' : 'border-zinc-800'}`}
                      placeholder="https://..."
                    />
                  </div>
                  {imageError && <p className="text-rose-500 text-xs font-medium">{imageError}</p>}
                  <p className="text-zinc-500 text-[10px]">Paste a web URL only. For files on your PC, use &quot;Choose Local File&quot; above.</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">YouTube Video or Shorts Link (Optional)</label>
                <div className="relative">
                  <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-500" size={16} />
                  <input 
                    value={formData.youtubeUrl}
                    onChange={(e) => updateField('youtubeUrl', e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-10 pr-3 text-white text-xs font-mono"
                    placeholder="youtube.com/watch?v=... or youtube.com/shorts/..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Hook / Short Excerpt</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={2}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white resize-none focus:border-amber-400 transition-all"
                  placeholder="Hook the reader..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">The Full Satire</label>
                <textarea 
                  value={formData.body}
                  onChange={(e) => updateField('body', e.target.value)}
                  rows={12}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white font-medium focus:border-amber-400 transition-all"
                  placeholder="Tell the story..."
                />
              </div>

              <div className="pt-4 flex gap-4">
                {editingSlug ? (
                  <>
                    <button 
                      onClick={handlePublish}
                      className="flex-grow flex items-center justify-center gap-3 bg-amber-400 text-zinc-950 hover:bg-amber-300 px-6 py-5 rounded-2xl font-black uppercase text-lg transition-all transform hover:scale-[1.02]"
                    >
                      <CheckCircle2 size={24} /> Update Story
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        setEditingSlug(null);
                        setFormData({ title: '', description: '', category: '', body: '', slug: '', image: '', youtubeUrl: '' });
                        setImageError('');
                      }}
                      className="px-6 py-5 rounded-2xl font-black uppercase text-sm border border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={handlePublish}
                    className="flex-grow flex items-center justify-center gap-3 bg-rose-600 hover:bg-rose-700 text-white px-6 py-5 rounded-2xl font-black uppercase text-lg transition-all rose-glow transform hover:scale-[1.02]"
                  >
                    <CheckCircle2 size={24} /> Publish Story
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Preview Side */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] italic">Live Reader Preview</h3>
                {formData.title && (
                  <button 
                    onClick={clearForm}
                    className="flex items-center gap-1 text-zinc-500 hover:text-rose-500 transition-colors text-xs font-bold uppercase tracking-tighter"
                  >
                    <Trash2 size={16} /> Clear Draft
                  </button>
                )}
              </div>
              
              <div className="bg-zinc-900 border-2 border-amber-400 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all">
                <div className="aspect-video relative bg-zinc-950 flex items-center justify-center overflow-hidden">
                  {formData.image ? (
                    <img src={formData.image} className="w-full h-full object-cover opacity-60 transition-opacity duration-700" alt="Preview" />
                  ) : (
                    <div className="text-zinc-800 animate-pulse">
                      <ImageIcon size={64} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <PlayCircle size={64} className="text-white opacity-20" />
                  </div>
                </div>
                <div className="p-10">
                  <div className="text-xs font-black text-rose-500 uppercase mb-4 tracking-[0.2em] italic">
                    {formData.category || 'CASE STUDY'}
                  </div>
                  <h4 className="text-3xl font-black text-white uppercase italic mb-6 leading-tight min-h-[4.5rem]">
                    {formData.title || 'YOUR EPIC HEADLINE'}
                  </h4>
                  <p className="text-zinc-400 text-base mb-8 line-clamp-3 leading-relaxed">
                    {formData.description || 'Your hook description...'}
                  </p>
                  <div className="flex items-center justify-between pt-8 border-t border-zinc-800">
                    <span className="text-xs font-bold text-zinc-600 uppercase tracking-widest italic">Mock Preview</span>
                    <span className="text-sm font-black text-amber-400 uppercase italic tracking-tighter flex items-center gap-1">
                      Full Story <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-2 mb-8">
            <FileText className="text-amber-400" />
            <h2 className="text-3xl font-black text-white uppercase italic">Manage Your Stories</h2>
          </div>
          
          {customStories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customStories.map(story => (
                <div key={story.slug} className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col group">
                  <div className="aspect-video relative overflow-hidden">
                    <img src={story.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={story.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent opacity-60" />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button 
                        onClick={() => startEditing(story)}
                        className="bg-amber-400 text-zinc-950 p-3 rounded-xl shadow-lg transform hover:scale-110 active:scale-95 transition-all"
                        title="Edit"
                      >
                        <Pencil size={18} />
                      </button>
                      <button 
                        onClick={(e) => handleDelete(e, story.slug)}
                        className="bg-rose-600 text-white p-3 rounded-xl shadow-lg transform hover:scale-110 active:scale-95 transition-all"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="p-6 flex-grow flex flex-col">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">{story.date}</span>
                    <h3 className="text-lg font-black text-white uppercase italic leading-tight mb-4 group-hover:text-amber-400 transition-colors line-clamp-2">{story.title}</h3>
                    <div className="mt-auto pt-4 border-t border-zinc-800 flex justify-between items-center">
                      <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">{story.category ?? ''}</span>
                      <div className="flex gap-3">
                        <button onClick={() => startEditing(story)} className="text-xs font-bold text-amber-400 uppercase tracking-tighter hover:underline">Edit</button>
                        <button onClick={() => onNavigate(`/stories/${encodeURIComponent(story.slug)}`)} className="text-xs font-bold text-white uppercase tracking-tighter hover:underline">View Post</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-32 text-center bg-zinc-900/50 border-2 border-dashed border-zinc-800 rounded-[3rem]">
              <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6 text-zinc-600">
                <FileText size={40} />
              </div>
              <h3 className="text-2xl font-black text-white uppercase mb-2">No Stories Yet</h3>
              <p className="text-zinc-500 max-w-sm mx-auto">You haven&apos;t published any stories manually yet. Start by creating your first roast!</p>
              <button 
                onClick={() => setView('create')}
                className="mt-8 bg-amber-400 text-zinc-950 px-8 py-3 rounded-xl font-black uppercase"
              >
                Go to Editor
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ArrowRight: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
);

export default Creator;
