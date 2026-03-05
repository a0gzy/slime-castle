import { NextResponse } from 'next/server';
import { verifyServerToken } from '@/lib/serverAuth';

export async function POST(req: Request) {
    try {
        const auth = await verifyServerToken(req);
        if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
        if (auth.role !== 'admin') return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });

        const formData = await req.formData();
        const file = formData.get('file') as File;
        const folderPath = formData.get('folderPath') as string || 'wiki';
        const customName = formData.get('fileName') as string | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const buffer = await file.arrayBuffer();
        const base64Content = Buffer.from(buffer).toString('base64');
        const ext = file.name.split('.').pop() || 'png';
        const sanitized = customName
            ? `${Date.now()}_${customName.replace(/[^a-zA-Z0-9_-]/g, '_')}.${ext}`
            : `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const path = `${folderPath}/${sanitized}`;

        const owner = process.env.GITHUB_OWNER || 'a0gzy';
        const repo = process.env.GITHUB_REPO || 'slime-castle';
        const token = process.env.GITHUB_TOKEN;

        if (!token) {
            return NextResponse.json({ error: 'GitHub token not configured' }, { status: 500 });
        }

        const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Slime-Castle-CMS'
            },
            body: JSON.stringify({
                message: `Upload image via CMS: ${sanitized}`,
                content: base64Content,
                branch: 'main' // assuming main branch
            })
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('GitHub API Error:', error);
            return NextResponse.json({ error: 'Failed to upload to GitHub' }, { status: response.status });
        }

        const data = await response.json();
        const jsDelivrUrl = `https://cdn.jsdelivr.net/gh/${owner}/${repo}@main/${path}`;

        return NextResponse.json({
            success: true,
            url: jsDelivrUrl,
            githubData: data
        });

    } catch (error) {
        console.error('Upload Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
