import { NextResponse } from 'next/server';
import { verifyServerToken } from '@/lib/serverAuth';

export async function GET(req: Request) {
    try {
        const auth = await verifyServerToken(req);
        if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
        if (auth.role !== 'admin') return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });

        const url = new URL(req.url);
        const folderPath = url.searchParams.get('folder') || 'wiki';

        const owner = process.env.GITHUB_OWNER || 'a0gzy';
        const repo = process.env.GITHUB_REPO || 'slime-castle';
        const token = process.env.GITHUB_TOKEN;

        if (!token) {
            return NextResponse.json({ error: 'GitHub token not configured' }, { status: 500 });
        }

        const githubUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${folderPath}`;

        const response = await fetch(githubUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Slime-Castle-CMS'
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                // Folder doesn't exist yet, return empty array
                return NextResponse.json({ images: [] });
            }
            const error = await response.json();
            console.error('GitHub API Error:', error);
            return NextResponse.json({ error: 'Failed to fetch from GitHub' }, { status: response.status });
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            return NextResponse.json({ error: 'Expected directory contents' }, { status: 400 });
        }

        const images = data
            .filter((file: any) => file.type === 'file' && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name))
            .map((file: any) => ({
                name: file.name,
                url: `https://cdn.jsdelivr.net/gh/${owner}/${repo}@main/${file.path}`,
                path: file.path,
                size: file.size,
                sha: file.sha,
            }));

        const folders = data
            .filter((item: any) => item.type === 'dir')
            .map((item: any) => ({
                name: item.name,
                path: item.path,
            }));

        return NextResponse.json({ images, folders });

    } catch (error) {
        console.error('Get Images Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
