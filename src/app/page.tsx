"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { BaseInput } from "@/components/BaseInput";
import { MovieCard } from "@/app/components/MovieCard";
export default function Home() {
	const [movies, setMovies] = useState([]);
	const [filterValue, setFilterValue] = useState("All");
	const filters = ["All", "Movies", "TV Shows"];
	useEffect(() => {
		fetch("/api/list")
			.then((response) => response.json())
			.then((data) => {
				console.log("Fetched movies:", data); // Log movies data to console
				setMovies(data);
			})
			.catch((error) => console.error("Error fetching movies:", error));
	}, []);

	return (
		<>
			<Navbar />
			<main className="container mainContainer">
				<section className="heroContainer">
					<h1 className="heroTitle">My Watchlist, Your Inspiration</h1>
					<p className="heroSubtitle">
						Discover all the movies and TV shows I’ve watched so far. Got a
						great recommendation? Don’t keep it to yourself — I’m all ears!
					</p>
				</section>
				<section className="searchContainer">
					<BaseInput
						variant="search"
						size="lg"
						idFor="baseinput2"
						label="Search Movies or TV Shows"
						iconPath="/icons/search-normal.svg"
						placeholder="Quentin Tarantino Movies"
					/>
				</section>
				<section className="movieCardsContainer">
					<div className="filterSelectBox">
						{filters.map((filter) => (
							<div
								key={filter}
								className={`filterOption ${
									filterValue === filter ? "active" : ""
								}`}
								onClick={() => setFilterValue(filter)}
							>
								{filter}
							</div>
						))}
					</div>
					<div className="moviesList">
						{movies
							.filter((movie) =>
								filterValue === "All"
									? true
									: movie.type === filterValue.toLowerCase()
							)
							.map((movie) => (
								<MovieCard
									key={movie.id}
									title={movie.title}
									posterPath={movie.poster_path}
									rating={movie.vote_average}
									variant="default"
								/>
							))}
					</div>
				</section>
			</main>
		</>
	);
}
