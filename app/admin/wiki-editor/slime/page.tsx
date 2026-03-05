'use client';

import { useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { saveWikiEntity, getWikiEntity, WikiEntity, SlimeMetadata, getWikiEntityIdsByCategory } from '@/lib/wiki';
import { useSearchParams } from 'next/navigation';
import { ImageGallery } from '@/components/WikiEditor/ImageGallery';
import { useEffect } from 'react';
import { Save, ArrowLeft, Loader2, Plus, Trash2 } from 'lucide-react';

export default function SlimeEditorPage() {
    const { user, isAdmin, loading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Base Entity State
    const [entityId, setEntityId] = useState('');
    const [existingIds, setExistingIds] = useState<string[]>([]);
    const [nameKey, setNameKey] = useState('');
    const [descKey, setDescKey] = useState('');
    const [image, setImage] = useState('');

    // Metadata State
    const [metadata, setMetadata] = useState<SlimeMetadata>({
        rank: 'SSS',
        element: 'Water',
        unlockCost: 'Event',
        stats: [{ level: 10, label: '', crystals: 0 }],
        bonusUnlock: [{ star: 1, shards: 50, bonus: '' }],
        activeSkill: { name: '', cd: 0, descKey: '' },
        passiveSkills: []
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
                category: 'slimes',
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
            if (data && data.category === 'slimes') {
                if (!idToLoad) setEntityId(id);
                setNameKey(data.nameKey);
                setDescKey(data.descriptionKey || '');
                setImage(data.image || '');
                if (data.metadata) {
                    setMetadata(data.metadata as SlimeMetadata);
                }
            } else {
                setLoadError('Entity not found or not a slime');
            }
        } catch (e) {
            console.error(e);
            setLoadError('Error loading');
        }
    };

    useEffect(() => {
        const loadIds = async () => {
            const ids = await getWikiEntityIdsByCategory('slimes');
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
                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-zinc-950 border-b border-zinc-800 sticky top-0 z-10 shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.push('/admin/wiki-editor')} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                            <ArrowLeft className="w-5 h-5 text-zinc-400" />
                        </button>
                        <h1 className="text-xl font-bold font-serif tracking-wide text-zinc-100 hidden sm:block">Slime Editor</h1>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-bold text-sm ${saving ? 'opacity-50' : ''}`}
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Publish Slime
                    </button>
                </div>

                <div className="p-6 md:p-10 w-full max-w-5xl mx-auto pb-32 space-y-8">
                    {/* Basic Info */}
                    <div className="bg-[#0c0c0e] border border-blue-900/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none -mt-32 -mr-32" />

                        <div className="text-blue-400 font-bold mb-6 uppercase text-xs tracking-widest flex items-center gap-3 relative z-10">
                            <span className="w-6 h-px bg-blue-700" />
                            General Details
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-zinc-500">Document ID</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={entityId}
                                        onChange={e => setEntityId(e.target.value)}
                                        className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                        placeholder="slimes-aelwenya"
                                        list="slime-ids"
                                    />
                                    <datalist id="slime-ids">
                                        {existingIds.map(id => <option key={id} value={id} />)}
                                    </datalist>
                                    <button onClick={() => handleLoad()} className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-semibold">Load</button>
                                </div>
                                {loadError && <div className="text-red-400 text-xs">{loadError}</div>}
                            </div>
                            <div className="flex flex-col gap-1.5 justify-end">
                                <label className="text-xs font-semibold text-zinc-500">Image URL (click gallery to set)</label>
                                <div className="flex items-center gap-4">
                                    {image && <img src={image} alt="preview" className="w-10 h-10 object-contain rounded bg-zinc-800" />}
                                    <input type="text" value={image} onChange={e => setImage(e.target.value)} className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="https://..." />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-zinc-500">Name Loc Key</label>
                                <input type="text" value={nameKey} onChange={e => setNameKey(e.target.value)} className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="wiki.slimes.aelwenya.name" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-zinc-500">Desc Loc Key</label>
                                <input type="text" value={descKey} onChange={e => setDescKey(e.target.value)} className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="wiki.slimes.aelwenya.desc" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-zinc-500">Rank (e.g. SSS)</label>
                                <input type="text" value={metadata.rank} onChange={e => setMetadata({ ...metadata, rank: e.target.value })} className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="SSS" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-zinc-500">Element (e.g. Water)</label>
                                <input type="text" value={metadata.element} onChange={e => setMetadata({ ...metadata, element: e.target.value })} className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="Water" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-zinc-500">Unlock Cost</label>
                                <input type="text" value={metadata.unlockCost} onChange={e => setMetadata({ ...metadata, unlockCost: e.target.value })} className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="Event" />
                            </div>
                        </div>
                    </div>

                    {/* Metadata: Stats and Unlocks */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Stats Array */}
                        <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl p-6 shadow-xl">
                            <div className="flex justify-between items-center mb-6">
                                <div className="text-zinc-400 font-bold uppercase text-xs tracking-widest">Level Stats</div>
                                <button onClick={() => setMetadata({ ...metadata, stats: [...metadata.stats, { level: metadata.stats.length ? metadata.stats[metadata.stats.length - 1].level + 25 : 10, label: '', crystals: 0 }] })} className="text-xs flex items-center gap-1 text-blue-400 hover:text-blue-300">
                                    <Plus className="w-3 h-3" /> Add Stat
                                </button>
                            </div>
                            <div className="flex flex-col gap-2">
                                {metadata.stats.map((stat, i) => (
                                    <div key={i} className="flex items-center gap-2 bg-zinc-900/50 p-2 rounded-lg border border-zinc-800/50">
                                        <input type="number" value={stat.level} onChange={e => { const s = [...metadata.stats]; s[i].level = Number(e.target.value); setMetadata({ ...metadata, stats: s }); }} className="w-16 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs" title="Level" />
                                        <input type="text" value={stat.label} onChange={e => { const s = [...metadata.stats]; s[i].label = e.target.value; setMetadata({ ...metadata, stats: s }); }} className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs" placeholder="ATK +100%" />
                                        <input type="number" value={stat.crystals} onChange={e => { const s = [...metadata.stats]; s[i].crystals = Number(e.target.value); setMetadata({ ...metadata, stats: s }); }} className="w-20 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs" title="Crystals Cost" />
                                        <button onClick={() => { const s = [...metadata.stats]; s.splice(i, 1); setMetadata({ ...metadata, stats: s }); }} className="p-1 text-red-500 hover:bg-red-500/20 rounded">
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Bonus Unlocks Array */}
                        <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl p-6 shadow-xl">
                            <div className="flex justify-between items-center mb-6">
                                <div className="text-zinc-400 font-bold uppercase text-xs tracking-widest">Star Bonuses</div>
                                <button onClick={() => setMetadata({ ...metadata, bonusUnlock: [...metadata.bonusUnlock, { star: metadata.bonusUnlock.length + 1, shards: 50, bonus: '' }] })} className="text-xs flex items-center gap-1 text-blue-400 hover:text-blue-300">
                                    <Plus className="w-3 h-3" /> Add Bonus
                                </button>
                            </div>
                            <div className="flex flex-col gap-2">
                                {metadata.bonusUnlock.map((bonus, i) => (
                                    <div key={i} className="flex items-center gap-2 bg-zinc-900/50 p-2 rounded-lg border border-zinc-800/50">
                                        <input type="number" value={bonus.star} onChange={e => { const b = [...metadata.bonusUnlock]; b[i].star = Number(e.target.value); setMetadata({ ...metadata, bonusUnlock: b }); }} className="w-12 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs" title="Star" />
                                        <input type="number" value={bonus.shards} onChange={e => { const b = [...metadata.bonusUnlock]; b[i].shards = Number(e.target.value); setMetadata({ ...metadata, bonusUnlock: b }); }} className="w-16 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs" title="Shards" />
                                        <input type="text" value={bonus.bonus} onChange={e => { const b = [...metadata.bonusUnlock]; b[i].bonus = e.target.value; setMetadata({ ...metadata, bonusUnlock: b }); }} className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs" placeholder="Slime Bonus +12%" />
                                        <button onClick={() => { const b = [...metadata.bonusUnlock]; b.splice(i, 1); setMetadata({ ...metadata, bonusUnlock: b }); }} className="p-1 text-red-500 hover:bg-red-500/20 rounded">
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Skills */}
                    <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
                        <div className="text-zinc-400 font-bold uppercase text-xs tracking-widest flex items-center gap-3">
                            <span className="w-6 h-px bg-zinc-700" />
                            Skills
                        </div>

                        {/* Active Skill */}
                        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl flex flex-col gap-3">
                            <div className="text-sm font-bold text-emerald-400">Active Skill</div>
                            <div className="flex gap-4">
                                <input type="text" value={metadata.activeSkill.name} onChange={e => setMetadata({ ...metadata, activeSkill: { ...metadata.activeSkill, name: e.target.value } })} className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="Skill Name" />
                                <label className="text-xs font-semibold py-3 text-zinc-500">CD</label>
                                <input type="number" value={metadata.activeSkill.cd} onChange={e => setMetadata({ ...metadata, activeSkill: { ...metadata.activeSkill, cd: Number(e.target.value) } })} className="w-24 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="CD (s)" />
                                <input type="text" value={metadata.activeSkill.icon || ''} onChange={e => setMetadata({ ...metadata, activeSkill: { ...metadata.activeSkill, icon: e.target.value } })} className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="Icon URL" />
                            </div>
                            <input type="text" value={metadata.activeSkill.descKey} onChange={e => setMetadata({ ...metadata, activeSkill: { ...metadata.activeSkill, descKey: e.target.value } })} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="Desc Loc Key (wiki.slimes.aelwenya.active)" />
                        </div>

                        {/* Passive Skills */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <div className="text-sm font-bold text-red-400">Passive Skills</div>
                                <button onClick={() => setMetadata({ ...metadata, passiveSkills: [...metadata.passiveSkills, { name: '', descKey: '' }] })} className="text-xs flex items-center gap-1 text-blue-400 hover:text-blue-300">
                                    <Plus className="w-3 h-3" /> Add Passive
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {metadata.passiveSkills.map((passive, i) => (
                                    <div key={i} className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl flex flex-col gap-3 relative">
                                        <button onClick={() => { const p = [...metadata.passiveSkills]; p.splice(i, 1); setMetadata({ ...metadata, passiveSkills: p }); }} className="absolute -top-2 -right-2 p-1.5 bg-zinc-800 text-red-500 rounded-full hover:bg-zinc-700 border border-zinc-700 shadow-lg">
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                        <input type="text" value={passive.name} onChange={e => { const p = [...metadata.passiveSkills]; p[i].name = e.target.value; setMetadata({ ...metadata, passiveSkills: p }); }} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="Passive Name" />
                                        <input type="text" value={passive.descKey} onChange={e => { const p = [...metadata.passiveSkills]; p[i].descKey = e.target.value; setMetadata({ ...metadata, passiveSkills: p }); }} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="Desc Loc Key" />
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Right Sidebar - Image Gallery */}
            <ImageGallery onSelect={setImage} />
        </div>
    );
}
