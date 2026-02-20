'use client';

import PageBuilderEditor from '@/components/page-builder/Editor';
import { type PageData } from '@/types';
import { useRouter } from 'next/navigation';

export default function PageEditorWrapper({ initialData }: { initialData: PageData }) {
    const router = useRouter();

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
                onSave={handleSave}
                onPublish={handlePublish}
                onUnpublish={handleUnpublish}
            />
        </div>
    );
}
