import { NextResponse } from 'next/server';
import { verifyServerToken } from '@/lib/serverAuth';

export async function GET() {
    try {
        const owner = process.env.GITHUB_OWNER || 'a0gzy';
        const repo = process.env.GITHUB_REPO || 'slime-castle';
        const token = process.env.GITHUB_TOKEN;

        if (!token) {
            return NextResponse.json({ error: 'GitHub token not configured' }, { status: 500 });
        }

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Slime-Castle-CMS'
        };

        // List files in lang/ folder
        const listUrl = `https://api.github.com/repos/${owner}/${repo}/contents/lang`;
        const listRes = await fetch(listUrl, { headers });

        if (!listRes.ok) {
            if (listRes.status === 404) {
                return NextResponse.json({ languages: {} });
            }
            return NextResponse.json({ error: 'Failed to list languages' }, { status: listRes.status });
        }

        const files = await listRes.json();
        const jsonFiles = Array.isArray(files)
            ? files.filter((f: any) => f.type === 'file' && f.name.endsWith('.json'))
            : [];

        // Fetch each file's content
        const languages: Record<string, { content: any; sha: string }> = {};

        await Promise.all(jsonFiles.map(async (file: any) => {
            try {
                const fileRes = await fetch(file.url, { headers });
                if (fileRes.ok) {
                    const fileData = await fileRes.json();
                    const content = JSON.parse(
                        Buffer.from(fileData.content, 'base64').toString('utf-8')
                    );
                    const langId = file.name.replace('.json', '');
                    languages[langId] = { content, sha: fileData.sha };
                }
            } catch (e) {
                console.error(`Failed to parse ${file.name}:`, e);
            }
        }));

        return NextResponse.json({ languages });

    } catch (error) {
        console.error('Get Languages Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const auth = await verifyServerToken(req);
        if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

        if (auth.role !== 'admin' && auth.role !== 'editor') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { langId, content, sha } = await req.json();

        if (auth.role === 'editor' && !auth.allowedLanguages?.includes(langId)) {
            return NextResponse.json({ error: 'You are not allowed to edit this language' }, { status: 403 });
        }

        if (!langId || !content) {
            return NextResponse.json({ error: 'langId and content are required' }, { status: 400 });
        }

        const owner = process.env.GITHUB_OWNER || 'a0gzy';
        const repo = process.env.GITHUB_REPO || 'slime-castle';
        const token = process.env.GITHUB_TOKEN;

        if (!token) {
            return NextResponse.json({ error: 'GitHub token not configured' }, { status: 500 });
        }

        const path = `lang/${langId}.json`;
        const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
        const base64Content = Buffer.from(JSON.stringify(content, null, 4), 'utf-8').toString('base64');

        const body: any = {
            message: `Update language: ${langId}`,
            content: base64Content,
            branch: 'main'
        };
        if (sha) body.sha = sha;

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Slime-Castle-CMS'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('GitHub API Error:', error);
            return NextResponse.json({ error: 'Failed to save language file' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json({ success: true, sha: data.content?.sha });

    } catch (error) {
        console.error('Save Language Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
