import { collection, doc, getDoc, getDocs, setDoc, query, where, orderBy } from "firebase/firestore";
import { db } from "./firebase";

export interface WikiEntity {
    id: string; // Document ID
    category: string; // 'slimes', 'gear', etc.
    nameKey: string; // Localization key for the entity name
    descriptionKey: string; // Localization key for a short description
    detailsKey?: string; // Localization key for detailed HTML content (or you can store HTML here directly if not using file-based localization for the huge text)
    content?: string; // The rich text content, sometimes easier to store in DB than JSON file
    image?: string; // Direct image URL (from github jsdelivr)
    stats?: Record<string, number | string>; // e.g. ATK, HP
    metadata?: any; // Contains the specific Slime/Artifact/Set data
    createdAt?: number;
    updatedAt?: number;
    published?: boolean;
}

// Specific Metadata structures
export interface SlimeMetadata {
    rank: string;
    element: string;
    unlockCost: string;
    stats: Array<{ level: number; label: string; crystals: number }>;
    bonusUnlock: Array<{ star: number; shards: number; bonus: string }>;
    activeSkill: { name: string; cd: number; descKey: string; icon?: string };
    passiveSkills: Array<{ name: string; descKey: string }>;
}

export interface ArtifactMetadata {
    rarity: string;
    exclusive: string;
    stars: Array<{ star: number; cost: number }>;
    skills: Array<{
        name: string;
        descKey: string;
        levels: Array<{ level: number; multiplier: string; stun: string }>;
        upgradeLevels: string;
    }>;
}

export interface SetMetadata {
    rarity: string;
    name: string;
    items: Array<{ name: string; icon: string; stats: string[] }>;
    setEffect2: { descKey: string };
    setEffect4: { descKey: string };
}

export interface BossMetadata {
    hpThreshold: string;
    weakness: string[];
    skills: Array<{ name: string; chance: string; descKey: string }>;
}

export const saveWikiEntity = async (entity: WikiEntity) => {
    const docRef = doc(db, "wikiEntities", entity.id);
    const now = Date.now();
    await setDoc(docRef, {
        ...entity,
        updatedAt: now,
        createdAt: entity.createdAt || now
    }, { merge: true });
}

export const getWikiEntity = async (id: string): Promise<WikiEntity | null> => {
    const docRef = doc(db, "wikiEntities", id);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as WikiEntity;
    }
    return null;
}

export const getAllWikiEntities = async (category?: string): Promise<WikiEntity[]> => {
    const pagesRef = collection(db, "wikiEntities");
    // Depending on Firestore indexes, you might need to create an index for (category, updatedAt desc)
    let q = query(pagesRef, orderBy("updatedAt", "desc"));
    if (category) {
        q = query(pagesRef, where("category", "==", category));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WikiEntity));
}

export const getWikiEntityIdsByCategory = async (category: string) => {
    const q = query(collection(db, "wikiEntities"), where("category", "==", category));
    const snapshots = await getDocs(q);
    return snapshots.docs.map(doc => doc.id);
};
