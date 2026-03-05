'use client';

import { useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { saveWikiEntity, getWikiEntity, WikiEntity, SetMetadata, getWikiEntityIdsByCategory } from '@/lib/wiki';
import { useSearchParams } from 'next/navigation';
import { ImageGallery } from '@/components/WikiEditor/ImageGallery';
import { useEffect } from 'react';
import { Save, ArrowLeft, Loader2, Plus, Trash2, Box } from 'lucide-react';

export default function SetEditorPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [entityId, setEntityId] = useState('');
    const [existingIds, setExistingIds] = useState<string[]>([]);
    const [nameKey, setNameKey] = useState('');
    const [descKey, setDescKey] = useState('');
    const [image, setImage] = useState('');

    const [metadata, setMetadata] = useState<SetMetadata>({
        rarity: 'SS',
        name: '',
        items: [],
        setEffect2: { descKey: '' },
        setEffect4: { descKey: '' }
    });

    const [saving, setSaving] = useState(false);
    const [loadError, setLoadError] = useState('');

    const handleSave = async () => {
        if (!entityId || !nameKey) {
            alert('ID and Name Key are required');
            return;
        }
        try {
            setSaving(true);
            const entity: WikiEntity = {
                id: entityId,
                category: 'sets',
                nameKey,
                descriptionKey: descKey,
                image,
                metadata,
                published: true
            };
            await saveWikiEntity(entity);
            alert('Saved successfully!');
        } catch (e) {
            console.error(e);
            alert('Error saving entity');
        } finally {
            setSaving(false);
        }
    };

    const handleLoad = async (idToLoad?: string) => {
        const id = idToLoad || entityId;
        if (!id) return;
        setLoadError('');
        try {
            const data = await getWikiEntity(id);
            if (data && data.category === 'sets') {
                if (!idToLoad) setEntityId(id);
                setNameKey(data.nameKey);
                setDescKey(data.descriptionKey || '');
                setImage(data.image || '');
                if (data.metadata) {
                    setMetadata(data.metadata as SetMetadata);
                }
            } else {
                setLoadError('Entity not found or not a set');
            }
        } catch (e) {
            console.error(e);
            setLoadError('Error loading');
        }
    };

    useEffect(() => {
        const loadIds = async () => {
            const ids = await getWikiEntityIdsByCategory('sets');
            setExistingIds(ids);
        };
        loadIds();

        const idParam = searchParams.get('id');
        if (idParam) {
            setEntityId(idParam);
            handleLoad(idParam);
        }
    }, [searchParams]);

    if (loading) return null;
    if (!user) return null;

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-black text-white">
            <div className="flex-1 flex flex-col overflow-y-auto w-full">
                <div className="flex items-center justify-between p-4 bg-zinc-950 border-b border-zinc-800 sticky top-0 z-10 shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.push('/admin/wiki-editor')} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                            <ArrowLeft className="w-5 h-5 text-zinc-400" />
                        </button>
                        <h1 className="text-xl font-bold font-serif tracking-wide text-zinc-100 hidden sm:block">Item Set Editor</h1>
                    </div>
                    <button onClick={handleSave} disabled={saving} className={`flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors font-bold text-sm ${saving ? 'opacity-50' : ''}`}>
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Publish Set
                    </button>
                </div>

                <div className="p-6 md:p-10 w-full max-w-5xl mx-auto pb-32 space-y-8">
                    {/* General Details */}
                    <div className="bg-[#0c0c0e] border border-purple-900/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none -mt-32 -mr-32" />

                        <div className="text-purple-400 font-bold mb-6 uppercase text-xs tracking-widest flex items-center gap-3 relative z-10">
                            <span className="w-6 h-px bg-purple-700" /> General Details
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-zinc-500">Document ID</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={entityId}
                                        onChange={e => setEntityId(e.target.value)}
                                        className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                                        placeholder="sets-astral"
                                        list="set-ids"
                                    />
                                    <datalist id="set-ids">
                                        {existingIds.map(id => <option key={id} value={id} />)}
                                    </datalist>
                                    <button onClick={() => handleLoad()} className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-semibold">Load</button>
                                </div>
                                {loadError && <div className="text-purple-400 text-xs">{loadError}</div>}
                            </div>
                            <div className="flex flex-col gap-1.5 py-1">
                                <label className="text-xs font-semibold text-zinc-500">Set Splash Art URL</label>
                                <input type="text" value={image} onChange={e => setImage(e.target.value)} className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500" placeholder="Optional. Displays at top." />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-zinc-500">Name Loc Key</label>
                                <input type="text" value={nameKey} onChange={e => setNameKey(e.target.value)} className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500" placeholder="wiki.sets.astral.name" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-zinc-500">Desc Loc Key</label>
                                <input type="text" value={descKey} onChange={e => setDescKey(e.target.value)} className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500" placeholder="wiki.sets.astral.desc" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-zinc-500">Rarity</label>
                                <select value={metadata.rarity} onChange={e => setMetadata({ ...metadata, rarity: e.target.value })} className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500">
                                    <option value="SS">SS</option>
                                    <option value="S">S</option>
                                    <option value="A">A</option>
                                    <option value="B">B</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-zinc-500">Official Name (English Fallback)</label>
                                <input type="text" value={metadata.name} onChange={e => setMetadata({ ...metadata, name: e.target.value })} className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500" placeholder="Astral Set" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Set Effects */}
                        <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
                            <div className="text-zinc-400 font-bold uppercase text-xs tracking-widest flex items-center gap-3">
                                <span className="w-6 h-px bg-zinc-700" /> Set Bonuses
                            </div>

                            <div className="bg-purple-950/20 border border-purple-900/50 p-4 rounded-xl flex flex-col gap-3">
                                <div className="text-sm font-bold text-purple-400">2-Piece Effect</div>
                                <input type="text" value={metadata.setEffect2.descKey} onChange={e => setMetadata({ ...metadata, setEffect2: { descKey: e.target.value } })} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500" placeholder="Desc Loc Key (wiki.sets.astral.effect2)" />
                            </div>

                            <div className="bg-purple-950/20 border border-purple-900/50 p-4 rounded-xl flex flex-col gap-3">
                                <div className="text-sm font-bold text-purple-400">4-Piece Effect</div>
                                <input type="text" value={metadata.setEffect4.descKey} onChange={e => setMetadata({ ...metadata, setEffect4: { descKey: e.target.value } })} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500" placeholder="Desc Loc Key (wiki.sets.astral.effect4)" />
                            </div>
                        </div>

                        {/* Items Array */}
                        <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl p-6 shadow-xl">
                            <div className="flex justify-between items-center mb-6">
                                <div className="text-zinc-400 font-bold uppercase text-xs tracking-widest">Set Items</div>
                                <button onClick={() => setMetadata({ ...metadata, items: [...metadata.items, { name: '', icon: '', stats: [] }] })} className="text-xs flex items-center gap-1 text-purple-400 hover:text-purple-300">
                                    <Plus className="w-3 h-3" /> Add Item
                                </button>
                            </div>

                            <div className="flex flex-col gap-4">
                                {metadata.items.map((item, i) => (
                                    <div key={i} className="flex flex-col gap-3 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/50 relative">
                                        <button onClick={() => { const items = [...metadata.items]; items.splice(i, 1); setMetadata({ ...metadata, items }); }} className="absolute -top-2 -right-2 p-1.5 bg-zinc-800 text-red-500 rounded-full hover:bg-zinc-700 border border-zinc-700 shadow-lg">
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                        <div className="flex gap-2">
                                            <div className="w-10 h-10 bg-zinc-800 rounded shrink-0 flex items-center justify-center overflow-hidden">
                                                {item.icon ? <img src={item.icon} alt="" className="w-full h-full object-cover" /> : <Box className="w-5 h-5 text-zinc-600" />}
                                            </div>
                                            <div className="flex-1 flex flex-col gap-2">
                                                <input type="text" value={item.name} onChange={e => { const items = [...metadata.items]; items[i].name = e.target.value; setMetadata({ ...metadata, items }); }} className="bg-zinc-900 border border-zinc-700 rounded p-1.5 text-xs text-white" placeholder="Item Name (e.g. Astral Sword)" />
                                                <input type="text" value={item.icon} onChange={e => { const items = [...metadata.items]; items[i].icon = e.target.value; setMetadata({ ...metadata, items }); }} className="bg-zinc-900 border border-zinc-700 rounded p-1.5 text-xs text-zinc-400" placeholder="Icon URL" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex justify-between items-center">
                                                <div className="text-[10px] uppercase font-bold text-zinc-500">Base Stats</div>
                                                <button onClick={() => { const items = [...metadata.items]; items[i].stats.push(''); setMetadata({ ...metadata, items }); }} className="text-[10px] text-emerald-400 hover:text-emerald-300">
                                                    + Add Stat
                                                </button>
                                            </div>
                                            {item.stats.map((stat, sIdx) => (
                                                <div key={sIdx} className="flex items-center gap-1">
                                                    <input type="text" value={stat} onChange={e => { const items = [...metadata.items]; items[i].stats[sIdx] = e.target.value; setMetadata({ ...metadata, items }); }} className="flex-1 bg-zinc-900 border border-zinc-700 rounded p-1 text-xs" placeholder="e.g. ATK +20%" />
                                                    <button onClick={() => { const items = [...metadata.items]; items[i].stats.splice(sIdx, 1); setMetadata({ ...metadata, items }); }} className="p-1 text-red-500/50 hover:text-red-500">
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ImageGallery onSelect={(url) => {
                // Determine what to do with the selected image. 
                // A quick hack: copy to clipboard, or let user paste it in fields manually.
                // We'll just alert that they copied it since there are multiple image inputs in this editor.
                navigator.clipboard.writeText(url);
                alert("Image URL copied to clipboard! Paste it in the relative Icon input.");
            }} />
        </div>
    );
}
