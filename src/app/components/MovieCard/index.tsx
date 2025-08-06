import Image from "next/image";
import styles from "./style.module.css";
import { RatingButton } from "@/app/components/RatingButton";

type MovieCardProps = {
	title: string;
	description: string;
	posterPath: string;
	variant?: "default" | "addToMyList" | "alreadyWatched";
	rating: number;
	onClick?: () => void;
};
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";
const size = "w500"; // istediğin kalite

export const MovieCard = ({
	title,
	rating,
	posterPath,
	variant = "default",
	onClick,
}: MovieCardProps) => {
	const variantStyles = {
		default: styles.movieCardDefault,
		addToMyList: styles.movieCardAddToMyList,
		alreadyWatched: styles.movieCardAlreadyWatched,
	};

	const fullPosterUrl = `${TMDB_IMAGE_BASE}/${size}${posterPath}`;

	return (
		<div
			className={`${styles.movieCardContainer} ${variantStyles[variant]}`}
			onClick={onClick}
		>
			<RatingButton rating={rating} />
			<img
				src={fullPosterUrl}
				alt={title}
				width={150}
				height={225}
				className={styles.movieCardPoster}
			/>
			<div className={styles.movieCardContent}>
				<p className={styles.movieCardTitle}>{title}</p>
			</div>
		</div>
	);
};
