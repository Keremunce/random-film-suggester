"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SuggestMePage() {
	const router = useRouter();

	useEffect(() => {
		// Redirect to home page - this feature not part of MVP
		router.push("/");
	}, [router]);

	return (
		<div style={{ textAlign: "center", padding: "2rem" }}>
			<p>Loading...</p>
		</div>
	);
}
