import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

// ─── Button ───────────────────────────────────────────────────────────────
//
// I went with forwardRef here because buttons often need to be passed as
// children to things like Tooltip or Popover — those need the DOM ref to
// position themselves correctly.
//
// Variants:
//   primary   → filled blue, main actions (Save, Add Transaction)
//   secondary → outlined, secondary actions (Cancel, Export)
//   ghost     → no border/bg, used inside tables and tight spaces
//   danger    → red filled, destructive actions (Delete)
//   soft      → light tinted, for filter pills and toggles
//
// Sizes: sm | md | lg
//
// Special props:
//   loading   → shows spinner, disables interaction
//   icon      → pass a Lucide component, renders left of label
//   iconRight → same but right side
//   fullWidth → stretches to container width

const VARIANTS = {
	primary: [
		"bg-accent-600 text-white border border-accent-600",
		"hover:bg-accent-700 hover:border-accent-700",
		"active:bg-accent-700",
		"dark:bg-accent-500 dark:border-accent-500",
		"dark:hover:bg-accent-400 dark:hover:border-accent-400",
	].join(" "),
	// primary: [
	// 	"bg-accent-600 text-white border border-accent-600",
	// 	"hover:bg-accent-700 hover:border-accent-700",
	// 	"active:bg-accent-700",
	// 	"focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2",
	// 	"disabled:bg-accent-200 disabled:border-accent-200 disabled:text-white",
	// 	"dark:bg-accent-500 dark:border-accent-500",
	// 	"dark:hover:bg-accent-400 dark:hover:border-accent-400",
	// 	"dark:disabled:bg-accent-900 dark:disabled:border-accent-900",
	// ].join(" "),

	secondary: [
		"bg-transparent text-gray-700 border border-gray-300",
		"hover:bg-gray-50 hover:border-gray-400",
		"active:bg-gray-100",
		"focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2",
		"disabled:text-gray-400 disabled:border-gray-200 disabled:bg-transparent",
		"dark:text-gray-300 dark:border-dark-border",
		"dark:hover:bg-dark-surface2 dark:hover:border-gray-500",
		"dark:disabled:text-gray-600 dark:disabled:border-dark-border",
	].join(" "),

	ghost: [
		"bg-transparent text-gray-600 border border-transparent",
		"hover:bg-gray-100 hover:text-gray-900",
		"active:bg-gray-200",
		"focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2",
		"disabled:text-gray-400",
		"dark:text-gray-400",
		"dark:hover:bg-dark-surface2 dark:hover:text-gray-200",
	].join(" "),

	danger: [
		"bg-danger-500 text-white border border-danger-500",
		"hover:bg-danger-600 hover:border-danger-600",
		"active:bg-danger-700",
		"focus-visible:ring-2 focus-visible:ring-danger-500 focus-visible:ring-offset-2",
		"disabled:bg-danger-200 disabled:border-danger-200",
		"dark:bg-danger-600 dark:border-danger-600",
		"dark:hover:bg-danger-700",
	].join(" "),

	// Soft is useful for things like role badges or category filter pills
	soft: [
		"bg-accent-50 text-accent-600 border border-accent-100",
		"hover:bg-accent-100 hover:border-accent-200",
		"active:bg-accent-200",
		"focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2",
		"disabled:text-accent-300 disabled:bg-accent-50",
		"dark:bg-accent-500/10 dark:text-accent-400 dark:border-accent-500/20",
		"dark:hover:bg-accent-500/20",
	].join(" "),
};

const SIZES = {
	sm: "h-8 px-3 text-xs gap-1.5 rounded-md",
	md: "h-9 px-4 text-sm gap-2 rounded-lg",
	lg: "h-11 px-5 text-sm gap-2 rounded-lg",
};

// Icon-only sizes when no children are passed
const ICON_SIZES = {
	sm: "h-8 w-8 rounded-md",
	md: "h-9 w-9 rounded-lg",
	lg: "h-11 w-11 rounded-lg",
};

const Button = forwardRef(function Button(
	{
		variant = "primary",
		size = "md",
		loading = false,
		icon: Icon,
		iconRight: IconRight,
		fullWidth = false,
		disabled,
		children,
		className = "",
		...props
	},
	ref,
) {
	const isDisabled = disabled || loading;
	const isIconOnly = !children && (Icon || loading);

	// Spinner size scales with button size
	const spinnerSize = size === "sm" ? 12 : size === "lg" ? 18 : 15;

	return (
		<button
			ref={ref}
			disabled={isDisabled}
			className={[
				// Base styles that apply to every button
				"inline-flex items-center justify-center",
				"font-jakarta font-medium",
				"transition-all duration-150 ease-smooth",
				"select-none cursor-pointer",
				"disabled:cursor-not-allowed disabled:opacity-60",
				"outline-none",

				// Size
				isIconOnly ? ICON_SIZES[size] : SIZES[size],

				// Variant
				VARIANTS[variant] || VARIANTS.primary,

				// Full width override
				fullWidth ? "w-full" : "",

				className,
			]
				.filter(Boolean)
				.join(" ")}
			{...props}
		>
			{/* Loading spinner replaces the left icon */}
			{loading ? (
				<Loader2
					size={spinnerSize}
					className="animate-spin shrink-0"
					aria-hidden="true"
				/>
			) : Icon ? (
				<Icon size={spinnerSize} className="shrink-0" aria-hidden="true" />
			) : null}

			{/* Label — hidden visually when icon-only but kept for a11y */}
			{children && (
				<span className={loading ? "opacity-70" : ""}>{children}</span>
			)}

			{/* Right icon — only renders if not loading */}
			{IconRight && !loading && (
				<IconRight size={spinnerSize} className="shrink-0" aria-hidden="true" />
			)}
		</button>
	);
});

export default Button;
