import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";

// ─── Select ───────────────────────────────────────────────────────────────
//
// Native <select> styled to match our Input component. I went native here
// instead of a custom dropdown because:
//   1. Keyboard navigation is free
//   2. Mobile gets the OS picker (which is better UX on touch)
//   3. Accessibility is handled by the browser
//
// For more complex dropdowns (multi-select, search) I'd reach for something
// like Radix UI Select, but for this project native is perfectly fine.
//
// The ChevronDown icon is layered over the select using pointer-events-none
// so it doesn't block click events.

const Select = forwardRef(function Select(
	{
		label,
		helperText,
		error,
		options = [], // [{ value, label, disabled? }]
		placeholder, // renders as the first disabled option
		size = "md",
		wrapperClassName = "",
		className = "",
		id,
		...props
	},
	ref,
) {
	const selectId =
		id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

	const sizeClasses = {
		sm: "h-8 text-xs rounded-md pl-3 pr-8",
		md: "h-9 text-sm rounded-lg pl-3.5 pr-9",
		lg: "h-11 text-sm rounded-lg pl-4 pr-10",
	};

	const iconSize = {
		sm: 12,
		md: 14,
		lg: 16,
	};

	const iconPosition = {
		sm: "right-2",
		md: "right-3",
		lg: "right-3.5",
	};

	return (
		<div className={["flex flex-col gap-1.5", wrapperClassName].join(" ")}>
			{label && (
				<label
					htmlFor={selectId}
					className="text-xs font-inter font-medium text-[var(--text-secondary)]"
				>
					{label}
				</label>
			)}

			<div className="relative">
				<select
					ref={ref}
					id={selectId}
					className={[
						"w-full font-inter appearance-none cursor-pointer",
						"bg-[var(--bg-surface)] text-[var(--text-primary)]",
						"border",
						error
							? "border-danger-400 focus:border-danger-400 focus:ring-danger-400/20"
							: "border-[var(--border-default)] focus:border-accent-500 focus:ring-accent-500/15",
						"focus:outline-none focus:ring-2",
						"transition-colors duration-150",
						"disabled:opacity-50 disabled:cursor-not-allowed",
						sizeClasses[size] || sizeClasses.md,
						className,
					]
						.filter(Boolean)
						.join(" ")}
					{...props}
				>
					{/* Placeholder option — disabled so it can't be re-selected */}
					{placeholder && (
						<option value="" disabled>
							{placeholder}
						</option>
					)}
					{options.map((opt) => (
						<option key={opt.value} value={opt.value} disabled={opt.disabled}>
							{opt.label}
						</option>
					))}
				</select>

				{/* Custom chevron — pointer-events-none so it doesn't eat clicks */}
				<div
					className={[
						"absolute top-1/2 -translate-y-1/2 pointer-events-none",
						"text-[var(--text-muted)]",
						iconPosition[size] || iconPosition.md,
					].join(" ")}
					aria-hidden="true"
				>
					<ChevronDown size={iconSize[size] || 14} strokeWidth={2} />
				</div>
			</div>

			{(error || helperText) && (
				<p
					className={[
						"text-xs font-inter",
						error ? "text-danger-500" : "text-[var(--text-muted)]",
					].join(" ")}
				>
					{error || helperText}
				</p>
			)}
		</div>
	);
});

export default Select;
