"use client";
import Navbar from "@/components/Navbar";
import {BaseInput} from "@/components/BaseInput";
import {BaseButton} from "@/components/BaseButton";
import { RatingButton } from './components/RatingButton';
import { MovieCard } from './components/MovieCard';

export default function Home() {
	return (
		<main className="p-8">
			<Navbar></Navbar>
			<BaseInput variant="search" size="lg"  idFor="baseinput2" label="Search Movies or TV Shows" iconPath="/icons/search-normal.svg" placeholder="Quentin Tarantino Movies"></BaseInput>
			<BaseButton value="button"></BaseButton>
			<RatingButton rating={8}></RatingButton>
			<MovieCard></MovieCard>
		</main>
	);
}