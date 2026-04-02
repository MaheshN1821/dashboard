// ─── useLocalStorage ──────────────────────────────────────────────────────
//
// A drop-in replacement for useState that also syncs to localStorage.
// I've used this pattern on a few projects now — it's simple and it works.
//
// One thing I added that I always end up needing: a cross-tab sync listener.
// If you open the dashboard in two tabs and switch roles in one, the other
// tab will pick it up automatically via the "storage" event.

import { useState, useEffect, useCallback } from "react";

/**
 * @param {string} key - localStorage key
 * @param {*} initialValue - used if key doesn't exist in storage
 * @returns {[*, function, function]} - [value, setter, remover]
 */
export function useLocalStorage(key, initialValue) {
	// Lazy init — only runs once on mount, reads from storage
	const [storedValue, setStoredValue] = useState(() => {
		if (typeof window === "undefined") return initialValue;

		try {
			const item = window.localStorage.getItem(key);
			// If nothing is stored yet, fall back to the initial value
			return item !== null ? JSON.parse(item) : initialValue;
		} catch (err) {
			// localStorage can throw in private browsing or when storage is full
			console.warn(`[useLocalStorage] Failed to read key "${key}":`, err);
			return initialValue;
		}
	});

	// Wrapping the setter so it writes to storage AND updates state
	const setValue = useCallback(
		(value) => {
			try {
				// Supports both direct values and updater functions (like setState does)
				const valueToStore =
					value instanceof Function ? value(storedValue) : value;

				setStoredValue(valueToStore);
				window.localStorage.setItem(key, JSON.stringify(valueToStore));
			} catch (err) {
				console.warn(`[useLocalStorage] Failed to write key "${key}":`, err);
			}
		},
		[key, storedValue],
	);

	// Lets you wipe the key without setting a new value
	const removeValue = useCallback(() => {
		try {
			setStoredValue(initialValue);
			window.localStorage.removeItem(key);
		} catch (err) {
			console.warn(`[useLocalStorage] Failed to remove key "${key}":`, err);
		}
	}, [key, initialValue]);

	// Cross-tab sync — if another tab changes the same key, we update here too
	useEffect(() => {
		const handleStorageChange = (e) => {
			if (e.key !== key || e.storageArea !== window.localStorage) return;

			try {
				if (e.newValue === null) {
					// Key was removed in another tab
					setStoredValue(initialValue);
				} else {
					setStoredValue(JSON.parse(e.newValue));
				}
			} catch (err) {
				console.warn(
					`[useLocalStorage] Failed to parse storage event for key "${key}":`,
					err,
				);
			}
		};

		window.addEventListener("storage", handleStorageChange);
		return () => window.removeEventListener("storage", handleStorageChange);
	}, [key, initialValue]);

	return [storedValue, setValue, removeValue];
}
