'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { LayoutDashboard, User as UserIcon, LogOut } from 'lucide-react';
import { User } from '@/lib/actions/auth';
import LogoutButton from './LogoutButton';
import styles from './Navbar.module.css';

export default function ProfileDropdown({ user }: { user: User }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isAdmin = user.role === 'ADMIN';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={styles.profileContainer} ref={dropdownRef}>
      <button className={styles.profileBtn} onClick={() => setIsOpen(!isOpen)}>
        {user.name.charAt(0).toUpperCase()}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <div className={styles.userInfoText}>
              <p className={styles.userName}>{user.name}</p>
              <p className={styles.userEmail}>{user.email}</p>
            </div>
          </div>

          <div className={styles.dropdownDivider}></div>

          <Link
            href={isAdmin ? '/admin/dashboard' : '/dashboard'}
            className={styles.dropdownItem}
            onClick={() => setIsOpen(false)}
          >
            <div className={styles.itemIcon}>
              <LayoutDashboard size={18} />
            </div>
            <span className={styles.itemLabel}>Dashboard</span>
          </Link>

          {!isAdmin && (
            <Link href="/profile" className={styles.dropdownItem} onClick={() => setIsOpen(false)}>
              <div className={styles.itemIcon}>
                <UserIcon size={18} />
              </div>
              <span className={styles.itemLabel}>My Profile</span>
            </Link>
          )}

          <div className={styles.dropdownDivider}></div>

          <div className={styles.logoutWrapper}>
            <LogoutButton className={styles.dropdownLogout}>
              <div className={styles.itemIcon}>
                <LogOut size={18} />
              </div>
              <span className={styles.itemLabel}>Sign Out</span>
            </LogoutButton>
          </div>
        </div>
      )}
    </div>
  );
}
