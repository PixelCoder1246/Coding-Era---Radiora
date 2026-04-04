'use client';

import React from 'react';
import Link from 'next/link';
import { Twitter, Linkedin, Github, Mail } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brandColumn}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoR}>R</span>
            <span className={styles.logoText}>adiora</span>
          </Link>
          <p className={styles.description}>
            Reimagining medical imaging workflows with intelligent PACS and HIS orchestration. Built for the modern
            radiology department.
          </p>
          <div className={styles.socials}>
            <div className={styles.socialIcon} aria-label="Twitter">
              <Twitter size={20} />
            </div>
            <div className={styles.socialIcon} aria-label="LinkedIn">
              <Linkedin size={20} />
            </div>
            <div className={styles.socialIcon} aria-label="GitHub">
              <Github size={20} />
            </div>
            <div className={styles.socialIcon} aria-label="Contact Support">
              <Mail size={20} />
            </div>
          </div>
        </div>

        <div>
          <h4 className={styles.columnTitle}>Platform</h4>
          <ul className={styles.linkList}>
            <li>
              <Link href="/features" className={styles.linkItem}>
                Features
              </Link>
            </li>
            <li>
              <Link href="/platform/pacs-orchestration" className={styles.linkItem}>
                PACS Orchestration
              </Link>
            </li>
            <li>
              <Link href="/platform/his-integration" className={styles.linkItem}>
                HIS Integration
              </Link>
            </li>
            <li>
              <Link href="/platform/ai-insights" className={styles.linkItem}>
                AI Insights
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className={styles.columnTitle}>Resources</h4>
          <ul className={styles.linkList}>
            <li>
              <Link href="/resources/documentation" className={styles.linkItem}>
                Documentation
              </Link>
            </li>
            <li>
              <Link href="/resources/api-reference" className={styles.linkItem}>
                API Reference
              </Link>
            </li>
            <li>
              <Link href="/resources/case-studies" className={styles.linkItem}>
                Case Studies
              </Link>
            </li>
            <li>
              <Link href="/resources/support" className={styles.linkItem}>
                Support Center
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className={styles.columnTitle}>Company</h4>
          <ul className={styles.linkList}>
            <li>
              <Link href="/company/about" className={styles.linkItem}>
                About Us
              </Link>
            </li>
            <li>
              <Link href="/company/careers" className={styles.linkItem}>
                Careers
              </Link>
            </li>
            <li>
              <Link href="/privacy" className={styles.linkItem}>
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className={styles.linkItem}>
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>© 2026 Radiora Inc. All rights reserved.</p>
        <div className={styles.legalLinks}>
          <Link href="/privacy" className={styles.linkItem}>
            Privacy
          </Link>
          <Link href="/terms" className={styles.linkItem}>
            Terms
          </Link>
          <Link href="#" className={styles.linkItem}>
            Cookies
          </Link>
        </div>
      </div>
    </footer>
  );
}
