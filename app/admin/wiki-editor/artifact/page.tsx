'use client';

import { useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { saveWikiEntity, getWikiEntity, WikiEntity, ArtifactMetadata, getWikiEntityIdsByCategory } from '@/lib/wiki';
import { useSearchParams } from 'next/navigation';
import { ImageGallery } from '@/components/WikiEditor/ImageGallery';
import { useEffect } from 'react';
import { Save, ArrowLeft, Loader2, Plus, Trash2, Sword } from 'lucide-react';

export default function ArtifactEditorPage() {
    const { user, isAdmin, loading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [entityId, setEntityId] = useState('');
    const [existingIds, setExistingIds] = useState<string[]>([]);
    const [nameKey, setNameKey] = useState('');
    const [descKey, setDescKey] = useState('');
    const [image, setImage] = useState('');

    const [metadata, setMetadata] = useState<ArtifactMetadata>({
        rarity: 'MYTHIC',
        exclusive: '',
        stars: [{ star: 1, cost: 50 }],
        skills: [{
            name: '',
            descKey: '',
            upgradeLevels: '',
            levels: [{ level: 2, multiplier: '', stun: '' }]
        }]
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
                category: 'artifacts',
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
            if (data && data.category === 'artifacts') {
                if (!idToLoad) setEntityId(id);
                setNameKey(data.nameKey);
                setDescKey(data.descriptionKey || '');
                setImage(data.image || '');
                if (data.metadata) {
                    setMetadata(data.metadata as ArtifactMetadata);
                }
            } else {
                setLoadError('Entity not found or not an artifact');
            }
        } catch (e) {
            console.error(e);
            setLoadError('Error loading');
        }
    };

    useEffect(() => {
        const loadIds = async () => {
            const ids = await getWikiEntityIdsByCategory('artifacts');
            setExistingIds(ids);
        };
        loadIds();

        const idParam = searchParams.get('id');
        if (idParam) {
            setEntityId(idParam);
            handleLoad(idParam);
        }
    }, [searchParams]);

    useEffect(() => {
        if (!loading && (!user || !isAdmin)) {
            router.push('/');
        }
    }, [user, isAdmin, loading, router]);

    if (loading) return <div className="p-8 text-zinc-400 flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Loading...</div>;
    if (!user || !isAdmin) return null;

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-black text-white">
            <div className="flex-1 flex flex-col overflow-y-auto w-full">
                <div className="flex items-center justify-between p-4 bg-zinc-950 border-b border-zinc-800 sticky top-0 z-10 shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.push('/admin/wiki-editor')} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                            <ArrowLeft className="w-5 h-5 text-zinc-400" />
                        </button>
                        <h1 className="text-xl font-bold font-serif tracking-wide text-zinc-100 hidden sm:block">Artifact Editor</h1>
                    </div>
                    <button onClick={handleSave} disabled={saving} className={`flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors font-bold text-sm ${saving ? 'opacity-50' : ''}`}>
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Publish Artifact
                    </button>
                </div>

                <div className="p-6 md:p-10 w-full max-w-5xl mx-auto pb-32 space-y-8">
                    {/* General Details */}
                    <div className="bg-[#0c0c0e] border border-red-900/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[100px] pointer-events-none -mt-32 -mr-32" />

                        <div className="text-red-400 font-bold mb-6 uppercase text-xs tracking-widest flex items-center gap-3 relative z-10">
                            <span className="w-6 h-px bg-red-700" /> General Details
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-zinc-500">Document ID</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={entityId}
                                        onChange={e => setEntityId(e.target.value)}
                                        className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                                        placeholder="artifacts-gourd"
                                        list="artifact-ids"
                                    />
                                    <datalist id="artifact-ids">
                                        {existingIds.map(id => <option key={id} value={id} />)}
                                    </datalist>
                                    <button onClick={() => handleLoad()} className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-semibold">Load</button>
                                </div>
                                {loadError && <div className="text-red-400 text-xs">{loadError}</div>}
                            </div>
                            <div className="flex flex-col gap-1.5 justify-end">
                                <label className="text-xs font-semibold text-zinc-500">Image URL (click gallery or paste)</label>
                                <div className="flex items-center gap-4">
                                    {image && <img src={image} alt="preview" className="w-10 h-10 object-contain bg-zinc-800 rounded" />}
                                    <input type="text" value={image} onChange={e => setImage(e.target.value)} className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-zinc-500">Name Loc Key</label>
                                <input type="text" value={nameKey} onChange={e => setNameKey(e.target.value)} className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500" placeholder="wiki.artifacts.gourd.name" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-zinc-500">Desc Loc Key</label>
                                <input type="text" value={descKey} onChange={e => setDescKey(e.target.value)} className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500" placeholder="wiki.artifacts.gourd.desc" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-zinc-500">Rarity</label>
                                <select value={metadata.rarity} onChange={e => setMetadata({ ...metadata, rarity: e.target.value })} className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500">
                                    <option value="MYTHIC">Mythic</option>
                                    <option value="LEGENDARY">Legendary</option>
                                    <option value="EPIC">Epic</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-zinc-500">Exclusive Slime (Optional)</label>
                                <input type="text" value={metadata.exclusive} onChange={e => setMetadata({ ...metadata, exclusive: e.target.value })} className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500" placeholder="e.g. Panpan" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left: Star Costs */}
                        <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl p-6 shadow-xl lg:col-span-1 h-fit">
                            <div className="flex justify-between items-center mb-6">
                                <div className="text-zinc-400 font-bold uppercase text-xs tracking-widest">Star Costs</div>
                                <button onClick={() => setMetadata({ ...metadata, stars: [...metadata.stars, { star: metadata.stars.length + 1, cost: 50 }] })} className="text-xs flex items-center gap-1 text-red-400 hover:text-red-300">
                                    <Plus className="w-3 h-3" /> Add Star
                                </button>
                            </div>
                            <div className="flex flex-col gap-2">
                                {metadata.stars.map((s, i) => (
                                    <div key={i} className="flex items-center gap-2 bg-zinc-900/50 p-2 rounded-lg border border-zinc-800/50">
                                        <input type="number" value={s.star} onChange={e => { const arr = [...metadata.stars]; arr[i].star = Number(e.target.value); setMetadata({ ...metadata, stars: arr }); }} className="w-16 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs" title="Star Level" />
                                        <input type="number" value={s.cost} onChange={e => { const arr = [...metadata.stars]; arr[i].cost = Number(e.target.value); setMetadata({ ...metadata, stars: arr }); }} className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs" title="Cost" />
                                        <button onClick={() => { const arr = [...metadata.stars]; arr.splice(i, 1); setMetadata({ ...metadata, stars: arr }); }} className="p-1 text-red-500 hover:bg-red-500/20 rounded">
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right: Skills array */}
                        <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl p-6 shadow-xl lg:col-span-2 space-y-6">
                            <div className="flex justify-between items-center mb-2">
                                <div className="text-zinc-400 font-bold uppercase text-xs tracking-widest flex items-center gap-3">
                                    <span className="w-6 h-px bg-zinc-700" /> Skills
                                </div>
                                <button onClick={() => setMetadata({ ...metadata, skills: [...metadata.skills, { name: '', descKey: '', upgradeLevels: '', levels: [] }] })} className="text-xs flex items-center gap-1 text-red-400 hover:text-red-300">
                                    <Plus className="w-3 h-3" /> Add Skill
                                </button>
                            </div>

                            {metadata.skills.map((skill, skIdx) => (
                                <div key={skIdx} className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="text-red-400 text-sm font-bold flex items-center gap-2">
                                            <Sword className="w-4 h-4" /> Skill {skIdx + 1}
                                        </div>
                                        <button onClick={() => { const arr = [...metadata.skills]; arr.splice(skIdx, 1); setMetadata({ ...metadata, skills: arr }); }} className="p-1 text-zinc-500 hover:text-red-500 rounded">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input type="text" value={skill.name} onChange={e => { const arr = [...metadata.skills]; arr[skIdx].name = e.target.value; setMetadata({ ...metadata, skills: arr }); }} className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500" placeholder="Skill Name" />
                                        <input type="text" value={skill.upgradeLevels} onChange={e => { const arr = [...metadata.skills]; arr[skIdx].upgradeLevels = e.target.value; setMetadata({ ...metadata, skills: arr }); }} className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500" placeholder="Upgrade Levels (e.g. 2, 3, 4)" />
                                        <input type="text" value={skill.descKey} onChange={e => { const arr = [...metadata.skills]; arr[skIdx].descKey = e.target.value; setMetadata({ ...metadata, skills: arr }); }} className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 md:col-span-2" placeholder="Desc Loc Key (wiki.artifacts.gourd.skill1)" />
                                    </div>

                                    <div className="pt-2 border-t border-zinc-800/50">
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="text-zinc-500 text-xs font-semibold">Skill Level Scaling</div>
                                            <button onClick={() => { const arr = [...metadata.skills]; arr[skIdx].levels.push({ level: arr[skIdx].levels.length + 2, multiplier: '', stun: '' }); setMetadata({ ...metadata, skills: arr }); }} className="text-xs flex items-center gap-1 text-zinc-400 hover:text-zinc-300">
                                                <Plus className="w-3 h-3" /> Add Level Data
                                            </button>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            {skill.levels.map((lvl, lvIdx) => (
                                                <div key={lvIdx} className="flex items-center gap-2 bg-zinc-900/30 p-2 rounded-lg border border-zinc-800/30">
                                                    <input type="number" value={lvl.level} onChange={e => { const arr = [...metadata.skills]; arr[skIdx].levels[lvIdx].level = Number(e.target.value); setMetadata({ ...metadata, skills: arr }); }} className="w-16 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs" title="Skill Lvl" />
                                                    <input type="text" value={lvl.multiplier} onChange={e => { const arr = [...metadata.skills]; arr[skIdx].levels[lvIdx].multiplier = e.target.value; setMetadata({ ...metadata, skills: arr }); }} className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs" placeholder="Multi (e.g. 700%)" />
                                                    <input type="text" value={lvl.stun} onChange={e => { const arr = [...metadata.skills]; arr[skIdx].levels[lvIdx].stun = e.target.value; setMetadata({ ...metadata, skills: arr }); }} className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs" placeholder="Stun/Effect (e.g. 2.2 sec)" />
                                                    <button onClick={() => { const arr = [...metadata.skills]; arr[skIdx].levels.splice(lvIdx, 1); setMetadata({ ...metadata, skills: arr }); }} className="p-1 text-red-500/50 hover:text-red-500 rounded">
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
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
