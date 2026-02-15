import { MediaItem } from "@/app/context/MovieContext";

const STORAGE_KEY = "rfs_media_items";

export const storageUtils = {
  saveData: (items: MediaItem[]): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error("Failed to save to localStorage", err);
    }
  },

  loadData: (): MediaItem[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as MediaItem[];
    } catch (err) {
      console.error("Failed to load from localStorage", err);
      return [];
    }
  },

  clear: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error("Failed to clear localStorage", err);
    }
  },
};
