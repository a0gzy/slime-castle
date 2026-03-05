'use client';

import { useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { saveWikiEntity, getWikiEntity, WikiEntity, BossMetadata, getWikiEntityIdsByCategory } from '@/lib/wiki';
import { useSearchParams } from 'next/navigation';
import { ImageGallery } from '@/components/WikiEditor/ImageGallery';
import { useEffect } from 'react';
import { Save, ArrowLeft, Loader2, Plus, Trash2 } from 'lucide-react';

export default function BossEditorPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [entityId, setEntityId] = useState('');
    const [existingIds, setExistingIds] = useState<string[]>([]);
    const [nameKey, setNameKey] = useState('');
    const [descKey, setDescKey] = useState('');
    const [image, setImage] = useState('');

    const [metadata, setMetadata] = useState<BossMetadata>({
        hpThreshold: '',
        weakness: [],
        skills: [{ name: '', chance: '100%', descKey: '' }]
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
                category: 'bosses',
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
            if (data && data.category === 'bosses') {
                if (!idToLoad) setEntityId(id);
                setNameKey(data.nameKey);
                setDescKey(data.descriptionKey || '');
                setImage(data.image || '');
                if (data.metadata) {
                    setMetadata(data.metadata as BossMetadata);
                }
            } else {
                setLoadError('Entity not found or not a boss');
            }
        } catch (e) {
            console.error(e);
            setLoadError('Error loading');
        }
    };

    useEffect(() => {
        const loadIds = async () => {
            const ids = await getWikiEntityIdsByCategory('bosses');
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
                        <h1 className="text-xl font-bold font-serif tracking-wide text-zinc-100 hidden sm:block">Boss Editor</h1>
                    </div>
                    <button onClick={handleSave} disabled={saving} className={`flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors font-bold text-sm ${saving ? 'opacity-50' : ''}`}>
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Publish Boss
                    </button>
                </div>

                <div className="p-6 md:p-10 w-full max-w-5xl mx-auto pb-32 space-y-8">
                    {/* General Details */}
                    <div className="bg-[#0c0c0e] border border-orange-900/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[100px] pointer-events-none -mt-32 -mr-32" />

                        <div className="text-orange-400 font-bold mb-6 uppercase text-xs tracking-widest flex items-center gap-3 relative z-10">
                            <span className="w-6 h-px bg-orange-700" /> General Details
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-zinc-500">Document ID</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={entityId}
                                        onChange={e => setEntityId(e.target.value)}
                                        className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                                        placeholder="bosses-golem"
                                        list="boss-ids"
                                    />
                                    <datalist id="boss-ids">
                                        {existingIds.map(id => <option key={id} value={id} />)}
                                    </datalist>
                                    <button onClick={() => handleLoad()} className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-semibold">Load</button>
                                </div>
                                {loadError && <div className="text-orange-400 text-xs">{loadError}</div>}
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-zinc-500">Image URL</label>
                                <div className="flex gap-2">
                                    {image && <img src={image} className="w-10 h-10 object-cover rounded bg-zinc-800" alt="Preview" />}
                                    <input type="text" value={image} onChange={e => setImage(e.target.value)} className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" placeholder="Url..." />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-zinc-500">Name Loc Key</label>
                                <input type="text" value={nameKey} onChange={e => setNameKey(e.target.value)} className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" placeholder="wiki.bosses.golem.name" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-zinc-500">Desc Loc Key</label>
                                <input type="text" value={descKey} onChange={e => setDescKey(e.target.value)} className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" placeholder="wiki.bosses.golem.desc" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-zinc-500">HP Threshold</label>
                                <input type="text" value={metadata.hpThreshold} onChange={e => setMetadata({ ...metadata, hpThreshold: e.target.value })} className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" placeholder="e.g. 244B" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-zinc-500">Weaknesses (Comma separated)</label>
                                <input type="text" value={metadata.weakness.join(', ')} onChange={e => setMetadata({ ...metadata, weakness: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" placeholder="Fire, Magic" />
                            </div>
                        </div>
                    </div>

                    {/* Boss Skills Structure */}
                    <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
                        <div className="flex justify-between items-center mb-2">
                            <div className="text-zinc-400 font-bold uppercase text-xs tracking-widest flex items-center gap-3">
                                <span className="w-6 h-px bg-zinc-700" /> Boss Skills
                            </div>
                            <button onClick={() => setMetadata({ ...metadata, skills: [...metadata.skills, { name: '', chance: '100%', descKey: '' }] })} className="text-xs flex items-center gap-1 text-orange-400 hover:text-orange-300">
                                <Plus className="w-3 h-3" /> Add Skill
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {metadata.skills.map((skill, skIdx) => (
                                <div key={skIdx} className="bg-zinc-950 border border-zinc-800 p-5 rounded-xl space-y-4 relative">
                                    <button onClick={() => { const arr = [...metadata.skills]; arr.splice(skIdx, 1); setMetadata({ ...metadata, skills: arr }); }} className="absolute top-4 right-4 text-zinc-500 hover:text-red-500">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <div className="grid grid-cols-[1fr_100px] gap-2">
                                        <input type="text" value={skill.name} onChange={e => { const arr = [...metadata.skills]; arr[skIdx].name = e.target.value; setMetadata({ ...metadata, skills: arr }); }} className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" placeholder="Skill Name" />
                                        <input type="text" value={skill.chance} onChange={e => { const arr = [...metadata.skills]; arr[skIdx].chance = e.target.value; setMetadata({ ...metadata, skills: arr }); }} className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 text-center" placeholder="100%" />
                                    </div>
                                    <input type="text" value={skill.descKey} onChange={e => { const arr = [...metadata.skills]; arr[skIdx].descKey = e.target.value; setMetadata({ ...metadata, skills: arr }); }} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" placeholder="Desc Loc Key" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <ImageGallery onSelect={setImage} />
        </div>
    );
}
