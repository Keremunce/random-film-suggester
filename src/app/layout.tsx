import type { Metadata } from "next";
import "./globals.css";
import { MovieProvider } from "./context/MovieContext";
import { Navigation } from "@/components/Navigation";

export const metadata: Metadata = {
	title: "Media Tracker",
	description: "Your personal movie and TV series tracker",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body>
				<MovieProvider>
					<Navigation />
					{children}
				</MovieProvider>
			</body>
		</html>
	);
}
