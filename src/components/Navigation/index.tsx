"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./style.module.css";

export const Navigation: React.FC = () => {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          🎬 Media Tracker
        </Link>

        <ul className={styles.links}>
          <li>
            <Link
              href="/search"
              className={`${styles.link} ${isActive("/search") ? styles.active : ""}`}
            >
              🔍 Search
            </Link>
          </li>
          <li>
            <Link
              href="/list"
              className={`${styles.link} ${isActive("/list") ? styles.active : ""}`}
            >
              📋 My List
            </Link>
          </li>
          <li>
            <Link
              href="/settings"
              className={`${styles.link} ${isActive("/settings") ? styles.active : ""}`}
            >
              ⚙️ Settings
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};
