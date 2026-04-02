// ─── Tooltip ──────────────────────────────────────────────────────────────
//
// Keeping this CSS-only (no portals, no Popper.js) because the use cases
// here are simple — icon button labels, truncated cell hints, chart data.
// For a production app I'd use Radix UI Tooltip, but that's overkill here.
//
// The tooltip uses CSS :hover + group-hover to show/hide. The `position`
// prop controls which side it appears on.

export function Tooltip({
	children,
	content,
	position = "top", // top | bottom | left | right
	delay = false, // adds a small delay before showing
	className = "",
}) {
	if (!content) return children;

	// Position classes — translate to center the tooltip relative to the trigger
	const positionClasses = {
		top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
		bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
		left: "right-full top-1/2 -translate-y-1/2 mr-2",
		right: "left-full top-1/2 -translate-y-1/2 ml-2",
	};

	// The little arrow triangle
	const arrowClasses = {
		top: "top-full left-1/2 -translate-x-1/2 border-t-[var(--bg-surface)] border-l-transparent border-r-transparent border-b-transparent border-4",
		bottom:
			"bottom-full left-1/2 -translate-x-1/2 border-b-[var(--bg-surface)] border-l-transparent border-r-transparent border-t-transparent border-4",
		left: "left-full top-1/2 -translate-y-1/2 border-l-[var(--bg-surface)] border-t-transparent border-b-transparent border-r-transparent border-4",
		right:
			"right-full top-1/2 -translate-y-1/2 border-r-[var(--bg-surface)] border-t-transparent border-b-transparent border-l-transparent border-4",
	};

	return (
		<div className={["relative inline-flex group", className].join(" ")}>
			{children}

			{/* Tooltip panel */}
			<div
				role="tooltip"
				className={[
					"absolute z-50 pointer-events-none",
					"px-2.5 py-1.5",
					"bg-[var(--bg-surface)] border border-[var(--border-default)]",
					"rounded-lg shadow-lg",
					"text-xs font-inter font-medium text-[var(--text-primary)]",
					"whitespace-nowrap",
					// Show on hover — using opacity + scale for a quick fade-in
					"opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100",
					delay
						? "transition-all duration-150 delay-300 group-hover:delay-300"
						: "transition-all duration-100",
					positionClasses[position] || positionClasses.top,
				].join(" ")}
			>
				{content}
			</div>
		</div>
	);
}

// ─── Icon Button with Tooltip ──────────────────────────────────────────────
// A common pattern in the app — small icon buttons that need a tooltip label.
// Keeps the JSX cleaner at the call site.
export function IconButton({
	icon: Icon,
	tooltip,
	tooltipPosition = "top",
	size = "md",
	variant = "ghost",
	onClick,
	disabled,
	className = "",
	"aria-label": ariaLabel,
	...props
}) {
	const sizeClasses = {
		xs: "w-6 h-6 rounded-md",
		sm: "w-7 h-7 rounded-md",
		md: "w-8 h-8 rounded-lg",
		lg: "w-9 h-9 rounded-lg",
	};

	const iconSize = { xs: 13, sm: 14, md: 15, lg: 17 };

	const variantClasses = {
		ghost: [
			"text-[var(--text-muted)] hover:text-[var(--text-primary)]",
			"hover:bg-[var(--bg-surface-2)]",
			"dark:hover:bg-dark-surface2",
		].join(" "),
		danger: [
			"text-[var(--text-muted)] hover:text-danger-500",
			"hover:bg-danger-50 dark:hover:bg-danger-500/10",
		].join(" "),
		primary: ["text-white bg-accent-600 hover:bg-accent-700"].join(" "),
	};

	const button = (
		<button
			onClick={onClick}
			disabled={disabled}
			aria-label={ariaLabel || tooltip}
			className={[
				"inline-flex items-center justify-center",
				"transition-colors duration-150",
				"outline-none focus-visible:ring-2 focus-visible:ring-accent-500",
				"disabled:opacity-40 disabled:cursor-not-allowed",
				sizeClasses[size] || sizeClasses.md,
				variantClasses[variant] || variantClasses.ghost,
				className,
			].join(" ")}
			{...props}
		>
			<Icon size={iconSize[size] || 15} strokeWidth={1.75} aria-hidden="true" />
		</button>
	);

	if (!tooltip) return button;

	return (
		<Tooltip content={tooltip} position={tooltipPosition} delay>
			{button}
		</Tooltip>
	);
}

export default Tooltip;
