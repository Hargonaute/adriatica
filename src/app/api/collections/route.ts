import { db } from '@/lib/db';
import { collections, pages } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Pre-fills the detail template with a Product Detail block sequence.
// Bindings target common field keys (name/title, image, description/benefice)
// so the template works out of the box once matching fields exist.
function buildProductDetailBlocks() {
  return [
    {
      id: uuidv4(),
      type: 'product-hero',
      order: 0,
      data: {
        type: 'product-hero',
        title: '',
        subtitle1: '',
        subtitle2: '',
        body: '',
        ctaLabel: 'Contact us',
        ctaUrl: '/contact',
        image: '',
        imagePosition: 'right',
        backgroundColor: '',
        titleFieldKey: 'name',
        subtitle1FieldKey: 'category',
        subtitle2FieldKey: 'tagline',
        bodyFieldKey: 'benefice',
        imageFieldKey: 'image',
        paddingTop: 'lg',
        paddingBottom: 'lg',
      },
    },
    {
      id: uuidv4(),
      type: 'spacer',
      order: 1,
      data: { type: 'spacer', size: 'md', showDivider: false, paddingTop: 'none', paddingBottom: 'none' },
    },
    {
      id: uuidv4(),
      type: 'section-heading',
      order: 2,
      data: {
        type: 'section-heading',
        heading: 'Tableau',
        subheading: '',
        align: 'left',
        size: 'lg',
        showDivider: true,
        dividerColor: '#BC0D2A',
        paddingTop: 'sm',
        paddingBottom: 'sm',
      },
    },
    {
      id: uuidv4(),
      type: 'table',
      order: 3,
      data: {
        type: 'table',
        caption: '',
        headers: ['Caractéristique', 'Valeur', 'Unité'],
        rows: [['', '', ''], ['', '', ''], ['', '', '']],
        striped: true,
        bordered: true,
        paddingTop: 'sm',
        paddingBottom: 'sm',
      },
    },
    {
      id: uuidv4(),
      type: 'spacer',
      order: 4,
      data: { type: 'spacer', size: 'sm', showDivider: false, paddingTop: 'none', paddingBottom: 'none' },
    },
    {
      id: uuidv4(),
      type: 'section-heading',
      order: 5,
      data: {
        type: 'section-heading',
        heading: 'Composition du produit',
        subheading: '',
        align: 'left',
        size: 'lg',
        showDivider: true,
        dividerColor: '#BC0D2A',
        paddingTop: 'sm',
        paddingBottom: 'sm',
      },
    },
    {
      id: uuidv4(),
      type: 'key-value-list',
      order: 6,
      data: {
        type: 'key-value-list',
        heading: '',
        items: [
          { id: uuidv4(), label: '', value: '' },
          { id: uuidv4(), label: '', value: '' },
          { id: uuidv4(), label: '', value: '' },
        ],
        striped: true,
        showDividers: true,
        layout: 'two-col',
        paddingTop: 'sm',
        paddingBottom: 'sm',
      },
    },
    {
      id: uuidv4(),
      type: 'spacer',
      order: 7,
      data: { type: 'spacer', size: 'md', showDivider: false, paddingTop: 'none', paddingBottom: 'none' },
    },
    {
      id: uuidv4(),
      type: 'download-button',
      order: 8,
      data: {
        type: 'download-button',
        label: 'Fiche Technique',
        url: '',
        icon: 'download',
        variant: 'primary',
        align: 'left',
        openInNewTab: true,
        urlFieldKey: null,
        paddingTop: 'sm',
        paddingBottom: 'lg',
      },
    },
  ];
}

function buildDefaultDetailBlocks() {
  return [
    {
      id: uuidv4(),
      type: 'collection-item-fields',
      order: 0,
      data: {
        type: 'collection-item-fields',
        paddingTop: 'lg',
        paddingBottom: 'xl',
      },
    },
  ];
}

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

    const detailStarter = body.detailStarter === 'product' ? 'product' : 'default';

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

    // 3. Create the Detail Template Page — starter blocks depend on `detailStarter`
    const detailBlocks = detailStarter === 'product'
      ? buildProductDetailBlocks()
      : buildDefaultDetailBlocks();

    const [detailPage] = await db.insert(pages).values({
      title: `${newCollection.name} Template`,
      slug: `${newCollection.slug}-template`,
      status: 'published',
      isTemplate: true,
      templateKind: 'detail',
      templateCollectionId: newCollection.id,
      draft_blocks: { en: detailBlocks, ar: [] },
      published_blocks: { en: detailBlocks, ar: [] },
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
