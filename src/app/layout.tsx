import type { Metadata } from "next";
import "./globals.css";
import { MovieProvider } from "./context/MovieContext";
import { Navigation } from "@/components/Navigation";

export const metadata: Metadata = {
	title: "Media Tracker",
	description: "Your personal movie and TV series tracker",
	manifest: "favicon/site.webmanifest",
	icons: {
		icon: [
			{ url: "favicon/favicon.ico" },
			{ url: "favicon/favicon.svg", type: "image/svg+xml" },
			{
				url: "favicon/favicon-96x96.png",
				sizes: "96x96",
				type: "image/png",
			},
		],
		apple: [{ url: "favicon/apple-touch-icon.png", sizes: "180x180" }],
	},
};

export const viewport = {
	themeColor: "#ffffff",
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
