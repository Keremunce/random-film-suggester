import type { Metadata } from "next";
import "./globals.css";
import { MovieProvider } from "./context/MovieContext";

import { Poppins, Raleway, Roboto } from "next/font/google";

const poppins = Poppins({
	weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
	subsets: ["latin"],
	variable: "--font-poppins",
});

export const metadata: Metadata = {
	title: "Random Film Suggester",
	description: "Discover random movies with ease!",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" data-theme="dark" className={`${poppins.variable}`}>
			<body className="bg-gray-900 text-white">
				<MovieProvider>{children}</MovieProvider>
			</body>
		</html>
	);
}
