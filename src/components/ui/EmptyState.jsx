// ─── EmptyState ───────────────────────────────────────────────────────────
//
// This gets rendered any time a list or table has nothing to show.
// There are a few flavors:
//   - No transactions at all (fresh state)
//   - No results matching the current filters
//   - No data for a chart
//
// I'm using inline SVG illustrations instead of stock images — keeps
// the file self-contained and the illustrations can be themed properly.
// They're intentionally simple and geometric, not the typical "sad cloud" stock art.

import Button from "./Button.jsx";

// ─── Illustration components ──────────────────────────────────────────────
// Each one is a small SVG that communicates the empty state visually.

function NoTransactionsIllustration() {
	return (
		<svg
			width="80"
			height="80"
			viewBox="0 0 80 80"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
		>
			{/* Background circle */}
			<circle cx="40" cy="40" r="40" fill="var(--bg-surface-2)" />

			{/* Receipt/document shape */}
			<rect
				x="22"
				y="18"
				width="36"
				height="44"
				rx="4"
				fill="var(--bg-surface)"
				stroke="var(--border-default)"
				strokeWidth="1.5"
			/>

			{/* Lines representing text */}
			<rect
				x="28"
				y="26"
				width="20"
				height="2.5"
				rx="1.25"
				fill="var(--border-strong)"
			/>
			<rect
				x="28"
				y="32"
				width="14"
				height="2"
				rx="1"
				fill="var(--border-default)"
			/>
			<rect
				x="28"
				y="38"
				width="24"
				height="2"
				rx="1"
				fill="var(--border-default)"
			/>
			<rect
				x="28"
				y="44"
				width="18"
				height="2"
				rx="1"
				fill="var(--border-default)"
			/>

			{/* Plus icon hint */}
			<circle cx="56" cy="56" r="12" fill="var(--accent)" />
			<rect x="55" y="50" width="2" height="12" rx="1" fill="white" />
			<rect x="50" y="55" width="12" height="2" rx="1" fill="white" />
		</svg>
	);
}

function NoResultsIllustration() {
	return (
		<svg
			width="80"
			height="80"
			viewBox="0 0 80 80"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
		>
			<circle cx="40" cy="40" r="40" fill="var(--bg-surface-2)" />

			{/* Search circle */}
			<circle
				cx="36"
				cy="35"
				r="14"
				stroke="var(--border-strong)"
				strokeWidth="2"
				fill="none"
			/>

			{/* Search line handle */}
			<line
				x1="46"
				y1="46"
				x2="57"
				y2="57"
				stroke="var(--border-strong)"
				strokeWidth="2.5"
				strokeLinecap="round"
			/>

			{/* X inside search circle — no results */}
			<line
				x1="31"
				y1="30"
				x2="41"
				y2="40"
				stroke="var(--text-muted)"
				strokeWidth="2"
				strokeLinecap="round"
			/>
			<line
				x1="41"
				y1="30"
				x2="31"
				y2="40"
				stroke="var(--text-muted)"
				strokeWidth="2"
				strokeLinecap="round"
			/>
		</svg>
	);
}

function NoDataIllustration() {
	return (
		<svg
			width="80"
			height="80"
			viewBox="0 0 80 80"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
		>
			<circle cx="40" cy="40" r="40" fill="var(--bg-surface-2)" />

			{/* Bar chart with empty bars */}
			<rect
				x="18"
				y="54"
				width="10"
				height="8"
				rx="2"
				fill="var(--border-default)"
			/>
			<rect
				x="32"
				y="42"
				width="10"
				height="20"
				rx="2"
				fill="var(--border-default)"
			/>
			<rect
				x="46"
				y="36"
				width="10"
				height="26"
				rx="2"
				fill="var(--border-default)"
			/>

			{/* Dashed question mark style bars on top */}
			<rect
				x="18"
				y="28"
				width="10"
				height="22"
				rx="2"
				fill="var(--border-default)"
				opacity="0.3"
				strokeDasharray="3 2"
			/>
			<rect
				x="32"
				y="22"
				width="10"
				height="16"
				rx="2"
				fill="var(--border-default)"
				opacity="0.3"
			/>
			<rect
				x="46"
				y="18"
				width="10"
				height="14"
				rx="2"
				fill="var(--border-default)"
				opacity="0.3"
			/>

			{/* Question mark */}
			<text
				x="58"
				y="24"
				fontSize="14"
				fill="var(--text-muted)"
				fontFamily="Inter, sans-serif"
				fontWeight="600"
			>
				?
			</text>
		</svg>
	);
}

// ─── EmptyState ────────────────────────────────────────────────────────────
const ILLUSTRATIONS = {
	transactions: NoTransactionsIllustration,
	search: NoResultsIllustration,
	data: NoDataIllustration,
};

export function EmptyState({
	type = "transactions", // transactions | search | data
	title,
	description,
	action, // { label, onClick, icon }
	size = "md", // sm | md | lg
	className = "",
}) {
	const Illustration = ILLUSTRATIONS[type] || ILLUSTRATIONS.transactions;

	const sizeClasses = {
		sm: "py-8 gap-3",
		md: "py-12 gap-4",
		lg: "py-16 gap-5",
	};

	const illustrationSize = {
		sm: "w-14 h-14",
		md: "w-20 h-20",
		lg: "w-24 h-24",
	};

	return (
		<div
			className={[
				"flex flex-col items-center justify-center text-center",
				sizeClasses[size] || sizeClasses.md,
				className,
			].join(" ")}
			role="status"
			aria-label={title || "No data available"}
		>
			{/* Illustration */}
			<div
				className={[
					"transition-transform duration-300 ease-bounce",
					illustrationSize[size] || illustrationSize.md,
				].join(" ")}
			>
				<Illustration />
			</div>

			{/* Text */}
			<div className="max-w-xs">
				<p className="font-jakarta font-semibold text-sm text-[var(--text-primary)]">
					{title || "Nothing here yet"}
				</p>
				{description && (
					<p className="mt-1 text-xs font-inter text-[var(--text-muted)] leading-relaxed">
						{description}
					</p>
				)}
			</div>

			{/* Optional CTA */}
			{action && (
				<Button
					variant="soft"
					size="sm"
					onClick={action.onClick}
					icon={action.icon}
				>
					{action.label}
				</Button>
			)}
		</div>
	);
}

// ─── Inline Empty ──────────────────────────────────────────────────────────
// Smaller, text-only version for things like empty chart tooltips
export function InlineEmpty({ message = "No data", className = "" }) {
	return (
		<p
			className={[
				"text-xs font-inter text-[var(--text-muted)] italic",
				className,
			].join(" ")}
		>
			{message}
		</p>
	);
}

export default EmptyState;
