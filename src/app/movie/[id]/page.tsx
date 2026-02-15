"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MovieDetail() {
	const router = useRouter();

	useEffect(() => {
		// Redirect to home page - detail view not part of MVP
		router.push("/");
	}, [router]);

	return (
		<div style={{ textAlign: "center", padding: "2rem" }}>
			<p>Loading...</p>
		</div>
	);
}
