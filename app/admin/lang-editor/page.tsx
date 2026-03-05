'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, Save, Loader2, Plus, Trash2, Search, ChevronDown, ChevronRight,
    AlertCircle, FileText, FilePlus, Copy, X, RefreshCw
} from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface LangFile {
    content: any;
    sha: string;
}

export default function LangEditorPage() {
    const { user, isAdmin, isEditor, userData, loading: authLoading } = useAuth();
    const router = useRouter();

    const [languages, setLanguages] = useState<Record<string, LangFile>>({});
    const [selectedLang, setSelectedLang] = useState('');
    const [editData, setEditData] = useState<any>(null);
    const [originalSha, setOriginalSha] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [hasChanges, setHasChanges] = useState(false);
    const [jsonError, setJsonError] = useState('');

    // New lang modal
    const [showNewLang, setShowNewLang] = useState(false);
    const [newLangId, setNewLangId] = useState('');

    useEffect(() => {
        if (!authLoading && !isEditor) router.push('/');
        else if (isEditor) loadLanguages();
    }, [isEditor, authLoading]);

    const loadLanguages = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/languages');
            const data = await res.json();
            if (data.languages) {
                setLanguages(data.languages);
                const keys = Object.keys(data.languages);
                if (keys.length > 0 && !selectedLang) {
                    // Select the first allowed language
                    const allowedKeys = isAdmin ? keys : keys.filter(key => userData?.allowedLanguages?.includes(key));
                    if (allowedKeys.length > 0) {
                        selectLang(allowedKeys[0], data.languages);
                    }
                }
            }
        } catch (e) {
            console.error('Failed to load languages:', e);
        } finally {
            setLoading(false);
        }
    };

    const selectLang = (langId: string, langs?: Record<string, LangFile>) => {
        const src = langs || languages;
        setSelectedLang(langId);
        setEditData(JSON.parse(JSON.stringify(src[langId].content)));
        setOriginalSha(src[langId].sha);
        setHasChanges(false);
        setJsonError('');
    };

    const handleSave = async () => {
        if (!selectedLang || !editData) return;
        setSaving(true);
        try {
            const token = await user?.getIdToken();
            const res = await fetch('/api/languages', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ langId: selectedLang, content: editData, sha: originalSha })
            });
            const data = await res.json();
            if (res.ok) {
                try {
                    await setDoc(doc(db, 'languages', selectedLang), { active: true });
                } catch (e) {
                    console.error('Firestore sync failed', e);
                }
                setOriginalSha(data.sha);
                setLanguages(prev => ({
                    ...prev,
                    [selectedLang]: { content: editData, sha: data.sha }
                }));
                setHasChanges(false);
                alert('Saved!');
            } else {
                alert('Save failed: ' + (data.error || 'Unknown error'));
            }
        } catch (e) {
            console.error('Save error:', e);
            alert('Save failed');
        } finally {
            setSaving(false);
        }
    };

    const handleCreateLang = async () => {
        if (!newLangId.trim()) return;
        const id = newLangId.trim().toLowerCase();
        // Use en as template
        const template = languages['en']?.content || {};
        setSaving(true);
        try {
            const token = await user?.getIdToken();
            const res = await fetch('/api/languages', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ langId: id, content: template })
            });
            const data = await res.json();
            if (res.ok) {
                // Add to Firestore so it shows up in LanguageProvider
                try {
                    await setDoc(doc(db, 'languages', id), { active: true });
                } catch (e) {
                    console.error('Failed to add language to Firestore:', e);
                }

                setShowNewLang(false);
                setNewLangId('');
                await loadLanguages();
                // Select the new one
                setSelectedLang(id);
                setEditData(JSON.parse(JSON.stringify(template)));
                setOriginalSha(data.sha);
            } else {
                alert('Failed: ' + (data.error || ''));
            }
        } catch (e) {
            alert('Failed to create');
        } finally {
            setSaving(false);
        }
    };

    const updateValue = (path: string[], value: any) => {
        const newData = JSON.parse(JSON.stringify(editData));
        let obj = newData;
        for (let i = 0; i < path.length - 1; i++) {
            obj = obj[path[i]];
        }
        obj[path[path.length - 1]] = value;
        setEditData(newData);
        setHasChanges(true);
    };

    const addKey = (path: string[], key: string, isObject: boolean) => {
        const newData = JSON.parse(JSON.stringify(editData));
        let obj = newData;
        for (const p of path) obj = obj[p];
        obj[key] = isObject ? {} : '';
        setEditData(newData);
        setHasChanges(true);
    };

    const deleteKey = (path: string[]) => {
        const newData = JSON.parse(JSON.stringify(editData));
        let obj = newData;
        for (let i = 0; i < path.length - 1; i++) obj = obj[path[i]];
        delete obj[path[path.length - 1]];
        setEditData(newData);
        setHasChanges(true);
    };

    const renameKey = (path: string[], newKey: string) => {
        const newData = JSON.parse(JSON.stringify(editData));
        let obj = newData;
        for (let i = 0; i < path.length - 1; i++) obj = obj[path[i]];
        const oldKey = path[path.length - 1];
        if (oldKey === newKey || !newKey) return;
        if (obj[newKey] !== undefined) { alert('Key already exists!'); return; }

        // Preserve order: rebuild object
        const entries = Object.entries(obj);
        const newObj: any = {};
        for (const [k, v] of entries) {
            newObj[k === oldKey ? newKey : k] = v;
        }
        // Replace in parent
        if (path.length === 1) {
            setEditData((prev: any) => {
                const result: any = {};
                for (const [k, v] of Object.entries(prev)) {
                    result[k === oldKey ? newKey : k] = v;
                }
                return result;
            });
        } else {
            let parent = newData;
            for (let i = 0; i < path.length - 2; i++) parent = parent[path[i]];
            parent[path[path.length - 2]] = newObj;
            setEditData(newData);
        }
        setHasChanges(true);
    };

    // Sync keys: collect union of all keys from all languages, add missing ones
    const handleSyncKeys = () => {
        if (!editData || !selectedLang) return;
        const allContents = Object.entries(languages)
            .filter(([id]) => id !== selectedLang)
            .map(([, lf]) => lf.content);
        if (allContents.length === 0) return;

        const collectKeys = (obj: any, path: string[] = []): string[][] => {
            const result: string[][] = [];
            for (const [key, val] of Object.entries(obj)) {
                const p = [...path, key];
                if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
                    result.push(...collectKeys(val, p));
                } else {
                    result.push(p);
                }
            }
            return result;
        };

        // Collect all key paths from other languages
        const allKeyPaths: string[][] = [];
        for (const content of allContents) {
            allKeyPaths.push(...collectKeys(content));
        }

        // Add missing keys to editData
        let added = 0;
        const newData = JSON.parse(JSON.stringify(editData));
        for (const keyPath of allKeyPaths) {
            let obj = newData;
            let missing = false;
            for (let i = 0; i < keyPath.length; i++) {
                const k = keyPath[i];
                if (i === keyPath.length - 1) {
                    if (obj[k] === undefined) {
                        obj[k] = '';
                        added++;
                    }
                } else {
                    if (obj[k] === undefined) {
                        obj[k] = {};
                        added++;
                    }
                    if (typeof obj[k] !== 'object') break;
                    obj = obj[k];
                }
            }
        }
        setEditData(newData);
        if (added > 0) setHasChanges(true);
        alert(`Synced! Added ${added} missing key(s).`);
    };

    if (authLoading) return null;
    if (!isEditor) return null;

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-black text-white">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-zinc-950 border-b border-zinc-800 shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/admin')} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5 text-zinc-400" />
                    </button>
                    <h1 className="text-xl font-bold font-serif tracking-wide text-zinc-100">Language Editor</h1>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleSyncKeys} disabled={!editData} className="flex items-center gap-2 px-3 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 rounded-lg text-sm font-bold transition-colors">
                        <RefreshCw className="w-4 h-4" /> Sync Keys
                    </button>
                    {isAdmin && (
                        <button onClick={() => setShowNewLang(true)} className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors">
                            <FilePlus className="w-4 h-4" /> New Language
                        </button>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={saving || !hasChanges}
                        className={`flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-bold transition-colors ${(!hasChanges || saving) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar: language list */}
                <div className="w-48 shrink-0 bg-zinc-950 border-r border-zinc-800 overflow-y-auto p-3 space-y-1">
                    {loading ? (
                        <div className="text-zinc-500 text-sm text-center mt-8">Loading...</div>
                    ) : Object.keys(languages).length === 0 ? (
                        <div className="text-zinc-500 text-sm text-center mt-8">No languages found.<br />Create one from en.json template.</div>
                    ) : (
                        Object.keys(languages).sort().map(langId => (
                            <button
                                key={langId}
                                onClick={() => selectLang(langId)}
                                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${selectedLang === langId ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
                            >
                                <FileText className="w-4 h-4 shrink-0" />
                                {langId.toUpperCase()}.json
                            </button>
                        ))
                    )}
                </div>

                {/* Main editor */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Search */}
                    {editData && (
                        <div className="p-3 border-b border-zinc-800/50 bg-zinc-950/50 shrink-0">
                            <div className="relative max-w-md">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                    placeholder="Search keys or values..."
                                />
                            </div>
                            {jsonError && (
                                <div className="mt-2 text-xs text-red-400 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> {jsonError}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tree */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {!editData ? (
                            <div className="text-zinc-500 text-sm text-center mt-20">
                                Select a language from the sidebar to start editing.
                            </div>
                        ) : (
                            <JsonObjectEditor
                                data={editData}
                                path={[]}
                                updateValue={updateValue}
                                addKey={addKey}
                                deleteKey={deleteKey}
                                renameKey={renameKey}
                                searchQuery={searchQuery}
                                depth={0}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* New language modal */}
            {showNewLang && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setShowNewLang(false)}>
                    <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-96 space-y-4 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-zinc-200">Create New Language</h3>
                        <p className="text-xs text-zinc-500">A copy of en.json will be created as a template.</p>
                        <div>
                            <label className="text-xs text-zinc-500 font-semibold block mb-1">Language ID</label>
                            <input
                                type="text"
                                value={newLangId}
                                onChange={e => setNewLangId(e.target.value)}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                placeholder="e.g. de, fr, es, jp"
                                autoFocus
                            />
                        </div>
                        <div className="flex gap-2 justify-end pt-2">
                            <button onClick={() => setShowNewLang(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800">Cancel</button>
                            <button onClick={handleCreateLang} disabled={saving} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg">
                                {saving ? 'Creating...' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Recursive JSON Editor Component ────────────────────────────

function JsonObjectEditor({
    data, path, updateValue, addKey, deleteKey, renameKey, searchQuery, depth
}: {
    data: any;
    path: string[];
    updateValue: (path: string[], value: any) => void;
    addKey: (path: string[], key: string, isObject: boolean) => void;
    deleteKey: (path: string[]) => void;
    renameKey: (path: string[], newKey: string) => void;
    searchQuery: string;
    depth: number;
}) {
    const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
    const [addingKey, setAddingKey] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [newKeyIsObject, setNewKeyIsObject] = useState(false);

    const entries = Object.entries(data);

    const matchesSearch = (key: string, val: any): boolean => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        if (key.toLowerCase().includes(q)) return true;
        if (typeof val === 'string' && val.toLowerCase().includes(q)) return true;
        if (Array.isArray(val)) return val.some((v, i) => matchesSearch(String(i), v));
        if (typeof val === 'object' && val !== null) {
            return Object.entries(val).some(([k, v]) => matchesSearch(k, v));
        }
        return false;
    };

    const filteredEntries = entries.filter(([key, val]) => matchesSearch(key, val));

    const handleAddKey = () => {
        if (!newKeyName.trim()) return;
        addKey(path, newKeyName.trim(), newKeyIsObject);
        setNewKeyName('');
        setAddingKey(false);
        setNewKeyIsObject(false);
    };

    const depthColor = [
        'border-blue-900/30',
        'border-emerald-900/30',
        'border-purple-900/30',
        'border-amber-900/30',
        'border-red-900/30',
    ][depth % 5];

    return (
        <div className={`space-y-0.5 ${depth > 0 ? `ml-4 pl-3 border-l-2 ${depthColor}` : ''}`}>
            {filteredEntries.map(([key, value]) => {
                const currentPath = [...path, key];
                const isObject = typeof value === 'object' && value !== null && !Array.isArray(value);
                const isArray = Array.isArray(value);
                const isCollapsed = collapsed[key];

                if (isObject) {
                    const childCount = Object.keys(value).length;
                    return (
                        <div key={key} className="mb-1">
                            <div className="flex items-center gap-1 group">
                                <button
                                    onClick={() => setCollapsed(p => ({ ...p, [key]: !p[key] }))}
                                    className="p-1 text-zinc-500 hover:text-white transition-colors"
                                >
                                    {isCollapsed
                                        ? <ChevronRight className="w-3.5 h-3.5" />
                                        : <ChevronDown className="w-3.5 h-3.5" />
                                    }
                                </button>
                                <EditableKey
                                    keyName={key}
                                    onRename={(newKey) => renameKey(currentPath, newKey)}
                                    className="text-sm font-bold text-blue-400"
                                />
                                <span className="text-xs text-zinc-600 ml-1">({childCount})</span>
                                <button onClick={() => deleteKey(currentPath)} className="opacity-0 group-hover:opacity-100 p-1 text-zinc-600 hover:text-red-400 transition-all ml-auto">
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                            {!isCollapsed && (
                                <JsonObjectEditor
                                    data={value}
                                    path={currentPath}
                                    updateValue={updateValue}
                                    addKey={addKey}
                                    deleteKey={deleteKey}
                                    renameKey={renameKey}
                                    searchQuery={searchQuery}
                                    depth={depth + 1}
                                />
                            )}
                        </div>
                    );
                }

                if (isArray) {
                    return (
                        <div key={key} className="mb-1">
                            <div className="flex items-center gap-1 group">
                                <button
                                    onClick={() => setCollapsed(p => ({ ...p, [key]: !p[key] }))}
                                    className="p-1 text-zinc-500 hover:text-white transition-colors"
                                >
                                    {isCollapsed
                                        ? <ChevronRight className="w-3.5 h-3.5" />
                                        : <ChevronDown className="w-3.5 h-3.5" />
                                    }
                                </button>
                                <EditableKey keyName={key} onRename={(newKey) => renameKey(currentPath, newKey)} className="text-sm font-bold text-purple-400" />
                                <span className="text-xs text-zinc-600 ml-1">[{value.length}]</span>
                                <button onClick={() => deleteKey(currentPath)} className="opacity-0 group-hover:opacity-100 p-1 text-zinc-600 hover:text-red-400 transition-all ml-auto">
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                            {!isCollapsed && (
                                <div className={`ml-4 pl-3 border-l-2 ${depthColor} space-y-1 mt-1`}>
                                    {value.map((item: any, idx: number) => (
                                        <div key={idx} className="flex items-start gap-2 group">
                                            <span className="text-xs text-zinc-600 font-mono mt-2 shrink-0 w-5 text-right">{idx}</span>
                                            <input
                                                type="text"
                                                value={item}
                                                onChange={e => {
                                                    const newArr = [...value];
                                                    newArr[idx] = e.target.value;
                                                    updateValue(currentPath, newArr);
                                                }}
                                                className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500 text-zinc-300"
                                            />
                                            <button onClick={() => {
                                                const newArr = value.filter((_: any, i: number) => i !== idx);
                                                updateValue(currentPath, newArr);
                                            }} className="opacity-0 group-hover:opacity-100 p-1 text-zinc-600 hover:text-red-400">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => updateValue(currentPath, [...value, ''])}
                                        className="text-xs text-zinc-600 hover:text-blue-400 flex items-center gap-1 mt-1"
                                    >
                                        <Plus className="w-3 h-3" /> Add item
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                }

                // Leaf value (string, number, boolean)
                return (
                    <div key={key} className="flex items-start gap-2 py-0.5 group pl-6">
                        <EditableKey keyName={key} onRename={(newKey) => renameKey(currentPath, newKey)} className="text-sm text-zinc-400 shrink-0 mt-1" />
                        <span className="text-zinc-700 mt-1">:</span>
                        {typeof value === 'string' && value.length > 80 ? (
                            <textarea
                                value={value}
                                onChange={e => updateValue(currentPath, e.target.value)}
                                className={`flex-1 bg-zinc-900/50 border rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500 text-emerald-300 min-h-[60px] resize-y font-mono ${value === '' ? 'border-red-500/70 bg-red-950/20' : 'border-zinc-800'}`}
                            />
                        ) : (
                            <input
                                type="text"
                                value={String(value ?? '')}
                                onChange={e => updateValue(currentPath, e.target.value)}
                                className={`flex-1 bg-zinc-900/50 border rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500 text-emerald-300 ${value === '' ? 'border-red-500/70 bg-red-950/20' : 'border-zinc-800'}`}
                            />
                        )}
                        <button onClick={() => deleteKey(currentPath)} className="opacity-0 group-hover:opacity-100 p-1 text-zinc-600 hover:text-red-400">
                            <Trash2 className="w-3 h-3" />
                        </button>
                    </div>
                );
            })}

            {/* Add key */}
            <div className="pl-6 mt-1">
                {addingKey ? (
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={newKeyName}
                            onChange={e => setNewKeyName(e.target.value)}
                            placeholder="key name"
                            className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500 w-32"
                            autoFocus
                            onKeyDown={e => { if (e.key === 'Enter') handleAddKey(); if (e.key === 'Escape') setAddingKey(false); }}
                        />
                        <label className="flex items-center gap-1 text-[10px] text-zinc-500">
                            <input type="checkbox" checked={newKeyIsObject} onChange={e => setNewKeyIsObject(e.target.checked)} className="rounded" />
                            Object
                        </label>
                        <button onClick={handleAddKey} className="text-xs text-blue-400 hover:text-blue-300 font-bold">Add</button>
                        <button onClick={() => setAddingKey(false)} className="text-xs text-zinc-600 hover:text-zinc-400">Cancel</button>
                    </div>
                ) : (
                    <button
                        onClick={() => setAddingKey(true)}
                        className="text-xs text-zinc-600 hover:text-blue-400 flex items-center gap-1 py-1"
                    >
                        <Plus className="w-3 h-3" /> Add key
                    </button>
                )}
            </div>
        </div>
    );
}

// ─── Editable Key Name ──────────────────────────────────────────

function EditableKey({ keyName, onRename, className }: { keyName: string; onRename: (newKey: string) => void; className?: string }) {
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState(keyName);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

    const commit = () => {
        setEditing(false);
        if (value !== keyName) onRename(value);
    };

    if (editing) {
        return (
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={e => setValue(e.target.value)}
                onBlur={commit}
                onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setValue(keyName); setEditing(false); } }}
                className={`bg-zinc-800 border border-blue-500 rounded px-1 py-0.5 text-xs outline-none ${className}`}
                style={{ width: `${Math.max(value.length, 3) + 2}ch` }}
            />
        );
    }

    return (
        <span className={`cursor-pointer hover:underline ${className}`} onDoubleClick={() => setEditing(true)} title="Double-click to rename">
            {keyName}
        </span>
    );
}
