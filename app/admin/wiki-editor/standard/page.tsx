'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import { saveWikiEntity, getWikiEntity, WikiEntity, getWikiEntityIdsByCategory } from '@/lib/wiki';
import { getAllWikiCategories, WikiCategory } from '@/lib/wikiCategories';
import { RichTextEditor, RichTextEditorRef } from '@/components/WikiEditor/RichTextEditor';
import { ImageGallery } from '@/components/WikiEditor/ImageGallery';
import { Save, Eye, ArrowLeft, Loader2 } from 'lucide-react';

export default function StandardWikiEditorPage() {
    const { user, isAdmin, loading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Model state
    const [entityId, setEntityId] = useState('');
    const [category, setCategory] = useState('');
    const [nameKey, setNameKey] = useState('');
    const [descKey, setDescKey] = useState('');
    const [content, setContent] = useState('');
    const [stats, setStats] = useState<Record<string, string>>({});

    const [saving, setSaving] = useState(false);
    const [loadError, setLoadError] = useState('');
    const [previewMode, setPreviewMode] = useState(false);

    // Dynamic categories and entity IDs
    const [categories, setCategories] = useState<WikiCategory[]>([]);
    const [entityIds, setEntityIds] = useState<string[]>([]);

    const editorRef = useRef<RichTextEditorRef>(null);

    useEffect(() => {
        if (!loading && (!user || !isAdmin)) {
            router.push('/');
        }
    }, [user, isAdmin, loading, router]);

    // Load categories on mount
    useEffect(() => {
        const loadCats = async () => {
            const cats = await getAllWikiCategories();
            setCategories(cats);
            // Set default category if not set
            if (!category && cats.length > 0) {
                setCategory(cats[0].id);
            }
        };
        loadCats();
    }, []);

    // Load entity IDs when category changes
    useEffect(() => {
        if (!category) return;
        const loadIds = async () => {
            const ids = await getWikiEntityIdsByCategory(category);
            setEntityIds(ids);
        };
        loadIds();
    }, [category]);

    // Handle URL params
    useEffect(() => {
        const idParam = searchParams.get('id');
        const catParam = searchParams.get('category');
        if (catParam) setCategory(catParam);
        if (idParam) {
            setEntityId(idParam);
            handleLoad(idParam);
        }
    }, [searchParams]);

    const handleSave = async () => {
        if (!entityId || !nameKey) {
            alert('ID and Name Key are required');
            return;
        }

        try {
            setSaving(true);
            const entity: WikiEntity = {
                id: entityId,
                category,
                nameKey,
                descriptionKey: descKey,
                content,
                stats,
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
            if (data) {
                setCategory(data.category);
                setNameKey(data.nameKey);
                setDescKey(data.descriptionKey || '');
                setContent(data.content || '');
                setStats(data.stats as Record<string, string> || {});
            } else {
                setLoadError('Entity not found');
            }
        } catch (e) {
            console.error(e);
            setLoadError('Error loading');
        }
    };

    const handleImageSelect = (url: string) => {
        editorRef.current?.insertImage(url);
    };

    if (loading) return <div className="p-8 text-zinc-400 flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Loading...</div>;
    if (!user || !isAdmin) return null;

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-black text-white">
            {/* Main Editor Area */}
            <div className="flex-1 flex flex-col overflow-y-auto w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-zinc-950 border-b border-zinc-800 sticky top-0 z-10 shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.push('/admin/wiki-editor')} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                            <ArrowLeft className="w-5 h-5 text-zinc-400" />
                        </button>
                        <h1 className="text-xl font-bold font-serif tracking-wide text-zinc-100 hidden sm:block">Standard Page Editor</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPreviewMode(!previewMode)}
                            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors font-semibold text-sm"
                        >
                            <Eye className="w-4 h-4" /> <span className="hidden sm:inline">{previewMode ? 'Edit Mode' : 'Preview'}</span>
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className={`flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-bold text-sm ${saving ? 'opacity-50' : ''}`}
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Publish
                        </button>
                    </div>
                </div>

                <div className="p-6 md:p-10 w-full mx-auto pb-32">
                    {previewMode ? (
                        <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl p-8 shadow-2xl">
                            <div className="text-zinc-500 text-sm mb-4">Previewing: {nameKey}</div>
                            <div className="prose prose-invert prose-emerald max-w-none wrap-break-word" dangerouslySetInnerHTML={{ __html: content }} />
                        </div>
                    ) : (
                        <div className="flex flex-col gap-8 h-full">
                            {/* Metadata Builder */}
                            <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl p-6 shadow-xl shrink-0">
                                <div className="text-zinc-400 font-bold mb-6 uppercase text-xs tracking-widest flex items-center gap-3">
                                    <span className="w-6 h-px bg-zinc-700" />
                                    Entity Configuration
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold text-zinc-500">Document ID</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={entityId}
                                                onChange={e => setEntityId(e.target.value)}
                                                className="flex-1 min-w-0 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                                                placeholder="guides-tierlist"
                                                list="entity-ids"
                                            />
                                            <datalist id="entity-ids">
                                                {entityIds.map(id => <option key={id} value={id} />)}
                                            </datalist>
                                            <button onClick={() => handleLoad()} className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-semibold transition-colors shrink-0">Load</button>
                                        </div>
                                        {loadError && <div className="text-red-400 text-xs">{loadError}</div>}
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold text-zinc-500">Category</label>
                                        <select
                                            value={category}
                                            onChange={e => setCategory(e.target.value)}
                                            className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                                        >
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.id}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold text-zinc-500">Name Loc Key</label>
                                        <input
                                            type="text"
                                            value={nameKey}
                                            onChange={e => setNameKey(e.target.value)}
                                            className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                                            placeholder="wiki.guides.tierlist.title"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold text-zinc-500">Desc Loc Key</label>
                                        <input
                                            type="text"
                                            value={descKey}
                                            onChange={e => setDescKey(e.target.value)}
                                            className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                                            placeholder="wiki.guides.tierlist.desc"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Rich Text Editor */}
                            <div className="flex flex-col gap-2 min-h-[500px]">
                                <label className="text-sm font-bold text-zinc-300 ml-1">Page Content</label>
                                <RichTextEditor ref={editorRef} content={content} onChange={setContent} />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Sidebar - Image Gallery */}
            {!previewMode && (
                <ImageGallery onSelect={handleImageSelect} />
            )}
        </div>
    );
}
