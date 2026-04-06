'use client';

import React, { useState } from 'react';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { useTheme } from '../app/ThemeProvider';
import Link from 'next/link';
import { User } from '@/lib/actions/auth';
import ProfileDropdown from './ProfileDropdown';
import styles from './Navbar.module.css';

export default function Navbar({ user }: { user: User | null }) {
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isAuthenticated = !!user;

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <div className={styles.logo}>
          <Link href="/" className={styles.logoLink}>
            <span className={styles.logoText}>Radiora</span>
          </Link>
        </div>

        {/* Desktop Links */}
        <div className={styles.desktopActions}>
          <div className={styles.navLinks}>
            <Link href="/features" className={styles.navLink}>
              Features
            </Link>
            <Link href="/company/about" className={styles.navLink}>
              About
            </Link>
          </div>

          <div className={styles.divider} />

          <button onClick={toggleTheme} className={styles.themeToggle} aria-label="Toggle theme">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <div className={styles.authButtons}>
            {isAuthenticated ? (
              <ProfileDropdown user={user!} />
            ) : (
              <>
                <Link href="/auth/login">
                  <button className={styles.loginBtn}>Login</button>
                </Link>
                <Link href="/auth/register">
                  <button className="btn-primary">Join</button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Controls */}
        <div className={styles.mobileActions}>
          <button onClick={toggleTheme} className={styles.themeToggle} aria-label="Toggle theme">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button
            className={styles.menuToggle}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <div className={styles.mobileLinks}>
            <Link href="/features" className={styles.mobileLink} onClick={() => setIsMobileMenuOpen(false)}>
              Features
            </Link>
            <Link href="/company/about" className={styles.mobileLink} onClick={() => setIsMobileMenuOpen(false)}>
              About
            </Link>
            <div className={styles.mobileAuth}>
              {isAuthenticated ? (
                <div style={{ padding: '0 1rem' }}>
                  <ProfileDropdown user={user!} />
                </div>
              ) : (
                <>
                  <Link href="/auth/login" className={styles.mobileLink} onClick={() => setIsMobileMenuOpen(false)}>
                    Login
                  </Link>
                  <Link href="/auth/register" onClick={() => setIsMobileMenuOpen(false)} style={{ padding: '1rem' }}>
                    <button className="btn-primary" style={{ width: '100%' }}>
                      Get Started
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
