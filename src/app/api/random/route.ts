import { NextResponse } from "next/server";

const BASE_URL = "https://api.themoviedb.org/3";

export async function GET() {
	try {
		// 1-50 sayfa arası random film sayfası seçelim
		const randomPage = Math.floor(Math.random() * 50) + 1;

		// TMDB Discover endpoint
		const res = await fetch(
			`${BASE_URL}/discover/movie?api_key=${process.env.TMDB_API_KEY}&sort_by=popularity.desc&page=${randomPage}`,
			{ cache: "no-store" } // cache istemiyoruz ki hep random gelsin
		);

		if (!res.ok) throw new Error("TMDB API error");

		const data = await res.json();

		// İçinden random bir film alalım
		const randomMovie =
			data.results[Math.floor(Math.random() * data.results.length)];

		return NextResponse.json(randomMovie);
	} catch (error) {
		return NextResponse.json(
			{ error: "Failed to fetch movie" },
			{ status: 500 }
		);
	}
}
