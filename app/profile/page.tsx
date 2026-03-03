'use client';

import { useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { LogOut, Save, Download, Cloud, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const { user, userData, logout, updateNickname, isAdmin } = useAuth();
    const { t } = useLanguage();
    const [nickname, setNickname] = useState(userData?.nickname || '');
    const [savingDrive, setSavingDrive] = useState(false);
    const [driveSuccess, setDriveSuccess] = useState(false);
    const router = useRouter();

    if (!user || !userData) {
        return (
            <div className="flex-1 flex items-center justify-center p-8 bg-zinc-950">
                <p className="text-zinc-400">Loading...</p>
            </div>
        );
    }

    const handleNicknameSave = async () => {
        await updateNickname(nickname);
    };

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    const handleDownloadBackup = () => {
        const dummyData = { status: "empty_backup", version: "1.0" };
        const blob = new Blob([JSON.stringify(dummyData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'backup.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleSaveDrive = async () => {
        setSavingDrive(true);
        setDriveSuccess(false);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setSavingDrive(false);
        setDriveSuccess(true);
        setTimeout(() => setDriveSuccess(false), 3000);
    };

    return (
        <div className="flex-1 flex flex-col items-center p-6 md:p-12 bg-zinc-950">
            <div className="max-w-2xl w-full space-y-8">

                <h1 className="text-4xl font-extrabold text-white tracking-tight">
                    {t('profile.title')}
                </h1>

                {/* Profile Card */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start shadow-xl">
                    <div className="flex flex-col items-center gap-4 shrink-0">
                        {user.photoURL ? (
                            <img src={user.photoURL} alt="Avatar" className="w-24 h-24 rounded-full border border-zinc-700 shadow-md" />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center text-4xl font-bold">
                                {user.email?.[0].toUpperCase()}
                            </div>
                        )}
                        <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-bold uppercase tracking-widest">
                            {userData.role}
                        </span>
                    </div>

                    <div className="flex-1 flex flex-col gap-6 w-full">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">{t('profile.nickname')}</label>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors"
                                />
                                <button
                                    onClick={handleNicknameSave}
                                    disabled={nickname === userData.nickname}
                                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    {t('common.save')}
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Email</label>
                            <div className="text-zinc-300 font-medium px-4 py-2.5 bg-zinc-950 border border-zinc-800/50 rounded-lg opacity-80 cursor-not-allowed">
                                {user.email}
                            </div>
                        </div>

                        <div className="pt-2 flex flex-wrap gap-3">
                            {isAdmin && (
                                <button
                                    onClick={() => router.push('/admin')}
                                    className="px-5 py-2.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-400 font-bold rounded-lg transition-all flex items-center gap-2"
                                >
                                    <ShieldCheck className="w-4 h-4" />
                                    {t('common.admin_panel')}
                                </button>
                            )}
                            <button
                                onClick={handleLogout}
                                className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 font-bold rounded-lg transition-all flex items-center gap-2"
                            >
                                <LogOut className="w-4 h-4" />
                                {t('profile.logout')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Data Management Card */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-lg">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                        {t('profile.data_management')}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                            onClick={handleDownloadBackup}
                            className="flex flex-col items-center justify-center gap-3 p-6 bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-500/5 rounded-xl transition-all group"
                        >
                            <Download className="w-8 h-8 text-emerald-500 group-hover:scale-110 transition-transform" />
                            <span className="font-semibold text-zinc-300">{t('profile.download_backup')}</span>
                        </button>

                        <button
                            onClick={handleSaveDrive}
                            disabled={savingDrive}
                            className="flex flex-col items-center justify-center gap-3 p-6 bg-zinc-950 border border-zinc-800 hover:border-blue-500/50 hover:bg-blue-500/5 rounded-xl transition-all group disabled:opacity-70 disabled:pointer-events-none relative overflow-hidden"
                        >
                            {savingDrive ? (
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-3" />
                            ) : (
                                <Cloud className={`w-8 h-8 ${driveSuccess ? 'text-green-400' : 'text-blue-500'} group-hover:scale-110 transition-transform`} />
                            )}
                            <span className={`font-semibold ${driveSuccess ? 'text-green-400' : 'text-zinc-300'}`}>
                                {savingDrive ? t('profile.saving') : (driveSuccess ? t('profile.save_drive_success') : t('profile.save_drive'))}
                            </span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
