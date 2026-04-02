// ─── SpendingBreakdownChart.jsx ───────────────────────────────────────────
//
// Donut chart showing spending broken down by category.
// The donut is intentionally thick — easier to read without label clutter.
//
// Layout: stacks vertically on mobile, side-by-side on sm+.
// The center label switches from "Total Spent" to the hovered category.
//
// Design updates from v1:
//   - Donut outer radius increased slightly for more visual presence
//   - Legend progress bars are thicker (h-1.5) for better readability
//   - Card header has a separator line like BalanceTrendChart for consistency
//   - Center label font sizes slightly increased
//   - Color swatch is now a small rounded square instead of a circle —
//     it matches how category colors are shown in the legend on insights page

import { useState } from "react";
import {
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
	Tooltip as RechartsTooltip,
	Sector,
} from "recharts";
import { Card, CardHeader } from "../ui/Card";
import { useInsights } from "../../hooks/useInsights";
import { formatCurrency } from "../../utils/formatters";

// ─── ActiveShape ──────────────────────────────────────────────────────────
// Expands the hovered slice slightly and adds an inner glow ring.

function ActiveShape(props) {
	const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
		props;

	return (
		<g>
			{/* Expanded outer slice */}
			<Sector
				cx={cx}
				cy={cy}
				innerRadius={innerRadius}
				outerRadius={outerRadius + 7}
				startAngle={startAngle}
				endAngle={endAngle}
				fill={fill}
				opacity={0.95}
			/>
			{/* Inner glow ring — subtle depth effect */}
			<Sector
				cx={cx}
				cy={cy}
				innerRadius={innerRadius - 4}
				outerRadius={innerRadius - 1}
				startAngle={startAngle}
				endAngle={endAngle}
				fill={fill}
				opacity={0.25}
			/>
		</g>
	);
}

// ─── DonutCenter ──────────────────────────────────────────────────────────
// SVG text inside the donut hole. Shows total when idle,
// switches to the active category data on hover.

function DonutCenter({ cx, cy, total, activeCategory }) {
	return (
		<g>
			{activeCategory ? (
				<>
					<text
						x={cx}
						y={cy - 10}
						textAnchor="middle"
						dominantBaseline="middle"
						style={{
							fontSize: 11,
							fontFamily: "Inter, sans-serif",
							fill: "var(--text-muted)",
							fontWeight: 500,
						}}
					>
						{activeCategory.name}
					</text>
					<text
						x={cx}
						y={cy + 11}
						textAnchor="middle"
						dominantBaseline="middle"
						style={{
							fontSize: 17,
							fontFamily: "DM Mono, monospace",
							fontWeight: 500,
							fill: "var(--text-primary)",
							letterSpacing: "-0.02em",
						}}
					>
						{formatCurrency(activeCategory.amount, "INR", true)}
					</text>
					<text
						x={cx}
						y={cy + 30}
						textAnchor="middle"
						dominantBaseline="middle"
						style={{
							fontSize: 11,
							fontFamily: "Inter, sans-serif",
							fill: "var(--text-muted)",
						}}
					>
						{activeCategory.percentage.toFixed(1)}%
					</text>
				</>
			) : (
				<>
					<text
						x={cx}
						y={cy - 10}
						textAnchor="middle"
						dominantBaseline="middle"
						style={{
							fontSize: 11,
							fontFamily: "Inter, sans-serif",
							fill: "var(--text-muted)",
							fontWeight: 500,
						}}
					>
						Total Spent
					</text>
					<text
						x={cx}
						y={cy + 12}
						textAnchor="middle"
						dominantBaseline="middle"
						style={{
							fontSize: 17,
							fontFamily: "DM Mono, monospace",
							fontWeight: 500,
							fill: "var(--text-primary)",
							letterSpacing: "-0.02em",
						}}
					>
						{formatCurrency(total, "INR", true)}
					</text>
				</>
			)}
		</g>
	);
}

// ─── SpendingBreakdownChart ───────────────────────────────────────────────

export default function SpendingBreakdownChart() {
	const { spendingByCategory, totals } = useInsights();
	const [activeIndex, setActiveIndex] = useState(null);

	// Top 6 — more than 6 slices starts getting hard to distinguish visually
	const chartData = spendingByCategory.slice(0, 6);
	const activeCategory = activeIndex !== null ? chartData[activeIndex] : null;

	const isEmpty = !chartData || chartData.length === 0;

	return (
		<Card variant="default" padding="none" className="flex flex-col h-full">
			{/* ── Header ────────────────────────────────────────────────────── */}
			<div className="p-5 pb-4">
				<CardHeader
					title="Spending by Category"
					subtitle="Where your money is going"
				/>
			</div>

			{/* Separator — matches the balance chart's style for visual consistency */}
			<div className="mx-5 border-t border-[var(--border-default)]" />

			{isEmpty ? (
				<div className="flex flex-1 items-center justify-center py-16">
					<p className="text-sm text-[var(--text-muted)] font-inter">
						No expense data available
					</p>
				</div>
			) : (
				// ── Chart + Legend layout ────────────────────────────────────────
				// Stacks vertically on mobile, side-by-side on sm+
				<div className="flex flex-col items-center gap-4 p-5 pt-4 sm:flex-row sm:items-start">
					{/* Donut chart — slightly larger than before (200→210px) */}
					<div
						className="relative shrink-0"
						style={{ width: 210, height: 210 }}
					>
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie
									data={chartData}
									cx="50%"
									cy="50%"
									innerRadius={64}
									outerRadius={92}
									dataKey="amount"
									activeIndex={activeIndex}
									activeShape={ActiveShape}
									onMouseEnter={(_, index) => setActiveIndex(index)}
									onMouseLeave={() => setActiveIndex(null)}
									paddingAngle={2}
									startAngle={90}
									endAngle={-270}
								>
									{chartData.map((entry, index) => (
										<Cell
											key={entry.category}
											fill={entry.config?.color || "#98A2B3"}
											opacity={
												activeIndex === null || activeIndex === index ? 1 : 0.4
											}
											style={{ cursor: "pointer", outline: "none" }}
										/>
									))}
								</Pie>

								{/* Center label — SVG overlay */}
								<DonutCenter
									cx={105}
									cy={105}
									total={totals.expenses}
									activeCategory={activeCategory}
								/>

								<RechartsTooltip
									content={() => null}
									// Hiding tooltip since we're showing data in the center
								/>
							</PieChart>
						</ResponsiveContainer>
					</div>

					{/* ── Legend list ─────────────────────────────────────────────── */}
					<div className="flex flex-1 flex-col gap-0.5 min-w-0 w-full sm:w-auto sm:pt-1">
						{chartData.map((item, index) => (
							<button
								key={item.category}
								onMouseEnter={() => setActiveIndex(index)}
								onMouseLeave={() => setActiveIndex(null)}
								className={[
									"flex items-center gap-3 rounded-lg px-2.5 py-2 text-left",
									"transition-colors duration-150 w-full",
									activeIndex === index
										? "bg-[var(--bg-surface-2)]"
										: "hover:bg-[var(--bg-surface-2)]",
								].join(" ")}
							>
								{/* Color swatch — rounded square feels more intentional than a dot */}
								<span
									className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
									style={{ backgroundColor: item.config?.color }}
								/>

								{/* Name, amount, bar */}
								<div className="min-w-0 flex-1">
									{/* Top row: name + amount + percentage */}
									<div className="flex items-center justify-between gap-2 mb-1.5">
										<span className="truncate text-xs font-medium text-[var(--text-primary)] font-inter">
											{item.name}
										</span>
										<div className="flex items-center gap-2 shrink-0">
											<span className="text-xs font-mono font-semibold text-[var(--text-primary)] tabular-nums">
												{formatCurrency(item.amount, "INR", true)}
											</span>
											<span className="text-xs font-mono text-[var(--text-muted)] tabular-nums w-8 text-right">
												{item.percentage.toFixed(0)}%
											</span>
										</div>
									</div>

									{/* Progress bar — slightly thicker than before for better readability */}
									<div className="h-1.5 w-full rounded-full bg-[var(--bg-surface-3)]">
										<div
											className="h-full rounded-full transition-all duration-500"
											style={{
												width: `${item.percentage}%`,
												backgroundColor: item.config?.color,
												opacity:
													activeIndex === null || activeIndex === index
														? 1
														: 0.35,
											}}
										/>
									</div>
								</div>
							</button>
						))}
					</div>
				</div>
			)}
		</Card>
	);
}
