"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Movie } from "@/types/Movie";
import Image from "next/image";
import Styles from "./style.module.css";
import { RatingButton } from "@/app/components/RatingButton";

export default function SuggestMePage() {
	const [movie, setMovie] = useState<Movie | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [diceRotate, setDiceRotate] = useState<boolean>(false);

	const fetchRandomMovie = async () => {
		setLoading(true);
		setError(null);
		setDiceRotate(true); // animasyonu başlat
		try {
			const res = await fetch("/api/list");

			if (!res.ok) throw new Error("API Error");

			const data: Movie[] = await res.json();

			if (!Array.isArray(data) || data.length === 0)
				throw new Error("No movies found");

			const randomIndex = Math.floor(Math.random() * data.length);
			setMovie(data[randomIndex]);
		} catch (err) {
			setError((err as Error).message);
		} finally {
			setLoading(false);
			// animasyonun tamamlanmasına zaman tanı (400ms)
			setTimeout(() => setDiceRotate(false), 400);
		}
	};

	useEffect(() => {
		fetchRandomMovie();
	}, []);

	return (
		<div className="container">
			<Navbar />
			<main className={Styles.suggestMeContainer}>
				<h1 className={Styles.pageTitle}>Random Film Suggestion</h1>
				{loading && <p>Loading...</p>}
				{error && <p>Error: {error}</p>}

				{movie && (
					<div className={Styles.movieCard}>
						<Image
							src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
							alt={movie.title}
							width={300}
							height={450}
							className={Styles.moviePoster}
						/>
						<h2 className={Styles.movieTitle}>{movie.title}</h2>
						<p className={Styles.movieOverview}>{movie.overview}</p>
						<RatingButton rating={movie.vote_average} />
					</div>
				)}

				<button className={Styles.refreshButton} onClick={fetchRandomMovie}>
					<span
						className={`${Styles.diceIcon} ${
							diceRotate ? Styles.rotate : ""
						}`}
					>
						🎲
					</span>
					Suggest Another
				</button>
			</main>
		</div>
	);
}
