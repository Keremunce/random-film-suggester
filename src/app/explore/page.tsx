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
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { MovieContext } from "@/app/context/MovieContext";
import { SearchResult } from "@/components/SearchResult";
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

type SearchResultData = {
  tmdbId: number;
  type: "movie" | "tv";
  title: string;
  posterPath: string | null;
  releaseDate: string | null;
  overview: string | null;
  voteAverage: number | null;
};

const POSTER_BASE = "https://image.tmdb.org/t/p/w342";

const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

function ExplorePageContent() {
  const context = useContext(MovieContext);
  if (!context) throw new Error("MovieContext not found");

  const { state, dispatch } = context;
  const searchParams = useSearchParams();

  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [releaseYear, setReleaseYear] = useState("");
  const [minVote, setMinVote] = useState("");
  const [sortBy, setSortBy] = useState("popularity.desc");
  const [results, setResults] = useState<MovieItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResultData[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

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
    let isMounted = true;

    const loadResults = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/discover?${queryString}`);
        if (!res.ok) throw new Error("Failed to load discoveries");
        const data = await res.json();
        if (!isMounted) return;
        setResults(data.results || []);
      } catch {
        if (!isMounted) return;
        setError("Failed to load results.");
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    loadResults();
    return () => {
      isMounted = false;
    };
  }, [queryString]);

  const handleToggleGenre = (id: number) => {
    setSelectedGenres((prev) =>
      prev.includes(id) ? prev.filter((genreId) => genreId !== id) : [...prev, id]
    );
  };

  const getExistingItem = (tmdbId: number) =>
    state.items.find((item) => item.tmdbId === tmdbId);

  const handleAddWatchlist = (item: MovieItem) => {
    const existing = getExistingItem(item.tmdbId);
    if (existing) {
      if (existing.status === "watchlist") {
        dispatch({ type: "REMOVE_ITEM", payload: { id: existing.id } });
      } else {
        dispatch({ type: "UPDATE_ITEM", payload: { ...existing, status: "watchlist" } });
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
  };

  const handleAddWatched = (item: MovieItem) => {
    const existing = getExistingItem(item.tmdbId);
    if (existing) {
      if (existing.status === "watched") return;
      dispatch({ type: "UPDATE_ITEM", payload: { ...existing, status: "watched" } });
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
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  useEffect(() => {
    const q = searchParams.get("q") || "";
    setSearchQuery(q);
    if (q.trim()) {
      performSearch(q);
    } else {
      setSearchResults([]);
      setSearchError(null);
    }
  }, [performSearch, searchParams]);

  const formatYear = (date: string | null) =>
    date ? new Date(date).getFullYear() : "N/A";

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
              const existing = getExistingItem(item.tmdbId);
              const isWatched = existing?.status === "watched";
              const isInWatchlist = existing?.status === "watchlist";

              return (
                <SearchResult
                  key={item.tmdbId}
                  tmdbId={item.tmdbId}
                  title={item.title}
                  type={item.type}
                  posterPath={item.posterPath}
                  releaseDate={item.releaseDate}
                  overview={item.overview}
                  voteAverage={item.voteAverage}
                  onAdd={() => {
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
                      return;
                    }
                    if (existing.status !== "watchlist") {
                      dispatch({
                        type: "UPDATE_ITEM",
                        payload: { ...existing, status: "watchlist" },
                      });
                    }
                  }}
                  onAddWatched={() => {
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
                      return;
                    }
                    if (existing.status !== "watched") {
                      dispatch({
                        type: "UPDATE_ITEM",
                        payload: { ...existing, status: "watched" },
                      });
                    }
                  }}
                  isAdded={isInWatchlist}
                  isWatched={isWatched}
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
              const posterUrl = item.posterPath
                ? `${POSTER_BASE}${item.posterPath}`
                : "https://via.placeholder.com/342x513?text=No+Poster";

              return (
                <div key={item.tmdbId} className={styles.card}>
                  <Link href={`/movie/${item.tmdbId}`} className={styles.cardLink}>
                    <div className={styles.cardPoster}>
                      <Image
                        src={posterUrl}
                        alt={item.title}
                        fill
                        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 180px"
                        className={styles.cardPosterImage}
                      />
                    </div>
                    <div className={styles.cardInfo}>
                      <h3>{item.title}</h3>
                      <p>
                        {formatYear(item.releaseDate)}
                        {item.voteAverage ? ` • ${item.voteAverage.toFixed(1)}` : ""}
                      </p>
                    </div>
                  </Link>
                  <div className={styles.cardActions}>
                    <button
                      type="button"
                      className={`${styles.saveButton} ${isSaved ? styles.saved : ""}`}
                      onClick={() => handleAddWatchlist(item)}
                    >
                      {isSaved ? "Saved" : "Watchlist"}
                    </button>
                    <button
                      type="button"
                      className={`${styles.watchedButton} ${isWatched ? styles.watchedActive : ""}`}
                      onClick={() => handleAddWatched(item)}
                      disabled={isWatched}
                    >
                      {isWatched ? "Watched" : "I Watched"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
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
