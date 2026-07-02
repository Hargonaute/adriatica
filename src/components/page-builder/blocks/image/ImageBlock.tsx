import { type BlockData, type ImageBlockData } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { AssetPicker } from '../../AssetPicker';
import { Button } from '@/components/ui/button';
import { X, Image as ImageIcon } from 'lucide-react';
import { useId } from 'react';

// --- Editor Component ---
export function ImageEditor({
  block,
  onChange,
}: {
  block: BlockData & { type: 'image' };
  onChange: (updates: Partial<BlockData>) => void;
}) {
  const uniqueId = useId();
  
  const handleSelect = (url: string, assetId?: string) => {
     onChange({ url, assetId });
  };

  const clearImage = () => {
    onChange({ url: '', assetId: undefined });
  };

  return (
    <div className="space-y-4 p-4 border rounded-md bg-background">
       <div className="space-y-2">
          <Label>Image Source</Label>
          
          {block.url ? (
            <div className="relative aspect-video w-full rounded-md overflow-hidden border bg-muted group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={block.url} alt="Preview" className="w-full h-full object-cover" />
                
                <div className="absolute top-2 right-2 flex gap-2">
                     <AssetPicker onSelect={handleSelect} trigger={
                        <Button size="sm" variant="secondary" className="opacity-0 group-hover:opacity-100 transition-opacity">Change</Button>
                     } />
                     <Button 
                        size="icon" 
                        variant="destructive" 
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={clearImage}
                    >
                        <X className="h-4 w-4" />
                     </Button>
                </div>
            </div>
          ) : (
            <div className="h-32 border-2 border-dashed rounded-md flex flex-col items-center justify-center gap-2 text-muted-foreground bg-muted/20">
                <ImageIcon className="h-8 w-8 opacity-50" />
                <AssetPicker onSelect={handleSelect} />
                <span className="text-xs">or paste URL below</span>
            </div>
          )}
       </div>

       {/* Fallback URL input for external images if needed */}
       <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor={`url-${uniqueId}`} className="text-xs text-muted-foreground">External URL (optional)</Label>
          <Input 
            id={`url-${uniqueId}`}
            type="url" 
            placeholder="https://..."
            value={block.url || ''} 
            onChange={(e) => onChange({ url: e.target.value })} 
            className="h-8 text-xs"
          />
       </div>

       <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor={`alt-${uniqueId}`}>Alt Text</Label>
          <Input 
             id={`alt-${uniqueId}`}
             type="text" 
             value={block.alt || ''} 
             onChange={(e) => onChange({ alt: e.target.value })} 
          />
       </div>
    </div>
  );
}

// --- Preview Component ---
const ASPECT_MAP: Record<string, string> = {
  '1:1': '1 / 1',
  '4:3': '4 / 3',
  '16:9': '16 / 9',
  '3:4': '3 / 4',
  square: '1 / 1',
  video: '16 / 9',
  portrait: '3 / 4',
};

const WIDTH_MAP: Record<string, string> = {
  full: '100%',
  half: '50%',
  third: '33.3333%',
  auto: 'auto',
};

const BORDER_RADIUS_MAP: Record<string, string> = {
  none: '0',
  sm: '4px',
  md: '8px',
  lg: '16px',
  full: '9999px',
};

export function ImagePreview({
  block,
  className
}: {
  block: BlockData & { type: 'image' };
  className?: string;
}) {
  if (!block.url) return null;

  const aspect = block.aspectRatio && block.aspectRatio !== 'auto'
    ? (ASPECT_MAP[block.aspectRatio] ?? undefined)
    : undefined;
  const objectFit = block.objectFit ?? 'cover';
  const widthKey = typeof block.width === 'string' ? block.width : 'full';
  const width = WIDTH_MAP[widthKey] ?? '100%';
  // borderRadius may already be applied by the wrapper's baseStyles for
  // template mode, but honouring it here means the image block reads correctly
  // in static mode too.
  const borderRadius = BORDER_RADIUS_MAP[block.borderRadius ?? 'none'];
  const hideMobile = block.hideOnMobile;

  const wrapperStyle: React.CSSProperties = {
    width,
    aspectRatio: aspect,
    borderRadius,
    overflow: 'hidden',
  };

  const imgStyle: React.CSSProperties = {
    width: '100%',
    height: aspect ? '100%' : 'auto',
    objectFit,
    display: 'block',
  };

  return (
    <div
      className={cn('relative', hideMobile && 'max-md:hidden @max-3xl/preview:hidden', className)}
      style={wrapperStyle}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={block.url}
        alt={block.alt || ''}
        style={imgStyle}
      />
    </div>
  );
}
