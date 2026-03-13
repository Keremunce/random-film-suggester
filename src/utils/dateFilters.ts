const parseReleaseDate = (releaseDate: string | null): Date | null => {
  if (!releaseDate) return null;
  const parsed = new Date(releaseDate);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

const normalizeToLocalDay = (date: Date): Date => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

export const isUpcomingMovie = (releaseDate: string | null): boolean => {
  const parsed = parseReleaseDate(releaseDate);
  if (!parsed) return false;
  const today = normalizeToLocalDay(new Date());
  const releaseDay = normalizeToLocalDay(parsed);
  return releaseDay.getTime() > today.getTime();
};

export const isReleasedThisYear = (releaseDate: string | null): boolean => {
  const parsed = parseReleaseDate(releaseDate);
  if (!parsed) return false;
  return parsed.getFullYear() === new Date().getFullYear();
};
