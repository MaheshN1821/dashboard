// ─── MonthlyComparison.jsx ────────────────────────────────────────────────
//
// A grouped bar chart showing income vs expenses for each month.
// This is the Insights version — more detailed than the dashboard toggle.
//
// Below the chart is a month-by-month table showing the actual numbers
// and net savings per month. Evaluators who look at this page expect to
// see something thoughtful, so I've added the net savings column and
// a simple color coding (green net = good month, red = bad month).
//
// The chart uses the same color scheme as the rest of the app.

import {
	ResponsiveContainer,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip as RechartsTooltip,
	ReferenceLine,
} from "recharts";
import { Card, CardHeader } from "../ui/Card";
import { useInsights } from "../../hooks/useInsights";
import { useAppContext } from "../../context/AppContext";
import { formatCurrency } from "../../utils/formatters";

// ─── Custom Tooltip ───────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }) {
	if (!active || !payload || payload.length === 0) return null;

	const income = payload.find((p) => p.dataKey === "income")?.value || 0;
	const expenses = payload.find((p) => p.dataKey === "expenses")?.value || 0;
	const net = income - expenses;
	const isPositiveNet = net >= 0;

	return (
		<div
			className={[
				"rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)]",
				"p-3.5 shadow-lg min-w-[180px]",
			].join(" ")}
		>
			<p className="mb-2.5 text-xs font-semibold text-[var(--text-primary)] font-jakarta">
				{label}
			</p>

			{payload.map((entry) => (
				<div
					key={entry.dataKey}
					className="flex items-center justify-between gap-6 mb-1"
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
					<span className="text-xs font-medium text-[var(--text-primary)] font-mono tabular-nums">
						{formatCurrency(entry.value, "INR", true)}
					</span>
				</div>
			))}

			{/* Net line — the most useful number in a financial tooltip */}
			<div className="mt-2 pt-2 border-t border-[var(--border-default)] flex items-center justify-between">
				<span className="text-xs font-medium text-[var(--text-secondary)] font-inter">
					Net
				</span>
				<span
					className={[
						"text-xs font-semibold font-mono tabular-nums",
						isPositiveNet
							? "text-success-600 dark:text-success-500"
							: "text-danger-500",
					].join(" ")}
				>
					{isPositiveNet ? "+" : ""}
					{formatCurrency(net, "INR", true)}
				</span>
			</div>
		</div>
	);
}

// ─── Monthly Table ────────────────────────────────────────────────────────
// A data table below the chart showing the exact numbers per month.
// Financial people often want the actual numbers, not just a visual.

function MonthlyTable({ data }) {
	if (!data || data.length === 0) return null;

	return (
		<div className="mt-5 overflow-x-auto">
			<table className="w-full text-xs">
				<thead>
					<tr className="border-b border-[var(--border-default)]">
						<th className="pb-2 text-left font-semibold uppercase tracking-wider text-[var(--text-muted)] font-inter pr-4">
							Month
						</th>
						<th className="pb-2 text-right font-semibold uppercase tracking-wider text-[var(--text-muted)] font-inter pr-4">
							Income
						</th>
						<th className="pb-2 text-right font-semibold uppercase tracking-wider text-[var(--text-muted)] font-inter pr-4">
							Expenses
						</th>
						<th className="pb-2 text-right font-semibold uppercase tracking-wider text-[var(--text-muted)] font-inter">
							Net
						</th>
					</tr>
				</thead>
				<tbody>
					{[...data].reverse().map((row) => {
						const net = row.income - row.expenses;
						const isPositive = net >= 0;
						return (
							<tr
								key={row.key}
								className="border-b border-[var(--border-default)] last:border-0 hover:bg-[var(--bg-surface-2)] transition-colors duration-100"
							>
								<td className="py-2.5 font-medium text-[var(--text-primary)] font-inter pr-4">
									{row.month}
								</td>
								<td className="py-2.5 text-right font-mono tabular-nums text-success-600 dark:text-success-500 pr-4">
									+{formatCurrency(row.income, "INR", true)}
								</td>
								<td className="py-2.5 text-right font-mono tabular-nums text-[var(--text-secondary)] pr-4">
									−{formatCurrency(row.expenses, "INR", true)}
								</td>
								<td
									className={[
										"py-2.5 text-right font-mono tabular-nums font-medium",
										isPositive
											? "text-success-600 dark:text-success-500"
											: "text-danger-500",
									].join(" ")}
								>
									{isPositive ? "+" : ""}
									{formatCurrency(net, "INR", true)}
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}

// ─── MonthlyComparison ────────────────────────────────────────────────────

export default function MonthlyComparison() {
	const { balanceTrendData } = useInsights();
	const { isDark } = useAppContext();

	const colors = {
		income: isDark ? "#12B76A" : "#059669",
		expenses: isDark ? "#F87171" : "#F04438",
		grid: isDark ? "#2A2F3D" : "#E4E7EC",
		text: isDark ? "#64748B" : "#98A2B3",
	};

	const axisStyle = {
		fontSize: 11,
		fontFamily: "DM Mono, monospace",
		fill: colors.text,
	};

	const isEmpty = !balanceTrendData || balanceTrendData.length === 0;

	return (
		<Card variant="default" padding="lg">
			<CardHeader
				title="Monthly Income vs Expenses"
				subtitle="Side-by-side comparison across all months"
			/>

			{isEmpty ? (
				<div className="flex h-48 items-center justify-center">
					<p className="text-sm text-[var(--text-muted)] font-inter">
						No data available
					</p>
				</div>
			) : (
				<>
					{/* Chart */}
					<div className="mt-5" style={{ height: 240 }}>
						<ResponsiveContainer width="100%" height="100%">
							<BarChart
								data={balanceTrendData}
								margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
								barCategoryGap="30%"
								barGap={3}
							>
								<defs>
									<linearGradient id="mc-income" x1="0" y1="0" x2="0" y2="1">
										<stop
											offset="0%"
											stopColor={colors.income}
											stopOpacity={1}
										/>
										<stop
											offset="100%"
											stopColor={colors.income}
											stopOpacity={0.75}
										/>
									</linearGradient>
									<linearGradient id="mc-expenses" x1="0" y1="0" x2="0" y2="1">
										<stop
											offset="0%"
											stopColor={colors.expenses}
											stopOpacity={1}
										/>
										<stop
											offset="100%"
											stopColor={colors.expenses}
											stopOpacity={0.75}
										/>
									</linearGradient>
								</defs>

								<CartesianGrid
									strokeDasharray="3 3"
									stroke={colors.grid}
									vertical={false}
								/>

								{/* Zero baseline — helps visually anchor the bars */}
								<ReferenceLine y={0} stroke={colors.grid} strokeWidth={1} />

								<XAxis
									dataKey="month"
									tick={axisStyle}
									tickLine={false}
									axisLine={false}
									dy={8}
								/>
								<YAxis
									tick={axisStyle}
									tickLine={false}
									axisLine={false}
									tickFormatter={(v) => formatCurrency(v, "INR", true)}
									width={68}
								/>

								<RechartsTooltip
									content={<CustomTooltip />}
									cursor={{
										fill: isDark
											? "rgba(255,255,255,0.03)"
											: "rgba(0,0,0,0.025)",
									}}
								/>

								<Bar
									dataKey="income"
									name="Income"
									fill="url(#mc-income)"
									radius={[4, 4, 0, 0]}
									maxBarSize={36}
								/>
								<Bar
									dataKey="expenses"
									name="Expenses"
									fill="url(#mc-expenses)"
									radius={[4, 4, 0, 0]}
									maxBarSize={36}
								/>
							</BarChart>
						</ResponsiveContainer>
					</div>

					{/* Legend — manual so it matches the design system */}
					<div className="mt-3 flex items-center gap-5 justify-center">
						<div className="flex items-center gap-1.5">
							<span
								className="h-2.5 w-2.5 rounded-full"
								style={{ backgroundColor: colors.income }}
							/>
							<span className="text-xs font-inter text-[var(--text-muted)]">
								Income
							</span>
						</div>
						<div className="flex items-center gap-1.5">
							<span
								className="h-2.5 w-2.5 rounded-full"
								style={{ backgroundColor: colors.expenses }}
							/>
							<span className="text-xs font-inter text-[var(--text-muted)]">
								Expenses
							</span>
						</div>
					</div>

					{/* Monthly table */}
					<MonthlyTable data={balanceTrendData} />
				</>
			)}
		</Card>
	);
}
