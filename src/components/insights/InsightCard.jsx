// ─── InsightCard.jsx ──────────────────────────────────────────────────────
//
// A reusable card for displaying a single insight observation.
// Used throughout the InsightsPage for things like "best savings month",
// "highest spending category", "average daily spend", etc.
//
// The `variant` prop controls the visual weight:
//   highlight  → accent-tinted, for the most important insight
//   default    → standard card, for secondary observations
//   minimal    → no border, lighter weight
//
// The `trend` prop is optional — shows a directional indicator.
// Good for "this month vs last month" type observations.

import * as Icons from "lucide-react";

// ─── Trend indicator ─────────────────────────────────────────────────────
// A small arrow + percentage that shows direction and magnitude.
// sentiment controls the color — positive = green, negative = red.
function TrendPill({ value, sentiment = "neutral" }) {
	const colorMap = {
		positive:
			"text-success-600 bg-success-50 dark:text-success-500 dark:bg-success-500/10",
		negative: "text-danger-500 bg-danger-50 dark:bg-danger-500/10",
		neutral: "text-[var(--text-muted)] bg-[var(--bg-surface-2)]",
	};

	const IconComponent =
		sentiment === "positive"
			? Icons.TrendingUp
			: sentiment === "negative"
				? Icons.TrendingDown
				: Icons.Minus;

	return (
		<span
			className={[
				"inline-flex items-center gap-1 rounded-full px-2 py-0.5",
				"text-xs font-medium font-inter",
				colorMap[sentiment] || colorMap.neutral,
			].join(" ")}
		>
			<IconComponent size={11} strokeWidth={2.5} aria-hidden="true" />
			{value}
		</span>
	);
}

// ─── InsightCard ──────────────────────────────────────────────────────────

export default function InsightCard({
	label, // small label above the main value (e.g. "Top Spending Category")
	value, // the main headline value
	subvalue, // secondary value below headline (e.g. "₹12,400 · 28% of total")
	description, // optional longer explanation
	icon: Icon,
	iconColor,
	trend, // { value: "+12%", sentiment: "positive" | "negative" | "neutral" }
	variant = "default",
	className = "",
}) {
	const variantClasses = {
		default:
			"bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xs",
		highlight: [
			"bg-accent-600 border border-accent-700",
			"shadow-md shadow-accent-500/20",
		].join(" "),
		minimal: "bg-[var(--bg-surface-2)]",
		success:
			"bg-success-50 border border-success-100 dark:bg-success-500/8 dark:border-success-500/15",
		warning:
			"bg-warning-50 border border-warning-100 dark:bg-warning-500/8 dark:border-warning-500/15",
	};

	const isHighlight = variant === "highlight";

	const textPrimary = isHighlight ? "text-white" : "text-[var(--text-primary)]";
	const textSecondary = isHighlight
		? "text-accent-200"
		: "text-[var(--text-secondary)]";
	const textMuted = isHighlight
		? "text-accent-300"
		: "text-[var(--text-muted)]";

	return (
		<div
			className={[
				"rounded-xl p-5 transition-shadow duration-200",
				variantClasses[variant] || variantClasses.default,
				className,
			].join(" ")}
		>
			{/* ── Top row — label + trend ──────────────────────────────────── */}
			<div className="flex items-center justify-between gap-2 mb-3">
				<div className="flex items-center gap-2">
					{Icon && (
						<div
							className={[
								"flex h-7 w-7 items-center justify-center rounded-lg shrink-0",
								isHighlight ? "bg-white/15" : "",
							].join(" ")}
							style={
								!isHighlight
									? {
											backgroundColor: iconColor
												? `${iconColor}18`
												: "var(--bg-surface-2)",
										}
									: {}
							}
						>
							<Icon
								size={14}
								style={{
									color: isHighlight
										? "white"
										: iconColor || "var(--text-muted)",
								}}
								strokeWidth={2}
								aria-hidden="true"
							/>
						</div>
					)}
					<p
						className={[
							"text-xs font-inter font-medium uppercase tracking-wide",
							textMuted,
						].join(" ")}
					>
						{label}
					</p>
				</div>

				{trend && !isHighlight && (
					<TrendPill value={trend.value} sentiment={trend.sentiment} />
				)}
			</div>

			{/* ── Main value ───────────────────────────────────────────────── */}
			<p
				className={[
					"font-numeric text-2xl font-medium tracking-tight leading-none",
					textPrimary,
				].join(" ")}
			>
				{value}
			</p>

			{/* ── Subvalue ────────────────────────────────────────────────── */}
			{subvalue && (
				<p className={["mt-1.5 text-xs font-inter", textSecondary].join(" ")}>
					{subvalue}
				</p>
			)}

			{/* ── Description ─────────────────────────────────────────────── */}
			{description && (
				<p
					className={[
						"mt-3 text-xs font-inter leading-relaxed border-t pt-3",
						textMuted,
						isHighlight ? "border-white/15" : "border-[var(--border-default)]",
					].join(" ")}
				>
					{description}
				</p>
			)}
		</div>
	);
}
