'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    onAuthStateChanged,
    signInWithPopup,
    signOut,
    User
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../../lib/firebase';

interface UserData {
    uid: string;
    email: string | null;
    nickname: string;
    role: 'admin' | 'editor' | 'user';
    allowedLanguages: string[];
}

interface AuthContextType {
    user: User | null;
    userData: UserData | null;
    isAdmin: boolean;
    isEditor: boolean;
    loading: boolean;
    login: () => Promise<void>;
    logout: () => Promise<void>;
    updateNickname: (newNickname: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    userData: null,
    isAdmin: false,
    isEditor: false,
    loading: true,
    login: async () => { },
    logout: async () => { },
    updateNickname: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // Fetch or create user document in Firestore
                const userDocRef = doc(db, 'users', currentUser.uid);
                try {
                    const userDoc = await getDoc(userDocRef);
                    if (userDoc.exists()) {
                        setUserData(userDoc.data() as UserData);
                    } else {
                        // Create default user doc
                        const newUserData: UserData = {
                            uid: currentUser.uid,
                            email: currentUser.email,
                            nickname: currentUser.displayName || '',
                            role: 'user',
                            allowedLanguages: []
                        };
                        await setDoc(userDocRef, newUserData);
                        setUserData(newUserData);
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    setUserData(null);
                }
            } else {
                setUserData(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const login = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const updateNickname = async (newNickname: string) => {
        if (!user || !userData) return;
        const userDocRef = doc(db, 'users', user.uid);
        try {
            await setDoc(userDocRef, { nickname: newNickname }, { merge: true });
            setUserData({ ...userData, nickname: newNickname });
        } catch (error) {
            console.error("Error updating nickname:", error);
        }
    };

    const isAdmin = userData?.role === 'admin';
    const isEditor = userData?.role === 'admin' || userData?.role === 'editor';

    return (
        <AuthContext.Provider value={{ user, userData, isAdmin, isEditor, loading, login, logout, updateNickname }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
