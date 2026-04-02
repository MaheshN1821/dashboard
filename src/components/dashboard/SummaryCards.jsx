// ─── SummaryCards.jsx ─────────────────────────────────────────────────────
//
// The four metric cards at the top of the dashboard.
// Each shows one headline number with a trend vs last month.
//
// Cards:
//   1. Total Balance   — running cumulative balance (all time)
//   2. Monthly Income  — income this month
//   3. Monthly Expenses — expenses this month
//   4. Savings Rate    — (income - expenses) / income as a percentage
//
// The trend sentiment logic is nuanced:
//   - Income  → up is positive
//   - Expenses → up is negative (spending more = bad)
//   - Savings  → up is positive
//   - Balance  → uses savings rate change as a proxy (makes more sense
//                than trying to subtract two percentage changes together)

import * as Icons from "lucide-react";
import { MetricCard } from "../ui/Card";
import { formatCurrency } from "../../utils/formatters";
import { useInsights } from "../../hooks/useInsights";

// ─── buildTrend ───────────────────────────────────────────────────────────
// Converts a percentage change number into the trend object MetricCard
// expects. The `positiveIsGood` flag flips the sentiment for expenses.

function buildTrend(changePercent, positiveIsGood = true) {
	if (changePercent === 0 || isNaN(changePercent)) {
		return { value: "No change", label: "vs last month", sentiment: "neutral" };
	}

	const isPositive = changePercent > 0;
	const prefix = isPositive ? "+" : "";
	const value = `${prefix}${changePercent.toFixed(1)}%`;

	// For expenses, going up is bad so we flip the sentiment
	const sentiment =
		(isPositive && positiveIsGood) || (!isPositive && !positiveIsGood)
			? "positive"
			: "negative";

	return { value, label: "vs last month", sentiment };
}

// ─── SummaryCards ─────────────────────────────────────────────────────────

export default function SummaryCards() {
	const { totals, currentMonthSummary, monthOverMonth } = useInsights();

	// Using an array so it's easy to add/remove cards without touching the JSX
	const cards = [
		{
			id: "balance",
			label: "Total Balance",
			value: formatCurrency(totals.balance, "INR", false),
			icon: Icons.Wallet,
			iconColor: "#2563EB",
			// Using savings rate change as the balance trend proxy.
			// Subtracting two % changes (income% - expenses%) produces a
			// dimensionless number that isn't actually a percentage — savings
			// rate change is the correct metric here.
			trend: buildTrend(monthOverMonth.savingsRate, true),
		},
		{
			id: "income",
			label: "Monthly Income",
			value: formatCurrency(currentMonthSummary.income, "INR", false),
			icon: Icons.TrendingUp,
			iconColor: "#12B76A",
			trend: buildTrend(monthOverMonth.income, true),
		},
		{
			id: "expenses",
			label: "Monthly Expenses",
			value: formatCurrency(currentMonthSummary.expenses, "INR", false),
			icon: Icons.TrendingDown,
			iconColor: "#F04438",
			// For expenses, rising is bad — flip the sentiment
			trend: buildTrend(monthOverMonth.expenses, false),
		},
		{
			id: "savings",
			label: "Savings Rate",
			value: `${currentMonthSummary.savingsRate.toFixed(1)}%`,
			icon: Icons.PiggyBank,
			iconColor: "#7C3AED",
			trend: buildTrend(monthOverMonth.savingsRate, true),
		},
	];

	return (
		// Responsive grid — 1 col on mobile, 2 on tablet, 4 on desktop
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
			{cards.map((card, i) => (
				<div
					key={card.id}
					className="stagger-child"
					style={{ "--delay": `${i * 60}ms` }}
				>
					<MetricCard
						label={card.label}
						value={card.value}
						icon={card.icon}
						iconColor={card.iconColor}
						trend={card.trend}
					/>
				</div>
			))}
		</div>
	);
}
