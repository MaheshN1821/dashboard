// ─── Currency Formatter ────────────────────────────────────────────────────
// Using Intl.NumberFormat — handles locale-specific formatting properly.
// I'd rather use this than a library like numeral.js for something this simple.

/**
 * Formats a number as currency.
 * @param {number} value
 * @param {string} currency - ISO 4217 code, defaults to INR
 * @param {boolean} compact - use compact notation (1.2K, 3.4M)
 * @returns {string}
 */
export function formatCurrency(value, currency = "INR", compact = false) {
	if (value === null || value === undefined || isNaN(value)) return "—";

	const options = {
		style: "currency",
		currency,
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	};

	if (compact) {
		options.notation = "compact";
		options.compactDisplay = "short";
	}

	// Using en-IN locale for Indian number formatting (lakhs/crores)
	return new Intl.NumberFormat("en-IN", options).format(value);
}

/**
 * Formats a number with + or - sign prefix and color hint.
 * Returns just the formatted string — color is applied via className in JSX.
 * @param {number} value
 * @param {string} type - "income" | "expense"
 * @returns {string}
 */
export function formatTransactionAmount(value, type) {
	const abs = Math.abs(value);
	const formatted = formatCurrency(abs);
	return type === "income" ? `+${formatted}` : `-${formatted}`;
}

// ─── Date Formatters ───────────────────────────────────────────────────────

/**
 * Formats a date string to display format.
 * @param {string|Date} date
 * @param {"short"|"medium"|"long"|"month-year"|"day-month"} format
 * @returns {string}
 */
export function formatDate(date, format = "medium") {
	if (!date) return "—";

	const d = typeof date === "string" ? new Date(date) : date;

	// Check for invalid date
	if (isNaN(d.getTime())) return "Invalid date";

	const formats = {
		// Jan 5, 2025
		short: { month: "short", day: "numeric", year: "numeric" },
		// January 5, 2025
		medium: { month: "long", day: "numeric", year: "numeric" },
		// Mon, Jan 5, 2025
		long: { weekday: "short", month: "short", day: "numeric", year: "numeric" },
		// Jan 2025
		"month-year": { month: "short", year: "numeric" },
		// Jan 5
		"day-month": { month: "short", day: "numeric" },
	};

	return new Intl.DateTimeFormat(
		"en-IN",
		formats[format] || formats.medium,
	).format(d);
}

/**
 * Returns relative time like "2 days ago", "just now", etc.
 * Useful for the recent transactions section.
 * @param {string|Date} date
 * @returns {string}
 */
export function formatRelativeTime(date) {
	if (!date) return "—";

	const d = typeof date === "string" ? new Date(date) : date;
	const now = new Date();
	const diffMs = now - d;
	const diffSecs = Math.floor(diffMs / 1000);
	const diffMins = Math.floor(diffSecs / 60);
	const diffHours = Math.floor(diffMins / 60);
	const diffDays = Math.floor(diffHours / 24);
	const diffWeeks = Math.floor(diffDays / 7);
	const diffMonths = Math.floor(diffDays / 30);

	if (diffSecs < 60) return "Just now";
	if (diffMins < 60) return `${diffMins}m ago`;
	if (diffHours < 24) return `${diffHours}h ago`;
	if (diffDays === 1) return "Yesterday";
	if (diffDays < 7) return `${diffDays} days ago`;
	if (diffWeeks === 1) return "Last week";
	if (diffWeeks < 4) return `${diffWeeks} weeks ago`;
	if (diffMonths === 1) return "Last month";
	return formatDate(d, "short");
}

/**
 * Gets the month name from a date string.
 * @param {string|Date} date
 * @param {"short"|"long"} length
 * @returns {string}
 */
export function getMonthName(date, length = "short") {
	const d = typeof date === "string" ? new Date(date) : date;
	return new Intl.DateTimeFormat("en-IN", { month: length }).format(d);
}

// ─── Number Formatters ─────────────────────────────────────────────────────

/**
 * Formats a percentage value.
 * @param {number} value - decimal (0.25) or percentage (25)
 * @param {boolean} isDecimal - true if value is 0-1, false if already 0-100
 * @param {number} decimals
 * @returns {string}
 */
export function formatPercent(value, isDecimal = false, decimals = 1) {
	if (value === null || value === undefined || isNaN(value)) return "—";
	const pct = isDecimal ? value * 100 : value;
	const sign = pct > 0 ? "+" : "";
	return `${sign}${pct.toFixed(decimals)}%`;
}

/**
 * Compact number format — 12500 → "12.5K", 1200000 → "1.2M"
 * @param {number} value
 * @returns {string}
 */
export function formatCompact(value) {
	if (value === null || value === undefined || isNaN(value)) return "—";
	return new Intl.NumberFormat("en-IN", {
		notation: "compact",
		compactDisplay: "short",
		maximumFractionDigits: 1,
	}).format(value);
}

// ─── Calculation Helpers ───────────────────────────────────────────────────
// These are used across both the dashboard and insights pages.
// Keeping them in formatters because they're about deriving display values.

/**
 * Calculates percentage change between two values.
 * @param {number} current
 * @param {number} previous
 * @returns {number} - percentage change, e.g. 12.5 for +12.5%
 */
export function percentageChange(current, previous) {
	if (!previous || previous === 0) return 0;
	return ((current - previous) / Math.abs(previous)) * 100;
}

/**
 * Groups transactions by month and returns summary per month.
 * @param {Array} transactions
 * @returns {Array} - [{month, income, expenses, net}]
 */
export function groupByMonth(transactions) {
	const grouped = {};

	transactions.forEach((tx) => {
		const date = new Date(tx.date);
		// Using year-month as key to handle year boundaries properly
		const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
		const monthLabel = getMonthName(date, "short");

		if (!grouped[key]) {
			grouped[key] = { key, month: monthLabel, income: 0, expenses: 0, net: 0 };
		}

		if (tx.type === "income") {
			grouped[key].income += tx.amount;
		} else {
			grouped[key].expenses += tx.amount;
		}
		grouped[key].net = grouped[key].income - grouped[key].expenses;
	});

	// Sort chronologically before returning
	return Object.values(grouped).sort((a, b) => a.key.localeCompare(b.key));
}

/**
 * Groups transactions by category and sums up amounts.
 * Only includes expenses (not income) for spending breakdown.
 * @param {Array} transactions
 * @returns {Array} - [{category, amount, percentage}] sorted by amount desc
 */
export function groupByCategory(transactions) {
	const expenses = transactions.filter((tx) => tx.type === "expense");
	const total = expenses.reduce((sum, tx) => sum + tx.amount, 0);

	const grouped = {};
	expenses.forEach((tx) => {
		if (!grouped[tx.category]) {
			grouped[tx.category] = 0;
		}
		grouped[tx.category] += tx.amount;
	});

	return Object.entries(grouped)
		.map(([category, amount]) => ({
			category,
			amount,
			percentage: total > 0 ? (amount / total) * 100 : 0,
		}))
		.sort((a, b) => b.amount - a.amount);
}
