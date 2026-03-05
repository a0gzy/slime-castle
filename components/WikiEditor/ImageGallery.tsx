'use client';

import { useState, useEffect, useRef } from 'react';
import { Upload, X, Copy, Image as ImageIcon, Clipboard, FolderPlus, Folder, ChevronRight, Home, Trash2 } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';

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

// Upload modal component
function UploadModal({ open, onClose, onConfirm, currentFolder, defaultName }: {
    open: boolean;
    onClose: () => void;
    onConfirm: (folder: string, fileName: string) => void;
    currentFolder: string;
    defaultName: string;
}) {
    const [folder, setFolder] = useState(currentFolder);
    const [fileName, setFileName] = useState(defaultName);

    useEffect(() => {
        setFolder(currentFolder);
        setFileName(defaultName);
    }, [currentFolder, defaultName, open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-80 space-y-4 shadow-2xl" onClick={e => e.stopPropagation()}>
                <h3 className="text-sm font-bold text-zinc-200">Upload Settings</h3>
                <div className="space-y-3">
                    <div>
                        <label className="text-xs text-zinc-500 font-semibold block mb-1">Folder Path</label>
                        <input
                            type="text"
                            value={folder}
                            onChange={e => setFolder(e.target.value)}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                            placeholder="wiki/slimes"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-zinc-500 font-semibold block mb-1">File Name (optional)</label>
                        <input
                            type="text"
                            value={fileName}
                            onChange={e => setFileName(e.target.value)}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                            placeholder="Leave empty for auto-name"
                        />
                        <p className="text-[10px] text-zinc-600 mt-1">Saved as: data_{'{name}'}.ext</p>
                    </div>
                </div>
                <div className="flex gap-2 justify-end pt-2">
                    <button onClick={onClose} className="px-3 py-1.5 text-sm text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors">Cancel</button>
                    <button onClick={() => onConfirm(folder, fileName)} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg transition-colors">Upload</button>
                </div>
            </div>
        </div>
    );
}

export function ImageGallery({ onSelect }: { onSelect?: (url: string) => void }) {
    const { user } = useAuth();
    const [images, setImages] = useState<GitHubImage[]>([]);
    const [folders, setFolders] = useState<GitHubFolder[]>([]);
    const [currentFolder, setCurrentFolder] = useState('wiki');
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Upload modal state
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [pendingFile, setPendingFile] = useState<File | null>(null);

    // Create folder state
    const [showCreateFolder, setShowCreateFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

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
            console.error('Failed to load images:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadImages();
    }, [currentFolder]);

    const uploadFile = async (file: File, folder: string, customName: string) => {
        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folderPath', folder);
            if (customName) formData.append('fileName', customName);

            const token = await user?.getIdToken();
            const res = await fetch('/api/upload-image', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();

            if (data.url) {
                if (folder === currentFolder) {
                    await loadImages();
                }
            }
        } catch (e) {
            console.error('Upload failed:', e);
        } finally {
            setUploading(false);
        }
    };

    const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPendingFile(file);
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
                    setShowUploadModal(true);
                    return;
                }
            }
            alert('No image found in clipboard!');
        } catch (e) {
            console.error('Paste failed:', e);
            alert('Failed to read clipboard.');
        }
    };

    const handleUploadConfirm = async (folder: string, fileName: string) => {
        if (!pendingFile) return;
        setShowUploadModal(false);
        await uploadFile(pendingFile, folder, fileName);
        setPendingFile(null);
    };

    const handleDelete = async (img: GitHubImage) => {
        if (!confirm(`Delete ${img.name}?`)) return;
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
            if (res.ok) {
                await loadImages();
            } else {
                alert('Failed to delete');
            }
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
    };

    // Breadcrumb parts
    const breadcrumbParts = currentFolder.split('/');

    return (
        <div className="flex flex-col h-full bg-zinc-900 border-l border-zinc-800 w-64 shrink-0">
            {/* Header */}
            <div className="p-3 border-b border-zinc-800 space-y-2">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold flex items-center gap-2 text-sm text-zinc-300">
                        <ImageIcon className="w-4 h-4" /> Gallery
                    </h3>
                    <div className="flex items-center gap-0.5">
                        <button onClick={() => setShowCreateFolder(!showCreateFolder)} className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors" title="New Folder">
                            <FolderPlus className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={handlePaste} disabled={uploading} className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors" title="Paste from Clipboard">
                            <Clipboard className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors" title="Upload Image">
                            <Upload className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                {/* Breadcrumb */}
                <div className="flex items-center gap-0.5 text-[10px] text-zinc-500 flex-wrap">
                    <button onClick={() => navigateToFolder('wiki')} className="hover:text-white transition-colors flex items-center gap-0.5">
                        <Home className="w-3 h-3" />
                    </button>
                    {breadcrumbParts.map((part, i) => {
                        if (i === 0 && part === 'wiki') return null; // skip 'wiki' since we have Home icon
                        const path = breadcrumbParts.slice(0, i + 1).join('/');
                        return (
                            <span key={i} className="flex items-center gap-0.5">
                                <ChevronRight className="w-2.5 h-2.5 text-zinc-700" />
                                <button onClick={() => navigateToFolder(path)} className="hover:text-white transition-colors">
                                    {part}
                                </button>
                            </span>
                        );
                    })}
                </div>

                {/* Create folder inline */}
                {showCreateFolder && (
                    <div className="flex gap-1">
                        <input
                            type="text"
                            value={newFolderName}
                            onChange={e => setNewFolderName(e.target.value)}
                            className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500"
                            placeholder="folder name"
                            onKeyDown={e => e.key === 'Enter' && handleCreateFolder()}
                        />
                        <button onClick={handleCreateFolder} className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 rounded text-xs font-bold text-white">OK</button>
                        <button onClick={() => setShowCreateFolder(false)} className="px-1 py-1 text-zinc-500 hover:text-white">
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                )}
            </div>

            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelected} />

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-3">
                {uploading && (
                    <div className="w-full aspect-square bg-zinc-800 animate-pulse rounded-lg mb-3 flex items-center justify-center text-xs text-zinc-500">
                        Uploading...
                    </div>
                )}

                {/* Folders */}
                {folders.length > 0 && (
                    <div className="flex flex-col gap-1 mb-3">
                        {folders.map(f => (
                            <button
                                key={f.path}
                                onClick={() => navigateToFolder(f.path)}
                                className="flex items-center gap-2 p-2 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg text-xs text-zinc-300 hover:text-white transition-colors text-left"
                            >
                                <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                                <span className="truncate">{f.name}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Images */}
                {loading && !images.length && !folders.length ? (
                    <div className="text-center text-zinc-500 text-sm mt-10">Loading...</div>
                ) : !loading && images.length === 0 && folders.length === 0 ? (
                    <div className="text-center text-zinc-500 text-sm mt-10">Empty folder</div>
                ) : (
                    <div className="grid grid-cols-2 gap-2">
                        {images.map(img => (
                            <div key={img.path} className="group relative aspect-square bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700/50">
                                <img src={img.url} alt={img.name} className="w-full h-full object-cover" />

                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                    <button onClick={() => handleCopy(img.url)} className="p-1.5 bg-zinc-800/80 hover:bg-blue-500 rounded text-white" title="Copy URL">
                                        <Copy className="w-3 h-3" />
                                    </button>
                                    {onSelect && (
                                        <button onClick={() => onSelect(img.url)} className="p-1.5 bg-zinc-800/80 hover:bg-emerald-500 rounded text-white font-bold text-[10px] px-2">
                                            USE
                                        </button>
                                    )}
                                    <button onClick={() => handleDelete(img)} className="p-1.5 bg-zinc-800/80 hover:bg-red-500 rounded text-white" title="Delete">
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            <UploadModal
                open={showUploadModal}
                onClose={() => { setShowUploadModal(false); setPendingFile(null); }}
                onConfirm={handleUploadConfirm}
                currentFolder={currentFolder}
                defaultName=""
            />
        </div>
    );
}
