import { NextResponse } from "next/server";

const BASE_URL = "https://api.themoviedb.org/3";
type TmdbMovie = {
	adult: boolean;
	backdrop_path: string | null;
	genre_ids: number[];
	id: number;
	original_language: string;
	original_title: string;
	overview: string;
	popularity: number;
	poster_path: string | null;
	release_date: string;
	title: string;
	video: boolean;
	vote_average: number;
	vote_count: number;
};

type TmdbMovieResponse = {
	page: number;
	results: TmdbMovie[];
	total_pages: number;
	total_results: number;
};

export async function GET() {
	try {
		const apiKey = process.env.TMDB_API_KEY;
		if (!apiKey) {
			return NextResponse.json(
				{
					error:
						"TMDB API key is missing. Set TMDB_API_KEY in environment variables.",
				},
				{ status: 500 }
			);
		}

		const res = await fetch(
			`${BASE_URL}/movie/popular?api_key=${apiKey}&language=en-US&page=1`,
			{ cache: "no-store" }
		);

		if (!res.ok) {
			const errorText = await res.text();
			return NextResponse.json(
				{ error: `TMDB API error: ${res.status} - ${errorText}` },
				{ status: res.status }
			);
		}

		const data: TmdbMovieResponse = await res.json(); // ✅ Artık tipli
		return NextResponse.json<TmdbMovie[]>(data.results);
	} catch (err) {
		const errorMessage = err instanceof Error ? err.message : "Unknown error";
		return NextResponse.json(
			{ error: `Unexpected server error: ${errorMessage}` },
			{ status: 500 }
		);
	}
}
