// ─── Card.jsx ─────────────────────────────────────────────────────────────
//
// The base surface container. Everything in the dashboard sits inside one
// of these. Keeping it to four variants — more than that and people start
// picking arbitrarily instead of intentionally.
//
// Variants:
//   default  → standard surface card with border
//   elevated → more prominent shadow + inset ring — for summary metrics
//   flat     → no shadow, just border
//   ghost    → no border, no shadow — for layout containers only

import { TrendingUp, TrendingDown } from "lucide-react";

export function Card({
	children,
	variant = "default",
	padding = "md",
	hover = false,
	className = "",
	...props
}) {
	const variantClasses = {
		default: [
			"bg-[var(--bg-surface)] border border-[var(--border-default)]",
			"shadow-sm",
		].join(" "),

		elevated: [
			"bg-[var(--bg-surface)] border border-[var(--border-default)]",
			"shadow-md",
			// The inner ring adds just a bit more perceived depth
			"ring-1 ring-inset ring-white/60 dark:ring-white/[0.04]",
		].join(" "),

		flat: ["bg-[var(--bg-surface)] border border-[var(--border-default)]"].join(
			" ",
		),

		ghost: "bg-transparent",

		tinted: [
			"bg-accent-600 border border-accent-700",
			"shadow-md shadow-accent-500/20",
		].join(" "),
	};

	const paddingClasses = {
		none: "",
		sm: "p-4",
		md: "p-5",
		lg: "p-6",
		xl: "p-8",
	};

	return (
		<div
			className={[
				"rounded-xl",
				"transition-shadow duration-200",
				variantClasses[variant] || variantClasses.default,
				paddingClasses[padding] || paddingClasses.md,
				hover
					? "cursor-pointer hover:shadow-lg dark:hover:shadow-black/30"
					: "",
				className,
			]
				.filter(Boolean)
				.join(" ")}
			{...props}
		>
			{children}
		</div>
	);
}

// ─── Card Header ──────────────────────────────────────────────────────────
// Reusable header section — title + optional right slot (button, badge, etc.)
export function CardHeader({
	title,
	subtitle,
	action,
	className = "",
	...props
}) {
	return (
		<div
			className={["flex items-start justify-between gap-4", className].join(
				" ",
			)}
			{...props}
		>
			<div className="min-w-0">
				{title && (
					<h3 className="font-jakarta font-semibold text-sm text-[var(--text-primary)] leading-tight truncate">
						{title}
					</h3>
				)}
				{subtitle && (
					<p className="mt-0.5 text-xs font-inter text-[var(--text-muted)]">
						{subtitle}
					</p>
				)}
			</div>
			{action && <div className="shrink-0">{action}</div>}
		</div>
	);
}

// ─── Card Divider ─────────────────────────────────────────────────────────
export function CardDivider({ className = "" }) {
	return (
		<hr
			className={[
				"border-0 border-t border-[var(--border-default)]",
				className,
			].join(" ")}
		/>
	);
}

// ─── Metric Card ──────────────────────────────────────────────────────────
// The four summary cards at the top of the dashboard.
//
// Redesigned from the original:
//   — Colored accent bar at the top ties the icon color to the card visually
//   — Icon container is larger (10×10) with a matching border glow
//   — Value uses font-numeric at 28px — you want this number to read instantly
//   — Trend row now shows a directional icon alongside the percentage
//   — Subtle hover lift (translate-y) makes the cards feel responsive

export function MetricCard({
	label,
	value,
	icon: Icon,
	iconColor,
	trend,
	loading = false,
	className = "",
	...props
}) {
	// Trend sentiment drives color and directional icon
	const trendColors = {
		positive: "text-success-600 dark:text-success-500",
		negative: "text-danger-500",
		neutral: "text-[var(--text-muted)]",
	};

	const trendSentiment = trend?.sentiment || "neutral";

	// Pick the right directional icon — neutral gets nothing
	const TrendDirectionIcon =
		trendSentiment === "positive"
			? TrendingUp
			: trendSentiment === "negative"
				? TrendingDown
				: null;

	return (
		<div
			className={[
				"relative overflow-hidden rounded-xl bg-[var(--bg-surface)]",
				"border border-[var(--border-default)] shadow-sm",
				"transition-all duration-200 hover:shadow-md hover:-translate-y-[2px]",
				"dark:hover:shadow-black/20",
				"group",
				className,
			]
				.filter(Boolean)
				.join(" ")}
			{...props}
		>
			{/* Colored accent stripe at the top — very subtle but ties the whole card together */}
			<div
				className="absolute top-0 left-0 right-0 h-[3px] rounded-t-xl"
				style={{
					backgroundColor: iconColor || "var(--accent)",
					opacity: 0.65,
				}}
			/>

			<div className="p-5 pt-6">
				{/* Top row — label + icon */}
				<div className="flex items-start justify-between mb-4">
					<p className="text-[11px] font-inter font-semibold text-[var(--text-secondary)] uppercase tracking-[0.08em] leading-none pt-1">
						{label}
					</p>

					{Icon && (
						<div
							className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
							style={{
								backgroundColor: iconColor
									? `${iconColor}18`
									: "var(--bg-surface-2)",
								boxShadow: iconColor ? `0 0 0 1px ${iconColor}20` : "none",
							}}
						>
							<Icon
								size={18}
								style={{ color: iconColor || "var(--text-muted)" }}
								strokeWidth={1.75}
							/>
						</div>
					)}
				</div>

				{/* Main metric value — this is what users come here to see */}
				{loading ? (
					<div className="skeleton h-9 w-36 mb-3" />
				) : (
					<p className="font-numeric text-[27px] font-semibold text-[var(--text-primary)] tracking-tight leading-none mb-3">
						{value}
					</p>
				)}

				{/* Trend row */}
				{trend && !loading && (
					<div className="flex items-center gap-1.5">
						{TrendDirectionIcon && (
							<TrendDirectionIcon
								size={12}
								className={trendColors[trendSentiment]}
								strokeWidth={2.5}
							/>
						)}
						<span
							className={[
								"text-xs font-inter font-semibold",
								trendColors[trendSentiment],
							].join(" ")}
						>
							{trend.value}
						</span>
						{trend.label && (
							<span className="text-xs font-inter text-[var(--text-muted)]">
								{trend.label}
							</span>
						)}
					</div>
				)}
			</div>
		</div>
	);
}

export default Card;
