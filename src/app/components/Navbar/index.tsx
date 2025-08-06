import Link from "next/link";
import Image from "next/image";
import styles from "./style.module.css";
export default function Navbar() {
	return (
		<nav className={styles.navbar}>
			<div className={styles.navbarContainer}>
				<div className={styles.navbarLogo}>
					<Link href="/" >
						<Image
							src="/logo/Icon Only=True.svg"
							alt="Logo"
							width={50}
							height={50}
						/>
					</Link>
				</div>
				<ul className={styles.navbarLinks}>
					<li className={styles.navbarLink}>
						<Link href="/" className={styles.linkMovies}>
							Movies
						</Link>
					</li>
					<li className={styles.navbarLink}>
						<Link href="/" className={styles.linkShows}>
							TV Shows
						</Link>
					</li>
					<li className={styles.navbarLink}>
						<Link href="/suggestme" className={styles.linkSuggest}>
							Suggest Me{" "}
							<Image
								src="/icons/arrow-right.svg"
								alt="Arrow Right Icon"
								width={20}
								height={20}
							/>
						</Link>
					</li>
				</ul>
			</div>
		</nav>
	);
}
