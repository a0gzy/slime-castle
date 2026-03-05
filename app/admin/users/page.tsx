'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Search, Save, Plus, Trash2, ArrowLeft } from 'lucide-react';

interface AdminUser {
    uid: string;
    email: string | null;
    nickname: string;
    role: 'admin' | 'editor' | 'user';
    allowedLanguages: string[];
}

interface AppLanguage {
    id: string;
    name: string;
}

export default function UsersPage() {
    const { user, isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();
    const { t } = useLanguage();

    const [users, setUsers] = useState<AdminUser[]>([]);
    const [languages, setLanguages] = useState<AppLanguage[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    const [newLangId, setNewLangId] = useState('');
    const [newLangName, setNewLangName] = useState('');

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            router.push('/');
        } else if (isAdmin) {
            fetchData();
        }
    }, [isAdmin, authLoading, router]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const usersData: AdminUser[] = [];
            usersSnapshot.forEach((doc) => {
                const data = doc.data();
                usersData.push({
                    uid: doc.id,
                    email: data.email,
                    nickname: data.nickname || '',
                    role: data.role || 'user',
                    allowedLanguages: data.allowedLanguages || []
                });
            });
            setUsers(usersData);

            const langSnapshot = await getDocs(collection(db, 'languages'));
            let langData: AppLanguage[] = [];
            langSnapshot.forEach((doc) => {
                langData.push({ id: doc.id, name: doc.data().name });
            });

            if (langData.length === 0) {
                const defaults: AppLanguage[] = [
                    { id: 'ru', name: 'Русский' },
                    { id: 'en', name: 'English' }
                ];
                for (const lang of defaults) {
                    await setDoc(doc(db, 'languages', lang.id), { name: lang.name });
                }
                langData = defaults;
            }
            setLanguages(langData);
        } catch (error) {
            console.error("Error fetching admin data:", error);
        }
        setLoading(false);
    };

    const handleSaveUser = async (updatedUser: AdminUser) => {
        try {
            await updateDoc(doc(db, 'users', updatedUser.uid), {
                role: updatedUser.role,
                allowedLanguages: updatedUser.allowedLanguages
            });
            setUsers(users.map(u => u.uid === updatedUser.uid ? updatedUser : u));
            alert('Saved!');
        } catch (error) {
            console.error("Error updating user:", error);
        }
    };

    const handleAddLanguage = async () => {
        if (!newLangId || !newLangName) return;
        try {
            await setDoc(doc(db, 'languages', newLangId), { name: newLangName });
            setLanguages([...languages, { id: newLangId, name: newLangName }]);
            setNewLangId('');
            setNewLangName('');
        } catch (error) {
            console.error("Error adding language:", error);
        }
    };

    const handleDeleteLanguage = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'languages', id));
            setLanguages(languages.filter(l => l.id !== id));
        } catch (error) {
            console.error("Error deleting language:", error);
        }
    };

    const filteredUsers = users.filter(u =>
        u.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (authLoading || (loading && isAdmin)) {
        return <div className="flex-1 flex items-center justify-center bg-zinc-950 text-zinc-400">Loading...</div>;
    }
    if (!isAdmin) return null;

    return (
        <div className="flex-1 flex flex-col p-6 md:p-12 bg-zinc-950 text-zinc-300 overflow-y-auto">
            <div className="max-w-5xl w-full mx-auto space-y-12">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/admin')} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5 text-zinc-400" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Users & Languages</h1>
                        <p className="text-zinc-500 mt-1">Manage user roles and supported languages.</p>
                    </div>
                </div>

                {/* Languages */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-purple-500 rounded-full" />
                        Languages
                    </h3>
                    <div className="flex flex-col gap-4">
                        <div className="flex gap-2 flex-wrap">
                            {languages.map(lang => (
                                <div key={lang.id} className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-lg">
                                    <span className="font-bold text-zinc-300">{lang.id.toUpperCase()}</span>
                                    <span className="text-zinc-500 text-sm">({lang.name})</span>
                                    <button onClick={() => handleDeleteLanguage(lang.id)} className="ml-2 text-zinc-500 hover:text-red-500">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-3 mt-2 items-center">
                            <input type="text" placeholder="ID (e.g. es)" value={newLangId} onChange={e => setNewLangId(e.target.value)} className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:border-purple-500 outline-none w-24" />
                            <input type="text" placeholder="Name (e.g. Spanish)" value={newLangName} onChange={e => setNewLangName(e.target.value)} className="flex-1 max-w-xs bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:border-purple-500 outline-none" />
                            <button onClick={handleAddLanguage} className="p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors">
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Users */}
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                            Users
                        </h3>
                        <div className="relative w-full sm:w-auto">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                            <input type="text" placeholder="Search by nickname" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full sm:w-64 bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-100 focus:border-blue-500 outline-none" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredUsers.map((u) => (
                            <UserCard key={u.uid} user={u} languages={languages} onSave={handleSaveUser} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function UserCard({ user, languages, onSave }: { user: AdminUser, languages: AppLanguage[], onSave: (u: AdminUser) => void }) {
    const [role, setRole] = useState(user.role);
    const [selectedLangs, setSelectedLangs] = useState<string[]>(user.allowedLanguages);

    const toggleLang = (langId: string) => {
        setSelectedLangs(prev => prev.includes(langId) ? prev.filter(id => id !== langId) : [...prev, langId]);
    };

    const handleSave = () => {
        onSave({ ...user, role, allowedLanguages: selectedLangs });
    };

    const hasChanges = role !== user.role || JSON.stringify(selectedLangs) !== JSON.stringify(user.allowedLanguages);

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex justify-between items-start">
                <div>
                    <div className="font-bold text-zinc-100 text-lg">{user.nickname || 'No Nickname'}</div>
                    <div className="text-zinc-500 text-sm">{user.email}</div>
                </div>
                <div className="text-xs bg-zinc-950 px-2 py-1 border border-zinc-800 rounded text-zinc-500 font-mono">
                    {user.uid.slice(0, 8)}...
                </div>
            </div>

            <div className="flex flex-col gap-3 mt-2">
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Role</label>
                    <select value={role} onChange={e => setRole(e.target.value as any)} className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 outline-none focus:border-blue-500">
                        <option value="user">User</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                {(role === 'editor' || role === 'admin') && (
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Languages</label>
                        <div className="flex flex-wrap gap-2">
                            {languages.map(lang => (
                                <button key={lang.id} onClick={() => toggleLang(lang.id)} className={`px-2 py-1 rounded text-xs font-bold transition-colors border ${selectedLangs.includes(lang.id) ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-zinc-950 text-zinc-500 border-zinc-800 hover:border-zinc-600'}`}>
                                    {lang.id.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <button onClick={handleSave} disabled={!hasChanges} className="mt-2 flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500 transition-colors">
                <Save className="w-4 h-4" />
                Save changes
            </button>
        </div>
    );
}
