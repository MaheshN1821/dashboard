// ─── AppContext ────────────────────────────────────────────────────────────
//
// Global app-level state: theme and role. Nothing else belongs here.
// I kept this separate from TransactionContext so the two concerns don't
// bleed into each other — theme/role changes shouldn't re-render transaction
// components, and transaction updates shouldn't affect the theme toggle.
//
// Both theme and role persist to localStorage via the useLocalStorage hook.

import {
	createContext,
	useContext,
	useEffect,
	useCallback,
	useMemo,
} from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { ROLES, STORAGE_KEYS } from "../utils/constants";

const AppContext = createContext(null);

export function AppProvider({ children }) {
	// ─── Theme ────────────────────────────────────────────────────────────
	// Default to the system preference on first load, then remember the
	// user's choice in localStorage. The inline script in index.html already
	// applies the class on paint, so this just stays in sync with it.

	const [theme, setThemeStorage] = useLocalStorage(
		STORAGE_KEYS.THEME,
		// Check system preference as the initial default
		typeof window !== "undefined" &&
			window.matchMedia("(prefers-color-scheme: dark)").matches
			? "dark"
			: "light",
	);

	// Sync the .dark class on <html> whenever theme changes
	useEffect(() => {
		const root = document.documentElement;
		if (theme === "dark") {
			root.classList.add("dark");
		} else {
			root.classList.remove("dark");
		}
	}, [theme]);

	const toggleTheme = useCallback(() => {
		setThemeStorage((prev) => (prev === "dark" ? "light" : "dark"));
	}, [setThemeStorage]);

	const setTheme = useCallback(
		(value) => {
			if (value === "dark" || value === "light") {
				setThemeStorage(value);
			}
		},
		[setThemeStorage],
	);

	// ─── Role ─────────────────────────────────────────────────────────────
	// Defaults to viewer so nobody accidentally lands on admin without choosing.
	// The role toggle in the Topbar lets users switch for demo purposes.

	const [role, setRoleStorage] = useLocalStorage(
		STORAGE_KEYS.ROLE,
		ROLES.VIEWER,
	);

	const setRole = useCallback(
		(newRole) => {
			if (Object.values(ROLES).includes(newRole)) {
				setRoleStorage(newRole);
			}
		},
		[setRoleStorage],
	);

	const toggleRole = useCallback(() => {
		setRoleStorage((prev) =>
			prev === ROLES.ADMIN ? ROLES.VIEWER : ROLES.ADMIN,
		);
	}, [setRoleStorage]);

	// Convenience derived value — avoids `role === ROLES.ADMIN` checks everywhere
	const isAdmin = role === ROLES.ADMIN;

	// ─── Context Value ────────────────────────────────────────────────────
	// Memoized to avoid unnecessary re-renders down the tree.
	// Only re-computes when theme or role actually changes.

	const value = useMemo(
		() => ({
			theme,
			toggleTheme,
			setTheme,
			isDark: theme === "dark",
			role,
			setRole,
			toggleRole,
			isAdmin,
		}),
		[theme, toggleTheme, setTheme, role, setRole, toggleRole, isAdmin],
	);

	return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────
// Throwing an error here is intentional — if something tries to use this
// outside the provider, I want to know immediately rather than hunting
// down a mysterious undefined bug.

export function useAppContext() {
	const ctx = useContext(AppContext);
	if (!ctx) {
		throw new Error("useAppContext must be used inside <AppProvider>");
	}
	return ctx;
}
