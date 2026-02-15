import { MediaItem } from "@/app/context/MovieContext";

export type StatusFilter = "all" | "watched" | "watchlist";
export type TypeFilter = "all" | "movie" | "tv";

export const filterUtils = {
  /**
   * Filter media items by status and type
   */
  filter: (
    items: MediaItem[],
    statusFilter: StatusFilter = "all",
    typeFilter: TypeFilter = "all"
  ): MediaItem[] => {
    return items.filter((item) => {
      const statusMatch =
        statusFilter === "all" || item.status === statusFilter;
      const typeMatch =
        typeFilter === "all" || item.type === typeFilter;
      return statusMatch && typeMatch;
    });
  },
};
