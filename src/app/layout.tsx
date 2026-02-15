import type { Metadata } from "next";
import "./globals.css";
import { MovieProvider } from "./context/MovieContext";
import { Navigation } from "@/components/Navigation";

import { Poppins } from "next/font/google";

const poppins = Poppins({
	weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
	subsets: ["latin"],
	variable: "--font-poppins",
});

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
		<html lang="en" className={`${poppins.variable}`}>
			<body>
				<MovieProvider>
					<Navigation />
					{children}
				</MovieProvider>
			</body>
		</html>
	);
}
