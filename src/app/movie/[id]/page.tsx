import Navbar from "@/components/Navbar";
import { RatingButton } from "@/app/components/RatingButton";
import Image from "next/image";
import Styles from "./style.module.css";

type MovieDetailParams = Promise<{ id: string }>;
type Movie = {
	adult: boolean;
	backdrop_path: string;
	genre_ids: number[];
	id: number;
	original_language: string;
	original_title: string;
	overview: string;
	popularity: number;
	poster_path: string;
	release_date: string;
	title: string;
	video: boolean;
	vote_average: number;
	vote_count: number;
};

export default async function MovieDetail({
	params,
}: {
	params: MovieDetailParams;
}) {
	const { id } = await params;

	const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/list`);
	const data = await res.json();
	const movie = data.find((item: Movie) => item.id == Number(id));
	console.log(data);
	if (!movie) {
		return (
			<div className="container">
				<Navbar />
				<main className={Styles.movieDetailContainer}>
					<p>Movie not found.</p>
				</main>
			</div>
		);
	}

	return (
		<div className="container">
			<Navbar />
			<main className={Styles.movieDetailContainer}>
				<div className={Styles.moviePosterContainer}>
					<Image
						src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
						alt={movie.title}
						className={Styles.moviePoster}
						width={500}
						height={750}
					/>
				</div>
				<div className={Styles.movieContentContainer}>
					<h1 className={Styles.movieTitle}>{movie.title}</h1>
					<p className={Styles.movieOverview}>{movie.overview}</p>
					<div className={Styles.ratingContainer}>
						<RatingButton rating={movie.vote_average} />
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
