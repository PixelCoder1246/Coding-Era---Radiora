# Radiora - Frontend

This is the central frontend repository for the Radiora platform, built with **Next.js 16**, **React 19**, and **TypeScript**.

## Getting Started

1.  **Clone and Navigate**:

    ```bash
    git clone https://github.com/PixelCoder1246/Coding-Era---Radiora.git
    cd Coding-Era---Radiora/frontend
    ```

2.  **Installation**:

    ```bash
    npm install
    ```

3.  **Local Development**:
    ```bash
    npm run dev
    ```

## New Features (v0.2.0) - Phase 1 Complete

- **Admin Dashboard**: Comprehensive clinical management interface featuring clinician allotments and system configuration.
- **Workflow Orchestration**: Advanced card-based grid layout for managing PACS and HIS HL7 integrations.
- **Security & Auth**: Centralized Next.js Middleware for JWT-based route protection and dynamic `async` root layout for real-time auth status.
- **Shared UI Library**: Reusable design system including `ProfileDropdown`, `AuthModal`, `LogoutButton`, and a premium "curvy" aesthetic.
- **Dynamic Navigation**: Context-aware Navbar and Hero sections that adapt to the user's authentication state.

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Library**: React 19
- **Language**: TypeScript
- **Styling**: 100% CSS Modules (Brand: Curvy Aesthetic)
- **Tooling**: ESLint 9, Prettier 3, Lucide React Icons

## Available Scripts

- `npm run dev`: Starts the application on port `3001`.
- `npm run build`: Compiles and optimizes the project for production.
- `npm run start`: Runs the built production bundle.
- `npm run lint`: Performs static analysis check using ESLint.
- `npm run lint:fix`: Automatically fixes fixable linting and formatting issues.
- `npm run format`: Runs Prettier directly to format the source code.

## Project Structure

- `src/app/`: Core application logic and routing.
  - `(marketing)/`: Public-facing pages (About, Features, Privacy).
  - `admin/`: Protected dashboard and system settings.
- `src/components/`: Reusable UI components and Shared Library.
- `src/lib/`: Unified server actions and authentication utilities.

---

_Created by [Antigravity AI](https://github.com/GoogleDeepMind)_
