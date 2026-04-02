// ─── Transaction Categories ────────────────────────────────────────────────
// Each category has a label, a color for charts/badges, and a Lucide icon name.
// I'm keeping this centralized so adding a new category only needs one change.
export const CATEGORIES = {
	FOOD: {
		label: "Food & Dining",
		color: "#F79009",
		bg: "#FFFAEB",
		darkBg: "rgba(247, 144, 9, 0.12)",
		icon: "UtensilsCrossed",
	},
	TRANSPORT: {
		label: "Transport",
		color: "#0891B2",
		bg: "#ECFEFF",
		darkBg: "rgba(8, 145, 178, 0.12)",
		icon: "Car",
	},
	SHOPPING: {
		label: "Shopping",
		color: "#7C3AED",
		bg: "#F5F3FF",
		darkBg: "rgba(124, 58, 237, 0.12)",
		icon: "ShoppingBag",
	},
	HOUSING: {
		label: "Housing",
		color: "#DC2626",
		bg: "#FEF2F2",
		darkBg: "rgba(220, 38, 38, 0.12)",
		icon: "Home",
	},
	ENTERTAINMENT: {
		label: "Entertainment",
		color: "#DB2777",
		bg: "#FDF2F8",
		darkBg: "rgba(219, 39, 119, 0.12)",
		icon: "Tv2",
	},
	HEALTH: {
		label: "Health",
		color: "#059669",
		bg: "#ECFDF5",
		darkBg: "rgba(5, 150, 105, 0.12)",
		icon: "Heart",
	},
	UTILITIES: {
		label: "Utilities",
		color: "#64748B",
		bg: "#F8FAFC",
		darkBg: "rgba(100, 116, 139, 0.12)",
		icon: "Zap",
	},
	SAVINGS: {
		label: "Savings",
		color: "#12B76A",
		bg: "#ECFDF3",
		darkBg: "rgba(18, 183, 106, 0.12)",
		icon: "PiggyBank",
	},
	INCOME: {
		label: "Income",
		color: "#2563EB",
		bg: "#EFF6FF",
		darkBg: "rgba(37, 99, 235, 0.12)",
		icon: "TrendingUp",
	},
	FREELANCE: {
		label: "Freelance",
		color: "#0D9488",
		bg: "#F0FDFA",
		darkBg: "rgba(13, 148, 136, 0.12)",
		icon: "Briefcase",
	},
	EDUCATION: {
		label: "Education",
		color: "#7C3AED",
		bg: "#F5F3FF",
		darkBg: "rgba(124, 58, 237, 0.12)",
		icon: "GraduationCap",
	},
	OTHER: {
		label: "Other",
		color: "#98A2B3",
		bg: "#F9FAFB",
		darkBg: "rgba(152, 162, 179, 0.12)",
		icon: "MoreHorizontal",
	},
};

// ─── Transaction Types ─────────────────────────────────────────────────────
export const TRANSACTION_TYPES = {
	INCOME: "income",
	EXPENSE: "expense",
};

// ─── User Roles ───────────────────────────────────────────────────────────
export const ROLES = {
	ADMIN: "admin",
	VIEWER: "viewer",
};

export const ROLE_CONFIG = {
	[ROLES.ADMIN]: {
		label: "Admin",
		description: "Can add, edit, and delete transactions",
		color: "accent",
	},
	[ROLES.VIEWER]: {
		label: "Viewer",
		description: "Read-only access to all data",
		color: "gray",
	},
};

// ─── Navigation Items ─────────────────────────────────────────────────────
// Lucide icon name as string — we dynamically import them in Sidebar.jsx
export const NAV_ITEMS = [
	{
		id: "dashboard",
		label: "Dashboard",
		path: "/",
		icon: "LayoutDashboard",
	},
	{
		id: "transactions",
		label: "Transactions",
		path: "/transactions",
		icon: "ArrowLeftRight",
	},
	{
		id: "insights",
		label: "Insights",
		path: "/insights",
		icon: "BarChart2",
	},
];

// ─── Chart Color Palette ───────────────────────────────────────────────────
// Used by Recharts components — ordered by visual priority.
// These match the CSS variables in index.css
export const CHART_COLORS = [
	"#2563EB", // blue   (accent)
	"#7C3AED", // violet
	"#0891B2", // cyan
	"#059669", // emerald
	"#D97706", // amber
	"#DC2626", // red
	"#DB2777", // pink
	"#64748B", // slate
];

// ─── Filter Options ────────────────────────────────────────────────────────
export const SORT_OPTIONS = [
	{ value: "date-desc", label: "Newest first" },
	{ value: "date-asc", label: "Oldest first" },
	{ value: "amount-desc", label: "Amount: High to low" },
	{ value: "amount-asc", label: "Amount: Low to high" },
];

export const DATE_RANGE_OPTIONS = [
	{ value: "all", label: "All time" },
	{ value: "7d", label: "Last 7 days" },
	{ value: "30d", label: "Last 30 days" },
	{ value: "90d", label: "Last 90 days" },
	{ value: "this-month", label: "This month" },
	{ value: "last-month", label: "Last month" },
];

// ─── LocalStorage Keys ─────────────────────────────────────────────────────
// Keeping all the keys in one place prevents typos across the codebase
export const STORAGE_KEYS = {
	THEME: "finly-theme",
	ROLE: "finly-role",
	TRANSACTIONS: "finly-transactions",
};

// ─── Pagination ────────────────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 10;

// ─── App Name ─────────────────────────────────────────────────────────────
export const APP_NAME = "Finly";
