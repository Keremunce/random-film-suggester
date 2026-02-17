"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./style.module.css";
import { FiFilm, FiList, FiSettings, FiCompass } from "react-icons/fi";

export const Navigation: React.FC = () => {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <FiFilm className={styles.logoIcon} aria-hidden="true" />
          <span className={styles.logoText}>Media Tracker</span>
        </Link>

        <ul className={styles.links}>
          <li>
            <Link
              href="/explore"
              className={`${styles.link} ${isActive("/explore") ? styles.active : ""}`}
            >
              <FiCompass className={styles.linkIcon} aria-hidden="true" />
              <span className={styles.linkText}>Explore</span>
            </Link>
          </li>
          <li>
            <Link
              href="/list"
              className={`${styles.link} ${isActive("/list") ? styles.active : ""}`}
            >
              <FiList className={styles.linkIcon} aria-hidden="true" />
              <span className={styles.linkText}>My List</span>
            </Link>
          </li>
          <li>
            <Link
              href="/settings"
              className={`${styles.link} ${isActive("/settings") ? styles.active : ""}`}
            >
              <FiSettings className={styles.linkIcon} aria-hidden="true" />
              <span className={styles.linkText}>Settings</span>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};
