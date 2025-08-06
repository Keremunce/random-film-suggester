import { NextResponse } from "next/server";

const BASE_URL = "https://api.themoviedb.org/3";

export async function GET() {
	try {
		const res = await fetch(
			`${BASE_URL}/movie/popular?api_key=${process.env.TMDB_API_KEY}&language=en-US&page=1`,
			{ cache: "no-store" }
		);

		if (!res.ok) throw new Error("TMDB API error");

		const data = await res.json();
		return NextResponse.json(data.results); // sadece results kısmını döndürüyoruz
	} catch {
		return NextResponse.json(
			{ error: "Failed to fetch movie list" },
			{ status: 500 }
		);
	}
}
