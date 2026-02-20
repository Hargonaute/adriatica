'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { upload } from '@vercel/blob/client';
import { Loader2, UploadCloud, Image as ImageIcon, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Asset {
  id: string;
  url: string;
  alt: string | null;
  contentType: string | null;
  createdAt: string;
}

interface AssetPickerProps {
  onSelect: (url: string, assetId?: string) => void;
  trigger?: React.ReactNode;
}

export function AssetPicker({ onSelect, trigger }: AssetPickerProps) {
  const [open, setOpen] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/assets');
      if (res.ok) {
        const data = await res.json();
        setAssets(data);
      }
    } catch (err) {
      console.error('Failed to load assets', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchAssets();
    }
  }, [open, fetchAssets]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const newBlob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      });
      
      toast.success('Upload complete');
      await fetchAssets(); // Refresh list
      
      // Optional: Auto-select uploaded file?
      // onSelect(newBlob.url);
      // setOpen(false);

    } catch (error) {
      console.error('Upload failed', error);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const onDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSelect = (asset: Asset) => {
    onSelect(asset.url, asset.id);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline"><ImageIcon className="mr-2 h-4 w-4" /> Select Image</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Asset Library</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="library" className="flex-1 flex flex-col overflow-hidden">
           <div className="px-6 border-b bg-muted/30">
             <TabsList>
                <TabsTrigger value="library">Library</TabsTrigger>
                <TabsTrigger value="upload">Upload</TabsTrigger>
             </TabsList>
           </div>

           <TabsContent value="library" className="flex-1 overflow-hidden p-0 m-0">
              <ScrollArea className="h-full p-6">
                 {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                 ) : assets.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                        <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>No assets found</p>
                    </div>
                 ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {assets.map((asset) => (
                            <div 
                                key={asset.id} 
                                className="group relative aspect-square border rounded-md overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                                onClick={() => handleSelect(asset)}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img 
                                    src={asset.url} 
                                    alt={asset.alt || 'Asset'} 
                                    className="w-full h-full object-cover bg-muted"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button size="sm" variant="secondary">Select</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                 )}
              </ScrollArea>
           </TabsContent>

           <TabsContent value="upload" className="flex-1 p-6 m-0">
              <div 
                className={cn(
                    "h-full border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-4 transition-colors cursor-pointer",
                    dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
                )}
                onDragEnter={onDrag}
                onDragLeave={onDrag}
                onDragOver={onDrag}
                onDrop={onDrop}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                  <input 
                    id="file-upload" 
                    type="file" 
                    className="hidden" 
                    accept="image/*,video/*"
                    onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                  />
                  
                  {uploading ? (
                      <div className="text-center">
                          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
                          <p className="text-sm text-muted-foreground">Uploading...</p>
                      </div>
                  ) : (
                      <div className="text-center">
                          <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                              <UploadCloud className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <p className="font-medium">Click or drag file to upload</p>
                          <p className="text-sm text-muted-foreground mt-1">Supports JPG, PNG, WEBP, MP4</p>
                      </div>
                  )}
              </div>
           </TabsContent>
        </Tabs>

      </DialogContent>
    </Dialog>
  );
}
