export const DRIVE_FILENAME = 'slime_castle_sync.json';

/**
 * Searches for a file by name in the app's accessible Drive space.
 * Retrieves the file ID if it exists.
 */
export async function getDriveFileId(accessToken: string, filename: string): Promise<string | null> {
    const query = encodeURIComponent(`name='${filename}' and trashed=false`);
    const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&spaces=drive`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to search Drive files');
    }

    const data = await response.json();
    if (data.files && data.files.length > 0) {
        return data.files[0].id;
    }
    return null;
}

/**
 * Creates a new file in Google Drive.
 */
export async function createDriveFile(accessToken: string, filename: string, content: string): Promise<string> {
    const metadata = {
        name: filename,
        mimeType: 'application/json',
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([content], { type: 'application/json' }));

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        body: form,
    });

    if (!response.ok) {
        throw new Error('Failed to create Drive file');
    }

    const data = await response.json();
    return data.id;
}

/**
 * Updates an existing file in Google Drive.
 */
export async function updateDriveFile(accessToken: string, fileId: string, content: string): Promise<void> {
    const response = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: content,
    });

    if (!response.ok) {
        throw new Error('Failed to update Drive file');
    }
}

/**
 * Downloads the content of a file from Google Drive.
 */
export async function downloadDriveFile(accessToken: string, fileId: string): Promise<any> {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to download Drive file');
    }

    return await response.json();
}
