"use client";

import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MovieContext } from "@/app/context/MovieContext";
import { DiscoveryCard } from "@/components/DiscoveryCard";
import { SearchResult } from "@/components/SearchResult";
import { MovieDetailSheet } from "@/components/MovieDetailSheet";
import { showToast } from "@/utils/showToast";
import styles from "./style.module.css";

type Genre = {
  id: number;
  name: string;
};

type MovieItem = {
  tmdbId: number;
  type: "movie";
  title: string;
  posterPath: string | null;
  releaseDate: string | null;
  voteAverage: number | null;
};

type DiscoverResponse = {
  results?: MovieItem[];
  total_pages?: number;
};

type ExploreSnapshot = {
  selectedGenres: number[];
  releaseYear: string;
  minVote: string;
  sortBy: string;
  results: MovieItem[];
  page: number;
  totalPages: number;
  queryString: string;
  scrollY: number;
};

type SearchResultData = {
  tmdbId: number;
  type: "movie" | "tv";
  title: string;
  posterPath: string | null;
  releaseDate: string | null;
  overview: string | null;
  voteAverage: number | null;
};

const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const EXPLORE_SNAPSHOT_KEY = "media-tracker:explore-snapshot";

function ExplorePageContent() {
  const context = useContext(MovieContext);
  if (!context) throw new Error("MovieContext not found");

  const { state, dispatch } = context;
  const router = useRouter();
  const searchParams = useSearchParams();

  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [releaseYear, setReleaseYear] = useState("");
  const [minVote, setMinVote] = useState("");
  const [sortBy, setSortBy] = useState("popularity.desc");
  const [results, setResults] = useState<MovieItem[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [stateReady, setStateReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResultData[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastQueryRef = useRef<string | null>(null);
  const resultsRequestIdRef = useRef(0);
  const resultsQueryRef = useRef<string | null>(null);
  const skipResultsFetchRef = useRef(false);
  const scrollYRef = useRef(0);
  const [selectedItem, setSelectedItem] = useState<SearchResultData | null>(null);
  const [pressedId, setPressedId] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadGenres = async () => {
      try {
        const res = await fetch("/api/genres");
        if (!res.ok) throw new Error("Failed to load genres");
        const data = await res.json();
        if (!isMounted) return;
        setGenres(data.genres || []);
      } catch {
        if (!isMounted) return;
        setGenres([]);
      }
    };

    loadGenres();
    return () => {
      isMounted = false;
    };
  }, []);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (selectedGenres.length > 0) {
      params.set("with_genres", selectedGenres.join(","));
    }
    if (releaseYear) {
      params.set("primary_release_year", releaseYear);
    }
    if (minVote) {
      params.set("vote_average_gte", minVote);
    }
    if (sortBy) {
      params.set("sort_by", sortBy);
    }
    return params.toString();
  }, [selectedGenres, releaseYear, minVote, sortBy]);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(EXPLORE_SNAPSHOT_KEY);
      if (saved) {
        const snapshot = JSON.parse(saved) as Partial<ExploreSnapshot>;
        if (
          Array.isArray(snapshot.selectedGenres) &&
          snapshot.selectedGenres.every((genreId) => typeof genreId === "number") &&
          typeof snapshot.releaseYear === "string" &&
          typeof snapshot.minVote === "string" &&
          typeof snapshot.sortBy === "string" &&
          typeof snapshot.scrollY === "number"
        ) {
          const snapshotQuery = new URLSearchParams();
          if (snapshot.selectedGenres.length > 0) {
            snapshotQuery.set("with_genres", snapshot.selectedGenres.join(","));
          }
          if (snapshot.releaseYear) {
            snapshotQuery.set("primary_release_year", snapshot.releaseYear);
          }
          if (snapshot.minVote) {
            snapshotQuery.set("vote_average_gte", snapshot.minVote);
          }
          if (snapshot.sortBy) snapshotQuery.set("sort_by", snapshot.sortBy);

          setSelectedGenres(snapshot.selectedGenres);
          setReleaseYear(snapshot.releaseYear);
          setMinVote(snapshot.minVote);
          setSortBy(snapshot.sortBy);
          scrollYRef.current = snapshot.scrollY;

          if (
            snapshot.queryString === snapshotQuery.toString() &&
            Array.isArray(snapshot.results) &&
            typeof snapshot.page === "number" &&
            Number.isInteger(snapshot.page) &&
            snapshot.page > 0 &&
            typeof snapshot.totalPages === "number" &&
            Number.isInteger(snapshot.totalPages) &&
            snapshot.totalPages >= snapshot.page
          ) {
            setResults(snapshot.results);
            setPage(snapshot.page);
            setTotalPages(snapshot.totalPages);
            setLoading(false);
            setLoadingMore(false);
            resultsQueryRef.current = snapshot.queryString;
            skipResultsFetchRef.current = true;
          }

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              window.scrollTo({ top: scrollYRef.current, behavior: "auto" });
            });
          });
        }
      }
    } catch (snapshotError) {
      console.error("Failed to restore Explore state.", snapshotError);
    }

    setStateReady(true);
  }, []);

  useEffect(() => {
    if (!stateReady) return;

    const snapshot: ExploreSnapshot = {
      selectedGenres,
      releaseYear,
      minVote,
      sortBy,
      results: resultsQueryRef.current === queryString ? results : [],
      page: resultsQueryRef.current === queryString ? page : 0,
      totalPages,
      queryString,
      scrollY: scrollYRef.current,
    };

    try {
      sessionStorage.setItem(EXPLORE_SNAPSHOT_KEY, JSON.stringify(snapshot));
    } catch (snapshotError) {
      console.error("Failed to save Explore state.", snapshotError);
    }
  }, [
    minVote,
    page,
    queryString,
    releaseYear,
    results,
    selectedGenres,
    sortBy,
    stateReady,
    totalPages,
  ]);

  useEffect(() => {
    const saveScrollPosition = () => {
      scrollYRef.current = window.scrollY;
    };

    window.addEventListener("scroll", saveScrollPosition, { passive: true });
    return () => {
      saveScrollPosition();
      try {
        const saved = sessionStorage.getItem(EXPLORE_SNAPSHOT_KEY);
        if (saved) {
          const snapshot = JSON.parse(saved) as Partial<ExploreSnapshot>;
          if (typeof snapshot === "object" && snapshot !== null) {
            sessionStorage.setItem(
              EXPLORE_SNAPSHOT_KEY,
              JSON.stringify({ ...snapshot, scrollY: scrollYRef.current }),
            );
          }
        }
      } catch (snapshotError) {
        console.error("Failed to save Explore scroll position.", snapshotError);
      }
      window.removeEventListener("scroll", saveScrollPosition);
    };
  }, []);

  useEffect(() => {
    if (!stateReady) return;
    if (skipResultsFetchRef.current) {
      skipResultsFetchRef.current = false;
      return;
    }

    let isMounted = true;
    const requestId = ++resultsRequestIdRef.current;

    const loadResults = async () => {
      try {
        setLoading(true);
        setLoadingMore(false);
        resultsQueryRef.current = null;
        setResults([]);
        setPage(0);
        setTotalPages(1);
        setError(null);
        const params = new URLSearchParams(queryString);
        params.set("page", "1");
        const res = await fetch(`/api/discover?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to load discoveries");
        const data = (await res.json()) as DiscoverResponse;
        if (!isMounted || resultsRequestIdRef.current !== requestId) return;
        setResults(data.results || []);
        resultsQueryRef.current = queryString;
        setPage(1);
        setTotalPages(data.total_pages ?? 1);
      } catch {
        if (!isMounted || resultsRequestIdRef.current !== requestId) return;
        setError("Failed to load results.");
      } finally {
        if (!isMounted || resultsRequestIdRef.current !== requestId) return;
        setLoading(false);
      }
    };

    loadResults();
    return () => {
      isMounted = false;
    };
  }, [queryString, stateReady]);

  const handleLoadMore = async () => {
    if (loading || loadingMore || page >= totalPages) return;

    const requestId = resultsRequestIdRef.current;
    const nextPage = page + 1;
    const params = new URLSearchParams(queryString);
    params.set("page", String(nextPage));

    setLoadingMore(true);
    setError(null);
    try {
      const res = await fetch(`/api/discover?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load more discoveries");
      const data = (await res.json()) as DiscoverResponse;
      if (resultsRequestIdRef.current !== requestId) return;

      const nextResults = data.results || [];
      setResults((current) => {
        const seen = new Set(current.map((item) => item.tmdbId));
        return [...current, ...nextResults.filter((item) => !seen.has(item.tmdbId))];
      });
      setPage(nextPage);
      setTotalPages(data.total_pages ?? nextPage);
    } catch {
      if (resultsRequestIdRef.current === requestId) {
        setError("Failed to load more results. Please try again.");
      }
    } finally {
      if (resultsRequestIdRef.current === requestId) setLoadingMore(false);
    }
  };

  const handleToggleGenre = (id: number) => {
    setSelectedGenres((prev) =>
      prev.includes(id) ? prev.filter((genreId) => genreId !== id) : [...prev, id]
    );
  };

  const getExistingItem = (tmdbId: number, type: "movie" | "tv" = "movie") =>
    state.items.find((item) => item.tmdbId === tmdbId && item.type === type);

  const handleAddWatchlist = (item: MovieItem) => {
    const existing = getExistingItem(item.tmdbId, item.type);
    if (existing) {
      if (existing.status === "watchlist") {
        dispatch({ type: "REMOVE_ITEM", payload: { id: existing.id } });
        showToast("Removed from Watchlist");
      } else {
        dispatch({ type: "UPDATE_ITEM", payload: { ...existing, status: "watchlist" } });
        showToast("Added to Watchlist");
      }
      return;
    }

    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: generateId(),
        tmdbId: item.tmdbId,
        type: "movie",
        title: item.title,
        posterPath: item.posterPath,
        releaseDate: item.releaseDate,
        status: "watchlist",
        rating: null,
        addedAt: new Date().toISOString(),
      },
    });
    showToast("Added to Watchlist");
  };

  const handleAddWatched = (item: MovieItem) => {
    const existing = getExistingItem(item.tmdbId, item.type);
    if (existing) {
      if (existing.status === "watched") {
        showToast("Already in your list", "warning");
        return;
      }
      dispatch({ type: "UPDATE_ITEM", payload: { ...existing, status: "watched" } });
      showToast("Marked as Watched");
      return;
    }

    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: generateId(),
        tmdbId: item.tmdbId,
        type: "movie",
        title: item.title,
        posterPath: item.posterPath,
        releaseDate: item.releaseDate,
        status: "watched",
        rating: null,
        addedAt: new Date().toISOString(),
      },
    });
    showToast("Marked as Watched");
  };

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }

    setSearchLoading(true);
    setSearchError(null);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch {
      setSearchError("Failed to search. Please try again.");
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value);
    lastQueryRef.current = value;
    const trimmed = value.trim();
    const nextUrl = trimmed
      ? `/explore?q=${encodeURIComponent(trimmed)}`
      : "/explore";
    router.replace(nextUrl, { scroll: false });
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  useEffect(() => {
    const q = searchParams.get("q") || "";
    if (lastQueryRef.current === q) return;
    lastQueryRef.current = q;
    setSearchQuery(q);
    if (q.trim()) {
      performSearch(q);
    } else {
      setSearchResults([]);
      setSearchError(null);
    }
  }, [performSearch, searchParams]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>Explore</p>
          <h1 className={styles.title}>Find movies by your filters</h1>
        </div>
        <p className={styles.subtitle}>
          Mix and match genres, years, and ratings to discover something new.
        </p>
      </header>

      <section className={styles.searchSection}>
        <div className={styles.searchHeader}>
          <div>
            <h2>Search</h2>
            <p>Find movies and series from TMDB.</p>
          </div>
        </div>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search movies, series..."
            value={searchQuery}
            onChange={(e) => handleSearchInputChange(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {searchError && <div className={styles.error}>{searchError}</div>}
        {searchLoading && <div className={styles.loading}>Searching...</div>}

        {!searchLoading && searchResults.length === 0 && searchQuery && (
          <div className={styles.empty}>No results found.</div>
        )}

        {!searchLoading && !searchQuery && (
          <div className={styles.empty}>Start typing to search</div>
        )}

        {searchResults.length > 0 && (
          <div className={styles.searchResults}>
            {searchResults.map((item) => {
              const existing = getExistingItem(item.tmdbId, item.type);
              const isWatched = existing?.status === "watched";
              const isInWatchlist = existing?.status === "watchlist";

              return (
                <SearchResult
                  key={`${item.type}-${item.tmdbId}`}
                  tmdbId={item.tmdbId}
                  title={item.title}
                  type={item.type}
                  posterPath={item.posterPath}
                  releaseDate={item.releaseDate}
                  overview={item.overview}
                  voteAverage={item.voteAverage}
                  onAdd={() => {
                    setPressedId(item.tmdbId);
                    window.setTimeout(() => setPressedId(null), 120);
                    if (!existing) {
                      dispatch({
                        type: "ADD_ITEM",
                        payload: {
                          id: generateId(),
                          tmdbId: item.tmdbId,
                          type: item.type,
                          title: item.title,
                          posterPath: item.posterPath,
                          releaseDate: item.releaseDate,
                          status: "watchlist",
                          rating: null,
                          addedAt: new Date().toISOString(),
                        },
                      });
                      showToast("Added to Watchlist");
                      return;
                    }
                    if (existing.status === "watchlist") {
                      dispatch({ type: "REMOVE_ITEM", payload: { id: existing.id } });
                      showToast("Removed from Watchlist");
                      return;
                    }
                    dispatch({
                      type: "UPDATE_ITEM",
                      payload: { ...existing, status: "watchlist" },
                    });
                    showToast("Added to Watchlist");
                  }}
                  onAddWatched={() => {
                    setPressedId(item.tmdbId);
                    window.setTimeout(() => setPressedId(null), 120);
                    if (!existing) {
                      dispatch({
                        type: "ADD_ITEM",
                        payload: {
                          id: generateId(),
                          tmdbId: item.tmdbId,
                          type: item.type,
                          title: item.title,
                          posterPath: item.posterPath,
                          releaseDate: item.releaseDate,
                          status: "watched",
                          rating: null,
                          addedAt: new Date().toISOString(),
                        },
                      });
                      showToast("Marked as Watched");
                      return;
                    }
                    if (existing.status === "watched") {
                      showToast("Already in your list", "warning");
                      return;
                    }
                    dispatch({
                      type: "UPDATE_ITEM",
                      payload: { ...existing, status: "watched" },
                    });
                    showToast("Marked as Watched");
                  }}
                  isAdded={isInWatchlist}
                  isWatched={isWatched}
                  onOpenDetail={() => setSelectedItem(item)}
                  isPressed={pressedId === item.tmdbId}
                />
              );
            })}
          </div>
        )}
      </section>

      <section className={styles.filters}>
        <div className={styles.filterBlock}>
          <h3>Genre</h3>
          <div className={styles.genreGrid}>
            {genres.map((genre) => (
              <button
                key={genre.id}
                type="button"
                className={`${styles.genreChip} ${
                  selectedGenres.includes(genre.id) ? styles.active : ""
                }`}
                onClick={() => handleToggleGenre(genre.id)}
              >
                {genre.name}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.filterRow}>
          <label className={styles.filterField}>
            <span>Release Year</span>
            <input
              type="number"
              min="1900"
              max={new Date().getFullYear()}
              value={releaseYear}
              onChange={(e) => setReleaseYear(e.target.value)}
              placeholder="2024"
            />
          </label>

          <label className={styles.filterField}>
            <span>Minimum Vote</span>
            <input
              type="number"
              min="0"
              max="10"
              step="0.5"
              value={minVote}
              onChange={(e) => setMinVote(e.target.value)}
              placeholder="7"
            />
          </label>

          <label className={styles.filterField}>
            <span>Sort By</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="popularity.desc">Popularity</option>
              <option value="vote_average.desc">Rating</option>
            </select>
          </label>
        </div>
      </section>

      <section className={styles.resultsSection}>
        <div className={styles.resultsHeader}>
          <h2>Explore Results</h2>
          <Link href="/" className={styles.backLink}>
            Back to discovery
          </Link>
        </div>

        {error && <div className={styles.error}>{error}</div>}
        {loading && <div className={styles.loading}>Loading...</div>}
        {!loading && results.length === 0 && (
          <div className={styles.empty}>No results found.</div>
        )}

        {!loading && results.length > 0 && (
          <div className={styles.grid}>
            {results.map((item) => {
              const existing = getExistingItem(item.tmdbId);
              const isSaved = existing?.status === "watchlist";
              const isWatched = existing?.status === "watched";

              return (
                <DiscoveryCard
                  key={`${item.type}-${item.tmdbId}`}
                  item={item}
                  isSaved={isSaved}
                  isWatched={isWatched}
                  onOpen={() => router.push(`/detail/${item.type}/${item.tmdbId}`)}
                  onWatchlistAction={() => handleAddWatchlist(item)}
                  onMarkWatched={() => handleAddWatched(item)}
                />
              );
            })}
          </div>
        )}
        {!loading && results.length > 0 && page < totalPages && (
          <div className={styles.loadMoreRow}>
            <button
              type="button"
              className={styles.loadMoreButton}
              onClick={handleLoadMore}
              disabled={loadingMore}
            >
              {loadingMore ? "Loading..." : "Show more"}
            </button>
          </div>
        )}
      </section>

      <MovieDetailSheet
        movie={selectedItem}
        open={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
}

export default function ExplorePage() {
  return (
    <React.Suspense fallback={<div className={styles.loading}>Loading...</div>}>
      <ExplorePageContent />
    </React.Suspense>
  );
}
