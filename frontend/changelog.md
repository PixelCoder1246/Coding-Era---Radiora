# Changelog

All notable changes to the Radiora Frontend will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-04-04

### Added
- **Admin Dashboard**: Launched the clinical management interface with profile settings and system configuration.
- **PACS & HIS Integration**: Full configuration support for PACS Orchestration and HIS HL7 Integration.
- **Auth Middleware**: Centralized protection for admin routes with JWT validation and redirection.
- **Shared Components**: Unified UI library including `ProfileDropdown`, `AuthModal`, and `LogoutButton`.
- **Features Page**: Dedicated landing page for platform capabilities discovery.

### Changed
- **Navigation**: Refactored global `Navbar` with server-side auth status and dynamic user menus.
- **Workflow UI**: Migrated integration settings to a modern card-based grid layout.
- **Root Layout**: Transitioned to an `async` layout for seamless server authentication checks.

### Fixed
- Fixed several linting warnings and formatting inconsistencies across core components.
- Standardized cross-component icon capitalization and Lucide integration.

## [0.1.0] - 2026-04-04

### Added
- Created 11 supplemental marketing and legal pages (Privacy, Terms, About, Company, etc.) with unified layout structure.
- Implemented comprehensive SEO metadata in the root layout, including OpenGraph and Twitter social tags.
- Integrated Lucide icons throughout the UI for better visual communication.

### Changed
- Refactored `Footer` into a reusable component and integrated it into the global `layout.tsx`.
- Restructured application routing using the `(marketing)` route group for better organization.
- Migrated 100% of styling to CSS Modules with a refined, premium "curvy" aesthetic.
- Enhanced landing page UI with unified brand colors and improved responsiveness.

### Fixed
- Fixed build error related to incorrectly versioned `lucide-react` package.
- Resolved Turbopack panic by optimizing directory structure and clearing cache.

## [0.0.0] - 2026-04-03

### Added
- Initial setup of the Next.js 16 project with App Router.
- Configured React 19 and Integrated TypeScript support.
- Set up professional ESLint 9 (flat config) and Prettier 3 workflow.
- Established basic project structure (`src/app`, `public`).
- Defined comprehensive development scripts (`dev`, `build`, `lint`, `format`, `frontend`).
- Documented core project setup in `README.md` and `changelog.md`.

### Changed
- Configured layout and meta-data for the root application.
- Standardized file formatting across the project (quotes, fragments, types).
- Optimized developer experience by merging linting and fixing into actionable scripts.

### Fixed
- Fixed initial lint errors in code templates (quotes, fragments, missing types).
- Resolved conflicts between auto-generated `next-env.d.ts` and project lint rules.

---
*Created by [Antigravity AI](https://github.com/GoogleDeepMind)*
