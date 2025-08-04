import Image from "next/image";
import styles from "./style.module.css";
import { RatingButton } from "@/app/components/RatingButton";

type MovieCardProps = {
	title: string;
	description: string;
	posterPath: string;
	variant?: "default" | "addToMyList" | "alreadyWatched";
	onClick?: () => void;
};

export const MovieCard = ({
	title,
	vote,
	posterPath,
	variant = "default",
	onClick,
}: MovieCardProps) => {
	const variantStyles = {
		default: styles.movieCardDefault,
		addToMyList: styles.movieCardAddToMyList,
		alreadyWatched: styles.movieCardAlreadyWatched,
	};
	return (
		<div
			className={`${styles.movieCardContainer} ${variantStyles[variant]}`}
			onClick={onClick}
		>
			<RatingButton rating={vote} />
			<img
				src={posterPath}
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
