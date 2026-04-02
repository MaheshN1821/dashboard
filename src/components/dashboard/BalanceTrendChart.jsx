// ─── BalanceTrendChart.jsx ────────────────────────────────────────────────
//
// Area chart showing running balance over the last 6 months.
// Also has an "Income vs Expenses" bar chart view toggled via a pill switch.
//
// Design notes:
//   - Chart height bumped from 280 to 300px — more breathing room
//   - Gradient fill opacity increased slightly in dark mode for more presence
//   - Header section has more vertical padding so the chart doesn't crowd it
//   - View toggle moved to a cleaner position

import { useState } from "react";
import {
	ResponsiveContainer,
	AreaChart,
	Area,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip as RechartsTooltip,
	Legend,
} from "recharts";
import { Card, CardHeader } from "../ui/Card";
import { useInsights } from "../../hooks/useInsights";
import { formatCurrency } from "../../utils/formatters";
import { useAppContext } from "../../context/AppContext";

// ─── Custom Tooltip ───────────────────────────────────────────────────────
// Recharts' default tooltip doesn't match our design system.
// This one uses the surface color and DM Mono for amounts.

function CustomTooltip({ active, payload, label }) {
	if (!active || !payload || payload.length === 0) return null;

	return (
		<div
			className={[
				"rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)]",
				"p-3 shadow-lg min-w-[160px]",
			].join(" ")}
		>
			<p className="mb-2 text-xs font-semibold text-[var(--text-primary)] font-inter">
				{label}
			</p>
			{payload.map((entry) => (
				<div
					key={entry.dataKey}
					className="flex items-center justify-between gap-4 py-0.5"
				>
					<div className="flex items-center gap-1.5">
						<span
							className="h-2 w-2 rounded-full shrink-0"
							style={{ backgroundColor: entry.color }}
						/>
						<span className="text-xs text-[var(--text-muted)] font-inter capitalize">
							{entry.name}
						</span>
					</div>
					<span className="text-xs font-semibold text-[var(--text-primary)] font-mono tabular-nums">
						{formatCurrency(entry.value, "INR", true)}
					</span>
				</div>
			))}
		</div>
	);
}

// ─── View Toggle ──────────────────────────────────────────────────────────
// Pill toggle to switch between Balance Trend and Income vs Expenses views.

function ViewToggle({ view, onChange }) {
	const options = [
		{ value: "balance", label: "Balance Trend" },
		{ value: "breakdown", label: "Income vs Expenses" },
	];

	return (
		<div className="flex items-center gap-1 rounded-lg bg-[var(--bg-surface-2)] p-1">
			{options.map((opt) => (
				<button
					key={opt.value}
					onClick={() => onChange(opt.value)}
					className={[
						"rounded-md px-2.5 py-1 text-xs font-medium font-inter transition-all duration-200 whitespace-nowrap",
						view === opt.value
							? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm"
							: "text-[var(--text-muted)] hover:text-[var(--text-secondary)]",
					].join(" ")}
				>
					{opt.label}
				</button>
			))}
		</div>
	);
}

// ─── BalanceTrendChart ────────────────────────────────────────────────────

export default function BalanceTrendChart() {
	const { balanceTrendData } = useInsights();
	const { isDark } = useAppContext();
	const [view, setView] = useState("balance");

	// Recharts doesn't read CSS vars so we pass explicit values here
	const colors = {
		balance: isDark ? "#4f8ef7" : "#2563EB",
		income: isDark ? "#12B76A" : "#059669",
		expenses: isDark ? "#F87171" : "#F04438",
		grid: isDark ? "#262c3a" : "#e2e6ed",
		text: isDark ? "#5a6480" : "#98A2B3",
	};

	const gradientId = "balance-gradient";
	const incomeGradientId = "income-gradient";
	const expenseGradientId = "expense-gradient";

	const axisTickStyle = {
		fontSize: 11,
		fontFamily: "DM Mono, monospace",
		fill: colors.text,
	};

	const isEmpty = !balanceTrendData || balanceTrendData.length === 0;

	return (
		<Card variant="default" padding="none" className="flex flex-col h-full">
			{/* ── Header ────────────────────────────────────────────────────── */}
			{/* Bumped padding and added the toggle below the title on mobile */}
			<div className="flex flex-col gap-3 p-5 pb-4 sm:flex-row sm:items-start sm:justify-between">
				<CardHeader
					title="Financial Overview"
					subtitle={
						view === "balance"
							? "Running balance across all months"
							: "Monthly income vs expenses"
					}
				/>
				<div className="shrink-0">
					<ViewToggle view={view} onChange={setView} />
				</div>
			</div>

			{/* Separator line */}
			<div className="mx-5 border-t border-[var(--border-default)]" />

			{/* ── Chart area ────────────────────────────────────────────────── */}
			{/* Height bumped from 280 to 300px — charts just read better with more room */}
			<div className="px-2 pt-4 pb-5" style={{ height: 300 }}>
				{isEmpty ? (
					<div className="flex h-full items-center justify-center">
						<p className="text-sm text-[var(--text-muted)] font-inter">
							No data available yet
						</p>
					</div>
				) : view === "balance" ? (
					// ── Balance Area Chart ───────────────────────────────────────
					<ResponsiveContainer width="100%" height="100%">
						<AreaChart
							data={balanceTrendData}
							margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
						>
							<defs>
								<linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
									<stop
										offset="0%"
										stopColor={colors.balance}
										stopOpacity={isDark ? 0.3 : 0.18}
									/>
									<stop
										offset="100%"
										stopColor={colors.balance}
										stopOpacity={0}
									/>
								</linearGradient>
							</defs>

							<CartesianGrid
								strokeDasharray="3 3"
								stroke={colors.grid}
								vertical={false}
							/>

							<XAxis
								dataKey="month"
								tick={axisTickStyle}
								tickLine={false}
								axisLine={false}
								dy={8}
							/>

							<YAxis
								tick={axisTickStyle}
								tickLine={false}
								axisLine={false}
								tickFormatter={(v) => formatCurrency(v, "INR", true)}
								width={72}
							/>

							<RechartsTooltip
								content={<CustomTooltip />}
								cursor={{
									stroke: colors.balance,
									strokeWidth: 1,
									strokeDasharray: "4 4",
									opacity: 0.6,
								}}
							/>

							<Area
								type="monotone"
								dataKey="balance"
								name="Balance"
								stroke={colors.balance}
								strokeWidth={2.5}
								fill={`url(#${gradientId})`}
								dot={false}
								activeDot={{
									r: 5,
									fill: colors.balance,
									strokeWidth: 2.5,
									stroke: isDark ? "#13161e" : "#ffffff",
								}}
							/>
						</AreaChart>
					</ResponsiveContainer>
				) : (
					// ── Income vs Expenses Bar Chart ─────────────────────────────
					<ResponsiveContainer width="100%" height="100%">
						<BarChart
							data={balanceTrendData}
							margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
							barGap={4}
							barCategoryGap="35%"
						>
							<defs>
								<linearGradient
									id={incomeGradientId}
									x1="0"
									y1="0"
									x2="0"
									y2="1"
								>
									<stop
										offset="0%"
										stopColor={colors.income}
										stopOpacity={0.9}
									/>
									<stop
										offset="100%"
										stopColor={colors.income}
										stopOpacity={0.6}
									/>
								</linearGradient>
								<linearGradient
									id={expenseGradientId}
									x1="0"
									y1="0"
									x2="0"
									y2="1"
								>
									<stop
										offset="0%"
										stopColor={colors.expenses}
										stopOpacity={0.9}
									/>
									<stop
										offset="100%"
										stopColor={colors.expenses}
										stopOpacity={0.6}
									/>
								</linearGradient>
							</defs>

							<CartesianGrid
								strokeDasharray="3 3"
								stroke={colors.grid}
								vertical={false}
							/>

							<XAxis
								dataKey="month"
								tick={axisTickStyle}
								tickLine={false}
								axisLine={false}
								dy={8}
							/>

							<YAxis
								tick={axisTickStyle}
								tickLine={false}
								axisLine={false}
								tickFormatter={(v) => formatCurrency(v, "INR", true)}
								width={72}
							/>

							<RechartsTooltip
								content={<CustomTooltip />}
								cursor={{
									fill: isDark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.02)",
								}}
							/>

							<Legend
								iconType="circle"
								iconSize={8}
								wrapperStyle={{
									fontSize: 11,
									fontFamily: "Inter, sans-serif",
									paddingTop: 12,
									color: colors.text,
								}}
							/>

							<Bar
								dataKey="income"
								name="Income"
								fill={`url(#${incomeGradientId})`}
								radius={[4, 4, 0, 0]}
								maxBarSize={40}
							/>
							<Bar
								dataKey="expenses"
								name="Expenses"
								fill={`url(#${expenseGradientId})`}
								radius={[4, 4, 0, 0]}
								maxBarSize={40}
							/>
						</BarChart>
					</ResponsiveContainer>
				)}
			</div>
		</Card>
	);
}
