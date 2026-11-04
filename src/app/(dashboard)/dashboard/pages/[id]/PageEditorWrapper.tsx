'use client';

import { useEffect } from 'react';
import PageBuilderEditor from '@/components/page-builder/Editor';
import { type PageData } from '@/types';
import { useRouter } from 'next/navigation';
import { useTemplateBuilderStore } from '@/lib/store/templateBuilderStore';

export default function PageEditorWrapper({
    initialData,
    initialHasUnpublishedChanges,
    liveSlug,
    isTemplate,
    templateKind,
    templateCollectionId,
}: {
    initialData: PageData;
    initialHasUnpublishedChanges: boolean;
    liveSlug: string;
    isTemplate: boolean;
    templateKind: 'index' | 'detail' | null;
    templateCollectionId: string | null;
}) {
    const router = useRouter();
    const setCollection = useTemplateBuilderStore((s) => s.setCollection);

    useEffect(() => {
        // Sync the template-builder store with this page's collection on every
        // prop change so SPA navigation between a template and a non-template
        // page doesn't leave a stale collectionId in the store.
        setCollection(isTemplate ? templateCollectionId : null);
    }, [isTemplate, templateCollectionId, setCollection]);

    const handleSave = async (data: PageData) => {
        const res = await fetch('/api/pages/save-draft', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to save');
        const json = (await res.json().catch(() => ({}))) as { hasUnpublishedChanges?: boolean };
        router.refresh();
        return { hasUnpublishedChanges: json.hasUnpublishedChanges };
    };

    const handlePublish = async (data: PageData) => {
        const res = await fetch('/api/pages/publish', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const json = (await res.json().catch(() => ({}))) as { error?: string; slug?: string };
        // 409 = slug already used by another page: show the server's message.
        if (!res.ok) throw new Error(res.status === 409 && json.error ? json.error : 'Publish failed');
        router.refresh();
        return { slug: json.slug };
    };
    
    const handleUnpublish = async (data: PageData) => {
        const res = await fetch('/api/pages/unpublish', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: data.id }),
        });
        if (!res.ok) throw new Error('Failed to unpublish');
        router.refresh();
    };

    return (
        <div className="fixed inset-0 z-50 bg-background">
            <PageBuilderEditor
                initialData={initialData}
                initialHasUnpublishedChanges={initialHasUnpublishedChanges}
                liveSlug={liveSlug}
                mode={isTemplate ? 'template' : 'static'}
                templateKind={isTemplate ? templateKind : null}
                onSave={handleSave}
                onPublish={handlePublish}
                onUnpublish={handleUnpublish}
            />
        </div>
    );
}
