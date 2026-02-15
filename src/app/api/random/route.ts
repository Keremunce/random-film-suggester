import { NextResponse } from "next/server";

const BASE_URL = "https://api.themoviedb.org/3";

export async function GET() {
	try {
		const apiKey = process.env.TMDB_API_KEY;
		if (!apiKey) {
			return NextResponse.json(
				{ error: "TMDB API key is missing. Set TMDB_API_KEY in env." },
				{ status: 500 }
			);
		}

		// 1-50 sayfa arası random film sayfası seçelim
		const randomPage = Math.floor(Math.random() * 50) + 1;

		// TMDB Discover endpoint
		const res = await fetch(
			`${BASE_URL}/discover/movie?api_key=${apiKey}&sort_by=popularity.desc&page=${randomPage}`,
			{ cache: "no-store" } // cache istemiyoruz ki hep random gelsin
		);

		if (!res.ok) {
			const errorText = await res.text();
			throw new Error(`TMDB API error: ${res.status} - ${errorText}`);
		}

		const data = await res.json();

		// İçinden random bir film alalım
		const randomMovie =
			data.results[Math.floor(Math.random() * data.results.length)];

		return NextResponse.json(randomMovie);
	} catch (err) {
		const message = err instanceof Error ? err.message : "Unknown error";
		return NextResponse.json({ error: `Failed to fetch movie: ${message}` }, { status: 500 });
	}
}
