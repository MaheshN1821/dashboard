# Finly - Finance Dashboard

Finly is a responsive personal finance dashboard built as a frontend take-home assignment. It helps users track transactions, review spending patterns, inspect monthly balance trends, and act on data-driven insights. The app is designed as a polished single-page experience with dark/light theme support, local persistence, responsive layouts, and a clean dashboard-style information hierarchy.

## Live Product Summary

The application is organized around three core views:

- **Dashboard** - a high-level overview of current financial activity
- **Transactions** - a full transaction management workspace with filters, sorting, pagination, CRUD actions, and export options
- **Insights** - a more analytical page that turns raw transaction data into charts and written observations

The app is entirely frontend-driven. Transaction data, theme preference, and role state are stored in `localStorage`, which makes the experience persistent across reloads without requiring a backend.

## What This Project Demonstrates

This project was built to show practical frontend fundamentals rather than only visual polish. It focuses on:

- Component-driven UI design
- State management with React context and custom hooks
- Data derivation and memoization for performance
- Responsive layouts for desktop and mobile
- Dark mode and theme persistence
- Reusable UI primitives
- Clear visual hierarchy and finance-focused UX
- Local-only persistence and mock data seeding

## Features

### Dashboard

- Greeting header with contextual time-based message
- Admin-only quick action to add a transaction
- Four summary metric cards:
  - Total balance
  - Monthly income
  - Monthly expenses
  - Savings rate
- Balance trend chart with a toggleable income vs expenses view
- Spending breakdown donut chart by category
- Quick insight banner that highlights the most important spending pattern
- Recent transactions preview with links to the full transactions page

### Transactions

- Full transaction table with a sticky header
- Search across description, merchant, and category label
- Type filters for income, expense, or all
- Multi-select category pills
- Date range filters
- Sort by date or amount
- Pagination with compact page controls
- Add, edit, and delete transactions
- Delete confirmation overlay for destructive actions
- Export transactions as CSV or JSON
- Admin-only actions, with viewer mode as read-only

### Insights

- Monthly comparison chart
- Top category analysis
- Income sources breakdown
- Analytical summary cards for key metrics
- Data-driven observation cards generated from the current transaction set
- Highlight moments such as best savings month and highest spending month

### Global Experience

- Dark and light themes
- Theme state persisted in local storage
- Role toggle for admin/viewer demo flows
- Fully responsive layout with sidebar and topbar shell
- Shared design tokens through CSS variables
- Finance-focused color system with semantic success, warning, and danger states

## Tech Stack

- **React 19** - application framework
- **Vite** - fast dev server and build tooling
- **React Router** - page routing
- **Tailwind CSS** - utility-first styling
- **Recharts** - charting library
- **Lucide React** - icon set
- **LocalStorage** - persistence for theme, role, and transaction data

## Project Structure

```text
src/
	components/
		dashboard/        Dashboard cards, charts, and recent transaction preview
		insights/         Insight cards, category badges, and monthly comparison UI
		layout/           App shell, sidebar, and topbar
		transactions/     Filters, table, rows, and add/edit modal
		ui/               Reusable primitives like Button, Card, Modal, Input, Select
	context/            App-wide theme/role state and transaction state
	data/               Mock transaction seed data
	hooks/              Derived data hooks and local storage helper
	pages/              Dashboard, Transactions, and Insights routes
	utils/              Constants, formatters, and export helpers
```

## Architecture Overview

### App Shell

The app is wrapped in a shared layout that provides the sidebar, topbar, and main content area. Pages are rendered inside this shell so the navigation and responsive structure remain consistent across the app.

### State Management

There are two main context layers:

- **AppContext** handles global app preferences such as theme and role
- **TransactionContext** manages the transaction list, filters, pagination state, and CRUD operations

This separation keeps unrelated state from causing unnecessary re-renders and makes the code easier to reason about.

### Derived Data Hooks

Most analytics are not stored manually. Instead, they are derived from the transaction list:

- `useTransactions` handles filtering, sorting, and pagination
- `useInsights` derives dashboard and analytics metrics such as totals, monthly summaries, category breakdowns, and trend data

This means the UI is always consistent with the current dataset and there is less duplication of logic across components.

### Persistence

The app uses `localStorage` for three key areas:

- Theme preference
- Role selection
- Transaction data

If no saved transaction data exists, the app seeds itself with realistic mock financial activity.

## Data Model

Each transaction includes:

- `id`
- `date`
- `description`
- `merchant`
- `category`
- `type` (`income` or `expense`)
- `amount`
- `note`

Categories are defined centrally in `src/utils/constants.js` and include metadata such as label, icon, chart color, and light/dark background swatches.

## Design System

The UI uses a custom finance-oriented design system built with CSS variables in `src/index.css`.

Key token groups include:

- Background surfaces
- Borders
- Primary and secondary text
- Accent colors
- Success, danger, and warning states
- Chart palette colors

This makes it easy to keep dark mode and light mode visually aligned while still supporting theme-specific contrast.

### Visual Style

- Clean, card-based financial layout
- Strong typographic hierarchy using Plus Jakarta Sans, Inter, and DM Mono
- Compact but readable data tables
- Semi-analytical dashboard presentation
- Subtle motion for route changes and card reveals

## Key User Flows

### 1. View Overview

Users land on the dashboard and immediately see high-level financial status, trends, recent activity, and a quick insight about spending behavior.

### 2. Manage Transactions

The transactions page is the operational hub. Users can search, filter, sort, paginate, export, and manage transaction records without leaving the page.

### 3. Read Insights

The insights page transforms the transaction history into charts and observations so the user can understand what the data means, not just what it contains.

### 4. Toggle Theme and Role

The topbar allows switching between light and dark mode as well as admin and viewer roles. This is useful both for presentation and for demonstrating role-based UI states.

## Installation and Setup

### Prerequisites

- Node.js 18+ recommended
- npm installed

### Install Dependencies

```bash
npm install
```

### Start the Dev Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview the Production Build

```bash
npm run preview
```

### Lint the Codebase

```bash
npm run lint
```

## Available Scripts

- `npm run dev` - starts the Vite development server
- `npm run build` - creates a production build
- `npm run preview` - previews the production build locally
- `npm run lint` - runs ESLint across the project

## Component Breakdown

### Layout

- `Sidebar` - app navigation and role-aware quick action
- `Topbar` - page title, role toggle, theme toggle, and mobile menu trigger
- `Layout` - shared shell for routes and content spacing

### Dashboard Components

- `SummaryCards` - top-level financial metrics with monthly trend context
- `BalanceTrendChart` - balance and income/expense visualization
- `SpendingBreakdownChart` - category donut chart with interactive legend
- `RecentTransactions` - compact recent activity preview

### Insights Components

- `InsightCard` - reusable metric card presentation
- `MonthlyComparison` - month-over-month comparative chart/table view
- `TopCategoryBadge` - top spending category summary

### Transactions Components

- `TransactionFilters` - search, filter, and sort controls
- `TransactionTable` - data table, pagination, and delete confirmation
- `TransactionRow` - individual transaction row rendering
- `AddEditTransactionModal` - add/edit drawer form with validation

### UI Primitives

- `Button`
- `Card`
- `Modal`
- `Input`
- `Select`
- `Tooltip`
- `Badge`
- `EmptyState`

## Accessibility and UX Considerations

The UI includes several usability-focused choices:

- Keyboard-friendly button and input styling
- Clear contrast between surfaces and text in both themes
- Sticky table headers for long transaction lists
- Responsive navigation with a mobile drawer
- Inline validation for transaction forms
- Readable numeric typography using a monospaced font
- Confirmation step before deleting transactions

## Notes for Reviewers

This is a frontend-only assignment project, so the emphasis is on UX, component architecture, state management, and data visualization rather than backend integration.

The app intentionally uses realistic mock financial data to show how the interface behaves with meaningful content instead of placeholder text. The goal is to demonstrate product thinking, not just implementation.

## Future Improvements

If this were extended into a production product, the next logical steps would be:

- Add backend persistence and authentication
- Support multi-currency formatting
- Add transaction categories management
- Add advanced reporting and date grouping options
- Add downloadable PDF reports
- Add real user onboarding and empty state guidance
- Introduce tests for critical filtering and analytics logic

## License

This project was created as a take-home frontend assignment demonstration.
