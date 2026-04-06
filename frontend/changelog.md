# Changelog

All notable changes to the Radiora-frontend will be documented here.

---

## [0.4.1] - 2026-04-07

### Added

- **Platform Vision — "The Platform that Powers Radiology"**: Complete rebranding from a generic "imaging platform" to a high-performance **Radiology Orchestration Platform**.
- **Mission-Driven Content Overhaul**: Re-aligned all marketing and product copy (Homepage, Features, About) to focus on **Reducing Physician Burnout** and providing **AI-First Orchestration**.
- **Admin Dashboard — HUD Precision Overhaul**:
  - Implemented 50/50 structural balancing for the critical header section.
  - Refined HUD corner accents to 2px high-precision optical markers.
  - Bulletproof vertical icon-title alignment platform-wide.
  - New "Clinical Table" layout for the Admin Profile dashboard for denser, medical-grade data display.
- **Global Branding — Browser Tab Update**: Refreshed metadata titles to reflect the new "Powering Radiology" mission.
- **Typography Scale**: Increased font sizes and weight across all clinical data points for better readability in high-pressure environments.


## [0.4.0] - 2026-04-07

### Added

- **Doctor Workstation — Clinical Dashboard**: New `/doctor` portal with a real-time study worklist, status tracking (Pending Review, In Review, Completed), and assigned patient details.
- **Doctor Workstation — Diagnostic Viewer**: Advanced `/doctor/cases/[id]` interface featuring:
  - **DICOM iFrame Integration**: Native embedding of Orthanc Stone Web Viewer for high-fidelity medical imaging.
  - **AI Intelligence Layer**: Dynamic SVG/CSS overlays for AI findings (bounding boxes, labels) with confidence scoring.
  - **Smart Findings Panel**: Automatically parsed list of clinical insights with multi-observation support.
  - **Real-time AI Sync**: Immediate polling and manual "refresh" capability to fetch latest AI inference results.
  - **Clinical Reporting**: Integrated impression input and "Complete Review & Sign" workflow that updates case status across the platform.
- **Platform — Role-Based Routing**: Centralized middleware enhancements to strictly separate Clinical (Doctor) and Administrative workflows, ensuring secure workspace isolation.


## [0.3.1] - 2026-04-05

### Changed

- **Admin Dashboard — Doctor Registry**: Renamed "Physician Registry" → "Doctor Registry" and "Register Specialist" → "Register Doctor" throughout the dashboard.
- **Admin Dashboard — Admin Profile**: Restored Name, Email, and Role fields (was showing only Email and Access Level).
- **Admin Dashboard — Integration Labels**: Renamed "Clinical Connectivity" → "Server Connectivity".
- **Admin Dashboard — Layout Overhaul**: Completely rewrote `AdminDashboard.module.css` — compacted all sections, reduced padding, fixed card sizes, made all colors use CSS theme variables for proper dark/light mode support.
- **Admin Dashboard — Section Spacing**: Fixed heading-to-content gap across all sections (Registered Doctors, Server Connectivity, All Cases, PACS Studies) — removed inline `marginBottom: 1.5rem` so flexbox gap controls spacing uniformly.
- **Admin Dashboard — Integration Cards**: Fixed button alignment — Save/Activate buttons now pin to the bottom of both HIS and PACS cards regardless of content height, using `margin-top: auto` on the action row.
- **Admin Dashboard — Empty State**: Doctor grid now shows a proper empty state message when no doctors are registered.
- **Admin Dashboard — Doctor Avatars**: Doctor cards now show the first letter of the doctor's name instead of generic "Dr".

### Added

- **Admin Dashboard — Reset Animation**: Premium `spinOnce` CSS keyframe animation on the reset-password button icon — spins 360° on hover.
- **Homepage — Full Rebuild**: Complete redesign of `Hero.tsx` and `page.tsx`:
  - Two-column layout (text left, product screenshot right) that fits within 100vh.
  - Real product screenshot (`/image.png`) displayed in a browser chrome frame, replacing the placeholder mockup.
  - "How It Works" section — 3-step cards with arrow connectors.
  - "Platform Capabilities" section — 6 feature cards with color-matched hover effects.
  - "Built for Every Role" section — Admin vs Doctor two-column breakdown with checklists.
  - Full-page CTA section at bottom with auth-aware buttons.
- **READMEs**: Created/rewrote `README.md` at root, `backend/README.md`, and `frontend/README.md` with accurate setup steps, env examples, scripts, and route references.

### Fixed

- **Auth Pages (Login/Register)**: Full dark/light theme support via CSS variables; fixed background color inconsistency and typography sizing.

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
