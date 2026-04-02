// ─── TransactionContext ───────────────────────────────────────────────────
//
// This manages two things: the transaction list and the current filter state.
// Keeping them together makes sense because filters are only meaningful in
// the context of the transaction data they operate on.
//
// CRUD operations update state AND localStorage so data persists on refresh.
// On first load, we seed from MOCK_TRANSACTIONS if localStorage is empty.

import {
	createContext,
	useContext,
	useState,
	useCallback,
	useMemo,
} from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { MOCK_TRANSACTIONS } from "../data/mockData";
import { STORAGE_KEYS } from "../utils/constants";

const TransactionContext = createContext(null);

// ─── Default Filter State ─────────────────────────────────────────────────
// Centralizing this so resetFilters always goes back to exactly this shape.
const DEFAULT_FILTERS = {
	search: "",
	type: "all", // "all" | "income" | "expense"
	categories: [], // array of category keys like ["FOOD", "TRANSPORT"]
	dateRange: "all", // matches DATE_RANGE_OPTIONS values in constants.js
	sort: "date-desc", // matches SORT_OPTIONS values
};

export function TransactionProvider({ children }) {
	// ─── Transaction Data ─────────────────────────────────────────────────
	// Seeding from mock data on first visit. After that, localStorage takes over.
	// The useLocalStorage hook handles the read/write/sync automatically.

	const [transactions, setTransactions] = useLocalStorage(
		STORAGE_KEYS.TRANSACTIONS,
		MOCK_TRANSACTIONS,
	);

	// ─── Filter State ─────────────────────────────────────────────────────
	// Filters aren't persisted — they reset on page refresh. This is intentional;
	// persisting filters usually surprises users more than it helps them.

	const [filters, setFilters] = useState(DEFAULT_FILTERS);
	const [currentPage, setCurrentPage] = useState(1);

	// ─── CRUD Operations ──────────────────────────────────────────────────
	// Each operation returns a boolean so the caller can show success/error UI.

	const addTransaction = useCallback(
		(txData) => {
			try {
				// Generating ID client-side — format matches the mock data IDs
				const newTx = {
					...txData,
					id: `TXN${Date.now()}`,
					// Normalize amount — store as positive number, type determines sign
					amount: Math.abs(Number(txData.amount)),
				};

				setTransactions((prev) => [newTx, ...prev]);
				return true;
			} catch (err) {
				console.error("[TransactionContext] addTransaction failed:", err);
				return false;
			}
		},
		[setTransactions],
	);

	const updateTransaction = useCallback(
		(id, updates) => {
			try {
				setTransactions((prev) =>
					prev.map((tx) =>
						tx.id === id
							? {
									...tx,
									...updates,
									// Keep amount positive — same reason as above
									amount:
										updates.amount !== undefined
											? Math.abs(Number(updates.amount))
											: tx.amount,
									id, // ID can never be overwritten
								}
							: tx,
					),
				);
				return true;
			} catch (err) {
				console.error("[TransactionContext] updateTransaction failed:", err);
				return false;
			}
		},
		[setTransactions],
	);

	const deleteTransaction = useCallback(
		(id) => {
			try {
				setTransactions((prev) => prev.filter((tx) => tx.id !== id));
				return true;
			} catch (err) {
				console.error("[TransactionContext] deleteTransaction failed:", err);
				return false;
			}
		},
		[setTransactions],
	);

	// Handy for a "reset to demo data" button — useful for an assignment demo
	const resetTransactions = useCallback(() => {
		setTransactions(MOCK_TRANSACTIONS);
		setFilters(DEFAULT_FILTERS);
		setCurrentPage(1);
	}, [setTransactions]);

	// ─── Context Value ────────────────────────────────────────────────────
	// Split into two separate memo calls so components that only read transactions
	// don't re-render when filters change (and vice versa) — small optimization
	// that becomes noticeable if the transaction list is large.

	const value = useMemo(
		() => ({
			// Data
			transactions,

			// Filters + pagination (raw state — derived/computed in useTransactions)
			filters,
			setFilters,
			currentPage,
			setCurrentPage,

			// CRUD
			addTransaction,
			updateTransaction,
			deleteTransaction,
			resetTransactions,
		}),
		[
			transactions,
			filters,
			currentPage,
			addTransaction,
			updateTransaction,
			deleteTransaction,
			resetTransactions,
		],
	);

	return (
		<TransactionContext.Provider value={value}>
			{children}
		</TransactionContext.Provider>
	);
}

// ─── Hook ─────────────────────────────────────────────────────────────────
export function useTransactionContext() {
	const ctx = useContext(TransactionContext);
	if (!ctx) {
		throw new Error(
			"useTransactionContext must be used inside <TransactionProvider>",
		);
	}
	return ctx;
}
