"use client";

import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MovieContext, MediaItem } from "@/app/context/MovieContext";
import styles from "./style.module.css";

const POSTER_BASE = "https://image.tmdb.org/t/p/w342";

export default function SuggestMePage() {
	const context = useContext(MovieContext);
	if (!context) throw new Error("MovieContext not found");

	const { state } = context;
	const watchedItems = useMemo(
		() => state.items.filter((item) => item.status === "watched"),
		[state.items],
	);
	const [suggestion, setSuggestion] = useState<MediaItem | null>(null);
	const [spin, setSpin] = useState(false);

	const pickRandom = useCallback(() => {
		if (watchedItems.length === 0) {
			setSuggestion(null);
			return;
		}
		const next =
			watchedItems[Math.floor(Math.random() * watchedItems.length)];
		setSuggestion(next);
	}, [watchedItems]);

	useEffect(() => {
		pickRandom();
	}, [pickRandom]);

	return (
		<div className={styles.page}>
			<div className={styles.header}>
				<h1>Suggest Me</h1>
				<p>Pick a random title from your watched list</p>
			</div>

			{!suggestion && (
				<div className={styles.empty}>
					<p>No watched items yet.</p>
					<Link href="/search" className={styles.link}>
						Search movies & series
					</Link>
				</div>
			)}

			{suggestion && (
				<div className={styles.card}>
					<div className={styles.poster}>
						<Image
							src={
								suggestion.posterPath
									? `${POSTER_BASE}${suggestion.posterPath}`
									: "https://via.placeholder.com/342x513?text=No+Poster"
							}
							alt={suggestion.title}
							width={342}
							height={513}
							className={styles.posterImage}
						/>
					</div>
					<div className={styles.info}>
						<p className={styles.kicker}>
							{suggestion.type === "movie" ? "Movie" : "Series"}
						</p>
						<h2 className={styles.title}>{suggestion.title}</h2>
						<p className={styles.meta}>
							{suggestion.releaseDate
								? new Date(suggestion.releaseDate).getFullYear()
								: "N/A"}
						</p>
						<div className={styles.actions}>
							<button
								type="button"
								className={styles.refreshButton}
								onClick={() => {
									setSpin(true);
									pickRandom();
									setTimeout(() => setSpin(false), 400);
								}}
							>
								<span className={`${styles.diceIcon} ${spin ? styles.rotate : ""}`}>
									🎲
								</span>
								Suggest another
							</button>
							<Link
								href={`/movie/${suggestion.tmdbId}`}
								className={styles.detailLink}
							>
								Open detail
							</Link>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
