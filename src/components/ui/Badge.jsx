// ─── Badge ────────────────────────────────────────────────────────────────
//
// Two use cases:
//   1. Category badges — colored dots with category label
//   2. Type badges — income (green) / expense (red) pill
//   3. Role badges — admin (blue) / viewer (gray)
//   4. Generic status badges with custom color
//
// I'm passing the color as a hex value and computing the tint programmatically
// rather than having a huge list of Tailwind variants. This way any new
// category we add to constants.js automatically gets styled correctly.

import { CATEGORIES } from "../../utils/constants";
import { useAppContext } from "../../context/AppContext";

// ─── Category Badge ───────────────────────────────────────────────────────
// Used in transaction rows and the spending breakdown chart legend
export function CategoryBadge({ category, size = "md", className = "" }) {
	const config = CATEGORIES[category] || CATEGORIES.OTHER;
	const { isDark } = useAppContext();

	const bgColor = isDark ? config.darkBg : config.bg;

	const sizeClasses = {
		sm: "text-xs px-2 py-0.5 gap-1.5",
		md: "text-xs px-2.5 py-1 gap-1.5",
		lg: "text-sm px-3 py-1 gap-2",
	};

	return (
		<span
			className={[
				"inline-flex items-center font-inter font-medium rounded-full",
				"transition-colors duration-150",
				sizeClasses[size] || sizeClasses.md,
				className,
			].join(" ")}
			style={{ backgroundColor: bgColor, color: config.color }}
		>
			{/* Colored dot — quicker to scan than text alone */}
			<span
				className="rounded-full shrink-0"
				style={{
					width: size === "sm" ? 5 : 6,
					height: size === "sm" ? 5 : 6,
					backgroundColor: config.color,
				}}
				aria-hidden="true"
			/>
			{config.label}
		</span>
	);
}

// ─── Type Badge ────────────────────────────────────────────────────────────
// Income = green, Expense = red — used in transaction rows
export function TypeBadge({ type, size = "md", className = "" }) {
	const isIncome = type === "income";

	const sizeClasses = {
		sm: "text-xs px-2 py-0.5",
		md: "text-xs px-2.5 py-1",
		lg: "text-sm px-3 py-1",
	};

	return (
		<span
			className={[
				"inline-flex items-center justify-center font-inter font-medium rounded-full",
				sizeClasses[size] || sizeClasses.md,
				isIncome
					? "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-500"
					: "bg-danger-50 text-danger-700 dark:bg-danger-500/10 dark:text-danger-500",
				className,
			].join(" ")}
		>
			{isIncome ? "Income" : "Expense"}
		</span>
	);
}

// ─── Role Badge ────────────────────────────────────────────────────────────
// Shown in the topbar next to the role switcher
export function RoleBadge({ role, size = "md", className = "" }) {
	const isAdmin = role === "admin";

	const sizeClasses = {
		sm: "text-xs px-2 py-0.5",
		md: "text-xs px-2.5 py-1",
		lg: "text-sm px-3 py-1",
	};

	return (
		<span
			className={[
				"inline-flex items-center gap-1.5 font-jakarta font-semibold rounded-full",
				sizeClasses[size] || sizeClasses.md,
				isAdmin
					? "bg-accent-50 text-accent-600 dark:bg-accent-500/10 dark:text-accent-400"
					: "bg-gray-100 text-gray-600 dark:bg-dark-surface2 dark:text-gray-400",
				className,
			].join(" ")}
		>
			{/* Status dot */}
			<span
				className={[
					"w-1.5 h-1.5 rounded-full",
					isAdmin
						? "bg-accent-500 dark:bg-accent-400"
						: "bg-gray-400 dark:bg-gray-500",
				].join(" ")}
				aria-hidden="true"
			/>
			{isAdmin ? "Admin" : "Viewer"}
		</span>
	);
}

// ─── Generic Badge ─────────────────────────────────────────────────────────
// Flexible badge for one-off use cases
export function Badge({
	children,
	color = "gray", // gray | blue | green | red | yellow | purple
	size = "md",
	dot = false,
	className = "",
}) {
	const colorClasses = {
		gray: "bg-gray-100 text-gray-700 dark:bg-dark-surface2 dark:text-gray-400",
		blue: "bg-accent-50 text-accent-700 dark:bg-accent-500/10 dark:text-accent-400",
		green:
			"bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-500",
		red: "bg-danger-50 text-danger-700 dark:bg-danger-500/10 dark:text-danger-500",
		yellow:
			"bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-500",
		purple:
			"bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
	};

	const dotColors = {
		gray: "bg-gray-400",
		blue: "bg-accent-500",
		green: "bg-success-500",
		red: "bg-danger-500",
		yellow: "bg-warning-500",
		purple: "bg-purple-500",
	};

	const sizeClasses = {
		sm: "text-xs px-2 py-0.5 gap-1",
		md: "text-xs px-2.5 py-1 gap-1.5",
		lg: "text-sm px-3 py-1 gap-2",
	};

	return (
		<span
			className={[
				"inline-flex items-center font-inter font-medium rounded-full",
				sizeClasses[size] || sizeClasses.md,
				colorClasses[color] || colorClasses.gray,
				className,
			].join(" ")}
		>
			{dot && (
				<span
					className={[
						"w-1.5 h-1.5 rounded-full shrink-0",
						dotColors[color],
					].join(" ")}
					aria-hidden="true"
				/>
			)}
			{children}
		</span>
	);
}

export default Badge;
