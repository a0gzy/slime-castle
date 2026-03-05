'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import {
    Upload, Copy, Clipboard, FolderPlus, Folder, ChevronRight, Home, Trash2,
    ArrowLeft, X, Image as ImageIcon, Search, RefreshCw, Move, MoreVertical
} from 'lucide-react';

interface GitHubImage {
    name: string;
    url: string;
    path: string;
    size: number;
    sha: string;
}

interface GitHubFolder {
    name: string;
    path: string;
}

export default function FileManagerPage() {
    const { user, isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();

    const [images, setImages] = useState<GitHubImage[]>([]);
    const [folders, setFolders] = useState<GitHubFolder[]>([]);
    const [currentFolder, setCurrentFolder] = useState('wiki');
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Upload modal
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [uploadFolder, setUploadFolder] = useState('wiki');
    const [uploadName, setUploadName] = useState('');

    // Create folder
    const [showCreateFolder, setShowCreateFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

    // Context menu
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; img: GitHubImage } | null>(null);

    // Move modal
    const [showMoveModal, setShowMoveModal] = useState(false);
    const [moveTarget, setMoveTarget] = useState<GitHubImage | null>(null);
    const [moveDestination, setMoveDestination] = useState('');
    const [moveFolderSuggestions, setMoveFolderSuggestions] = useState<string[]>([]);
    const [moving, setMoving] = useState(false);

    const loadImages = async (folder?: string) => {
        const target = folder ?? currentFolder;
        try {
            setLoading(true);
            const token = await user?.getIdToken();
            const res = await fetch(`/api/get-images?folder=${encodeURIComponent(target)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setImages(data.images || []);
            setFolders(data.folders || []);
        } catch (e) {
            console.error('Failed to load:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            router.push('/');
        } else if (isAdmin) {
            loadImages();
        }
    }, [currentFolder, isAdmin, authLoading]);

    const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPendingFile(file);
        setUploadFolder(currentFolder);
        setUploadName('');
        setShowUploadModal(true);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handlePaste = async () => {
        try {
            const items = await navigator.clipboard.read();
            for (const item of items) {
                const imageType = item.types.find(type => type.startsWith('image/'));
                if (imageType) {
                    const blob = await item.getType(imageType);
                    const file = new File([blob], `pasted.png`, { type: imageType });
                    setPendingFile(file);
                    setUploadFolder(currentFolder);
                    setUploadName('');
                    setShowUploadModal(true);
                    return;
                }
            }
            alert('No image found in clipboard!');
        } catch (e) {
            alert('Failed to read clipboard.');
        }
    };

    const handleUploadConfirm = async () => {
        if (!pendingFile) return;
        setShowUploadModal(false);
        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('file', pendingFile);
            formData.append('folderPath', uploadFolder);
            if (uploadName) formData.append('fileName', uploadName);

            const token = await user?.getIdToken();
            const res = await fetch('/api/upload-image', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            if (res.ok && uploadFolder === currentFolder) {
                await loadImages();
            }
        } catch (e) {
            console.error('Upload failed:', e);
        } finally {
            setUploading(false);
            setPendingFile(null);
        }
    };

    const handleDelete = async (img: GitHubImage) => {
        if (!confirm(`Delete "${img.name}"?`)) return;
        try {
            const token = await user?.getIdToken();
            const res = await fetch('/api/delete-image', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ path: img.path, sha: img.sha })
            });
            if (res.ok) await loadImages();
            else alert('Failed to delete');
        } catch (e) {
            console.error('Delete failed:', e);
        }
    };

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;
        const folderPath = `${currentFolder}/${newFolderName.trim().replace(/[^a-zA-Z0-9_-]/g, '_')}`;
        try {
            const token = await user?.getIdToken();
            const res = await fetch('/api/create-folder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ folderPath })
            });
            if (res.ok) {
                setShowCreateFolder(false);
                setNewFolderName('');
                await loadImages();
            } else {
                alert('Failed to create folder');
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleCopy = (url: string) => {
        navigator.clipboard.writeText(url);
    };

    const navigateToFolder = (folderPath: string) => {
        setCurrentFolder(folderPath);
        setSearchQuery('');
    };

    const handleContextMenu = (e: React.MouseEvent, img: GitHubImage) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, img });
    };

    const openMoveModal = async (img: GitHubImage) => {
        setContextMenu(null);
        setMoveTarget(img);
        setMoveDestination(currentFolder);
        setShowMoveModal(true);

        // Load folder suggestions recursively from root
        try {
            const token = await user?.getIdToken();
            const fetchOpts = { headers: { 'Authorization': `Bearer ${token}` } };
            const rootRes = await fetch(`/api/get-images?folder=wiki`, fetchOpts);
            const rootData = await rootRes.json();
            const rootFolders = (rootData.folders || []).map((f: GitHubFolder) => f.path);

            // Also load subfolders of current folder if different
            let allFolders = ['wiki', ...rootFolders];

            // Load subfolders one level deep for each root folder
            for (const rf of rootFolders) {
                try {
                    const subRes = await fetch(`/api/get-images?folder=${encodeURIComponent(rf)}`, fetchOpts);
                    const subData = await subRes.json();
                    const subFolders = (subData.folders || []).map((f: GitHubFolder) => f.path);
                    allFolders = [...allFolders, ...subFolders];
                } catch { }
            }

            setMoveFolderSuggestions([...new Set(allFolders)]);
        } catch {
            setMoveFolderSuggestions(['wiki']);
        }
    };

    const handleMove = async () => {
        if (!moveTarget || !moveDestination) return;
        setMoving(true);
        try {
            const token = await user?.getIdToken();
            const res = await fetch('/api/move-file', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    sourcePath: moveTarget.path,
                    sourceSha: moveTarget.sha,
                    destinationFolder: moveDestination
                })
            });
            if (res.ok) {
                setShowMoveModal(false);
                setMoveTarget(null);
                await loadImages();
            } else {
                alert('Failed to move file');
            }
        } catch (e) {
            console.error('Move failed:', e);
            alert('Move failed');
        } finally {
            setMoving(false);
        }
    };

    const breadcrumbParts = currentFolder.split('/');

    const filteredImages = searchQuery
        ? images.filter(img => img.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : images;

    if (authLoading) return null;
    if (!isAdmin || !user) return null;

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-black text-white">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-zinc-950 border-b border-zinc-800 shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/admin')} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5 text-zinc-400" />
                    </button>
                    <h1 className="text-xl font-bold font-serif tracking-wide text-zinc-100">File Manager</h1>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => loadImages()} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors" title="Refresh">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <button onClick={() => setShowCreateFolder(!showCreateFolder)} className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors">
                        <FolderPlus className="w-4 h-4" /> New Folder
                    </button>
                    <button onClick={handlePaste} disabled={uploading} className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors">
                        <Clipboard className="w-4 h-4" /> Paste
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-bold transition-colors">
                        <Upload className="w-4 h-4" /> Upload
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-4 px-4 py-3 bg-zinc-950/50 border-b border-zinc-800/50 shrink-0">
                {/* Breadcrumb */}
                <div className="flex items-center gap-1 text-sm text-zinc-400 flex-1 min-w-0">
                    <button onClick={() => navigateToFolder('wiki')} className="hover:text-white transition-colors flex items-center gap-1 shrink-0">
                        <Home className="w-4 h-4" />
                        <span>wiki</span>
                    </button>
                    {breadcrumbParts.map((part, i) => {
                        if (i === 0 && part === 'wiki') return null;
                        const path = breadcrumbParts.slice(0, i + 1).join('/');
                        return (
                            <span key={i} className="flex items-center gap-1 shrink-0">
                                <ChevronRight className="w-3 h-3 text-zinc-700" />
                                <button onClick={() => navigateToFolder(path)} className="hover:text-white transition-colors">
                                    {part}
                                </button>
                            </span>
                        );
                    })}
                </div>

                {/* Search */}
                <div className="relative w-56">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:border-zinc-600"
                        placeholder="Search files..."
                    />
                </div>
            </div>

            {/* Create folder inline */}
            {showCreateFolder && (
                <div className="flex items-center gap-2 px-4 py-3 bg-zinc-900/50 border-b border-zinc-800/50">
                    <Folder className="w-4 h-4 text-amber-400" />
                    <input
                        type="text"
                        value={newFolderName}
                        onChange={e => setNewFolderName(e.target.value)}
                        className="flex-1 max-w-xs bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
                        placeholder="New folder name"
                        onKeyDown={e => e.key === 'Enter' && handleCreateFolder()}
                        autoFocus
                    />
                    <button onClick={handleCreateFolder} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-bold text-white">Create</button>
                    <button onClick={() => setShowCreateFolder(false)} className="p-1.5 text-zinc-500 hover:text-white">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelected} />

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {uploading && (
                    <div className="mb-4 px-4 py-3 bg-blue-950/30 border border-blue-900/50 rounded-xl text-sm text-blue-300 flex items-center gap-3">
                        <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                        Uploading...
                    </div>
                )}

                {loading ? (
                    <div className="text-center text-zinc-500 mt-20">Loading...</div>
                ) : (
                    <>
                        {/* Folders Grid */}
                        {folders.length > 0 && (
                            <div className="mb-6">
                                <div className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Folders</div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                                    {folders.map(f => (
                                        <button
                                            key={f.path}
                                            onClick={() => navigateToFolder(f.path)}
                                            className="flex flex-col items-center gap-2 p-4 bg-zinc-900/50 hover:bg-zinc-800 rounded-xl border border-zinc-800/50 hover:border-zinc-700 transition-all text-center group"
                                        >
                                            <Folder className="w-10 h-10 text-amber-400 group-hover:scale-110 transition-transform" />
                                            <span className="text-xs text-zinc-300 truncate w-full">{f.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Images Grid */}
                        {filteredImages.length > 0 && (
                            <div>
                                <div className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">
                                    Files ({filteredImages.length})
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                                    {filteredImages.map(img => (
                                        <div
                                            key={img.path}
                                            className="group relative aspect-square bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800/50 hover:border-zinc-600 transition-all"
                                            onContextMenu={e => handleContextMenu(e, img)}
                                        >
                                            <img src={img.url} alt={img.name} className="w-full h-full object-cover" />

                                            {/* Hover overlay */}
                                            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                                                <div className="flex gap-1">
                                                    <button onClick={() => handleCopy(img.url)} className="p-2 bg-zinc-800/90 hover:bg-blue-500 rounded-lg text-white transition-colors" title="Copy URL">
                                                        <Copy className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button onClick={() => openMoveModal(img)} className="p-2 bg-zinc-800/90 hover:bg-amber-500 rounded-lg text-white transition-colors" title="Move">
                                                        <Move className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button onClick={() => handleDelete(img)} className="p-2 bg-zinc-800/90 hover:bg-red-500 rounded-lg text-white transition-colors" title="Delete">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                                <span className="text-[10px] text-zinc-400 truncate w-full text-center">{img.name}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {filteredImages.length === 0 && folders.length === 0 && (
                            <div className="text-center text-zinc-500 mt-20 space-y-2">
                                <ImageIcon className="w-12 h-12 mx-auto text-zinc-700" />
                                <p>This folder is empty</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => { setShowUploadModal(false); setPendingFile(null); }}>
                    <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-96 space-y-4 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-zinc-200">Upload Settings</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-zinc-500 font-semibold block mb-1">Folder Path</label>
                                <input
                                    type="text"
                                    value={uploadFolder}
                                    onChange={e => setUploadFolder(e.target.value)}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                    placeholder="wiki/slimes"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-zinc-500 font-semibold block mb-1">File Name (optional)</label>
                                <input
                                    type="text"
                                    value={uploadName}
                                    onChange={e => setUploadName(e.target.value)}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                    placeholder="Leave empty for auto-name"
                                />
                                <p className="text-[10px] text-zinc-600 mt-1">Saved as: data_{'{name}'}.ext</p>
                            </div>
                            {pendingFile && (
                                <div className="text-xs text-zinc-500 flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4" />
                                    {pendingFile.name} ({(pendingFile.size / 1024).toFixed(1)}KB)
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2 justify-end pt-2">
                            <button onClick={() => { setShowUploadModal(false); setPendingFile(null); }} className="px-4 py-2 text-sm text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors">Cancel</button>
                            <button onClick={handleUploadConfirm} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg transition-colors">Upload</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Context Menu */}
            {contextMenu && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setContextMenu(null)} />
                    <div
                        className="fixed z-50 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl py-1 min-w-[160px]"
                        style={{ left: contextMenu.x, top: contextMenu.y }}
                    >
                        <button
                            onClick={() => { handleCopy(contextMenu.img.url); setContextMenu(null); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                        >
                            <Copy className="w-4 h-4" /> Copy URL
                        </button>
                        <button
                            onClick={() => openMoveModal(contextMenu.img)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                        >
                            <Move className="w-4 h-4" /> Move to...
                        </button>
                        <div className="h-px bg-zinc-800 my-1" />
                        <button
                            onClick={() => { handleDelete(contextMenu.img); setContextMenu(null); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-950/50 hover:text-red-300 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" /> Delete
                        </button>
                    </div>
                </>
            )}

            {/* Move Modal */}
            {showMoveModal && moveTarget && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => { setShowMoveModal(false); setMoveTarget(null); }}>
                    <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-96 space-y-4 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-zinc-200">Move File</h3>
                        <div className="space-y-3">
                            <div className="text-xs text-zinc-500 flex items-center gap-2">
                                <ImageIcon className="w-4 h-4" />
                                {moveTarget.name}
                            </div>
                            <div>
                                <label className="text-xs text-zinc-500 font-semibold block mb-1">From</label>
                                <div className="text-sm text-zinc-400 bg-zinc-800 rounded-lg px-3 py-2 border border-zinc-700/50">
                                    {moveTarget.path.split('/').slice(0, -1).join('/')}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-zinc-500 font-semibold block mb-1">Move to Folder</label>
                                <input
                                    type="text"
                                    value={moveDestination}
                                    onChange={e => setMoveDestination(e.target.value)}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                                    placeholder="wiki/slimes"
                                    list="move-folder-suggestions"
                                />
                                <datalist id="move-folder-suggestions">
                                    {moveFolderSuggestions.map(f => <option key={f} value={f} />)}
                                </datalist>
                            </div>
                            {moveFolderSuggestions.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {moveFolderSuggestions.slice(0, 10).map(f => (
                                        <button
                                            key={f}
                                            onClick={() => setMoveDestination(f)}
                                            className={`px-2 py-1 rounded text-xs border transition-all ${moveDestination === f
                                                ? 'bg-amber-600 border-amber-500 text-white'
                                                : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                                                }`}
                                        >
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2 justify-end pt-2">
                            <button onClick={() => { setShowMoveModal(false); setMoveTarget(null); }} className="px-4 py-2 text-sm text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors">Cancel</button>
                            <button onClick={handleMove} disabled={moving} className={`px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold rounded-lg transition-colors ${moving ? 'opacity-50' : ''}`}>
                                {moving ? 'Moving...' : 'Move'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
