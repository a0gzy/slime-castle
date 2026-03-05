import { getAllWikiCategories } from "@/lib/wikiCategories";
import { getAllWikiEntities, WikiEntity } from "@/lib/wiki";
import { WikiCategoriesClient } from "./WikiCategoriesClient";

export const revalidate = 60;

export default async function WikiPage() {
    const categories = await getAllWikiCategories();

    // Fetch latest changelog entry
    let latestChangelog: WikiEntity | null = null;
    try {
        const changelogEntities = await getAllWikiEntities('changelogs');
        if (changelogEntities.length > 0) {
            latestChangelog = changelogEntities[0]; // Already sorted by updatedAt desc
        }
    } catch (e) {
        console.error('Failed to fetch changelogs:', e);
    }

    return <WikiCategoriesClient categories={categories} latestChangelog={latestChangelog} />;
}
