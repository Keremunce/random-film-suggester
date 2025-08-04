"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { BaseInput } from "@/components/BaseInput";
import { BaseButton } from "@/components/BaseButton";
import { RatingButton } from "./components/RatingButton";
import { MovieCard } from "./components/MovieCard";

export default function Home() {
    const [movies, setMovies] = useState([]);

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
        <main className="p-8">
            <Navbar />
            <BaseInput
                variant="search"
                size="lg"
                idFor="baseinput2"
                label="Search Movies or TV Shows"
                iconPath="/icons/search-normal.svg"
                placeholder="Quentin Tarantino Movies"
            />
			<div className="my-4"></div>
        </main>
    );
}