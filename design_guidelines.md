# Design Guidelines: Fair Water Distribution Management System

## Design Approach

**Selected System:** Carbon Design System with Material Design influences
**Rationale:** Enterprise-grade data visualization requirements, government/civic context requiring trust and clarity, complex dashboard needs with real-time monitoring capabilities.

## Core Design Principles

1. **Data Clarity First** - Information hierarchy prioritizes critical alerts and metrics
2. **Dual Audience Design** - Professional authority dashboard + accessible citizen portal
3. **Trust Through Transparency** - Clear data presentation builds civic confidence
4. **Responsive Efficiency** - Dense information on desktop, streamlined on mobile

---

## Typography System

**Font Stack:** IBM Plex Sans (primary), Inter (fallback) via Google Fonts CDN

**Hierarchy:**
- **Dashboard Headers:** text-2xl font-semibold (monitoring sections, zone titles)
- **Page Titles:** text-3xl font-bold (main dashboard title, portal headers)
- **Metric Values:** text-4xl font-bold (large numerical displays - flow rates, pressure levels)
- **Card Titles:** text-lg font-semibold (individual component headers)
- **Body Text:** text-base font-normal (descriptions, reports, timestamps)
- **Labels & Meta:** text-sm font-medium (form labels, chart axes, table headers)
- **Small Data:** text-xs font-normal (timestamps, secondary metrics, helper text)

---

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, and 8 as base increments

**Container Strategy:**
- **Full Dashboard:** max-w-screen-2xl mx-auto (accommodates wide data tables and charts)
- **Citizen Portal:** max-w-6xl mx-auto (focused content area)
- **Form Containers:** max-w-2xl (optimal form readability)

**Grid Patterns:**
- **Authority Dashboard:** 12-column grid (grid-cols-12) for complex layouts
- **Metric Cards:** grid-cols-1 md:grid-cols-2 lg:grid-cols-4 (status overview)
- **Data Tables:** Full-width with horizontal scroll on mobile
- **Citizen Portal:** grid-cols-1 md:grid-cols-2 (report cards, simple layouts)

**Spacing Standards:**
- Page padding: px-4 md:px-6 lg:px-8
- Section spacing: space-y-6 md:space-y-8
- Card internal padding: p-6
- Form field spacing: space-y-4
- Grid gaps: gap-4 md:gap-6

---

## Component Library

### Navigation

**Authority Dashboard Navigation:**
- Persistent left sidebar (w-64) with collapsible mobile overlay
- Navigation items with icon + label (h-12, px-4)
- Grouped by: Overview, Monitoring, Reports, Alerts, Settings
- Active state: font-semibold with subtle background

**Citizen Portal Navigation:**
- Top horizontal navigation bar (sticky)
- Simple links: Report Issue, Track Reports, Water Schedule, FAQs
- Mobile: Hamburger menu with full-screen overlay

### Dashboard Components

**Real-Time Metric Cards:**
- Rounded corners (rounded-lg)
- Shadow elevation (shadow-md)
- Padding: p-6
- Layout: Large value at top, label below, trend indicator/icon right-aligned
- Spacing: space-y-2 internal

**Interactive Map:**
- Full-width container with min-h-[600px]
- Use Leaflet.js for geolocation mapping
- Zone overlays with status indicators
- Click interactions reveal detailed pump/pressure data
- Legend positioned bottom-right with backdrop blur

**Data Visualization Charts:**
- Use Chart.js for line/bar/pie charts
- Standard height: h-[400px] for primary charts, h-[250px] for secondary
- Padding: p-6 container with p-4 chart area
- Responsive: Reduce height on mobile to h-[300px]

**Alert System:**
- Top banner for critical alerts (h-16, px-6)
- Toast notifications (fixed top-4 right-4) for real-time updates
- Alert cards in dedicated panel with icon, timestamp, severity, action button
- Stacked with space-y-3

**Data Tables:**
- Striped rows for readability
- Sticky header (sticky top-0)
- Row height: h-14 with px-4 py-3 cells
- Pagination controls at bottom (h-16)
- Sort indicators on column headers

### Citizen Portal Components

**Report Submission Form:**
- Single column layout (max-w-2xl)
- Field groups with space-y-4
- Geolocation picker with map preview (h-[300px])
- Photo upload with drag-drop area (h-48)
- File input shows thumbnail previews in grid-cols-3 gap-3
- Submit button: full width on mobile, w-auto on desktop

**Report Cards:**
- Grid display (grid-cols-1 md:grid-cols-2 gap-6)
- Card structure: Image thumbnail (if available, h-48), status badge, description, timestamp, location
- Status tracking timeline with connected dots

### Forms & Inputs

**Text Inputs:**
- Height: h-12
- Padding: px-4
- Border: border-2 with rounded-lg
- Focus: ring-2 ring-offset-2

**Select Dropdowns:**
- Match input styling (h-12, px-4)
- Custom arrow icon positioned right-3

**Buttons:**
- Primary actions: h-12 px-6 rounded-lg font-semibold
- Secondary actions: h-10 px-4 rounded-md font-medium
- Icon buttons: h-10 w-10 rounded-full (for actions like close, edit)
- Full-width on mobile for primary CTAs

**Search Bar:**
- Height: h-12
- Full width with icon left (pl-12)
- Debounced search with loading indicator

### Data Display

**Status Badges:**
- Inline-flex items-center px-3 py-1 rounded-full
- Text: text-sm font-medium
- Variants: Online/Offline, High/Medium/Low pressure, Resolved/Pending

**Stat Panels:**
- Large number display (text-4xl font-bold)
- Label below (text-sm)
- Trend indicator with icon and percentage (text-sm)
- Grouped in grid-cols-2 lg:grid-cols-4

**Timeline/Activity Feed:**
- Vertical line connector (border-l-2, ml-4)
- Items with rounded-lg cards, shadow-sm
- Timestamp positioned top-right (text-sm)
- Icon circles (h-8 w-8) at connection points

---

## Page Layouts

### Authority Dashboard (Main)
1. **Top Bar** (h-16): Logo, breadcrumbs, user profile, notifications
2. **Sidebar** (w-64 hidden lg:block): Persistent navigation
3. **Main Content Area:**
   - Header section (h-24): Page title, date/time, quick filters
   - Metrics Overview (grid-cols-4): Real-time key stats
   - Map Section (min-h-[600px]): Interactive zone visualization
   - Analytics Grid (grid-cols-2 gap-6): Charts for flow rates, usage patterns
   - Recent Alerts Table: Scrollable with h-[400px]

### Citizen Report Portal
1. **Header** (h-20): Logo, navigation links, login/profile
2. **Hero Section** (h-[400px]): 
   - Background: Subtle illustration of water infrastructure
   - Headline + CTA button ("Report an Issue")
   - Quick stats: Reports resolved this month, average response time
3. **Report Form Section** (py-16): Centered form with max-w-2xl
4. **Recent Reports** (py-16): Grid of status cards showing community activity
5. **Footer** (py-12): Contact info, emergency numbers, links

---

## Icons

**Icon Library:** Heroicons (via CDN)
- Use outline variant for navigation and secondary actions
- Use solid variant for status indicators and primary actions
- Size: h-5 w-5 for inline icons, h-6 w-6 for standalone buttons
- Consistent positioning: icons left of text in buttons/links

---

## Images

**Authority Dashboard:** No hero images - function over form. Use icon-based illustrations for empty states.

**Citizen Portal:**
- **Hero Background:** Isometric illustration of water infrastructure (pipelines, pumps, water towers) in abstract style - NOT photographic. Subtle, not overwhelming. Full-width, h-[400px]
- **Empty States:** Simple line illustrations when no reports exist
- **Report Photos:** User-uploaded images shown as thumbnails (aspect-ratio-square, object-cover)

---

## Responsive Behavior

**Breakpoints:**
- Mobile: < 768px - Single column, stacked navigation, simplified charts
- Tablet: 768px - 1024px - 2-column grids, sidebar collapses to overlay
- Desktop: > 1024px - Full multi-column layouts, persistent sidebar

**Mobile Optimizations:**
- Dashboard switches to vertical card stack
- Tables become horizontally scrollable with sticky first column
- Map height reduces to h-[400px]
- Metric cards stack vertically (grid-cols-1)

---

## Accessibility

- Form labels always visible (not placeholder-only)
- High contrast maintained throughout for readability
- Focus indicators: ring-2 ring-offset-2 on all interactive elements
- ARIA labels on icon-only buttons
- Keyboard navigation support for all interactive maps/charts
- Alert announcements for screen readers on real-time updates