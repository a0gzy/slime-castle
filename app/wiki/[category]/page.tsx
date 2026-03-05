import { getAllWikiEntities } from "@/lib/wiki";
import { getWikiCategory } from "@/lib/wikiCategories";
import { CategoryPageClient } from "./CategoryPageClient";
import { notFound } from "next/navigation";

export const revalidate = 60;

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
    const { category } = await params;

    const [categoryData, entities] = await Promise.all([
        getWikiCategory(category),
        getAllWikiEntities(category)
    ]);

    if (!categoryData) {
        notFound();
    }

    const publishedEntities = entities.filter(e => e.published !== false);

    return <CategoryPageClient category={categoryData} entities={publishedEntities} />;
}
