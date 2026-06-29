import { db } from '@/lib/db';
import { collections, pages } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const allCollections = await db.select().from(collections).orderBy(desc(collections.createdAt));
    return NextResponse.json(allCollections);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.slug) {
        return NextResponse.json({ error: 'Name and Slug required' }, { status: 400 });
    }

    // 1. Create the collection first
    const [newCollection] = await db.insert(collections).values({
        name: body.name,
        slug: body.slug,
        description: body.description,
        basePath: body.basePath ?? body.slug,
    }).returning();

    // 2. Create the Index Page template
    const [indexPage] = await db.insert(pages).values({
      title: `${newCollection.name} Index`,
      slug: `${newCollection.slug}-index`,
      status: 'published',
      isTemplate: true,
      templateKind: 'index',
      templateCollectionId: newCollection.id,
      draft_blocks: {
        en: [
          {
            id: uuidv4(),
            type: 'collection-list',
            order: 0,
            data: {
              type: 'collection-list',
              collectionId: newCollection.id,
              collectionSlug: newCollection.slug,
              layout: 'grid-3',
              linkToItems: true,
              paddingTop: 'lg',
              paddingBottom: 'xl',
            }
          }
        ],
        ar: []
      },
      published_blocks: {
        en: [
          {
            id: uuidv4(),
            type: 'collection-list',
            order: 0,
            data: {
              type: 'collection-list',
              collectionId: newCollection.id,
              collectionSlug: newCollection.slug,
              layout: 'grid-3',
              linkToItems: true,
              paddingTop: 'lg',
              paddingBottom: 'xl',
            }
          }
        ],
        ar: []
      }
    }).returning();

    // 3. Create the Detail Template Page
    const [detailPage] = await db.insert(pages).values({
      title: `${newCollection.name} Template`,
      slug: `${newCollection.slug}-template`,
      status: 'published',
      isTemplate: true,
      templateKind: 'detail',
      templateCollectionId: newCollection.id,
      draft_blocks: {
        en: [
          {
            id: uuidv4(),
            type: 'collection-item-fields',
            order: 0,
            data: {
              type: 'collection-item-fields',
              paddingTop: 'lg',
              paddingBottom: 'xl',
            }
          }
        ],
        ar: []
      },
      published_blocks: {
        en: [
          {
            id: uuidv4(),
            type: 'collection-item-fields',
            order: 0,
            data: {
              type: 'collection-item-fields',
              paddingTop: 'lg',
              paddingBottom: 'xl',
            }
          }
        ],
        ar: []
      }
    }).returning();

    // 4. Update the collection with the page IDs
    const [updatedCollection] = await db.update(collections)
      .set({
        indexPageId: indexPage.id,
        detailTemplatePageId: detailPage.id,
      })
      .where(eq(collections.id, newCollection.id))
      .returning();

    return NextResponse.json(updatedCollection);
  } catch (error) {
    console.error('Create collection error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
