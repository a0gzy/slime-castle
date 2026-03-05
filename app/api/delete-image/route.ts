import { NextResponse } from 'next/server';
import { verifyServerToken } from '@/lib/serverAuth';

export async function DELETE(req: Request) {
    try {
        const auth = await verifyServerToken(req);
        if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
        if (auth.role !== 'admin') return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });

        const { path, sha } = await req.json();

        if (!path || !sha) {
            return NextResponse.json({ error: 'path and sha are required' }, { status: 400 });
        }

        const owner = process.env.GITHUB_OWNER || 'a0gzy';
        const repo = process.env.GITHUB_REPO || 'slime-castle';
        const token = process.env.GITHUB_TOKEN;

        if (!token) {
            return NextResponse.json({ error: 'GitHub token not configured' }, { status: 500 });
        }

        const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Slime-Castle-CMS'
            },
            body: JSON.stringify({
                message: `Delete file via CMS: ${path}`,
                sha,
                branch: 'main'
            })
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('GitHub API Error:', error);
            return NextResponse.json({ error: 'Failed to delete file' }, { status: response.status });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Delete Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
