import { ReactNode } from "react";
import Image from "next/image";
import styles from "./style.module.css";

type ButtonProps = {
	leftIconPath?: string;
	rightIconPath?: string;
	value: string;
	onClick?: () => void;
	disabled?: boolean;
};

export const BaseButton = ({
	leftIconPath,
	rightIconPath,
	value,
	onClick,
	disabled = false,
}: ButtonProps) => {
	return (
		<div className={styles.basebuttonContainer}>
			<button onClick={onClick} disabled={disabled}>
				{leftIconPath && (
					<Image src={leftIconPath} alt="Left Icon" width={24} height={24} />
				)}
				{value}
				{rightIconPath && (
					<Image src={rightIconPath} alt="Right Icon" width={24} height={24} />
				)}
			</button>
		</div>
	);
};

type MovieCardProps = {
	title: string;
	description: string;
	posterPath: string;
	onClick?: () => void;
};

export const MovieCard = ({
	title,
	description,
	posterPath,
	onClick,
}: MovieCardProps) => {
	return (
		<div className={styles.movieCardContainer} onClick={onClick}>
			<Image
				src={posterPath}
				alt={title}
				width={150}
				height={225}
				className={styles.movieCardPoster}
			/>
			<div className={styles.movieCardContent}>
				<h3 className={styles.movieCardTitle}>{title}</h3>
				<p className={styles.movieCardDescription}>{description}</p>
			</div>
		</div>
	);
};
