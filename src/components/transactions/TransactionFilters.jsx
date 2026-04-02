// ─── TransactionFilters.jsx ───────────────────────────────────────────────
//
// The filter bar above the transactions table. Controls:
//   - Search (text)
//   - Type (All / Income / Expense)
//   - Category (multi-select — pill toggles)
//   - Date range (dropdown)
//   - Sort (dropdown)
//
// The type filter is rendered as pill buttons rather than a dropdown —
// three options max, and pills are faster to toggle and easier to scan.
// Category filter also uses pills but is collapsible since there are 12.
//
// I'm accepting all setters as props from the parent (TransactionsPage)
// which gets them from useTransactions. This keeps the filter component
// stateless and easy to test.

import { useState } from "react";
import * as Icons from "lucide-react";
import { SearchInput } from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import {
	CATEGORIES,
	SORT_OPTIONS,
	DATE_RANGE_OPTIONS,
} from "../../utils/constants";

// ─── Type Filter Pills ────────────────────────────────────────────────────

function TypePills({ value, onChange }) {
	const options = [
		{ value: "all", label: "All" },
		{ value: "income", label: "Income" },
		{ value: "expense", label: "Expense" },
	];

	return (
		<div className="flex items-center gap-1 rounded-lg bg-[var(--bg-surface-2)] p-1">
			{options.map((opt) => (
				<button
					key={opt.value}
					onClick={() => onChange(opt.value)}
					className={[
						"rounded-md px-3 py-1.5 text-xs font-medium font-inter transition-all duration-200",
						value === opt.value
							? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs"
							: "text-[var(--text-muted)] hover:text-[var(--text-secondary)]",
					].join(" ")}
				>
					{opt.label}
				</button>
			))}
		</div>
	);
}

// ─── Category Pills ───────────────────────────────────────────────────────
// Shows all category options as toggleable pills.
// Selected ones get filled with the category's own color.
// Collapses to show just active ones + "Show all" when none are selected.

function CategoryPills({ selected, onChange }) {
	const [expanded, setExpanded] = useState(false);

	const allCategories = Object.entries(CATEGORIES);

	// In collapsed mode, show the first 5 + any active ones
	const visibleCategories = expanded
		? allCategories
		: allCategories.filter(([key], i) => i < 5 || selected.includes(key));

	function toggleCategory(key) {
		if (selected.includes(key)) {
			onChange(selected.filter((k) => k !== key));
		} else {
			onChange([...selected, key]);
		}
	}

	return (
		<div className="flex flex-wrap items-center gap-1.5">
			{visibleCategories.map(([key, config]) => {
				const isActive = selected.includes(key);
				return (
					<button
						key={key}
						onClick={() => toggleCategory(key)}
						className={[
							"inline-flex items-center gap-1.5 rounded-full px-2.5 py-1",
							"text-xs font-medium font-inter border transition-all duration-150",
							isActive
								? "text-white border-transparent"
								: "bg-[var(--bg-surface)] border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]",
						].join(" ")}
						style={
							isActive
								? { backgroundColor: config.color, borderColor: config.color }
								: {}
						}
					>
						{/* Dot only when not active — active is already colored */}
						{!isActive && (
							<span
								className="h-1.5 w-1.5 rounded-full shrink-0"
								style={{ backgroundColor: config.color }}
							/>
						)}
						{config.label}
					</button>
				);
			})}

			{/* Show more / less toggle */}
			<button
				onClick={() => setExpanded((p) => !p)}
				className="text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-secondary)] font-inter transition-colors duration-150"
			>
				{expanded ? "Show less" : `+${allCategories.length - 5} more`}
			</button>
		</div>
	);
}

// ─── TransactionFilters ───────────────────────────────────────────────────

export default function TransactionFilters({
	filters,
	setSearch,
	setTypeFilter,
	setCategoryFilter,
	setDateRange,
	setSort,
	clearFilters,
	hasActiveFilters,
	totalCount,
	filteredCount,
}) {
	// Track whether the category section is visible — collapsed by default
	// to keep the filter bar compact on first load
	const [showCategories, setShowCategories] = useState(false);

	return (
		<div className="flex flex-col gap-3">
			{/* ── Row 1: Search + Type + Date + Sort ──────────────────────── */}
			<div className="flex flex-wrap items-center gap-2">
				{/* Search — takes remaining space */}
				<div className="flex-1 min-w-[180px]">
					<SearchInput
						value={filters.search}
						onChange={(e) => setSearch(e.target.value)}
						onClear={() => setSearch("")}
						placeholder="Search transactions..."
					/>
				</div>

				{/* Type pills */}
				<TypePills value={filters.type} onChange={setTypeFilter} />

				{/* Date range */}
				<Select
					value={filters.dateRange}
					onChange={(e) => setDateRange(e.target.value)}
					options={DATE_RANGE_OPTIONS}
					size="md"
					className="min-w-[130px]"
				/>

				{/* Sort */}
				<Select
					value={filters.sort}
					onChange={(e) => setSort(e.target.value)}
					options={SORT_OPTIONS}
					size="md"
					className="min-w-[160px]"
				/>

				{/* Category toggle button */}
				<Button
					variant="secondary"
					size="md"
					icon={Icons.Tag}
					onClick={() => setShowCategories((p) => !p)}
					className={
						filters.categories.length > 0
							? "border-accent-400 text-accent-600 dark:border-accent-500 dark:text-accent-400"
							: ""
					}
				>
					Categories
					{filters.categories.length > 0 && (
						<span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent-600 text-[10px] text-white dark:bg-accent-500">
							{filters.categories.length}
						</span>
					)}
				</Button>

				{/* Clear filters — only shown when something is active */}
				{hasActiveFilters && (
					<Button
						variant="ghost"
						size="md"
						icon={Icons.X}
						onClick={clearFilters}
					>
						Clear
					</Button>
				)}
			</div>

			{/* ── Row 2: Category pills (collapsible) ─────────────────────── */}
			{showCategories && (
				<div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface-2)] p-3">
					<p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] font-inter">
						Filter by category
					</p>
					<CategoryPills
						selected={filters.categories}
						onChange={setCategoryFilter}
					/>
				</div>
			)}

			{/* ── Results count ────────────────────────────────────────────── */}
			{/* Shows total or filtered count depending on active filters */}
			<div className="flex items-center justify-between">
				<p className="text-xs text-[var(--text-muted)] font-inter">
					{hasActiveFilters ? (
						<>
							Showing{" "}
							<span className="font-medium text-[var(--text-secondary)]">
								{filteredCount}
							</span>{" "}
							of{" "}
							<span className="font-medium text-[var(--text-secondary)]">
								{totalCount}
							</span>{" "}
							transactions
						</>
					) : (
						<>
							<span className="font-medium text-[var(--text-secondary)]">
								{totalCount}
							</span>{" "}
							transactions total
						</>
					)}
				</p>
			</div>
		</div>
	);
}
