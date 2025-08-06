"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { BaseInput } from "@/components/BaseInput";
import { MovieCard } from "@/app/components/MovieCard";
import Link from "next/link";
export default function Home() {
	const [searchValue, setSearchValue] = useState("");
	const [movies, setMovies] = useState<
		{
			id: string;
			title: string;
			type: string;
			description: string;
			poster_path: string;
			vote_average: number;
		}[]
	>([]); // Updated type definition to include 'vote_average'
	const [filteredMovies, setFilteredMovies] = useState<
		{
			id: string;
			title: string;
			type: string;
			description: string;
			poster_path: string;
			vote_average: number;
		}[]
	>([]); // Updated type definition to include 'vote_average'
	const [filterValue, setFilterValue] = useState("All");
	const filters = ["All", "Movies", "TV Shows"];
	useEffect(() => {
		 fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/list`)
			.then((response) => response.json())
			.then((data) => {
				console.log("Fetched movies:", data); // Log movies data to console
				setMovies(data);
			})
			.catch((error) => console.error("Error fetching movies:", error));
	}, []);

	useEffect(() => {
		if (searchValue) {
			const lowerCaseSearch = searchValue.toLowerCase();
			const filtered = movies.filter((movie) =>
				movie.title.toLowerCase().includes(lowerCaseSearch)
			);
			setFilteredMovies(filtered);
		} else {
			setFilteredMovies(movies);
		}
	}, [searchValue, movies]);

	return (
		<>
			<main className="container mainContainer">
				<Navbar />
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
						value={searchValue}
						onChange={(e) => setSearchValue(e.target.value)}
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
					<div>
						{filterValue !== "All" && (
							<p className="filterDescription">
								Showing {filterValue} only (
								{
									movies.filter((movie) =>
										filterValue === "All"
											? true
											: movie.type === filterValue.toLowerCase()
									).length
								}
								)
							</p>
						)}
						<span className="filterTitle">All</span>{" "}
						<span className="filteredLength">({movies.length})</span>
					</div>
					<div className="moviesList">
						{filteredMovies
							.filter((movie) =>
								filterValue === "All"
									? true
									: movie.type === filterValue.toLowerCase()
							)
							.map((movie) => (
								<Link
									href={`/movie/${movie.id}`}
									key={movie.id}
									className="movieCardLink"
								>
									<MovieCard
										key={movie.id}
										title={movie.title}
										description={
											movie.description || "No description available"
										} // Added 'description' property
										posterPath={movie.poster_path}
										rating={movie.vote_average}
										variant="default"
									/>
								</Link>
							))}
					</div>
				</section>
			</main>
		</>
	);
}
