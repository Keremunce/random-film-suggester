"use client";

import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { MovieContext } from "@/app/context/MovieContext";
import { SegmentedControl } from "@/components/SegmentedControl";
import styles from "./page.module.css";
import { FiBookmark, FiEye, FiStar } from "react-icons/fi";

type LatestItem = {
	tmdbId: number;
	type: "movie" | "tv";
	title: string;
	posterPath: string | null;
	releaseDate: string | null;
	voteAverage: number | null;
};

type SearchItem = LatestItem & {
	overview?: string | null;
	voteAverage?: number | null;
};

const generateId = () =>
	`${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export default function HomePage() {
	const context = useContext(MovieContext);
	if (!context) throw new Error("MovieContext not found");

	const { state, dispatch } = context;
	const [heroQuery, setHeroQuery] = useState("");
	const [latestFilter, setLatestFilter] = useState<"movie" | "tv">("movie");
	const [latestData, setLatestData] = useState<{
		movies: LatestItem[];
		series: LatestItem[];
	} | null>(null);
	const [latestLoading, setLatestLoading] = useState(true);
	const [latestError, setLatestError] = useState<string | null>(null);
	const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
	const [searchLoading, setSearchLoading] = useState(false);
	const [searchError, setSearchError] = useState<string | null>(null);
	const debounceTimer = useRef<NodeJS.Timeout | null>(null);
	const searchWrapRef = useRef<HTMLDivElement | null>(null);
	const stickyTriggerRef = useRef<number | null>(null);
	const searchDockRef = useRef<{ left: number; width: number; top: number }>({
		left: 0,
		width: 0,
		top: 0,
	});
	const [isSearchSticky, setIsSearchSticky] = useState(false);
	const [searchHeight, setSearchHeight] = useState<number | null>(null);
	const [searchDock, setSearchDock] = useState<{ left: number; width: number; top: number }>({
		left: 0,
		width: 0,
		top: 0,
	});

	const stats = {
		total: state.items.length,
		watched: state.items.filter((i) => i.status === "watched").length,
		watchlist: state.items.filter((i) => i.status === "watchlist").length,
	};

	useEffect(() => {
		let isMounted = true;
		const loadLatest = async () => {
			try {
				setLatestLoading(true);
				setLatestError(null);
				const res = await fetch("/api/latest");
				if (!res.ok) throw new Error("Failed to load latest list");
				const data = await res.json();
				if (!isMounted) return;
				setLatestData(data);
			} catch (err) {
				if (!isMounted) return;
				setLatestError("Failed to load new releases.");
				setLatestData({ movies: [], series: [] });
			} finally {
				if (!isMounted) return;
				setLatestLoading(false);
			}
		};

		loadLatest();
		return () => {
			isMounted = false;
		};
	}, []);

	useEffect(() => {
		if (debounceTimer.current) clearTimeout(debounceTimer.current);
		const query = heroQuery.trim();

		if (!query) {
			setSearchResults([]);
			setSearchError(null);
			setSearchLoading(false);
			return;
		}

		debounceTimer.current = setTimeout(async () => {
			try {
				setSearchLoading(true);
				setSearchError(null);
				const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
				if (!res.ok) throw new Error("Search failed");
				const data = await res.json();
				setSearchResults(data.results || []);
			} catch (err) {
				setSearchError("Failed to search. Please try again.");
				setSearchResults([]);
			} finally {
				setSearchLoading(false);
			}
		}, 300);

		return () => {
			if (debounceTimer.current) clearTimeout(debounceTimer.current);
		};
	}, [heroQuery]);

	useEffect(() => {
		const updateLayout = () => {
			if (!searchWrapRef.current) return;
			const rect = searchWrapRef.current.getBoundingClientRect();
			stickyTriggerRef.current = rect.top + window.scrollY;
			setSearchHeight(Math.ceil(rect.height));
			const nav = document.querySelector("nav");
			const navHeight = nav ? nav.getBoundingClientRect().height : 0;
			const topOffset = navHeight + 12;
			const dock = {
				left: Math.round(rect.left),
				width: Math.round(rect.width),
				top: Math.round(topOffset),
			};
			searchDockRef.current = dock;
			setSearchDock(dock);
		};

		const onScroll = () => {
			const trigger = stickyTriggerRef.current;
			if (trigger === null) return;
			const shouldStick = window.scrollY + searchDockRef.current.top >= trigger;
			setIsSearchSticky(shouldStick);
		};

		updateLayout();
		window.addEventListener("resize", updateLayout);
		window.addEventListener("scroll", onScroll, { passive: true });
		onScroll();

		return () => {
			window.removeEventListener("resize", updateLayout);
			window.removeEventListener("scroll", onScroll);
		};
	}, []);

	const isSearching = heroQuery.trim().length > 0;

	const latestItems = useMemo(() => {
		if (isSearching) {
			const filtered = searchResults.filter(
				(item) => item.type === latestFilter,
			);
			return filtered.slice(0, 20);
		}
		if (!latestData) return [];
		const list =
			latestFilter === "movie" ? latestData.movies : latestData.series;
		return list.slice(0, 20);
	}, [isSearching, latestData, latestFilter, searchResults]);

	const getExistingItem = (tmdbId: number) =>
		state.items.find((item) => item.tmdbId === tmdbId);

	const handleSave = (item: LatestItem, status: "watchlist" | "watched") => {
		const existing = getExistingItem(item.tmdbId);
		if (existing) {
			if (existing.status === status) {
				dispatch({ type: "REMOVE_ITEM", payload: { id: existing.id } });
				return;
			}
			dispatch({ type: "UPDATE_ITEM", payload: { ...existing, status } });
			return;
		}

		dispatch({
			type: "ADD_ITEM",
			payload: {
				id: generateId(),
				tmdbId: item.tmdbId,
				type: item.type,
				title: item.title,
				posterPath: item.posterPath,
				releaseDate: item.releaseDate,
				status,
				rating: null,
				addedAt: new Date().toISOString(),
			},
		});
	};

	const handleToggleWatched = (item: LatestItem) => {
		const existing = getExistingItem(item.tmdbId);
		if (existing) {
			const nextStatus =
				existing.status === "watched" ? "watchlist" : "watched";
			dispatch({ type: "UPDATE_ITEM", payload: { ...existing, status: nextStatus } });
			return;
		}
		handleSave(item, "watched");
	};

	return (
		<div className={styles.page}>
			<div className={styles.hero}>
				<div className={styles.heroContent}>
					<h1 className={styles.heroTitle}>My Watchlist, Your Inspiration</h1>
					<p className={styles.heroSubtitle}>
						Discover all the movies and TV shows I&apos;ve watched so far. Got a
						great recommendation? Don&apos;t keep it to yourself — I&apos;m all
						ears!
					</p>
					<div
						ref={searchWrapRef}
						className={styles.heroSearchWrap}
						style={{
							height: searchHeight ? `${searchHeight}px` : undefined,
							["--search-left" as string]: `${searchDock.left}px`,
							["--search-width" as string]: `${searchDock.width}px`,
							["--search-top" as string]: `${searchDock.top}px`,
						}}
					>
						<div
							role="search"
							className={`${styles.heroSearch} ${
								isSearchSticky ? styles.heroSearchSticky : ""
							}`}
						>
							<label htmlFor="hero-search" className={styles.srOnly}>
								Search movies or series
							</label>
							<input
								id="hero-search"
								type="text"
								placeholder="Search movies or series..."
								value={heroQuery}
								onChange={(e) => setHeroQuery(e.target.value)}
								className={styles.heroSearchInput}
								tabIndex={0}
								aria-label="Search movies or series"
							/>
							<button type="button" className={styles.heroSearchButton}>
								Search
							</button>
						</div>
					</div>
				</div>

				<div className={styles.heroStats}>
					<div className={styles.stat}>
						<div className={styles.number}>{stats.total}</div>
						<div className={styles.label}>Total Items</div>
					</div>
					<div className={styles.stat}>
						<div className={styles.number}>{stats.watched}</div>
						<div className={styles.label}>Watched</div>
					</div>
					<div className={styles.stat}>
						<div className={styles.number}>{stats.watchlist}</div>
						<div className={styles.label}>Watchlist</div>
					</div>
				</div>
			</div>

			<div className={styles.latestSection}>
				<div className={styles.latestHeader}>
					<h2 className={styles.latestTitle}>
						{isSearching ? "Search Results" : "New Releases"}
					</h2>
					<SegmentedControl
						ariaLabel="Filter new releases by type"
						value={latestFilter}
						onChange={setLatestFilter}
						className={styles.latestSegmented}
						stretch
						options={[
							{ value: "movie", label: "Movies" },
							{ value: "tv", label: "Series" },
						]}
					/>
				</div>

				{!isSearching && latestError && (
					<div className={styles.latestError}>{latestError}</div>
				)}
				{!isSearching && latestLoading && (
					<div className={styles.latestLoading}>Loading...</div>
				)}
				{isSearching && searchError && (
					<div className={styles.latestError}>{searchError}</div>
				)}
				{isSearching && searchLoading && (
					<div className={styles.latestLoading}>Searching...</div>
				)}

				{!latestLoading && !searchLoading && (
					<div className={styles.latestGrid}>
						{latestItems.map((item) => {
							console.log(item);
							const existing = getExistingItem(item.tmdbId);
							const isWatchlist = existing?.status === "watchlist";
							const isWatched = existing?.status === "watched";

							return (
								<Link
									key={item.tmdbId}
									href={`/movie/${item.tmdbId}`}
									className={styles.latestCard}
								>
									<div className={styles.cardActions}>
										<button
											type="button"
											className={`${styles.actionButton} ${styles.actionLeft} ${isWatchlist ? styles.actionActive : ""}`}
											title="Add to Watchlist"
											onClick={(e) => {
												e.preventDefault();
												e.stopPropagation();
												handleSave(item, "watchlist");
											}}
										>
											<FiBookmark
												className={styles.actionIcon}
												aria-hidden="true"
											/>
										</button>
										<button
											type="button"
											className={`${styles.actionButton} ${styles.actionRight} ${isWatched ? styles.actionActive : ""}`}
											title="Mark as Watched"
											onClick={(e) => {
												e.preventDefault();
												e.stopPropagation();
												handleToggleWatched(item);
											}}
										>
											<FiEye className={styles.actionIcon} aria-hidden="true" />
											Watched
										</button>
									</div>
									<div className={styles.latestPoster}>
										<img
											src={
												item.posterPath
													? `https://image.tmdb.org/t/p/w342${item.posterPath}`
													: "https://via.placeholder.com/342x513?text=No+Poster"
											}
											alt={item.title}
											loading="lazy"
										/>
									</div>
									<div className={styles.latestInfo}>
										<div className={styles.latestName}>{item.title}</div>
										<div className={styles.latestMeta}>
											<span className={styles.latestRating}>
												<FiStar aria-hidden="true" />
												{typeof item.voteAverage === "number"
													? item.voteAverage.toFixed(1)
													: "N/A"}
											</span>
											<span className={styles.latestYear}>
												{item.releaseDate
													? new Date(item.releaseDate).getFullYear()
													: "N/A"}
											</span>
										</div>
									</div>
								</Link>
							);
						})}
					</div>
				)}
			</div>

			<div className={styles.features}>
				<h2>Features</h2>
				<ul>
					<li>🔎 Search from TMDB database</li>
					<li>⭐ Rate movies and series 1-10 stars</li>
					<li>🏷️ Tag as &quot;Watched&quot; or &quot;Watchlist&quot;</li>
					<li>📊 Filter by status and type</li>
					<li>💾 All data stored locally</li>
					<li>📥 Import/Export JSON & CSV</li>
					<li>📱 Mobile-friendly design</li>
				</ul>
			</div>

			<div className={styles.privacy}>
				<h3>Privacy First</h3>
				<p>
					Your data never leaves your device. No tracking, no backend, no
					authentication required. Full control over your library with export
					and import capabilities.
				</p>
			</div>
		</div>
	);
}
