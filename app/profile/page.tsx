'use client';

import { useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { LogOut, Save, Download, Cloud, ShieldCheck, UploadCloud } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import {
    DRIVE_FILENAME,
    getDriveFileId,
    createDriveFile,
    updateDriveFile,
    downloadDriveFile
} from '@/lib/drive';

export default function ProfilePage() {
    const { user, userData, logout, updateNickname, isAdmin, isEditor } = useAuth();
    const { t } = useLanguage();
    const [nickname, setNickname] = useState(userData?.nickname || '');

    const [savingDrive, setSavingDrive] = useState(false);
    const [driveSuccess, setDriveSuccess] = useState(false);

    const [loadingDrive, setLoadingDrive] = useState(false);
    const [loadSuccess, setLoadSuccess] = useState(false);

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

    const getExportData = () => {
        const bingoHistory = JSON.parse(localStorage.getItem('bingo_history') || '[]');
        const monopolyEventHistory = JSON.parse(localStorage.getItem('monopoly_event_history') || '[]');
        const runesGrid = JSON.parse(localStorage.getItem('slime_runes_grid') || '{}');
        const runesDupes = JSON.parse(localStorage.getItem('slime_runes_dupelist_v2') || '{}');

        return {
            bingo_history: bingoHistory,
            monopoly_event_history: monopolyEventHistory,
            slime_runes_grid: runesGrid,
            slime_runes_dupelist_v2: runesDupes,
            lastSync: new Date().toISOString()
        };
    };

    const importData = (data: any) => {
        if (!data) return;

        // Overwrite with imported data
        if (data.bingo_history) {
            localStorage.setItem('bingo_history', JSON.stringify(data.bingo_history));
        }
        if (data.monopoly_event_history) {
            localStorage.setItem('monopoly_event_history', JSON.stringify(data.monopoly_event_history));
        }
        if (data.slime_runes_grid) {
            localStorage.setItem('slime_runes_grid', JSON.stringify(data.slime_runes_grid));
        }
        if (data.slime_runes_dupelist_v2) {
            localStorage.setItem('slime_runes_dupelist_v2', JSON.stringify(data.slime_runes_dupelist_v2));
        }
    };

    const handleDownloadBackup = () => {
        const data = getExportData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `slime_castle_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const data = JSON.parse(content);
                importData(data);
                setLoadSuccess(true);
                setTimeout(() => setLoadSuccess(false), 3000);
            } catch (error) {
                console.error('Failed to parse JSON file:', error);
                alert('Invalid JSON file. Please try a valid backup file.');
            }
            // Reset input so the same file can be selected again
            event.target.value = '';
        };
        reader.readAsText(file);
    };

    const getDriveAccessToken = async () => {
        const provider = new GoogleAuthProvider();
        provider.addScope('https://www.googleapis.com/auth/drive.file');

        const result = await signInWithPopup(auth, provider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (!credential?.accessToken) {
            throw new Error('Failed to get Drive access token');
        }
        return credential.accessToken;
    };

    const handleSaveDrive = async () => {
        try {
            setSavingDrive(true);
            setDriveSuccess(false);

            const token = await getDriveAccessToken();
            const data = getExportData();
            const content = JSON.stringify(data, null, 2);

            let fileId = await getDriveFileId(token, DRIVE_FILENAME);
            if (fileId) {
                await updateDriveFile(token, fileId, content);
            } else {
                await createDriveFile(token, DRIVE_FILENAME, content);
            }

            setDriveSuccess(true);
            setTimeout(() => setDriveSuccess(false), 3000);
        } catch (error) {
            console.error('Save to Drive failed:', error);
            alert('Failed to save to Google Drive. Please try again.');
        } finally {
            setSavingDrive(false);
        }
    };

    const handleLoadDrive = async () => {
        try {
            setLoadingDrive(true);
            setLoadSuccess(false);

            const token = await getDriveAccessToken();
            const fileId = await getDriveFileId(token, DRIVE_FILENAME);

            if (!fileId) {
                alert('No sync file found in your Google Drive!');
                return;
            }

            const data = await downloadDriveFile(token, fileId);
            importData(data);

            setLoadSuccess(true);
            setTimeout(() => setLoadSuccess(false), 3000);

        } catch (error) {
            console.error('Load from Drive failed:', error);
            alert('Failed to load from Google Drive. Please try again.');
        } finally {
            setLoadingDrive(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center p-6 md:p-12 bg-zinc-950">
            <div className="max-w-4xl w-full space-y-8">

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
                            {isAdmin ? (
                                <button
                                    onClick={() => router.push('/admin')}
                                    className="px-5 py-2.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-400 font-bold rounded-lg transition-all flex items-center gap-2"
                                >
                                    <ShieldCheck className="w-4 h-4" />
                                    Admin Panel
                                </button>
                            ) : isEditor ? (
                                <button
                                    onClick={() => router.push('/admin/lang-editor')}
                                    className="px-5 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 font-bold rounded-lg transition-all flex items-center gap-2"
                                >
                                    <ShieldCheck className="w-4 h-4" />
                                    Language Editor
                                </button>
                            ) : null}
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
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                            {t('profile.data_management')}
                        </h3>
                        <div className="flex items-center gap-3">
                            <input
                                type="file"
                                id="file-import"
                                accept=".json"
                                className="hidden"
                                onChange={handleFileImport}
                            />
                            <button
                                onClick={() => document.getElementById('file-import')?.click()}
                                className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-semibold rounded-lg transition-colors"
                            >
                                <UploadCloud className="w-4 h-4" />
                                {loadSuccess ? t('profile.load_file_success') : t('profile.load_file')}
                            </button>
                            <button
                                onClick={handleDownloadBackup}
                                className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-semibold rounded-lg transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                {t('profile.download_backup')}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Save to Drive Card */}
                        <div className="flex items-center p-6 bg-zinc-950/50 border border-blue-500/20 rounded-xl gap-4">
                            <div className="p-3 bg-blue-500/10 rounded-full text-blue-400 shrink-0">
                                <UploadCloud className="w-8 h-8" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-zinc-200 mb-1">{t('profile.save_drive')}</h4>
                                <p className="text-xs text-zinc-500 leading-tight mb-3">
                                    Экспорт всех трекеров в Google Диск
                                </p>
                                <button
                                    onClick={handleSaveDrive}
                                    disabled={savingDrive || loadingDrive}
                                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                                >
                                    {savingDrive ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <Cloud className="w-4 h-4" />}
                                    {driveSuccess ? t('profile.save_drive_success') : t('common.save')}
                                </button>
                            </div>
                        </div>

                        {/* Load from Drive Card */}
                        <div className="flex items-center p-6 bg-zinc-950/50 border border-emerald-500/20 rounded-xl gap-4">
                            <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-400 shrink-0">
                                <Download className="w-8 h-8" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-zinc-200 mb-1">{t('profile.load_drive')}</h4>
                                <p className="text-xs text-zinc-500 leading-tight mb-3">
                                    {t('profile.merge_notice')}
                                </p>
                                <button
                                    onClick={handleLoadDrive}
                                    disabled={loadingDrive || savingDrive}
                                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                                >
                                    {loadingDrive ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <Download className="w-4 h-4" />}
                                    {loadSuccess ? t('profile.load_drive_success') : t('profile.load_drive').split(' ')[0]}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}

