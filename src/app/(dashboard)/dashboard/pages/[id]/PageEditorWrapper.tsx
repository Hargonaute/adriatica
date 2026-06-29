'use client';

import { useEffect } from 'react';
import PageBuilderEditor from '@/components/page-builder/Editor';
import { type PageData } from '@/types';
import { useRouter } from 'next/navigation';
import { useTemplateBuilderStore } from '@/lib/store/templateBuilderStore';

export default function PageEditorWrapper({ initialData, isTemplate, templateCollectionId }: { initialData: PageData; isTemplate: boolean; templateCollectionId: string | null }) {
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
        router.refresh();
    };

    const handlePublish = async (data: PageData) => {
        const res = await fetch('/api/pages/publish', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to publish');
        router.refresh();
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
                mode={isTemplate ? 'template' : 'static'}
                onSave={handleSave}
                onPublish={handlePublish}
                onUnpublish={handleUnpublish}
            />
        </div>
    );
}
