"use client";
import { useEffect, useState } from "react";
import { use } from "react";
import Styles from "./style.module.css";
import { RatingButton } from "@/app/components/RatingButton";
import Navbar from "@/components/Navbar";

type MovieDetailProps = {
	params: {
		id: string;
	};
};

export default function MovieDetail({ params }: MovieDetailProps) {
	const [movie, setMovie] = useState(null);
	const { id } = use(params);

	useEffect(() => {
		fetch("/api/list")
			.then((response) => response.json())
			.then((data) => {
				data.forEach((item) => {
					if (item.id == id) {
						setMovie(item);
					}
				});
			})
			.catch((error) => console.error("Error fetching movies:", error));
	}, [id]);

	if (!movie) {
		return <p>Loading...</p>;
	}

	return (
		<div className="container">
            <Navbar></Navbar>
			<main className={Styles.movieDetailContainer}>
				<div className={Styles.moviePosterContainer}>
					<img
						src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
						alt={movie.title}
						className={Styles.moviePoster}
					/>
				</div>
				<div className={Styles.movieContentContainer}>
					<div>
						<h1 className={Styles.movieTitle}>{movie.title}</h1>
					</div>
					<div>
						<p className={Styles.movieOverview}>{movie.overview}</p>
					</div>
					<div className={Styles.ratingContainer}>
						<RatingButton rating={movie.vote_average}></RatingButton>
					</div>

					<div className={Styles.subContentContainer}>
						<p className={Styles.subTitle}>Release Date:</p>
						<p className={Styles.movieReleaseDate}>{movie.release_date}</p>
					</div>
					<div className={Styles.subContentContainer}>
						<p className={Styles.subTitle}>Rating:</p>
						<p className={Styles.movieVoteAverage}>{movie.vote_average}</p>
					</div>
					<div className={Styles.subContentContainer}>
						<p className={Styles.subTitle}>Vote Count:</p>
						<p className={Styles.movieVoteCount}>{movie.vote_count}</p>
					</div>
					<div className={Styles.subContentContainer}>
						<p className={Styles.subTitle}>Popularity:</p>
						<p className={Styles.moviePopularity}>{movie.popularity}</p>
					</div>
					<div className={Styles.subContentContainer}>
						<p className={Styles.subTitle}>Language:</p>
						<p className={Styles.movieOriginalLanguage}>
							{movie.original_language}
						</p>
					</div>
					<div className={Styles.subContentContainer}>
						<p className={Styles.subTitle}>Adult Content:</p>
						<p className={Styles.movieAdult}>{movie.adult ? "Yes" : "No"}</p>
					</div>
				</div>
			</main>
		</div>
	);
}
