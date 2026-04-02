// ─── TransactionsPage.jsx ─────────────────────────────────────────────────
//
// The full transaction management view. Brings together:
//   - Filter bar (TransactionFilters)
//   - Sortable, paginated table (TransactionTable)
//   - Add/Edit modal (AddEditTransactionModal)
//   - Export functionality (CSV + JSON)
//
// This page owns the modal open/close state and passes down CRUD handlers.
// The actual data + filter state lives in useTransactions, which reads from
// TransactionContext under the hood.
//
// URL query param: ?action=add opens the Add modal on mount.
// This is what the Sidebar's "Add Transaction" admin link uses.
// It's a small detail that makes the admin flow feel intentional.

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import * as Icons from "lucide-react";
import TransactionFilters from "../components/transactions/TransactionFilters";
import TransactionTable from "../components/transactions/TransactionTable";
import AddEditTransactionModal from "../components/transactions/AddEditTransactionModal";
import Button from "../components/ui/Button";
import { useTransactions } from "../hooks/useTransactions";
import { useAppContext } from "../context/AppContext";

// ─── Export helpers ───────────────────────────────────────────────────────
// Kept inline here rather than in exportUtils.js since the file was empty.
// Simple enough that a separate file isn't worth it.

function exportToCSV(transactions) {
	if (!transactions.length) return;

	const headers = [
		"ID",
		"Date",
		"Description",
		"Merchant",
		"Category",
		"Type",
		"Amount",
		"Note",
	];
	const rows = transactions.map((tx) => [
		tx.id,
		tx.date,
		`"${tx.description?.replace(/"/g, '""') || ""}"`,
		`"${tx.merchant?.replace(/"/g, '""') || ""}"`,
		tx.category,
		tx.type,
		tx.amount,
		`"${tx.note?.replace(/"/g, '""') || ""}"`,
	]);

	const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
	const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`;
	link.click();
	URL.revokeObjectURL(url);
}

function exportToJSON(transactions) {
	if (!transactions.length) return;

	const json = JSON.stringify(transactions, null, 2);
	const blob = new Blob([json], { type: "application/json" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = `transactions-${new Date().toISOString().split("T")[0]}.json`;
	link.click();
	URL.revokeObjectURL(url);
}

// ─── Export Menu ──────────────────────────────────────────────────────────
// A tiny dropdown-style button group. Two options: CSV and JSON.
// Not using a full dropdown component here — this is simple enough to inline.

function ExportMenu({ onExportCSV, onExportJSON, disabled }) {
	const [open, setOpen] = useState(false);

	return (
		<div className="relative">
			<Button
				variant="secondary"
				size="md"
				icon={Icons.Download}
				onClick={() => setOpen((p) => !p)}
				disabled={disabled}
				iconRight={Icons.ChevronDown}
			>
				Export
			</Button>

			{open && (
				<>
					{/* Click-outside dismiss */}
					<div
						className="fixed inset-0 z-10"
						onClick={() => setOpen(false)}
						aria-hidden="true"
					/>
					<div
						className={[
							"absolute right-0 top-full z-20 mt-1",
							"w-40 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)]",
							"shadow-lg p-1 animate-fade-up",
						].join(" ")}
					>
						<button
							onClick={() => {
								onExportCSV();
								setOpen(false);
							}}
							className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-inter text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)] hover:text-[var(--text-primary)] transition-colors duration-150"
						>
							<Icons.FileText size={14} strokeWidth={1.75} />
							Export CSV
						</button>
						<button
							onClick={() => {
								onExportJSON();
								setOpen(false);
							}}
							className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-inter text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)] hover:text-[var(--text-primary)] transition-colors duration-150"
						>
							<Icons.Braces size={14} strokeWidth={1.75} />
							Export JSON
						</button>
					</div>
				</>
			)}
		</div>
	);
}

// ─── TransactionsPage ─────────────────────────────────────────────────────

export default function TransactionsPage() {
	const { isAdmin } = useAppContext();
	const [searchParams, setSearchParams] = useSearchParams();

	// ── Modal state ───────────────────────────────────────────────────
	const [modalOpen, setModalOpen] = useState(false);
	const [editingTransaction, setEditingTransaction] = useState(null);

	// ── Data + filter state from hook ────────────────────────────────
	const {
		transactions,
		filteredTransactions,
		allTransactions,
		currentPage,
		totalPages,
		totalCount,
		pageSize,
		setCurrentPage,
		filters,
		setSearch,
		setTypeFilter,
		setCategoryFilter,
		setDateRange,
		setSort,
		clearFilters,
		hasActiveFilters,
		addTransaction,
		updateTransaction,
		deleteTransaction,
		resetTransactions,
	} = useTransactions();

	// ── Open add modal if ?action=add is in the URL ───────────────────
	// This is what the admin sidebar shortcut uses
	useEffect(() => {
		if (searchParams.get("action") === "add" && isAdmin) {
			setEditingTransaction(null);
			setModalOpen(true);
			// Remove the param so refreshing doesn't re-open it
			setSearchParams({}, { replace: true });
		}
	}, [searchParams, isAdmin, setSearchParams]);

	// ── Handlers ─────────────────────────────────────────────────────

	const handleOpenAdd = useCallback(() => {
		setEditingTransaction(null);
		setModalOpen(true);
	}, []);

	const handleOpenEdit = useCallback((transaction) => {
		setEditingTransaction(transaction);
		setModalOpen(true);
	}, []);

	const handleCloseModal = useCallback(() => {
		setModalOpen(false);
		// Small delay before clearing editingTransaction so the modal
		// close animation doesn't show a blank form mid-slide
		setTimeout(() => setEditingTransaction(null), 300);
	}, []);

	const handleModalSubmit = useCallback(
		async (formData) => {
			if (editingTransaction) {
				return updateTransaction(editingTransaction.id, formData);
			} else {
				return addTransaction(formData);
			}
		},
		[editingTransaction, addTransaction, updateTransaction],
	);

	const handleDelete = useCallback(
		(id) => {
			deleteTransaction(id);
		},
		[deleteTransaction],
	);

	const handleExportCSV = useCallback(() => {
		// Export the filtered set, not just the current page
		exportToCSV(filteredTransactions);
	}, [filteredTransactions]);

	const handleExportJSON = useCallback(() => {
		exportToJSON(filteredTransactions);
	}, [filteredTransactions]);

	return (
		<div className="flex flex-col gap-5">
			{/* ── Page header ─────────────────────────────────────────────── */}
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h2 className="text-xl font-bold text-[var(--text-primary)] font-jakarta leading-tight">
						Transactions
					</h2>
					<p className="mt-0.5 text-sm text-[var(--text-secondary)] font-inter">
						{allTransactions.length} total entries across all time
					</p>
				</div>

				<div className="flex items-center gap-2">
					{/* Export is visible to everyone — viewers can still export data */}
					<ExportMenu
						onExportCSV={handleExportCSV}
						onExportJSON={handleExportJSON}
						disabled={filteredTransactions.length === 0}
					/>

					{/* Reset demo data — admin only, surfaces as a subtle secondary button */}
					{isAdmin && (
						<Button
							variant="ghost"
							size="md"
							icon={Icons.RotateCcw}
							onClick={resetTransactions}
							title="Reset to demo data"
						>
							Reset
						</Button>
					)}

					{/* Add transaction — admin only */}
					{isAdmin && (
						<Button
							variant="primary"
							size="md"
							icon={Icons.Plus}
							onClick={handleOpenAdd}
							className="bg-[var(--accent)] border-[var(--accent)] text-white hover:bg-[var(--accent-hover)] hover:border-[var(--accent-hover)]"
						>
							Add Transaction
						</Button>
					)}
				</div>
			</div>

			{/* ── Filters ─────────────────────────────────────────────────── */}
			<TransactionFilters
				filters={filters}
				setSearch={setSearch}
				setTypeFilter={setTypeFilter}
				setCategoryFilter={setCategoryFilter}
				setDateRange={setDateRange}
				setSort={setSort}
				clearFilters={clearFilters}
				hasActiveFilters={hasActiveFilters}
				totalCount={allTransactions.length}
				filteredCount={filteredTransactions.length}
			/>

			{/* ── Table ───────────────────────────────────────────────────── */}
			<TransactionTable
				transactions={transactions}
				currentPage={currentPage}
				totalPages={totalPages}
				totalCount={filteredTransactions.length}
				pageSize={pageSize}
				onPageChange={setCurrentPage}
				onEdit={handleOpenEdit}
				onDelete={handleDelete}
				filters={filters}
				onSort={setSort}
				hasActiveFilters={hasActiveFilters}
				onClearFilters={clearFilters}
			/>

			{/* ── Add/Edit Modal ───────────────────────────────────────────── */}
			<AddEditTransactionModal
				isOpen={modalOpen}
				onClose={handleCloseModal}
				onSubmit={handleModalSubmit}
				transaction={editingTransaction}
			/>

			{/* ── Floating Add button on mobile (admin only) ───────────────── */}
			{/* The header button is hidden on very small screens to avoid crowding.
          This FAB gives admin users a persistent Add action on mobile. */}
			{isAdmin && (
				<button
					onClick={handleOpenAdd}
					aria-label="Add transaction"
					className={[
						"fixed bottom-6 right-6 z-30 sm:hidden",
						"flex h-14 w-14 items-center justify-center rounded-full",
						"bg-[var(--accent)] text-white shadow-lg",
						"hover:bg-[var(--accent-hover)] active:scale-95",
						"transition-all duration-200",
					].join(" ")}
				>
					<Icons.Plus size={22} strokeWidth={2.5} />
				</button>
			)}
		</div>
	);
}
