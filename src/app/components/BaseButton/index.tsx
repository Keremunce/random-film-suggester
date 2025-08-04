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
