"use client";

import React, { useContext, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { MovieContext } from "@/app/context/MovieContext";
import { StarRating } from "@/components/StarRating";
import styles from "./style.module.css";

type MediaDetail = {
	tmdbId: number;
	type: "movie" | "tv";
	title: string;
	posterPath: string | null;
	backdropPath: string | null;
	releaseDate: string | null;
	overview: string | null;
	runtime: number | null;
	genres: string[];
	voteAverage: number | null;
	creators: string[];
};

const POSTER_BASE = "https://image.tmdb.org/t/p/w500";
const BACKDROP_BASE = "https://image.tmdb.org/t/p/w1280";

const generateId = () =>
	`${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export default function MovieDetail() {
	const params = useParams<{ id: string }>();
	const context = useContext(MovieContext);
	if (!context) throw new Error("MovieContext not found");

	const { state, dispatch } = context;
	const [detail, setDetail] = useState<MediaDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;

		const loadDetail = async () => {
			try {
				setLoading(true);
				setError(null);
				const res = await fetch(`/api/media/${params.id}`);
				if (!res.ok) throw new Error("Failed to load detail");
				const data = (await res.json()) as MediaDetail;
				if (!isMounted) return;
				setDetail(data);
			} catch (err) {
				if (!isMounted) return;
				setError("Failed to load details. Please try again.");
			} finally {
				if (!isMounted) return;
				setLoading(false);
			}
		};

		loadDetail();
		return () => {
			isMounted = false;
		};
	}, [params.id]);

	const existing = useMemo(() => {
		if (!detail) return undefined;
		return state.items.find((item) => item.tmdbId === detail.tmdbId);
	}, [detail, state.items]);

	const handleAdd = (status: "watchlist" | "watched") => {
		if (!detail) return;
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
				tmdbId: detail.tmdbId,
				type: detail.type,
				title: detail.title,
				posterPath: detail.posterPath,
				releaseDate: detail.releaseDate,
				status,
				rating: null,
				addedAt: new Date().toISOString(),
			},
		});
	};

	const handleRating = (rating: number | null) => {
		if (!existing) return;
		dispatch({ type: "UPDATE_ITEM", payload: { ...existing, rating } });
	};

	const isWatchlist = existing?.status === "watchlist";
	const isWatched = existing?.status === "watched";

	if (loading) {
		return <div className={styles.state}>Loading...</div>;
	}

	if (error || !detail) {
		return <div className={styles.state}>{error ?? "Not found."}</div>;
	}

	const posterUrl = detail.posterPath
		? `${POSTER_BASE}${detail.posterPath}`
		: "https://via.placeholder.com/500x750?text=No+Poster";
	const backdropUrl = detail.backdropPath
		? `${BACKDROP_BASE}${detail.backdropPath}`
		: null;

	const year = detail.releaseDate
		? new Date(detail.releaseDate).getFullYear()
		: "N/A";

	return (
		<div className={styles.page}>
			{backdropUrl && (
				<div
					className={styles.backdrop}
					style={{ backgroundImage: `url(${backdropUrl})` }}
					aria-hidden="true"
				/>
			)}

			<div className={styles.content}>
				<div className={styles.poster}>
					<img src={posterUrl} alt={detail.title} />
				</div>

				<div className={styles.info}>
					<div className={styles.header}>
						<div>
							<p className={styles.kicker}>
								{detail.type === "movie" ? "Movie" : "Series"}
							</p>
							<h1 className={styles.title}>{detail.title}</h1>
							<p className={styles.meta}>
								<span>{year}</span>
								{detail.runtime ? <span>• {detail.runtime} min</span> : null}
								{detail.voteAverage ? (
									<span>• {detail.voteAverage.toFixed(1)}</span>
								) : null}
							</p>
						</div>
						<div className={styles.actions}>
							<button
								type="button"
								className={`${styles.actionButton} ${
									isWatchlist ? styles.active : ""
								}`}
								onClick={() => handleAdd("watchlist")}
							>
								{isWatchlist ? "Remove from Watchlist" : "Save to Watchlist"}
							</button>
							<button
								type="button"
								className={`${styles.actionButton} ${styles.secondary} ${
									isWatched ? styles.active : ""
								}`}
								onClick={() => handleAdd("watched")}
							>
								{isWatched ? "Remove from Watched" : "Mark as Watched"}
							</button>
						</div>
					</div>

					{detail.overview && (
						<p className={styles.overview}>{detail.overview}</p>
					)}

					{detail.genres.length > 0 && (
						<div className={styles.genres}>
							{detail.genres.map((genre) => (
								<span key={genre} className={styles.genrePill}>
									{genre}
								</span>
							))}
						</div>
					)}

					{detail.creators.length > 0 && (
						<p className={styles.creators}>
							<span className={styles.label}>
								{detail.type === "movie" ? "Director" : "Creators"}:
							</span>{" "}
							{detail.creators.join(", ")}
						</p>
					)}

					<div className={styles.ratingBlock}>
						<p className={styles.label}>Your Rating</p>
						{existing ? (
							<StarRating value={existing.rating} onChange={handleRating} />
						) : (
							<p className={styles.hint}>
								Save this item to rate it.
							</p>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
