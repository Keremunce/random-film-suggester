"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./style.module.css";
import { Compass } from "@phosphor-icons/react/dist/csr/Compass";
import { FilmStrip } from "@phosphor-icons/react/dist/csr/FilmStrip";
import { GearSix } from "@phosphor-icons/react/dist/csr/GearSix";
import { List } from "@phosphor-icons/react/dist/csr/List";

export const Navigation: React.FC = () => {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <FilmStrip className={styles.logoIcon} aria-hidden="true" />
          <span className={styles.logoText}>Media Tracker</span>
        </Link>

        <ul className={styles.links}>
          <li>
            <Link
              href="/explore"
              className={`${styles.link} ${isActive("/explore") ? styles.active : ""}`}
            >
              <Compass className={styles.linkIcon} aria-hidden="true" />
              <span className={styles.linkText}>Explore</span>
            </Link>
          </li>
          <li>
            <Link
              href="/list"
              className={`${styles.link} ${isActive("/list") ? styles.active : ""}`}
            >
              <List className={styles.linkIcon} aria-hidden="true" />
              <span className={styles.linkText}>My List</span>
            </Link>
          </li>
          <li>
            <Link
              href="/settings"
              className={`${styles.link} ${isActive("/settings") ? styles.active : ""}`}
            >
              <GearSix className={styles.linkIcon} aria-hidden="true" />
              <span className={styles.linkText}>Settings</span>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};
