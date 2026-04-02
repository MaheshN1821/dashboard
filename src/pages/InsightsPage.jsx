// ─── InsightsPage.jsx ─────────────────────────────────────────────────────
//
// The analytics page. Surfaces meaningful observations from the data —
// not just raw numbers, but interpreted signals the user can act on.
//
// Layout (top to bottom):
//   1. Quick stats row — 4 highlight metrics side by side
//   2. Two-column section: MonthlyComparison (left) + TopCategoryBadge (right)
//   3. Income sources breakdown
//   4. Observations — written insights derived from the data
//
// The "Observations" section at the bottom is the differentiator. Most
// dashboards just show data. Finly reads the data and tells the user
// something useful about it in plain language — that's what makes it
// feel like a real product and not a charting exercise.

import * as Icons from "lucide-react";
import InsightCard from "../components/insights/InsightCard";
import MonthlyComparison from "../components/insights/MonthlyComparison";
import TopCategoryBadge from "../components/insights/TopCategoryBadge";
import { Card, CardHeader, CardDivider } from "../components/ui/Card";
import { useInsights } from "../hooks/useInsights";
import { useAppContext } from "../context/AppContext";
import {
	formatCurrency,
	formatPercent,
	percentageChange,
} from "../utils/formatters";
import { CATEGORIES } from "../utils/constants";

// ─── Income Sources breakdown ─────────────────────────────────────────────
// Shows how income is split between Salary, Freelance, etc.
// Simple bar rows — same pattern as TopCategoryBadge but for income.

function IncomeSourceRow({ item, isDark }) {
	const config = CATEGORIES[item.category] || CATEGORIES.OTHER;
	const Icon = Icons[config.icon] || Icons.Circle;

	return (
		<div className="flex items-center gap-3 py-3">
			<div
				className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
				style={{ backgroundColor: isDark ? config.darkBg : config.bg }}
			>
				<Icon
					size={15}
					style={{ color: config.color }}
					strokeWidth={2}
					aria-hidden="true"
				/>
			</div>
			<div className="min-w-0 flex-1">
				<div className="flex items-center justify-between gap-2 mb-1">
					<span className="text-sm font-medium text-[var(--text-primary)] font-inter truncate">
						{config.label}
					</span>
					<span className="text-sm font-mono font-medium text-[var(--text-primary)] tabular-nums shrink-0">
						{formatCurrency(item.amount, "INR", true)}
					</span>
				</div>
				<div className="flex items-center gap-2">
					<div className="flex-1 h-1.5 rounded-full bg-[var(--bg-surface-2)]">
						<div
							className="h-full rounded-full transition-all duration-700"
							style={{
								width: `${item.percentage}%`,
								backgroundColor: config.color,
							}}
						/>
					</div>
					<span className="text-xs font-mono text-[var(--text-muted)] w-10 text-right shrink-0 tabular-nums">
						{item.percentage.toFixed(1)}%
					</span>
				</div>
			</div>
		</div>
	);
}

// ─── SmartObservation ─────────────────────────────────────────────────────
// A single data-driven observation card. The message is derived from real
// data, not hardcoded — so it changes as the transactions change.

function SmartObservation({
	icon: Icon,
	title,
	message,
	sentiment = "neutral",
}) {
	const borderColors = {
		positive: "border-l-success-400",
		negative: "border-l-danger-400",
		neutral: "border-l-accent-400",
		warning: "border-l-warning-400",
	};

	const iconBg = {
		positive: "bg-success-50 dark:bg-success-500/10",
		negative: "bg-danger-50 dark:bg-danger-500/10",
		neutral: "bg-accent-50 dark:bg-accent-500/10",
		warning: "bg-warning-50 dark:bg-warning-500/10",
	};

	const iconColor = {
		positive: "text-success-600 dark:text-success-500",
		negative: "text-danger-500",
		neutral: "text-accent-600 dark:text-accent-400",
		warning: "text-warning-600 dark:text-warning-500",
	};

	return (
		<div
			className={[
				"flex gap-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4",
				"border-l-2",
				borderColors[sentiment] || borderColors.neutral,
			].join(" ")}
		>
			<div
				className={[
					"flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-0.5",
					iconBg[sentiment] || iconBg.neutral,
				].join(" ")}
			>
				<Icon
					size={15}
					className={iconColor[sentiment] || iconColor.neutral}
					strokeWidth={2}
					aria-hidden="true"
				/>
			</div>
			<div>
				<p className="text-sm font-semibold text-[var(--text-primary)] font-jakarta mb-0.5">
					{title}
				</p>
				<p className="text-xs text-[var(--text-secondary)] font-inter leading-relaxed">
					{message}
				</p>
			</div>
		</div>
	);
}

// ─── InsightsPage ─────────────────────────────────────────────────────────

export default function InsightsPage() {
	const { isDark } = useAppContext();
	const {
		totals,
		currentMonthSummary,
		monthOverMonth,
		balanceTrendData,
		spendingByCategory,
		topSpendingCategory,
		incomeBySource,
		bestSavingsMonth,
		worstSpendingMonth,
		transactionStats,
	} = useInsights();

	// ── Derived observations ──────────────────────────────────────────────
	// These are the "smart" messages. Each one reads the actual data and
	// generates a contextual observation. Not hardcoded strings.

	const observations = [];

	// Savings rate observation
	if (currentMonthSummary.savingsRate > 30) {
		observations.push({
			icon: Icons.TrendingUp,
			title: "Strong savings rate this month",
			message: `You're saving ${currentMonthSummary.savingsRate.toFixed(1)}% of your income this month — that's well above the recommended 20%. Keep it up.`,
			sentiment: "positive",
		});
	} else if (currentMonthSummary.savingsRate < 10) {
		observations.push({
			icon: Icons.AlertTriangle,
			title: "Low savings rate this month",
			message: `Your savings rate is ${currentMonthSummary.savingsRate.toFixed(1)}% this month. Financial advisors typically recommend saving at least 20% of your income.`,
			sentiment: "warning",
		});
	}

	// Top spending category observation
	if (topSpendingCategory) {
		const topConfig = CATEGORIES[topSpendingCategory.category];
		if (topSpendingCategory.percentage > 35) {
			observations.push({
				icon: Icons.PieChart,
				title: `${topConfig?.label} dominates your spending`,
				message: `${topConfig?.label} accounts for ${topSpendingCategory.percentage.toFixed(0)}% of total expenses (${formatCurrency(topSpendingCategory.amount, "INR")}). It might be worth reviewing whether this aligns with your priorities.`,
				sentiment: "warning",
			});
		} else {
			observations.push({
				icon: Icons.BarChart2,
				title: "Well-distributed spending",
				message: `Your spending is reasonably balanced. ${topConfig?.label} leads at ${topSpendingCategory.percentage.toFixed(0)}% — not dominant enough to be a concern.`,
				sentiment: "positive",
			});
		}
	}

	// Best savings month
	if (bestSavingsMonth) {
		observations.push({
			icon: Icons.Star,
			title: `${bestSavingsMonth.month} was your best month`,
			message: `You saved the most in ${bestSavingsMonth.month} — net positive of ${formatCurrency(bestSavingsMonth.net, "INR")}. Income was ${formatCurrency(bestSavingsMonth.income, "INR")} against expenses of ${formatCurrency(bestSavingsMonth.expenses, "INR")}.`,
			sentiment: "positive",
		});
	}

	// Worst spending month
	if (worstSpendingMonth) {
		observations.push({
			icon: Icons.TrendingDown,
			title: `${worstSpendingMonth.month} had the highest expenses`,
			message: `You spent ${formatCurrency(worstSpendingMonth.expenses, "INR")} in ${worstSpendingMonth.month} — the most across all recorded months. Consider what drove that spike.`,
			sentiment: "neutral",
		});
	}

	// Average expense observation
	if (transactionStats.avgExpense > 0) {
		observations.push({
			icon: Icons.Calculator,
			title: "Average transaction insight",
			message: `Your average expense transaction is ${formatCurrency(transactionStats.avgExpense, "INR")}. You've made ${transactionStats.expenseCount} expense transactions and ${transactionStats.incomeCount} income transactions overall.`,
			sentiment: "neutral",
		});
	}

	// Income source diversity
	if (incomeBySource.length > 1) {
		const freelanceShare = incomeBySource.find(
			(s) => s.category === "FREELANCE",
		);
		if (freelanceShare && freelanceShare.percentage > 15) {
			observations.push({
				icon: Icons.Briefcase,
				title: "Diversified income sources",
				message: `${freelanceShare.percentage.toFixed(0)}% of your income comes from freelance work (${formatCurrency(freelanceShare.amount, "INR")}). Multiple income streams is a strong financial position.`,
				sentiment: "positive",
			});
		}
	}

	// ── Metric cards data ─────────────────────────────────────────────────
	const summaryCards = [
		{
			id: "total-balance",
			label: "Total Balance",
			value: formatCurrency(totals.balance, "INR", false),
			subvalue: "Cumulative across all time",
			icon: Icons.Wallet,
			iconColor: "#2563EB",
			variant: "default",
		},
		{
			id: "savings-rate",
			label: "Overall Savings Rate",
			value: `${totals.savingsRate.toFixed(1)}%`,
			subvalue: `Income ${formatCurrency(totals.income, "INR", true)} · Expenses ${formatCurrency(totals.expenses, "INR", true)}`,
			icon: Icons.PiggyBank,
			iconColor: "#7C3AED",
			trend:
				totals.savingsRate >= 20
					? { value: "On track", sentiment: "positive" }
					: { value: "Below target", sentiment: "warning" },
		},
		{
			id: "avg-expense",
			label: "Avg Expense",
			value: formatCurrency(transactionStats.avgExpense, "INR", true),
			subvalue: `Across ${transactionStats.expenseCount} transactions`,
			icon: Icons.Receipt,
			iconColor: "#F04438",
		},
		{
			id: "total-transactions",
			label: "Total Transactions",
			value: transactionStats.total.toString(),
			subvalue: `${transactionStats.incomeCount} income · ${transactionStats.expenseCount} expenses`,
			icon: Icons.ArrowLeftRight,
			iconColor: "#0891B2",
		},
	];

	return (
		<div className="flex flex-col gap-6">
			{/* ── Page header ──────────────────────────────────────────────── */}
			<div>
				<h2 className="text-2xl font-bold text-[var(--text-primary)] font-jakarta leading-tight">
					Insights
				</h2>
				<p className="mt-1 text-sm text-[var(--text-secondary)] font-inter">
					What your financial data is telling you.
				</p>
			</div>

			{/* ── Summary metric cards ──────────────────────────────────────── */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{summaryCards.map((card, i) => (
					<div
						key={card.id}
						className="stagger-child animate-fade-up"
						style={{ "--delay": `${i * 60}ms` }}
					>
						<InsightCard
							label={card.label}
							value={card.value}
							subvalue={card.subvalue}
							icon={card.icon}
							iconColor={card.iconColor}
							trend={card.trend}
							variant={card.variant || "default"}
						/>
					</div>
				))}
			</div>

			{/* ── Charts row ───────────────────────────────────────────────── */}
			{/*
        Monthly comparison gets more width because bar charts need horizontal
        space. Category breakdown is comfortable in the narrower column.
      */}
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
				<div className="lg:col-span-3">
					<MonthlyComparison />
				</div>
				<div className="lg:col-span-2">
					<TopCategoryBadge />
				</div>
			</div>

			{/* ── Income sources ────────────────────────────────────────────── */}
			{incomeBySource.length > 0 && (
				<Card variant="default" padding="lg">
					<CardHeader
						title="Income Sources"
						subtitle="Breakdown of where your income comes from"
					/>
					<div className="mt-4 divide-y divide-[var(--border-default)]">
						{incomeBySource.map((item) => (
							<IncomeSourceRow
								key={item.category}
								item={item}
								isDark={isDark}
							/>
						))}
					</div>
					{/* Total footer */}
					<div className="mt-4 pt-4 border-t border-[var(--border-default)] flex items-center justify-between">
						<span className="text-xs font-inter text-[var(--text-muted)]">
							Total income across all sources
						</span>
						<span className="text-sm font-mono font-semibold text-success-600 dark:text-success-500 tabular-nums">
							+{formatCurrency(totals.income, "INR")}
						</span>
					</div>
				</Card>
			)}

			{/* ── Observations ─────────────────────────────────────────────── */}
			{/*
        This is the section that makes the app feel like more than a chart demo.
        Each observation is generated from real data — the messages change
        based on what the transactions actually show.
      */}
			{observations.length > 0 && (
				<div>
					<div className="mb-4">
						<h3 className="text-base font-semibold text-[var(--text-primary)] font-jakarta">
							Observations
						</h3>
						<p className="mt-0.5 text-xs font-inter text-[var(--text-muted)]">
							What we noticed about your financial patterns
						</p>
					</div>
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
						{observations.map((obs, i) => (
							<div
								key={i}
								className="stagger-child"
								style={{ "--delay": `${i * 50}ms` }}
							>
								<SmartObservation
									icon={obs.icon}
									title={obs.title}
									message={obs.message}
									sentiment={obs.sentiment}
								/>
							</div>
						))}
					</div>
				</div>
			)}

			{/* ── Footnote ─────────────────────────────────────────────────── */}
			<p className="text-center text-xs text-[var(--text-muted)] font-inter pb-2">
				Analysis based on{" "}
				<span className="font-medium text-[var(--text-secondary)]">
					{transactionStats.total} transactions
				</span>{" "}
				·{" "}
				<span className="font-medium text-[var(--text-secondary)]">
					6 months of data
				</span>
			</p>
		</div>
	);
}
