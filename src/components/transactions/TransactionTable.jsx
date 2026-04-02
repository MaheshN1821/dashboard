// ─── TransactionTable.jsx ─────────────────────────────────────────────────
//
// The full sortable, paginated table. This component is mostly layout —
// it renders the table shell, header row, and pagination controls.
// The actual row data is delegated to TransactionRow.
//
// The sticky header keeps column labels visible while scrolling tall lists.
// On mobile, less important columns (date, category, type) hide progressively
// so the core info (description + amount) always fits.
//
// A delete confirmation is handled inline via a small confirm state —
// clicking delete shows a mini confirm prompt in a tooltip-style popover
// rather than a full modal. Less disruptive for a destructive action.

import { useState, useCallback } from "react";
import * as Icons from "lucide-react";
import TransactionRow from "./TransactionRow";
import EmptyState from "../ui/EmptyState";
import Button from "../ui/Button";
import { useAppContext } from "../../context/AppContext";

// ─── Sortable Column Header ───────────────────────────────────────────────
// Clicking a sortable header updates the sort — clicking again flips direction.
// The current sort is communicated via an arrow icon.

function SortableHeader({
	label,
	sortKey,
	currentSort,
	onSort,
	className = "",
}) {
	const [field, dir] = (currentSort || "date-desc").split("-");
	const isActive = field === sortKey;
	const isDesc = dir === "desc";

	function handleClick() {
		if (isActive) {
			// Flip direction
			onSort(`${sortKey}-${isDesc ? "asc" : "desc"}`);
		} else {
			// Default to desc on first click (highest/newest first)
			onSort(`${sortKey}-desc`);
		}
	}

	return (
		<th
			className={[
				"py-3 text-xs font-semibold uppercase tracking-wider font-inter",
				"text-[var(--text-muted)] cursor-pointer select-none whitespace-nowrap",
				"hover:text-[var(--text-secondary)] transition-colors duration-150",
				className,
			].join(" ")}
			onClick={handleClick}
		>
			<span className="flex items-center gap-1">
				{label}
				{isActive ? (
					isDesc ? (
						<Icons.ArrowDown
							size={11}
							strokeWidth={2.5}
							className="text-accent-500"
						/>
					) : (
						<Icons.ArrowUp
							size={11}
							strokeWidth={2.5}
							className="text-accent-500"
						/>
					)
				) : (
					<Icons.ArrowUpDown
						size={11}
						strokeWidth={1.75}
						className="opacity-40"
					/>
				)}
			</span>
		</th>
	);
}

// ─── Pagination Controls ──────────────────────────────────────────────────

function Pagination({
	currentPage,
	totalPages,
	totalCount,
	pageSize,
	onPageChange,
}) {
	if (totalPages <= 1) return null;

	const from = (currentPage - 1) * pageSize + 1;
	const to = Math.min(currentPage * pageSize, totalCount);

	// Build page number buttons — show first, last, current, and neighbors
	function getPageNumbers() {
		const pages = [];
		const delta = 1; // how many pages around current to show

		for (let i = 1; i <= totalPages; i++) {
			if (
				i === 1 ||
				i === totalPages ||
				(i >= currentPage - delta && i <= currentPage + delta)
			) {
				pages.push(i);
			} else if (pages[pages.length - 1] !== "...") {
				pages.push("...");
			}
		}
		return pages;
	}

	return (
		<div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between border-t border-[var(--border-default)]">
			{/* Result range */}
			<p className="text-xs text-[var(--text-muted)] font-inter">
				Showing{" "}
				<span className="font-medium text-[var(--text-secondary)]">
					{from}–{to}
				</span>{" "}
				of{" "}
				<span className="font-medium text-[var(--text-secondary)]">
					{totalCount}
				</span>
			</p>

			{/* Page buttons */}
			<div className="flex items-center gap-1">
				<Button
					variant="secondary"
					size="sm"
					icon={Icons.ChevronLeft}
					onClick={() => onPageChange(currentPage - 1)}
					disabled={currentPage === 1}
					aria-label="Previous page"
				/>

				{getPageNumbers().map((page, i) =>
					page === "..." ? (
						<span
							key={`ellipsis-${i}`}
							className="px-2 text-xs text-[var(--text-muted)] font-inter"
						>
							…
						</span>
					) : (
						<button
							key={page}
							onClick={() => onPageChange(page)}
							className={[
								"h-8 min-w-8 rounded-md px-2.5 text-xs font-medium font-inter transition-all duration-150",
								page === currentPage
									? "bg-accent-600 text-white shadow-xs"
									: "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)] hover:text-[var(--text-primary)]",
							].join(" ")}
							aria-label={`Page ${page}`}
							aria-current={page === currentPage ? "page" : undefined}
						>
							{page}
						</button>
					),
				)}

				<Button
					variant="secondary"
					size="sm"
					icon={Icons.ChevronRight}
					onClick={() => onPageChange(currentPage + 1)}
					disabled={currentPage === totalPages}
					aria-label="Next page"
				/>
			</div>
		</div>
	);
}

// ─── Delete Confirm ───────────────────────────────────────────────────────
// Inline mini-confirmation overlay — less heavy than a full modal for a
// delete action. Shows the transaction name and two buttons.

function DeleteConfirmOverlay({ transaction, onConfirm, onCancel }) {
	if (!transaction) return null;

	return (
		<div className="fixed inset-0 z-40 flex items-end justify-center p-4 sm:items-center">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-gray-900/30 dark:bg-black/40 backdrop-blur-sm"
				onClick={onCancel}
				aria-hidden="true"
			/>
			{/* Card */}
			<div
				className={[
					"relative z-10 w-full max-w-sm rounded-2xl",
					"bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xl p-5",
					"animate-fade-up",
				].join(" ")}
			>
				<div className="flex items-start gap-3 mb-4">
					<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-danger-50 dark:bg-danger-500/10">
						<Icons.Trash2
							size={16}
							className="text-danger-500"
							strokeWidth={2}
						/>
					</div>
					<div>
						<p className="text-sm font-semibold text-[var(--text-primary)] font-jakarta">
							Delete transaction?
						</p>
						<p className="mt-0.5 text-xs text-[var(--text-secondary)] font-inter">
							<span className="font-medium">"{transaction.description}"</span>{" "}
							will be permanently removed.
						</p>
					</div>
				</div>

				<div className="flex items-center justify-end gap-2">
					<Button variant="secondary" size="sm" onClick={onCancel}>
						Cancel
					</Button>
					<Button variant="danger" size="sm" onClick={onConfirm}>
						Delete
					</Button>
				</div>
			</div>
		</div>
	);
}

// ─── TransactionTable ─────────────────────────────────────────────────────

export default function TransactionTable({
	transactions,
	currentPage,
	totalPages,
	totalCount,
	pageSize,
	onPageChange,
	onEdit,
	onDelete,
	filters,
	onSort,
	hasActiveFilters,
	onClearFilters,
}) {
	const { isAdmin } = useAppContext();
	const [deleteTarget, setDeleteTarget] = useState(null);

	const handleDeleteRequest = useCallback((transaction) => {
		setDeleteTarget(transaction);
	}, []);

	const handleDeleteConfirm = useCallback(() => {
		if (deleteTarget) {
			onDelete(deleteTarget.id);
			setDeleteTarget(null);
		}
	}, [deleteTarget, onDelete]);

	const handleDeleteCancel = useCallback(() => {
		setDeleteTarget(null);
	}, []);

	return (
		<>
			{/* ── Table wrapper — horizontal scroll on mobile ────────────── */}
			<div className="overflow-x-auto rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)]">
				{transactions.length === 0 ? (
					<div className="py-16 px-6">
						<EmptyState
							type={hasActiveFilters ? "no-results" : "no-transactions"}
							title={
								hasActiveFilters
									? "No matching transactions"
									: "No transactions yet"
							}
							description={
								hasActiveFilters
									? "Try adjusting or clearing your filters"
									: "Add your first transaction using the button above"
							}
							action={
								hasActiveFilters
									? { label: "Clear filters", onClick: onClearFilters }
									: undefined
							}
						/>
					</div>
				) : (
					<table className="w-full">
						{/* ── Sticky header ─────────────────────────────────────── */}
						<thead className="sticky top-0 z-10">
							<tr className="border-b border-[var(--border-default)] bg-[var(--bg-surface-2)]">
								{/* Icon column — no label */}
								<th
									className="py-3 pl-5 pr-3 w-10"
									aria-label="Category icon"
								/>

								<SortableHeader
									label="Description"
									sortKey="description"
									currentSort={filters.sort}
									onSort={onSort}
									className="text-left"
								/>

								<SortableHeader
									label="Date"
									sortKey="date"
									currentSort={filters.sort}
									onSort={onSort}
									className="text-left hidden sm:table-cell"
								/>

								<th className="py-3 pr-4 text-left text-xs font-semibold uppercase tracking-wider font-inter text-[var(--text-muted)] hidden md:table-cell">
									Category
								</th>

								<th className="py-3 pr-4 text-left text-xs font-semibold uppercase tracking-wider font-inter text-[var(--text-muted)] hidden lg:table-cell">
									Type
								</th>

								<SortableHeader
									label="Amount"
									sortKey="amount"
									currentSort={filters.sort}
									onSort={onSort}
									className="text-right pr-4"
								/>

								{/* Actions column — always reserved */}
								<th className="py-3 pl-2 pr-5 w-20" aria-label="Actions" />
							</tr>
						</thead>

						{/* ── Body ──────────────────────────────────────────────── */}
						<tbody>
							{transactions.map((tx) => (
								<TransactionRow
									key={tx.id}
									transaction={tx}
									onEdit={onEdit}
									onDelete={handleDeleteRequest}
									isAdmin={isAdmin}
								/>
							))}
						</tbody>
					</table>
				)}

				{/* ── Pagination ────────────────────────────────────────────── */}
				{transactions.length > 0 && (
					<Pagination
						currentPage={currentPage}
						totalPages={totalPages}
						totalCount={totalCount}
						pageSize={pageSize}
						onPageChange={onPageChange}
					/>
				)}
			</div>

			{/* ── Delete confirmation overlay ────────────────────────────── */}
			<DeleteConfirmOverlay
				transaction={deleteTarget}
				onConfirm={handleDeleteConfirm}
				onCancel={handleDeleteCancel}
			/>
		</>
	);
}
