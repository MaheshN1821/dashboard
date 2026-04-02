// ─── Sidebar.jsx ──────────────────────────────────────────────────────────
//
// The main nav sidebar. Two behaviors depending on screen size:
//   - Desktop: fixed left panel, collapses to icon-only mode
//   - Mobile: hidden off-screen, slides in as a drawer with an overlay
//
// The collapsed state is managed locally here (not in context) because
// nothing else in the app actually needs to know if the sidebar is open
// or closed — it's purely a layout concern.

import { useState, useEffect, useCallback } from "react";
import { NavLink, useLocation } from "react-router-dom";
import * as Icons from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { NAV_ITEMS, APP_NAME, ROLES } from "../../utils/constants";

// ─── NavItem ──────────────────────────────────────────────────────────────
// A single nav entry. Handles both expanded and icon-only (collapsed) states.

function NavItem({ item, collapsed, onClick }) {
	const Icon = Icons[item.icon] || Icons.Circle;

	return (
		<NavLink
			to={item.path}
			end={item.path === "/"}
			onClick={onClick}
			className={({ isActive }) =>
				[
					"group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
					"font-inter",
					isActive
						? "bg-accent-50 text-accent-700 dark:bg-[rgba(79,142,247,0.1)] dark:text-[var(--accent)]"
						: "text-gray-500 hover:bg-gray-50 hover:text-gray-800 dark:text-[var(--text-secondary)] dark:hover:bg-[var(--bg-surface-2)] dark:hover:text-[var(--text-primary)]",
					collapsed ? "justify-center px-2.5" : "",
				].join(" ")
			}
		>
			{({ isActive }) => (
				<>
					{/* Left edge active indicator — a bit thicker and rounded */}
					{isActive && (
						<span className="absolute left-0 top-1/2 h-[60%] w-[3px] -translate-y-1/2 rounded-full bg-accent-600 dark:bg-[var(--accent)]" />
					)}

					<Icon
						size={17}
						strokeWidth={isActive ? 2.25 : 1.75}
						className="shrink-0"
					/>

					{/* Label fades out when collapsed */}
					{!collapsed && (
						<span className="truncate leading-none">{item.label}</span>
					)}

					{/* Tooltip for collapsed state — slides in from left */}
					{collapsed && (
						<span
							className={[
								"pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1.5",
								"text-xs font-medium text-white opacity-0 shadow-lg transition-all duration-150 translate-x-1",
								"group-hover:opacity-100 group-hover:translate-x-0 dark:bg-[var(--bg-surface-3)] dark:text-[var(--text-primary)] dark:border dark:border-[var(--border-default)]",
							].join(" ")}
						>
							{item.label}
						</span>
					)}
				</>
			)}
		</NavLink>
	);
}

// ─── Sidebar ──────────────────────────────────────────────────────────────

export default function Sidebar({ mobileOpen, onMobileClose }) {
	const { isAdmin } = useAppContext();
	const location = useLocation();

	// Desktop collapse state — starting expanded
	const [collapsed, setCollapsed] = useState(false);

	// Close mobile drawer on route change
	useEffect(() => {
		onMobileClose?.();
	}, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

	// Close drawer on Escape key
	useEffect(() => {
		function handleKeyDown(e) {
			if (e.key === "Escape" && mobileOpen) {
				onMobileClose?.();
			}
		}
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [mobileOpen, onMobileClose]);

	const toggleCollapsed = useCallback(() => {
		setCollapsed((prev) => !prev);
	}, []);

	// ── Sidebar inner content — shared between desktop and mobile drawer
	const SidebarContent = (
		<div
			className={[
				"flex h-full flex-col transition-all duration-300",
				"bg-[var(--bg-surface)]",
				collapsed ? "w-[68px]" : "w-[240px]",
			].join(" ")}
		>
			{/* ── Logo area ─────────────────────────────────────────────────── */}
			<div
				className={[
					"flex h-16 shrink-0 items-center border-b border-[var(--border-default)] border-r border-[var(--border-default)]",
					collapsed ? "justify-center px-3" : "gap-3 px-5",
				].join(" ")}
			>
				{/* Gradient icon — BarChart3 feels more finance-native than TrendingUp */}
				{/* <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent-500 to-accent-700 text-white shadow-sm shadow-accent-500/25">
					<Icons.BarChart3 size={15} strokeWidth={2.5} />
				</div> */}

				{!collapsed && (
					<div className="min-w-0">
						<span className="block truncate text-[15px] font-bold leading-none tracking-tight text-[var(--text-primary)] font-jakarta">
							{APP_NAME}
						</span>
						<span className="mt-[5px] block text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
							Finance
						</span>
					</div>
				)}
			</div>

			{/* ── Navigation ────────────────────────────────────────────────── */}
			<nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4">
				{/* Section label — only shown when expanded */}
				{!collapsed && (
					<p className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
						Menu
					</p>
				)}

				<ul className="flex flex-col gap-0.5">
					{NAV_ITEMS.map((item) => (
						<li key={item.id}>
							<NavItem
								item={item}
								collapsed={collapsed}
								onClick={onMobileClose}
							/>
						</li>
					))}
				</ul>

				{/* Divider — admin-only section below */}
				{isAdmin && (
					<>
						<div className="my-4 border-t border-[var(--border-default)]" />

						{!collapsed && (
							<p className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
								Admin
							</p>
						)}

						{/* Quick-action link for admins */}
						<NavItem
							item={{
								id: "add-transaction",
								label: "Add Transaction",
								path: "/transactions?action=add",
								icon: "PlusCircle",
							}}
							collapsed={collapsed}
							onClick={onMobileClose}
						/>
					</>
				)}
			</nav>

			{/* ── Footer — collapse toggle ───────────────────────────────────── */}
			{/* Only shown on desktop; mobile doesn't need this */}
			{/* <div className="hidden border-t border-[var(--border-default)] p-3 lg:block">
				<button
					onClick={toggleCollapsed}
					aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
					className={[
						"flex w-full items-center rounded-lg px-3 py-2.5 text-sm text-[var(--text-secondary)]",
						"hover:bg-gray-50 hover:text-gray-700 dark:hover:bg-[var(--bg-surface-2)] dark:hover:text-[var(--text-primary)]",
						"transition-colors duration-200",
						collapsed ? "justify-center" : "gap-3",
					].join(" ")}
				>
					<Icons.PanelLeftClose
						size={15}
						strokeWidth={1.75}
						className={`shrink-0 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
					/>
					{!collapsed && <span className="font-inter text-sm">Collapse</span>}
				</button>
			</div> */}
		</div>
	);

	return (
		<>
			{/* ── Desktop sidebar — always visible, fixed position ──────────── */}
			<aside
				className={[
					"hidden lg:flex flex-col border-r border-[var(--border-default)]",
					"fixed left-0 top-0 z-30 h-screen",
					"transition-all duration-300 ease-smooth",
					collapsed ? "w-[68px]" : "w-[240px]",
				].join(" ")}
			>
				{SidebarContent}
			</aside>

			{/* ── Mobile drawer ─────────────────────────────────────────────── */}
			{/* Backdrop */}
			<div
				onClick={onMobileClose}
				aria-hidden="true"
				className={[
					"fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden",
					"transition-opacity duration-300",
					mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
				].join(" ")}
			/>

			{/* Drawer panel */}
			<aside
				className={[
					"fixed left-0 top-0 z-50 h-screen lg:hidden",
					"transition-transform duration-300 ease-smooth",
					mobileOpen ? "translate-x-0" : "-translate-x-full",
				].join(" ")}
				aria-label="Mobile navigation"
			>
				{/* Close button inside the drawer for mobile */}
				<div className="relative flex h-full">
					{SidebarContent}
					<button
						onClick={onMobileClose}
						aria-label="Close navigation"
						className="absolute right-3 top-4 flex h-8 w-8 items-center justify-center rounded-md text-[var(--text-secondary)] hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-[var(--bg-surface-2)] lg:hidden"
					>
						<Icons.X size={16} />
					</button>
				</div>
			</aside>
		</>
	);
}

// Export collapsed state width so Layout can compute its left offset
export const SIDEBAR_WIDTH = 240;
export const SIDEBAR_COLLAPSED_WIDTH = 68;
