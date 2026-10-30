import styles from "./style.module.css";

export const AppVersion = () => (
	<div className={styles.version} aria-label={`Version ${process.env.NEXT_PUBLIC_APP_VERSION}, commit ${process.env.NEXT_PUBLIC_GIT_COMMIT_SHA}`}>
		v{process.env.NEXT_PUBLIC_APP_VERSION} · {process.env.NEXT_PUBLIC_GIT_COMMIT_SHA}
	</div>
);
