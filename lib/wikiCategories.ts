import { collection, doc, getDoc, getDocs, setDoc, query, orderBy, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";

export interface WikiCategory {
    id: string;          // slug, e.g. "slimes"
    nameKey: string;     // Localization key, e.g. "wiki.categories.slimes"
    descriptionKey: string;
    icon: string;        // Lucide icon name, e.g. "Ghost"
    order: number;       // Sort order
    introContent?: string; // Rich text HTML for the top of the category page
    createdAt?: number;
    updatedAt?: number;
}

export const saveWikiCategory = async (category: WikiCategory) => {
    const docRef = doc(db, "wikiCategories", category.id);
    const now = Date.now();
    await setDoc(docRef, {
        ...category,
        updatedAt: now,
        createdAt: category.createdAt || now
    }, { merge: true });
};

export const getWikiCategory = async (id: string): Promise<WikiCategory | null> => {
    const docRef = doc(db, "wikiCategories", id);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as WikiCategory;
    }
    return null;
};

export const getAllWikiCategories = async (): Promise<WikiCategory[]> => {
    const ref = collection(db, "wikiCategories");
    const q = query(ref, orderBy("order", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as WikiCategory));
};

export const deleteWikiCategory = async (id: string) => {
    const docRef = doc(db, "wikiCategories", id);
    await deleteDoc(docRef);
};
