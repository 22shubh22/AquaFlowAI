# AquaFlow - Water Distribution Management System

## Overview

AquaFlow is a smart city water distribution management system designed to ensure fair, efficient, and transparent delivery of water across all regions. The application provides two distinct interfaces: an administrative dashboard for water authorities to monitor and manage the distribution network, and a citizen portal for residents to report issues and view water supply schedules.

The system incorporates AI-driven insights for demand prediction, anomaly detection, and optimal pump scheduling. It also implements a blockchain-inspired verification system for citizen reports to ensure transparency and trust.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, built using Vite as the build tool and development server.

**UI Framework**: Shadcn UI components (New York style variant) built on Radix UI primitives with Tailwind CSS for styling. The design follows Carbon Design System principles with Material Design influences, prioritizing data clarity and enterprise-grade visualization.

**State Management**: 
- TanStack Query (React Query) for server state management with automatic caching and refetching
- React Context API for authentication state (`AuthContext`)
- Local component state using React hooks

**Routing**: Wouter for lightweight client-side routing

**Design System**:
- Typography: IBM Plex Sans (primary), Inter (fallback)
- Spacing: Tailwind utility-first approach with 2, 4, 6, 8 unit increments
- Layout: Responsive grid system supporting 12-column layouts for complex dashboards
- Theme: Light/dark mode support via `ThemeProvider` with localStorage persistence
- Color System: HSL-based color tokens with CSS variables for easy theming

**Key UI Patterns**:
- Sidebar navigation with collapsible menu
- Card-based dashboard layout for metrics and data visualization
- Interactive maps using Leaflet for zone and water source visualization
- Real-time data updates via query refetching at configurable intervals
- Toast notifications for user feedback

**Role-Based Access**:
- Admin users: Full dashboard access including zones, pumps, water sources, analytics, and settings
- Citizen users: Limited access to report submission and pump schedule viewing
- Authentication flow with separate login/signup paths for admin and citizen roles

### Backend Architecture

**Framework**: Express.js with TypeScript running on Node.js

**API Structure**: RESTful API with the following main endpoints:
- `/api/auth/*` - Authentication (login for admin/citizen, citizen signup)
- `/api/zones/*` - Zone management (CRUD operations)
- `/api/water-sources/*` - Water source management
- `/api/pumps/*` - Pump schedule management
- `/api/reports/*` - Citizen report submission and management
- `/api/alerts/*` - System alert management
- `/api/analytics/*` - Demand predictions and historical data
- `/api/blockchain/*` - Report verification statistics

**Data Layer**: In-memory storage implementation (`storage.ts`) with interfaces defined for future database integration. The storage layer provides abstraction for:
- User management (admin and citizen users)
- Zone data with real-time metrics
- Water source tracking
- Pump scheduling
- Alert management
- Citizen reports with blockchain-style verification
- Historical data for zones, reservoirs, and pumps

**AI Engine** (`ai-engine.ts`): Custom implementation for:
- Zone status calculation based on pressure, flow rate, and time-based demand patterns
- Anomaly detection for excess pumping, leaks, pressure drops, and irregular consumption
- Optimal pump scheduling recommendations based on equity scoring and demand prediction
- Equity score calculation to ensure fair water distribution across zones

**Blockchain Integration** (`blockchain.ts`): SHA-256 hash-based verification system for citizen reports, providing:
- Report hash generation for data integrity
- Cryptographic signatures with timestamps
- Chain verification from report back to genesis
- Immutable audit trail for transparency

**Session Management**: Uses `connect-pg-simple` for PostgreSQL-backed session storage (though currently using in-memory storage, the infrastructure supports database sessions).

### Data Storage Solutions

**Current Implementation**: In-memory storage with TypeScript interfaces mimicking database schemas. This allows for rapid development and testing while maintaining the structure needed for database migration.

**Database Ready**: 
- Drizzle ORM configured for PostgreSQL with migration support
- Schema definitions in `shared/schema.ts` using Drizzle's schema builder
- Neon serverless PostgreSQL driver configured via `@neondatabase/serverless`
- Connection string via `DATABASE_URL` environment variable

**Schema Structure**:
- `users` table: Admin users with username/password authentication
- Additional schemas defined as TypeScript interfaces: Zone, WaterSource, Pump, Alert, CitizenUser, CitizenReport, historical data tables

**Migration Strategy**: Drizzle Kit configured to generate and apply migrations from schema definitions, with migrations stored in the `/migrations` directory.

### Authentication and Authorization

**Mechanism**: Simple credential-based authentication with role differentiation (admin vs. citizen). Currently implements password comparison without hashing (suitable for development/demo, should be enhanced for production).

**Session Storage**: Server-side session management with credentials included in API requests.

**Role Enforcement**:
- Frontend: `AuthContext` provides role-based routing and UI access control
- Backend: API endpoints check user credentials and expected roles before processing requests

**Citizen Onboarding**: Self-service signup flow for citizen users requiring username, password, email, and phone number.

### External Dependencies

**Third-Party Services**:
- **Leaflet**: Interactive mapping library for zone and water source visualization with custom markers and styling
- **Google Fonts CDN**: IBM Plex Sans and Inter font families for typography
- **Recharts**: Data visualization library for flow/pressure trends, demand predictions, and analytics charts

**Database**:
- **Neon PostgreSQL**: Serverless PostgreSQL configured via Drizzle ORM (ready for integration, currently using in-memory storage)
- **Drizzle ORM**: Type-safe database toolkit with migration support

**UI Component Library**:
- **Radix UI**: Unstyled, accessible component primitives (Dialog, Dropdown, Select, Tabs, Toast, etc.)
- **Shadcn UI**: Pre-styled component implementations built on Radix UI

**Development Tools**:
- **Vite**: Build tool and dev server with HMR
- **Replit Plugins**: Runtime error overlay, cartographer, dev banner (development environment only)

**Utilities**:
- **TanStack Query**: Server state management with caching
- **Wouter**: Lightweight routing
- **date-fns**: Date manipulation and formatting
- **class-variance-authority**: Component variant management
- **zod**: Schema validation (integrated with Drizzle)

**Build and Runtime**:
- **esbuild**: Server-side bundling for production
- **tsx**: TypeScript execution for development server
- **PostCSS**: CSS processing with Tailwind and Autoprefixer