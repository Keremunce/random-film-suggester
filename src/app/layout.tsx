import type { Metadata } from "next";
import "./globals.css";
import { MovieProvider } from "./context/MovieContext";

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
    <html lang="en" data-theme="dark">
      <body className="bg-gray-900 text-white">
        <MovieProvider>
          {children}
        </MovieProvider>
      </body>
    </html>
  );
}