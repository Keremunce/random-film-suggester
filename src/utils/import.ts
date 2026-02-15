import { MediaItem } from "@/app/context/MovieContext";

export const importUtils = {
  /**
   * Import JSON file and merge with existing items
   * Avoids duplicates based on tmdbId
   */
  fromJSON: async (file: File): Promise<MediaItem[]> => {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();

        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            const data = JSON.parse(content);

            // Validate structure
            if (!Array.isArray(data)) {
              throw new Error("Invalid file format: expected array");
            }

            // Validate each item has required fields
            const items = data as MediaItem[];
            const isValid = items.every(
              (item) =>
                typeof item.id === "string" &&
                typeof item.tmdbId === "number" &&
                (item.type === "movie" || item.type === "tv") &&
                typeof item.title === "string" &&
                (item.status === "watched" || item.status === "watchlist") &&
                (item.rating === null || typeof item.rating === "number") &&
                typeof item.addedAt === "string"
            );

            if (!isValid) {
              throw new Error("Invalid file structure: missing required fields");
            }

            resolve(items);
          } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to parse JSON";
            reject(new Error(msg));
          }
        };

        reader.onerror = () => {
          reject(new Error("Failed to read file"));
        };

        reader.readAsText(file);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        reject(new Error(msg));
      }
    });
  },
};
