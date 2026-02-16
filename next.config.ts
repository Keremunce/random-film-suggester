import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "image.tmdb.org",
				port: "",
				pathname: "/t/p/**",
			},
			{
				protocol: "https",
				hostname: "via.placeholder.com",
				port: "",
				pathname: "/**",
			},
		],
	},
	reactStrictMode: true,
	// Eğer Turbopack kullanıyorsan, aşağıdaki alias bölümü açılmalı
	turbopack: {
		resolveAlias: {
			"@/components": "./src/components",
			"@/lib": "./src/lib",
			"@/context": "./src/context",
			"@": "./src",
		},
	},
	// Webpack (sonradan Turbopack devreye girmezse)
	webpack(config) {
		config.resolve.alias = {
			...config.resolve.alias,
			"@": path.resolve(__dirname, "src"),
			"@/components": path.resolve(__dirname, "src/components"),
			"@/lib": path.resolve(__dirname, "src/lib"),
			"@/context": path.resolve(__dirname, "src/context"),
		};
		return config;
	},
};

export default nextConfig;
