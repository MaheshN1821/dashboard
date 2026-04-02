// ─── useInsights ──────────────────────────────────────────────────────────
//
// This is where the "smart" parts of the dashboard live. It takes the raw
// transaction list and derives everything the Insights page needs — trends,
// comparisons, top categories, etc.
//
// None of this is stored in state — it's all computed on demand using useMemo.
// Keeps the context lean and makes testing individual calculations easy.

import { useMemo } from "react";
import { useTransactionContext } from "../context/TransactionContext";
import {
	groupByMonth,
	groupByCategory,
	percentageChange,
} from "../utils/formatters";
import { CATEGORIES } from "../utils/constants";

/**
 * Derives all analytics and insight data from the full transaction list.
 * Used by InsightsPage and the dashboard summary cards.
 */
export function useInsights() {
	const { transactions } = useTransactionContext();

	// ─── Monthly Summary (for charts) ────────────────────────────────────
	// All 6 months of data, grouped and sorted chronologically.
	const monthlyData = useMemo(() => groupByMonth(transactions), [transactions]);

	// ─── Current + Previous Month ─────────────────────────────────────────
	// I'm sorting by date to find the most recent month, not assuming the
	// last item is the latest — data could come from localStorage in any order.
	const { currentMonth, previousMonth } = useMemo(() => {
		if (monthlyData.length === 0) {
			return { currentMonth: null, previousMonth: null };
		}
		const sorted = [...monthlyData].sort((a, b) => b.key.localeCompare(a.key));
		return {
			currentMonth: sorted[0] ?? null,
			previousMonth: sorted[1] ?? null,
		};
	}, [monthlyData]);

	// ─── Running Balance ──────────────────────────────────────────────────
	// Calculated across ALL transactions, sorted oldest → newest.
	// Each month gets its running balance added, which is what the trend
	// chart shows — not just income/expense per month, but cumulative position.
	const balanceTrendData = useMemo(() => {
		let runningBalance = 180000; // starting balance — matches mock data intent

		return [...monthlyData]
			.sort((a, b) => a.key.localeCompare(b.key))
			.map((m) => {
				runningBalance += m.net;
				return {
					month: m.month,
					key: m.key,
					income: m.income,
					expenses: m.expenses,
					balance: runningBalance,
					net: m.net,
				};
			});
	}, [monthlyData]);

	// ─── Summary Totals ───────────────────────────────────────────────────
	// Total income and expenses across the entire dataset (all time).
	const totals = useMemo(() => {
		const income = transactions
			.filter((tx) => tx.type === "income")
			.reduce((sum, tx) => sum + tx.amount, 0);

		const expenses = transactions
			.filter((tx) => tx.type === "expense")
			.reduce((sum, tx) => sum + tx.amount, 0);

		// Using the last calculated running balance from the trend data
		const balance =
			balanceTrendData.length > 0
				? balanceTrendData[balanceTrendData.length - 1].balance
				: 180000;

		const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

		return { income, expenses, balance, savingsRate };
	}, [transactions, balanceTrendData]);

	// ─── Current Month Summary (for summary cards) ────────────────────────
	const currentMonthSummary = useMemo(() => {
		if (!currentMonth) {
			return { income: 0, expenses: 0, savingsRate: 0 };
		}

		const savingsRate =
			currentMonth.income > 0
				? ((currentMonth.income - currentMonth.expenses) /
						currentMonth.income) *
					100
				: 0;

		return {
			income: currentMonth.income,
			expenses: currentMonth.expenses,
			savingsRate,
		};
	}, [currentMonth]);

	// ─── Month-over-Month Changes ─────────────────────────────────────────
	// Percentage change from last month to this month for each metric.
	// Used by the trend arrows on the summary cards.
	const monthOverMonth = useMemo(() => {
		if (!currentMonth || !previousMonth) {
			return { income: 0, expenses: 0, savingsRate: 0 };
		}

		const prevSavingsRate =
			previousMonth.income > 0
				? ((previousMonth.income - previousMonth.expenses) /
						previousMonth.income) *
					100
				: 0;

		const currSavingsRate =
			currentMonth.income > 0
				? ((currentMonth.income - currentMonth.expenses) /
						currentMonth.income) *
					100
				: 0;

		return {
			income: percentageChange(currentMonth.income, previousMonth.income),
			expenses: percentageChange(currentMonth.expenses, previousMonth.expenses),
			savingsRate: percentageChange(currSavingsRate, prevSavingsRate),
		};
	}, [currentMonth, previousMonth]);

	// ─── Spending Breakdown (donut chart data) ────────────────────────────
	// Only expenses, grouped by category, with percentage of total.
	// Used on both Dashboard (donut) and Insights (ranked list).
	const spendingByCategory = useMemo(() => {
		return groupByCategory(transactions).map((item) => ({
			...item,
			// Attach the category config so the chart has color + icon info ready
			config: CATEGORIES[item.category] || CATEGORIES.OTHER,
			name: CATEGORIES[item.category]?.label || item.category,
		}));
	}, [transactions]);

	// ─── Top Spending Category ────────────────────────────────────────────
	const topSpendingCategory = useMemo(() => {
		return spendingByCategory[0] ?? null;
	}, [spendingByCategory]);

	// ─── Income by Source ─────────────────────────────────────────────────
	// Groups income transactions by category for the insights section.
	// Shows how much came from Salary vs Freelance etc.
	const incomeBySource = useMemo(() => {
		const incomeOnly = transactions.filter((tx) => tx.type === "income");
		const total = incomeOnly.reduce((sum, tx) => sum + tx.amount, 0);
		const grouped = {};

		incomeOnly.forEach((tx) => {
			if (!grouped[tx.category]) grouped[tx.category] = 0;
			grouped[tx.category] += tx.amount;
		});

		return Object.entries(grouped)
			.map(([category, amount]) => ({
				category,
				amount,
				percentage: total > 0 ? (amount / total) * 100 : 0,
				name: CATEGORIES[category]?.label || category,
				config: CATEGORIES[category] || CATEGORIES.OTHER,
			}))
			.sort((a, b) => b.amount - a.amount);
	}, [transactions]);

	// ─── Best and Worst Months ────────────────────────────────────────────
	// For the insights cards that show "Your best savings month was..."
	const { bestSavingsMonth, worstSpendingMonth } = useMemo(() => {
		if (monthlyData.length === 0)
			return { bestSavingsMonth: null, worstSpendingMonth: null };

		const best = [...monthlyData].sort((a, b) => b.net - a.net)[0];
		const worst = [...monthlyData].sort((a, b) => b.expenses - a.expenses)[0];

		return { bestSavingsMonth: best, worstSpendingMonth: worst };
	}, [monthlyData]);

	// ─── Transaction Count Stats ──────────────────────────────────────────
	const transactionStats = useMemo(() => {
		const total = transactions.length;
		const incomeCount = transactions.filter(
			(tx) => tx.type === "income",
		).length;
		const expenseCount = transactions.filter(
			(tx) => tx.type === "expense",
		).length;

		// Average transaction amount (expenses only — income skews this too much)
		const avgExpense =
			expenseCount > 0
				? transactions
						.filter((tx) => tx.type === "expense")
						.reduce((sum, tx) => sum + tx.amount, 0) / expenseCount
				: 0;

		return { total, incomeCount, expenseCount, avgExpense };
	}, [transactions]);

	return {
		// Chart data
		monthlyData,
		balanceTrendData,

		// Summary metrics
		totals,
		currentMonthSummary,
		monthOverMonth,
		currentMonth,
		previousMonth,

		// Category breakdowns
		spendingByCategory,
		topSpendingCategory,
		incomeBySource,

		// Highlight moments
		bestSavingsMonth,
		worstSpendingMonth,

		// Stats
		transactionStats,
	};
}
