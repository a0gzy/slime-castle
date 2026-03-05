'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import { saveWikiCategory, getWikiCategory, getAllWikiCategories, WikiCategory } from '@/lib/wikiCategories';
import { ImageGallery } from '@/components/WikiEditor/ImageGallery';
import { Save, ArrowLeft, Loader2, Trash2 } from 'lucide-react';

export default function CategoryEditorPage() {
    const { user, isAdmin, loading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [categoryId, setCategoryId] = useState('');
    const [existingIds, setExistingIds] = useState<string[]>([]);
    const [nameKey, setNameKey] = useState('');
    const [descKey, setDescKey] = useState('');
    const [icon, setIcon] = useState('FileText');
    const [customSvg, setCustomSvg] = useState('');
    const [iconMode, setIconMode] = useState<'preset' | 'svg' | 'image'>('preset');
    const [imageUrl, setImageUrl] = useState('');
    const [order, setOrder] = useState(0);
    const [introContent, setIntroContent] = useState('');

    const [saving, setSaving] = useState(false);
    const [loadError, setLoadError] = useState('');

    const handleSave = async () => {
        if (!categoryId || !nameKey) {
            alert('ID and Name Key are required');
            return;
        }
        try {
            setSaving(true);
            let iconValue = icon;
            if (iconMode === 'svg') iconValue = `svg:${customSvg}`;
            else if (iconMode === 'image') iconValue = `img:${imageUrl}`;

            const category: WikiCategory = {
                id: categoryId,
                nameKey,
                descriptionKey: descKey,
                icon: iconValue,
                order,
                introContent,
            };
            await saveWikiCategory(category);
            alert('Category saved!');
        } catch (e) {
            console.error(e);
            alert('Error saving category');
        } finally {
            setSaving(false);
        }
    };

    const handleLoad = async (idToLoad?: string) => {
        const id = idToLoad || categoryId;
        if (!id) return;
        setLoadError('');
        try {
            const data = await getWikiCategory(id);
            if (data) {
                if (!idToLoad) setCategoryId(id);
                setNameKey(data.nameKey);
                setDescKey(data.descriptionKey || '');
                const savedIcon = data.icon || 'FileText';
                if (savedIcon.startsWith('svg:')) {
                    setIconMode('svg');
                    setCustomSvg(savedIcon.slice(4));
                    setIcon('FileText');
                    setImageUrl('');
                } else if (savedIcon.startsWith('img:')) {
                    setIconMode('image');
                    setImageUrl(savedIcon.slice(4));
                    setIcon('FileText');
                    setCustomSvg('');
                } else {
                    setIconMode('preset');
                    setCustomSvg('');
                    setImageUrl('');
                    setIcon(savedIcon);
                }
                setOrder(data.order || 0);
                setIntroContent(data.introContent || '');
            } else {
                setLoadError('Category not found');
            }
        } catch (e) {
            console.error(e);
            setLoadError('Error loading');
        }
    };

    useEffect(() => {
        const loadIds = async () => {
            const cats = await getAllWikiCategories();
            setExistingIds(cats.map(c => c.id));
        };
        loadIds();

        const idParam = searchParams.get('id');
        if (idParam) {
            setCategoryId(idParam);
            handleLoad(idParam);
        }
    }, [searchParams]);

    if (loading) return <div className="p-8 text-zinc-400 flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Loading...</div>;
    if (!user || !isAdmin) return null;

    const iconOptions = ['Ghost', 'Sword', 'Shield', 'Box', 'Book', 'FileText', 'Sparkles', 'Star', 'Skull', 'Target', 'Gem', 'Crown', 'Zap', 'Heart'];

    const showGallery = iconMode === 'image';

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-black text-white">
            <div className={`flex-1 flex flex-col overflow-y-auto w-full ${showGallery ? 'max-w-[calc(100%-320px)]' : ''}`}>
                <div className="flex items-center justify-between p-4 bg-zinc-950 border-b border-zinc-800 sticky top-0 z-10 shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.push('/admin/wiki-editor')} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                            <ArrowLeft className="w-5 h-5 text-zinc-400" />
                        </button>
                        <h1 className="text-xl font-bold font-serif tracking-wide text-zinc-100 hidden sm:block">Category Editor</h1>
                    </div>
                    <button onClick={handleSave} disabled={saving} className={`flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-bold text-sm ${saving ? 'opacity-50' : ''}`}>
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Category
                    </button>
                </div>

                <div className="p-6 md:p-10 w-full max-w-3xl mx-auto pb-32 space-y-8">
                    <div className="bg-[#0c0c0e] border border-emerald-900/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none -mt-32 -mr-32" />

                        <div className="text-emerald-400 font-bold mb-6 uppercase text-xs tracking-widest flex items-center gap-3 relative z-10">
                            <span className="w-6 h-px bg-emerald-700" /> Category Details
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-zinc-500">Category ID (slug)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={categoryId}
                                        onChange={e => setCategoryId(e.target.value)}
                                        className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                                        placeholder="slimes"
                                        list="cat-ids"
                                    />
                                    <datalist id="cat-ids">
                                        {existingIds.map(id => <option key={id} value={id} />)}
                                    </datalist>
                                    <button onClick={() => handleLoad()} className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-semibold">Load</button>
                                </div>
                                {loadError && <div className="text-red-400 text-xs">{loadError}</div>}
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-zinc-500">Order (sorting)</label>
                                <input type="number" value={order} onChange={e => setOrder(Number(e.target.value))} className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-zinc-500">Name Loc Key</label>
                                <input type="text" value={nameKey} onChange={e => setNameKey(e.target.value)} className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" placeholder="wiki.categories.slimes" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-zinc-500">Desc Loc Key</label>
                                <input type="text" value={descKey} onChange={e => setDescKey(e.target.value)} className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" placeholder="wiki.categories.slimes.desc" />
                            </div>
                            <div className="flex flex-col gap-1.5 md:col-span-2">
                                <label className="text-xs font-semibold text-zinc-500">Icon</label>
                                <div className="flex items-center gap-3 mb-2">
                                    <button
                                        onClick={() => setIconMode('preset')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${iconMode === 'preset' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500'}`}
                                    >
                                        Preset Icons
                                    </button>
                                    <button
                                        onClick={() => setIconMode('svg')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${iconMode === 'svg' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500'}`}
                                    >
                                        Custom SVG
                                    </button>
                                    <button
                                        onClick={() => setIconMode('image')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${iconMode === 'image' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500'}`}
                                    >
                                        Image
                                    </button>
                                </div>
                                {iconMode === 'preset' && (
                                    <div className="flex flex-wrap gap-2">
                                        {iconOptions.map(ic => (
                                            <button
                                                key={ic}
                                                onClick={() => setIcon(ic)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${icon === ic ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500'}`}
                                            >
                                                {ic}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {iconMode === 'svg' && (
                                    <div className="space-y-3">
                                        <textarea
                                            value={customSvg}
                                            onChange={e => setCustomSvg(e.target.value)}
                                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-emerald-500 min-h-[100px] resize-y text-zinc-300"
                                            placeholder='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">...</svg>'
                                        />
                                        {customSvg && (
                                            <div className="flex items-center gap-3">
                                                <div className="text-xs text-zinc-500">Preview:</div>
                                                <div
                                                    className="w-10 h-10 bg-zinc-800 rounded-lg border border-zinc-700 flex items-center justify-center p-1.5 [&_svg]:w-full [&_svg]:h-full [&_svg]:text-emerald-400"
                                                    dangerouslySetInnerHTML={{ __html: customSvg }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                                {iconMode === 'image' && (
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            value={imageUrl}
                                            onChange={e => setImageUrl(e.target.value)}
                                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                                            placeholder="Select from gallery or paste URL →"
                                        />
                                        {imageUrl && (
                                            <div className="flex items-center gap-3">
                                                <div className="text-xs text-zinc-500">Preview:</div>
                                                <img src={imageUrl} alt="Icon preview" className="w-14 h-14 object-cover rounded-lg border border-zinc-700" />
                                            </div>
                                        )}
                                        <p className="text-xs text-zinc-600">Use the gallery panel on the right to select an image. →</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Intro Content */}
                    <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl p-6 shadow-xl">
                        <div className="text-zinc-400 font-bold mb-4 uppercase text-xs tracking-widest flex items-center gap-3">
                            <span className="w-6 h-px bg-zinc-700" /> Intro Content (HTML)
                        </div>
                        <textarea
                            value={introContent}
                            onChange={e => setIntroContent(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 min-h-[200px] font-mono resize-y text-zinc-300"
                            placeholder="<p>Welcome to the Slimes section...</p>"
                        />
                        <p className="text-xs text-zinc-600 mt-2">This HTML will be displayed at the top of the category page, before the entity list.</p>
                    </div>
                </div>
            </div>

            {/* Right Sidebar - Image Gallery (shown when Image mode is selected) */}
            {showGallery && (
                <ImageGallery onSelect={(url) => setImageUrl(url)} />
            )}
        </div>
    );
}
