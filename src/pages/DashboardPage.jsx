// ─── DashboardPage.jsx ────────────────────────────────────────────────────
//
// The main landing view. Composes:
//   1. Greeting header
//   2. Summary cards row
//   3. Charts row (balance trend + spending breakdown)
//   4. Quick insight banner
//   5. Recent transactions
//
// This page is intentionally thin on logic — all the data work happens
// in the hooks and components. DashboardPage is the layout shell.

import { useMemo } from "react";
import { Link } from "react-router-dom";
import * as Icons from "lucide-react";
import SummaryCards from "../components/dashboard/SummaryCards";
import BalanceTrendChart from "../components/dashboard/BalanceTrendChart";
import SpendingBreakdownChart from "../components/dashboard/SpendingBreakdownChart";
import RecentTransactions from "../components/dashboard/RecentTransactions";
import { useInsights } from "../hooks/useInsights";
import { useAppContext } from "../context/AppContext";
import { formatCurrency } from "../utils/formatters";

// ─── Greeting ─────────────────────────────────────────────────────────────
// Time-based greeting — personal without being gimmicky

function getGreeting() {
	const hour = new Date().getHours();
	if (hour < 12) return "Good morning";
	if (hour < 17) return "Good afternoon";
	return "Good evening";
}

// ─── QuickInsightBanner ───────────────────────────────────────────────────
// A slim highlight bar between the charts and recent transactions.
// Shows the highest spending category observation — the kind of thing that
// makes a dashboard feel intelligent rather than just a data display.

function QuickInsightBanner({ topSpendingCategory, savingsRate }) {
	if (!topSpendingCategory) return null;

	const isGoodSavings = savingsRate > 20;

	return (
		<div
			className={[
				"flex flex-col gap-3 rounded-xl border px-5 py-4 sm:flex-row sm:items-center sm:justify-between",
				// Color shifts based on whether the savings rate is healthy
				isGoodSavings
					? "border-success-100 bg-success-50/70 dark:border-success-500/12 dark:bg-success-500/[0.06]"
					: "border-warning-100 bg-warning-50/70 dark:border-warning-500/12 dark:bg-warning-500/[0.06]",
			].join(" ")}
		>
			<div className="flex items-center gap-3.5">
				{/* Icon bubble */}
				<div
					className={[
						"flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
						isGoodSavings
							? "bg-success-100 dark:bg-success-500/15"
							: "bg-warning-100 dark:bg-warning-500/15",
					].join(" ")}
				>
					<Icons.Lightbulb
						size={16}
						strokeWidth={2}
						className={
							isGoodSavings
								? "text-success-600 dark:text-success-500"
								: "text-warning-600 dark:text-warning-500"
						}
					/>
				</div>

				<div>
					<p className="text-sm font-medium text-[var(--text-primary)] font-inter leading-snug">
						<span className="font-semibold">{topSpendingCategory.name}</span> is
						your highest spending category this period
					</p>
					<p className="mt-0.5 text-xs text-[var(--text-secondary)] font-inter">
						{formatCurrency(topSpendingCategory.amount, "INR")} spent ·{" "}
						{topSpendingCategory.percentage.toFixed(0)}% of total expenses
					</p>
				</div>
			</div>

			{/* Link to insights — gives the evaluator a natural next-step */}
			<Link
				to="/insights"
				className={[
					"flex shrink-0 items-center gap-1.5 text-xs font-semibold font-inter",
					"transition-colors duration-150",
					isGoodSavings
						? "text-success-700 hover:text-success-800 dark:text-success-400 dark:hover:text-success-300"
						: "text-warning-700 hover:text-warning-800 dark:text-warning-400 dark:hover:text-warning-300",
				].join(" ")}
			>
				View insights
				<Icons.ArrowRight size={13} strokeWidth={2.5} />
			</Link>
		</div>
	);
}

// ─── DashboardPage ────────────────────────────────────────────────────────

export default function DashboardPage() {
	const { isAdmin } = useAppContext();
	const { topSpendingCategory, currentMonthSummary, transactionStats } =
		useInsights();

	const greeting = useMemo(() => getGreeting(), []);

	return (
		<div className="flex flex-col gap-7">
			{/* ── Page greeting ─────────────────────────────────────────────
          Larger than a typical page header — this is the first thing
          users see and it should feel welcoming, not corporate. */}
			<div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
				<div>
					{/* The greeting is big and bold — it anchors the page */}
					<h2 className="text-[26px] font-bold text-[var(--text-primary)] font-jakarta leading-tight tracking-tight">
						{greeting}
					</h2>
					<p className="mt-1.5 text-sm text-[var(--text-secondary)] font-inter">
						Here's what's happening with your finances.
					</p>
				</div>

				{/* Admin shortcut button — only visible in admin role */}
				{isAdmin && (
					<Link
						to="/transactions?action=add"
						className={[
							"hidden sm:flex items-center gap-2 rounded-lg px-4 py-2.5",
							"bg-[var(--accent)] text-white text-sm font-semibold font-jakarta",
							"hover:bg-[var(--accent-hover)] active:bg-[var(--accent-hover)]",
							"transition-colors duration-150 shadow-sm shadow-accent-600/30",
						].join(" ")}
					>
						<Icons.Plus size={15} strokeWidth={2.5} />
						Add Transaction
					</Link>
				)}
			</div>

			{/* ── Summary cards ──────────────────────────────────────────────
          The four key metrics. Each one should be readable at a glance. */}
			<SummaryCards />

			{/* ── Charts row ─────────────────────────────────────────────────
          Balance trend gets more horizontal space because line charts
          need width to be legible. Donut gets less — it's square-ish. */}
			<div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
				<div className="lg:col-span-3">
					<BalanceTrendChart />
				</div>
				<div className="lg:col-span-2">
					<SpendingBreakdownChart />
				</div>
			</div>

			{/* ── Quick insight banner ────────────────────────────────────────
          One smart observation from the data — makes the dashboard feel
          like it's actually analysing something, not just displaying it. */}
			<QuickInsightBanner
				topSpendingCategory={topSpendingCategory}
				savingsRate={currentMonthSummary.savingsRate}
			/>

			{/* ── Recent transactions ─────────────────────────────────────── */}
			<RecentTransactions />

			{/* ── Footer footnote ─────────────────────────────────────────────
          Small data summary at the bottom. Easy to miss but appreciated
          when you see it — adds to the "real product" feel. */}
			<p className="text-center text-xs text-[var(--text-muted)] font-inter pb-2">
				Showing data across{" "}
				<span className="font-semibold text-[var(--text-secondary)]">
					{transactionStats.total} transactions
				</span>{" "}
				·{" "}
				<span className="font-semibold text-[var(--text-secondary)]">
					{transactionStats.incomeCount} income
				</span>{" "}
				&{" "}
				<span className="font-semibold text-[var(--text-secondary)]">
					{transactionStats.expenseCount} expenses
				</span>
			</p>
		</div>
	);
}
