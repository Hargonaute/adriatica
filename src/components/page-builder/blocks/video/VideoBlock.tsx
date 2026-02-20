'use client';

import { type BlockData } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

// ── Editor ────────────────────────────────────────────────────────────────

export function VideoEditor({
  block,
  onChange,
}: {
  block: BlockData & { type: 'video' };
  onChange: (updates: Partial<BlockData>) => void;
}) {
  return (
    <div className="space-y-4 p-4 border rounded-md">
      <div className="space-y-1.5">
        <Label>Video URL</Label>
        <Input
          type="url"
          placeholder="YouTube, Vimeo, or direct .mp4 URL"
          value={block.url || ''}
          onChange={(e) => onChange({ url: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          Supports youtube.com, youtu.be, vimeo.com, or any .mp4 link.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label>Title (accessibility)</Label>
        <Input
          type="text"
          placeholder="Describe the video content"
          value={block.title || ''}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          <Switch
            checked={!!block.autoPlay}
            onCheckedChange={(v) => onChange({ autoPlay: v })}
          />
          <Label className="text-sm">Auto Play</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={!!block.muted}
            onCheckedChange={(v) => onChange({ muted: v })}
          />
          <Label className="text-sm">Muted</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={!!block.loop}
            onCheckedChange={(v) => onChange({ loop: v })}
          />
          <Label className="text-sm">Loop</Label>
        </div>
      </div>
      {block.autoPlay && !block.muted && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2">
          Browsers block autoplay unless the video is also muted. Enable Muted for autoplay to work.
        </p>
      )}
    </div>
  );
}

// ── URL detection ──────────────────────────────────────────────────────────

function isYouTube(url: string) {
  return /youtube\.com|youtu\.be/.test(url);
}

function isVimeo(url: string) {
  return /vimeo\.com/.test(url);
}

function getYouTubeId(url: string) {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
  return m?.[1] ?? null;
}

function getVimeoId(url: string) {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m?.[1] ?? null;
}

function buildYouTubeEmbed(url: string, autoPlay: boolean, muted: boolean, loop: boolean) {
  const id = getYouTubeId(url);
  if (!id) return null;
  const params = new URLSearchParams({
    ...(autoPlay && { autoplay: '1' }),
    ...(muted && { mute: '1' }),
    ...(loop && { loop: '1', playlist: id }),
    rel: '0',
    modestbranding: '1',
  });
  return `https://www.youtube.com/embed/${id}?${params.toString()}`;
}

function buildVimeoEmbed(url: string, autoPlay: boolean, muted: boolean, loop: boolean) {
  const id = getVimeoId(url);
  if (!id) return null;
  const params = new URLSearchParams({
    ...(autoPlay && { autoplay: '1' }),
    ...(muted && { muted: '1' }),
    ...(loop && { loop: '1' }),
    title: '0',
    byline: '0',
    portrait: '0',
  });
  return `https://player.vimeo.com/video/${id}?${params.toString()}`;
}

// ── Preview ───────────────────────────────────────────────────────────────

export function VideoPreview({
  block,
  className,
}: {
  block: BlockData & { type: 'video' };
  className?: string;
}) {
  if (!block.url) {
    return (
      <div className="bg-muted h-48 flex items-center justify-center text-muted-foreground rounded-md text-sm">
        No video URL set
      </div>
    );
  }

  const autoPlay = !!block.autoPlay;
  const muted = !!block.muted;
  const loop = !!block.loop;

  if (isYouTube(block.url)) {
    const embedUrl = buildYouTubeEmbed(block.url, autoPlay, muted, loop);
    if (!embedUrl) return <p className="text-destructive text-sm">Invalid YouTube URL</p>;
    return (
      <div className={cn('relative w-full aspect-video rounded-md overflow-hidden', className)}>
        <iframe
          src={embedUrl}
          title={block.title || 'YouTube video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    );
  }

  if (isVimeo(block.url)) {
    const embedUrl = buildVimeoEmbed(block.url, autoPlay, muted, loop);
    if (!embedUrl) return <p className="text-destructive text-sm">Invalid Vimeo URL</p>;
    return (
      <div className={cn('relative w-full aspect-video rounded-md overflow-hidden', className)}>
        <iframe
          src={embedUrl}
          title={block.title || 'Vimeo video'}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    );
  }

  // Direct video file
  return (
    <div className={cn('relative w-full aspect-video rounded-md overflow-hidden', className)}>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        src={block.url}
        title={block.title}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        controls={!autoPlay}
        playsInline
        className="w-full h-full object-cover"
      />
    </div>
  );
}
