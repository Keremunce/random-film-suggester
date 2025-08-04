import { ReactNode } from "react";
import Image from "next/image";
import styles from "./style.module.css";
// use state .hasValue TO THE INPUT TO SHOW THE LABEL
import { useState } from "react";

type InputProps = {
	variant?: "default" | "primary" | "search";
	size?: "sm" | "md" | "lg";
	placeholder?: string;
	idFor: string;
	label: string;
	iconPath?: string | ReactNode;
};

export const BaseInput = ({
	variant = "default",
	size = "md",
	placeholder = "eg. Avengers",
	iconPath = "/icons/placeholder.svg",
	idFor,
	label,
}: InputProps) => {
	const variantStyles = {
		default: styles.baseinputDefault,
		primary: styles.baseinputPrimary,
		search: styles.baseinputSearch,
	};
	const sizeStyles = {
		sm: styles.baseinputSm,
		md: styles.baseinputMd,
		lg: styles.baseinputLg,
	};
	const [hasValue, setHasValue] = useState(false);
	return (
		<div className={styles.baseinputContainer}>
			<div className={styles.baseinputLogo}>
				{iconPath && <Image src={iconPath} alt="Logo" width={24} height={24} />}
			</div>
			<div className={`${styles.baseinputInputContainer} ${hasValue ? styles.hasValue : ""}`}>
				<div>
					<span className={styles.baseinputSmall}>{label}</span>
					<label htmlFor={idFor} className={styles.baseinputLabel }>
						{label}
					</label>
				</div>
				<input
					onChange={(e) => setHasValue(e.target.value.length > 0)}
					type="text"
					size={size === "lg" ? 40 : size === "md" ? 30 : 20}
					id={idFor}
					className={`${styles.baseinputInput} ${variantStyles[variant]}`}
				/>
			</div>
		</div>
	);
};
