# Changelog

All notable changes to the Radiora-frontend will be documented here.

---

## [0.3.0] - 2026-04-04 (Phase 2 Completed)

### Added

- **Guided HIS Simulation**: Interactive 3-step workflow for simulating clinical integration cycles (Patient → Order → PACS).
- **Real-time Feedback**: Instant validation and status updates during the simulation.
- **Data Persistence**: Simulation data is now saved to the database and visible in the Admin Dashboard.
- **Admin Dashboard Enhancements**:
  - **Simulation History**: View and manage all simulation records.
  - **Patient Management**: Create, view, and delete patient records.
  - **Order Management**: Create and delete study orders.
  - **PACS Management**: Configure PACS connections and view study lists.

### Changed

- **UI/UX**:
  - Redesigned `IntegrationHub` to `GuidedSimulation` with a step-by-step wizard interface.
  - Added progress indicator and clear action buttons for each step.
  - Enhanced loading states and error handling with user-friendly messages.
- **Backend Integration**:
  - Updated `api/simulation.ts` to support creating and deleting simulation records.
  - Added endpoints for managing patient and order data.
  - Enhanced PACS integration to fetch and display study lists.
- **Database Schema**:
  - Added `SimulationRecord`, `Patient`, and `StudyOrder` models to `prisma/schema.prisma`.
  - Updated `Admin` model to include `maxConcurrentCases`.

---

## [0.2.0] - 2026-03-24 (Phase 1 Completed)

### Added

- **Authentication & Security**:
  - Centralized **Auth Middleware** (`middleware.ts`) for route protection.
  - Deep validation of JWT tokens via backend API status checks.
  - Automatic redirection for authenticated users away from `/auth` routes.
  - Secure Server Action patterns for `getAuthStatus` and `logout`.
- **Admin Dashboard**:
  - Redesigned integration UI with a modern **Card Grid** layout.
  - Clinical allotment management for doctor specialists.
  - Enhanced HIS & PACS configuration with real-time status indicators.
- **Marketing & Content**:
  - Dedicated `/features` page detailing platform capabilities.
  - Proper absolute routing for all main navigation links (Navbar/Footer).
  - New UI components: `ProfileDropdown`, `AuthModal`, and `LogoutButton`.

### Changed

- Refactored navigation to work seamlessly across subdirectories and dashboards.
- Improved CSS Modules architecture for the dashboard integration suite.
- Optimized development environment with port adjustments (HIS service on 3002).

---

## [0.1.1] - 2026-03-22

### Added

- **UI Components**:
  - Standalone `Footer` component with rich links and social icons.
  - Reusable `ContentSection` for marketing pages.
  - Integrated `lucide-react` icons across the platform.
- **Pages & Routing**:
  - Created 11 supplemental pages (Platform, Resources, Company, Legal).
  - Organized marketing routes into a `(marketing)` Route Group for better structure.
- **SEO & Metadata**:
  - Global SEO metadata in `layout.tsx` (OpenGraph, Twitter, Keywords).
  - Page-specific metadata for all routes.
  - Optimized clinical and technical copy for search engine visibility.

### Changed

- Refactored `Navbar`, `Hero`, and `Home` to use **CSS Modules** exclusively.
- Unified "Radiora" branding colors across all components.
- Enhanced layout with premium glassmorphism and curvy aesthetic.

---

## [0.1.0] - 2026-03-21

### Added

- Next.js (v16) project setup with React 19 and TypeScript
- ESLint (v9) setup with Flat Config (`eslint.config.mjs`) and `eslint-config-next`
- Prettier configuration for consistent code formatting (`.prettierrc`)
- `npm run lint` and `npm run dev` scripts
- Initial folder structure with `src/` and `public/` directories
- React Compiler tracking via `babel-plugin-react-compiler`

### Notes

- No backend connectivity implemented at this phase
- Authentication pages (login/register) not yet included
- Main application dashboard and routing not yet set up
- Styling architecture (e.g., Tailwind CSS) pending configuration

---

## [0.0.0] - 2026-03-21

### Added

- Initial project repository and initial boilerplate code
