"use client";

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../app/ThemeProvider';
import Link from 'next/link';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span className={styles.logoR}>R</span>
          <span className={styles.logoText}>adiora</span>
        </Link>
      </div>

      <div className={styles.navActions}>
        <div className={styles.navLinks}>
          <Link href="#features" className={styles.navLink}>Features</Link>
          <Link href="#about" className={styles.navLink}>About</Link>
        </div>

        <button 
          onClick={toggleTheme}
          className={styles.themeToggle}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <div className={styles.authButtons}>
          <button className="btn-outline" style={{ fontSize: '0.85rem' }}>Admin Login</button>
          <button className="btn-primary" style={{ fontSize: '0.85rem' }}>Register</button>
        </div>
      </div>
    </nav>
  );
}
