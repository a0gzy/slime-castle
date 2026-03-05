import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function verifyServerToken(request: Request): Promise<{
    error?: string;
    status?: number;
    uid?: string;
    role?: string;
    allowedLanguages?: string[];
}> {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { error: 'Unauthorized: Missing token', status: 401 };
    }
    const token = authHeader.split('Bearer ')[1];

    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) {
        return { error: 'Server misconfiguration', status: 500 };
    }

    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: token })
    });

    if (!res.ok) {
        return { error: 'Unauthorized: Invalid token', status: 401 };
    }

    const data = await res.json();
    if (!data.users || data.users.length === 0) {
        return { error: 'Unauthorized: Invalid token data', status: 401 };
    }

    const uid = data.users[0].localId;

    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) {
        return { error: 'Forbidden: User not found', status: 403 };
    }

    const userData = userDoc.data();
    return {
        uid,
        role: userData.role as string,
        allowedLanguages: (userData.allowedLanguages as string[]) || []
        // No error returned means success
    };
}
