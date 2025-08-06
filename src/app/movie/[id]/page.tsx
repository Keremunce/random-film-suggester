"use client";
import { useEffect, useState } from "react";
import { use } from "react";

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
		<main className="movieDetailContainer">
			<h1 className="movieTitle">{movie.title}</h1>
			<img
				src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
				alt={movie.title}
				className="moviePoster"
			/>
			<p className="movieOverview">{movie.overview}</p>
			<p className="movieReleaseDate">Release Date: {movie.release_date}</p>
			<p className="movieVoteAverage">Rating: {movie.vote_average}</p>
			<p className="movieVoteCount">Vote Count: {movie.vote_count}</p>
			<p className="moviePopularity">Popularity: {movie.popularity}</p>
			<p className="movieOriginalLanguage">Language: {movie.original_language}</p>
			<p className="movieAdult">Adult Content: {movie.adult ? "Yes" : "No"}</p>
		</main>
	);
}
