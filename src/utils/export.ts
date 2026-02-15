import { MediaItem } from "@/app/context/MovieContext";

export const exportUtils = {
  /**
   * Export media items as JSON
   */
  toJSON: (items: MediaItem[], filterType: "all" | "movies" | "series" = "all"): void => {
    const filtered =
      filterType === "all"
        ? items
        : items.filter((item) =>
            filterType === "movies" ? item.type === "movie" : item.type === "tv"
          );

    const json = JSON.stringify(filtered, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `media-tracker-${filterType}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * Export media items as CSV
   */
  toCSV: (items: MediaItem[], filterType: "all" | "movies" | "series" = "all"): void => {
    const filtered =
      filterType === "all"
        ? items
        : items.filter((item) =>
            filterType === "movies" ? item.type === "movie" : item.type === "tv"
          );

    const headers = ["title", "type", "status", "rating", "releaseDate", "addedAt"];
    const rows = filtered.map((item) => [
      `"${item.title.replace(/"/g, '""')}"`, // Escape quotes in title
      item.type,
      item.status,
      item.rating ?? "",
      item.releaseDate ?? "",
      item.addedAt,
    ]);

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `media-tracker-${filterType}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};
