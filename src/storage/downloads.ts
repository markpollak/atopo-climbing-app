import { useState, useEffect, useCallback } from 'react';
import type { Crag } from '../types';

export interface DownloadedCrag {
  id: string;
  crag: Crag;
  routeCount: number;
  photoUrl: string;
  downloadedAt: number;
  sizeMb: number;
}

const KEY = 'atopo_downloads';

function load(): DownloadedCrag[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

function save(items: DownloadedCrag[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function useDownloads() {
  const [downloads, setDownloads] = useState<DownloadedCrag[]>(load);
  const [downloading, setDownloading] = useState<Set<string>>(new Set());

  useEffect(() => {
    save(downloads);
  }, [downloads]);

  const isDownloaded = useCallback((id: string) => downloads.some(d => d.id === id), [downloads]);
  const isDownloading = useCallback((id: string) => downloading.has(id), [downloading]);

  const download = useCallback(async (id: string, crag: Crag, routeCount: number, photoUrl: string) => {
    if (isDownloaded(id) || isDownloading(id)) return;
    setDownloading(prev => new Set(prev).add(id));

    // Simulate download time proportional to "size"
    const sizeMb = Math.round(routeCount * 1.4 + Math.random() * 8);
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 600));

    setDownloads(prev => [
      ...prev,
      { id, crag, routeCount, photoUrl, downloadedAt: Date.now(), sizeMb },
    ]);
    setDownloading(prev => { const s = new Set(prev); s.delete(id); return s; });
  }, [isDownloaded, isDownloading]);

  const remove = useCallback((id: string) => {
    setDownloads(prev => prev.filter(d => d.id !== id));
  }, []);

  const totalMb = downloads.reduce((sum, d) => sum + d.sizeMb, 0);

  return { downloads, isDownloaded, isDownloading, download, remove, totalMb };
}
