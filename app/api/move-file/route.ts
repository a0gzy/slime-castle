import { NextResponse } from 'next/server';
import { verifyServerToken } from '@/lib/serverAuth';

export async function POST(req: Request) {
    try {
        const auth = await verifyServerToken(req);
        if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
        if (auth.role !== 'admin') return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });

        const { sourcePath, sourceSha, destinationFolder, fileName } = await req.json();

        if (!sourcePath || !sourceSha || !destinationFolder) {
            return NextResponse.json({ error: 'sourcePath, sourceSha, and destinationFolder are required' }, { status: 400 });
        }

        const owner = process.env.GITHUB_OWNER || 'a0gzy';
        const repo = process.env.GITHUB_REPO || 'slime-castle';
        const token = process.env.GITHUB_TOKEN;

        if (!token) {
            return NextResponse.json({ error: 'GitHub token not configured' }, { status: 500 });
        }

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'User-Agent': 'Slime-Castle-CMS'
        };

        // Step 1: Get file content
        const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${sourcePath}`;
        const getRes = await fetch(getUrl, { headers });
        if (!getRes.ok) {
            return NextResponse.json({ error: 'Source file not found' }, { status: 404 });
        }
        const fileData = await getRes.json();
        const content = fileData.content; // base64

        // Step 2: Create file at destination
        const destFileName = fileName || sourcePath.split('/').pop();
        const destPath = `${destinationFolder}/${destFileName}`;
        const createUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${destPath}`;
        const createRes = await fetch(createUrl, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
                message: `Move file: ${sourcePath} → ${destPath}`,
                content: content,
                branch: 'main'
            })
        });

        if (!createRes.ok) {
            const err = await createRes.json();
            console.error('Create failed:', err);
            return NextResponse.json({ error: 'Failed to create file at destination' }, { status: createRes.status });
        }

        // Step 3: Delete original file
        const deleteUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${sourcePath}`;
        const deleteRes = await fetch(deleteUrl, {
            method: 'DELETE',
            headers,
            body: JSON.stringify({
                message: `Move file (delete original): ${sourcePath}`,
                sha: sourceSha,
                branch: 'main'
            })
        });

        if (!deleteRes.ok) {
            console.error('Delete original failed, file was copied but not deleted');
        }

        const jsDelivrUrl = `https://cdn.jsdelivr.net/gh/${owner}/${repo}@main/${destPath}`;

        return NextResponse.json({ success: true, url: jsDelivrUrl, path: destPath });

    } catch (error) {
        console.error('Move Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
