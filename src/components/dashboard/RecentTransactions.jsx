// ─── RecentTransactions.jsx ───────────────────────────────────────────────
//
// A compact preview of the 5 most recent transactions for the dashboard.
// NOT the full transactions table — it's a teaser that links to it.
//
// Each row shows: category icon, description, category label, date, amount.
// Amount is right-aligned in DM Mono — financial data should never be
// left-aligned, it makes comparison impossible.
//
// Design updates:
//   - Category name shown as a small tag below the description
//   - Income amounts get a + prefix and the full success color treatment
//   - Category icon bubble is slightly larger (h-10 w-10) for visual weight
//   - The "See all" footer button has a proper border and bg now

import { Link } from "react-router-dom";
import * as Icons from "lucide-react";
import { Card, CardHeader, CardDivider } from "../ui/Card";
import EmptyState from "../ui/EmptyState";
import { useTransactionContext } from "../../context/TransactionContext";
import { useAppContext } from "../../context/AppContext";
import { formatCurrency, formatRelativeTime } from "../../utils/formatters";
import { CATEGORIES } from "../../utils/constants";

// ─── RecentRow ────────────────────────────────────────────────────────────
// A single transaction preview row.

function RecentRow({ transaction, isDark }) {
	const { description, category, type, amount, date } = transaction;

	const isIncome = type === "income";
	const categoryConfig = CATEGORIES[category] || CATEGORIES.OTHER;
	const Icon = Icons[categoryConfig.icon] || Icons.Circle;

	return (
		<div className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-[var(--bg-surface-2)] transition-colors duration-150 group cursor-default">
			{/* Category icon bubble */}
			<div
				className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
				style={{
					backgroundColor: isDark ? categoryConfig.darkBg : categoryConfig.bg,
				}}
			>
				<Icon
					size={17}
					style={{ color: categoryConfig.color }}
					strokeWidth={2}
				/>
			</div>

			{/* Description + category + date */}
			<div className="min-w-0 flex-1">
				<p className="truncate text-sm font-medium text-[var(--text-primary)] font-inter leading-tight">
					{description}
				</p>
				<div className="flex items-center gap-2 mt-0.5">
					<span className="text-[11px] text-[var(--text-muted)] font-inter">
						{categoryConfig.label}
					</span>
					<span className="text-[var(--border-strong)]">·</span>
					<span className="text-[11px] text-[var(--text-muted)] font-inter">
						{formatRelativeTime(date)}
					</span>
				</div>
			</div>

			{/* Amount — right aligned, DM Mono, color-coded */}
			<div className="shrink-0 text-right">
				<span
					className={[
						"text-sm font-semibold font-mono tabular-nums",
						isIncome
							? "text-success-600 dark:text-success-500"
							: "text-[var(--text-primary)]",
					].join(" ")}
				>
					{isIncome ? "+" : "−"}
					{formatCurrency(amount, "INR")}
				</span>
			</div>
		</div>
	);
}

// ─── RecentTransactions ───────────────────────────────────────────────────

export default function RecentTransactions() {
	const { transactions } = useTransactionContext();
	const { isDark } = useAppContext();

	// Sort by date desc, take the 5 most recent
	const recent = [...transactions]
		.sort((a, b) => new Date(b.date) - new Date(a.date))
		.slice(0, 5);

	return (
		<Card variant="default" padding="none">
			{/* ── Header ────────────────────────────────────────────────────── */}
			<div className="p-5 pb-4">
				<CardHeader
					title="Recent Transactions"
					subtitle="Your latest financial activity"
					action={
						<Link
							to="/transactions"
							className={[
								"flex items-center gap-1 text-xs font-semibold font-inter",
								"text-accent-600 hover:text-accent-700 dark:text-[var(--accent)] dark:hover:text-accent-300",
								"transition-colors duration-150",
							].join(" ")}
						>
							View all
							<Icons.ArrowRight size={12} strokeWidth={2.5} />
						</Link>
					}
				/>
			</div>

			{/* Separator — consistent with chart cards */}
			<div className="mx-5 border-t border-[var(--border-default)]" />

			{/* ── Rows or empty state ─────────────────────────────────────── */}
			{recent.length === 0 ? (
				<div className="px-5 py-10">
					<EmptyState
						type="no-transactions"
						size="sm"
						title="No transactions yet"
						description="Add your first transaction to get started"
					/>
				</div>
			) : (
				<div className="divide-y divide-[var(--border-default)]">
					{recent.map((tx) => (
						<RecentRow key={tx.id} transaction={tx} isDark={isDark} />
					))}
				</div>
			)}

			{/* ── Footer link ───────────────────────────────────────────────── */}
			{recent.length > 0 && (
				<>
					<div className="mx-5 border-t border-[var(--border-default)]" />
					<div className="p-4">
						<Link
							to="/transactions"
							className={[
								"flex w-full items-center justify-center gap-2 rounded-lg py-2.5",
								"text-sm font-medium font-inter text-[var(--text-secondary)]",
								"border border-[var(--border-default)] bg-[var(--bg-surface-2)]",
								"hover:bg-[var(--bg-surface-3)] hover:text-[var(--text-primary)]",
								"transition-colors duration-150",
							].join(" ")}
						>
							See all transactions
							<Icons.ArrowRight size={13} strokeWidth={2} />
						</Link>
					</div>
				</>
			)}
		</Card>
	);
}
