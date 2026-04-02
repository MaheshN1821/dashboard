// ─── useTransactions ──────────────────────────────────────────────────────
//
// This is the main data hook — it handles all the filtering, sorting, and
// pagination logic so the components don't have to think about any of it.
//
// I kept this separate from the context because the context is about *state*
// (what's stored) while this hook is about *derived data* (what to show).
// Mixing the two tends to create a mess when you need to add new filter types.

import { useMemo, useCallback } from "react";
import { useTransactionContext } from "../context/TransactionContext";
import { CATEGORIES, DEFAULT_PAGE_SIZE } from "../utils/constants";

/**
 * Main hook for accessing and manipulating transaction data.
 * Reads from TransactionContext and returns derived, filtered, paginated data.
 */
export function useTransactions() {
	const {
		transactions,
		filters,
		currentPage,
		setFilters,
		setCurrentPage,
		addTransaction,
		updateTransaction,
		deleteTransaction,
		resetTransactions,
	} = useTransactionContext();

	// ─── Filter + Sort ───────────────────────────────────────────────────
	// Runs every time transactions or filters change.
	// Order matters: filter first (cheaper), then sort the smaller set.

	const filteredAndSorted = useMemo(() => {
		let result = [...transactions];

		// Search — checks description, merchant, and category label
		if (filters.search?.trim()) {
			const query = filters.search.toLowerCase().trim();
			result = result.filter((tx) => {
				const categoryLabel =
					CATEGORIES[tx.category]?.label?.toLowerCase() || "";
				return (
					tx.description?.toLowerCase().includes(query) ||
					tx.merchant?.toLowerCase().includes(query) ||
					categoryLabel.includes(query)
				);
			});
		}

		// Type filter — "income" | "expense" | "all"
		if (filters.type && filters.type !== "all") {
			result = result.filter((tx) => tx.type === filters.type);
		}

		// Category filter — array of category keys
		if (filters.categories?.length > 0) {
			result = result.filter((tx) => filters.categories.includes(tx.category));
		}

		// Date range filter
		if (filters.dateRange && filters.dateRange !== "all") {
			const now = new Date();
			// Setting time to end of today so "today" includes the full day
			now.setHours(23, 59, 59, 999);

			let fromDate = null;

			if (filters.dateRange === "7d") {
				fromDate = new Date(now);
				fromDate.setDate(fromDate.getDate() - 7);
			} else if (filters.dateRange === "30d") {
				fromDate = new Date(now);
				fromDate.setDate(fromDate.getDate() - 30);
			} else if (filters.dateRange === "90d") {
				fromDate = new Date(now);
				fromDate.setDate(fromDate.getDate() - 90);
			} else if (filters.dateRange === "this-month") {
				fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
			} else if (filters.dateRange === "last-month") {
				fromDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
				const toDate = new Date(now.getFullYear(), now.getMonth(), 0);
				toDate.setHours(23, 59, 59, 999);
				result = result.filter((tx) => {
					const txDate = new Date(tx.date);
					return txDate >= fromDate && txDate <= toDate;
				});
				// Skip the fromDate filter below since we already handled last-month
				fromDate = null;
			}

			if (fromDate) {
				result = result.filter((tx) => new Date(tx.date) >= fromDate);
			}
		}

		// Sorting
		const [sortField, sortDir] = (filters.sort || "date-desc").split("-");

		result.sort((a, b) => {
			let comparison = 0;

			if (sortField === "date") {
				comparison = new Date(a.date) - new Date(b.date);
			} else if (sortField === "amount") {
				comparison = a.amount - b.amount;
			}

			// "desc" means we want the bigger value first, so flip the sign
			return sortDir === "desc" ? -comparison : comparison;
		});

		return result;
	}, [transactions, filters]);

	// ─── Pagination ──────────────────────────────────────────────────────
	const pageSize = DEFAULT_PAGE_SIZE;
	const totalCount = filteredAndSorted.length;
	const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

	// Clamp currentPage so we never show an empty page after filtering
	const safePage = Math.min(currentPage, totalPages);

	const paginatedTransactions = useMemo(() => {
		const start = (safePage - 1) * pageSize;
		return filteredAndSorted.slice(start, start + pageSize);
	}, [filteredAndSorted, safePage, pageSize]);

	// ─── Filter Helpers ──────────────────────────────────────────────────
	// Cleaner to have named setters than passing raw setFilters everywhere

	const setSearch = useCallback(
		(search) => {
			setFilters((prev) => ({ ...prev, search }));
			setCurrentPage(1); // reset to page 1 whenever filters change
		},
		[setFilters, setCurrentPage],
	);

	const setTypeFilter = useCallback(
		(type) => {
			setFilters((prev) => ({ ...prev, type }));
			setCurrentPage(1);
		},
		[setFilters, setCurrentPage],
	);

	const setCategoryFilter = useCallback(
		(categories) => {
			setFilters((prev) => ({ ...prev, categories }));
			setCurrentPage(1);
		},
		[setFilters, setCurrentPage],
	);

	const setDateRange = useCallback(
		(dateRange) => {
			setFilters((prev) => ({ ...prev, dateRange }));
			setCurrentPage(1);
		},
		[setFilters, setCurrentPage],
	);

	const setSort = useCallback(
		(sort) => {
			setFilters((prev) => ({ ...prev, sort }));
		},
		[setFilters],
	);

	const clearFilters = useCallback(() => {
		setFilters({
			search: "",
			type: "all",
			categories: [],
			dateRange: "all",
			sort: "date-desc",
		});
		setCurrentPage(1);
	}, [setFilters, setCurrentPage]);

	// Whether any non-default filter is active — useful for showing a clear button
	const hasActiveFilters =
		!!filters.search?.trim() ||
		(filters.type && filters.type !== "all") ||
		(filters.categories?.length ?? 0) > 0 ||
		(filters.dateRange && filters.dateRange !== "all");

	return {
		// Data
		allTransactions: transactions,
		transactions: paginatedTransactions,
		filteredTransactions: filteredAndSorted,

		// Pagination state
		currentPage: safePage,
		totalPages,
		totalCount,
		pageSize,
		setCurrentPage,

		// Filter state + setters
		filters,
		setSearch,
		setTypeFilter,
		setCategoryFilter,
		setDateRange,
		setSort,
		clearFilters,
		hasActiveFilters,

		// CRUD
		addTransaction,
		updateTransaction,
		deleteTransaction,
		resetTransactions,
	};
}
