import { forwardRef } from "react";
import { Search, X } from "lucide-react";

// ─── Input ────────────────────────────────────────────────────────────────
//
// Covers most of what we need: text, number, date, search.
// The design goal was "feels native but polished" — not over-designed.
// I match the height to Button (h-9 for md) so they line up in filter rows.
//
// Props:
//   label       → renders a label above the input
//   helperText  → small text below the input (instructions, hints)
//   error       → error string — renders below input in red
//   icon        → Lucide component, renders on the left
//   iconRight   → Lucide component, renders on the right
//   onClear     → if passed, a clear (X) button shows when there's a value
//   size        → sm | md | lg

const Input = forwardRef(function Input(
	{
		label,
		helperText,
		error,
		icon: Icon,
		iconRight: IconRight,
		onClear,
		size = "md",
		id,
		className = "",
		wrapperClassName = "",
		...props
	},
	ref,
) {
	// Generate an id if one isn't passed, so the label's htmlFor works
	const inputId =
		id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

	const hasLeftIcon = !!Icon;
	const hasRightContent = !!IconRight || (!!onClear && !!props.value);

	const sizeClasses = {
		sm: {
			input: "h-8 text-xs rounded-md",
			padding: hasLeftIcon ? "pl-8" : "pl-3",
			paddingRight: hasRightContent ? "pr-8" : "pr-3",
			icon: 14,
			iconPos: "left-2.5",
			iconRightPos: "right-2.5",
		},
		md: {
			input: "h-9 text-sm rounded-lg",
			padding: hasLeftIcon ? "pl-9" : "pl-3.5",
			paddingRight: hasRightContent ? "pr-9" : "pr-3.5",
			icon: 15,
			iconPos: "left-3",
			iconRightPos: "right-3",
		},
		lg: {
			input: "h-11 text-sm rounded-lg",
			padding: hasLeftIcon ? "pl-10" : "pl-4",
			paddingRight: hasRightContent ? "pr-10" : "pr-4",
			icon: 16,
			iconPos: "left-3.5",
			iconRightPos: "right-3.5",
		},
	};

	const s = sizeClasses[size] || sizeClasses.md;

	return (
		<div className={["flex flex-col gap-1.5", wrapperClassName].join(" ")}>
			{/* Label */}
			{label && (
				<label
					htmlFor={inputId}
					className="text-xs font-inter font-medium text-[var(--text-secondary)]"
				>
					{label}
				</label>
			)}

			{/* Input wrapper — relative so we can position icons */}
			<div className="relative">
				{/* Left icon */}
				{Icon && (
					<div
						className={[
							"absolute top-1/2 -translate-y-1/2 pointer-events-none",
							s.iconPos,
						].join(" ")}
						aria-hidden="true"
					>
						<Icon
							size={s.icon}
							className="text-[var(--text-muted)]"
							strokeWidth={1.75}
						/>
					</div>
				)}

				<input
					ref={ref}
					id={inputId}
					className={[
						"w-full font-inter",
						"bg-[var(--bg-surface)] text-[var(--text-primary)]",
						"border",
						error
							? "border-danger-400 focus:border-danger-400 focus:ring-danger-400/20"
							: "border-[var(--border-default)] focus:border-accent-500 focus:ring-accent-500/15",
						"focus:outline-none focus:ring-2",
						"placeholder:text-[var(--text-muted)]",
						"transition-colors duration-150",
						"disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[var(--bg-surface-2)]",
						s.input,
						s.padding,
						s.paddingRight,
						className,
					]
						.filter(Boolean)
						.join(" ")}
					{...props}
				/>

				{/* Right icon or clear button */}
				{hasRightContent && (
					<div
						className={[
							"absolute top-1/2 -translate-y-1/2",
							s.iconRightPos,
						].join(" ")}
					>
						{onClear && props.value ? (
							// Clear button — only shows when there's something to clear
							<button
								type="button"
								onClick={onClear}
								className={[
									"rounded-md p-0.5",
									"text-[var(--text-muted)] hover:text-[var(--text-secondary)]",
									"hover:bg-[var(--bg-surface-2)]",
									"transition-colors duration-150",
									"focus-visible:ring-2 focus-visible:ring-accent-500",
									"outline-none",
								].join(" ")}
								aria-label="Clear input"
							>
								<X size={s.icon - 1} strokeWidth={2} />
							</button>
						) : IconRight ? (
							<IconRight
								size={s.icon}
								className="text-[var(--text-muted)] pointer-events-none"
								strokeWidth={1.75}
							/>
						) : null}
					</div>
				)}
			</div>

			{/* Helper or error text */}
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

// ─── Search Input ──────────────────────────────────────────────────────────
// Preconfigured input with search icon and clear button — used in the
// transaction filter bar. Just a thin wrapper, not a separate component.
export function SearchInput({
	value,
	onChange,
	onClear,
	placeholder = "Search transactions...",
	size = "md",
	className = "",
}) {
	return (
		<Input
			type="text"
			value={value}
			onChange={onChange}
			onClear={onClear}
			placeholder={placeholder}
			icon={Search}
			size={size}
			className={className}
			aria-label="Search"
		/>
	);
}

export default Input;
