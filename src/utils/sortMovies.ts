import { MediaItem } from "@/app/context/MovieContext";

const toTime = (value: string | null | undefined): number | null => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.getTime();
};

export const sortByRecentlyAdded = (items: MediaItem[]): MediaItem[] => {
  return [...items].sort((a, b) => {
    const aTime = toTime(a.addedAt);
    const bTime = toTime(b.addedAt);
    if (aTime === null && bTime === null) return 0;
    if (aTime === null) return 1;
    if (bTime === null) return -1;
    return bTime - aTime;
  });
};

export const sortByOldestAdded = (items: MediaItem[]): MediaItem[] => {
  return [...items].sort((a, b) => {
    const aTime = toTime(a.addedAt);
    const bTime = toTime(b.addedAt);
    if (aTime === null && bTime === null) return 0;
    if (aTime === null) return 1;
    if (bTime === null) return -1;
    return aTime - bTime;
  });
};

export const sortByReleaseNewest = (items: MediaItem[]): MediaItem[] => {
  return [...items].sort((a, b) => {
    const aTime = toTime(a.releaseDate);
    const bTime = toTime(b.releaseDate);
    if (aTime === null && bTime === null) return 0;
    if (aTime === null) return 1;
    if (bTime === null) return -1;
    return bTime - aTime;
  });
};

export const sortByReleaseOldest = (items: MediaItem[]): MediaItem[] => {
  return [...items].sort((a, b) => {
    const aTime = toTime(a.releaseDate);
    const bTime = toTime(b.releaseDate);
    if (aTime === null && bTime === null) return 0;
    if (aTime === null) return 1;
    if (bTime === null) return -1;
    return aTime - bTime;
  });
};
