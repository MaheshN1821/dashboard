/** @type {import('tailwindcss').Config} */

// Custom design tokens for the finance dashboard.
// I'm extending Tailwind's defaults instead of overriding them — keeps
// all the utility classes intact while adding our own palette on top.
export default {
	content: ["./index.html", "./src/**/*.{js,jsx}"],

	// Dark mode is class-based so we can toggle it programmatically
	// via a button rather than relying on the OS preference (though we
	// do read that on first load — check AppContext for that logic).
	darkMode: "class",

	theme: {
		extend: {
			// ─── Font Families ───────────────────────────────────────────────
			// Plus Jakarta Sans → headings, display text, nav labels
			// Inter → body copy, descriptions, secondary text
			// DM Mono → all numbers, amounts, transaction IDs
			fontFamily: {
				jakarta: ['"Plus Jakarta Sans"', "sans-serif"],
				inter: ["Inter", "sans-serif"],
				mono: ['"DM Mono"', "monospace"],
			},

			// ─── Color Palette ────────────────────────────────────────────────
			// Keeping it tight. One blue accent, semantic greens/reds for
			// financial data, and a well-stepped neutral gray scale.
			// Each color has both light and dark variants baked in.
			colors: {
				// Primary accent — used for CTAs, active states, links
				accent: {
					50: "#EFF6FF",
					100: "#DBEAFE",
					200: "#BFDBFE",
					400: "#60A5FA",
					500: "#3B82F6",
					600: "#2563EB",
					700: "#1D4ED8",
				},

				// Neutral grays — the backbone of the UI
				gray: {
					25: "#FCFCFD",
					50: "#F9FAFB",
					75: "#F6F7F9", // our light bg
					100: "#F2F4F7",
					200: "#EAECF0",
					300: "#D0D5DD",
					400: "#98A2B3",
					500: "#667085",
					600: "#475467",
					700: "#344054",
					800: "#1D2939",
					900: "#101828",
				},

				// Dark mode surfaces — not just "invert gray", these are
				// properly tuned for dark backgrounds
				dark: {
					bg: "#0D0F14",
					surface: "#161A23",
					surface2: "#1E2330",
					border: "#2A2F3D",
				},

				// Semantic colors — income, expenses, warnings
				success: {
					50: "#ECFDF3",
					100: "#D1FADF",
					500: "#12B76A",
					600: "#039855",
					700: "#027A48",
				},
				danger: {
					50: "#FEF3F2",
					100: "#FEE4E2",
					500: "#F04438",
					600: "#D92D20",
					700: "#B42318",
				},
				warning: {
					50: "#FFFAEB",
					100: "#FEF0C7",
					500: "#F79009",
					600: "#DC6803",
				},
			},

			// ─── Border Radius ────────────────────────────────────────────────
			// Slightly more generous radii than Tailwind defaults — feels
			// more premium for a finance product
			borderRadius: {
				"2xs": "2px",
				xs: "4px",
				sm: "6px",
				md: "8px",
				lg: "12px",
				xl: "16px",
				"2xl": "20px",
				"3xl": "24px",
			},

			// ─── Box Shadows ─────────────────────────────────────────────────
			// Soft, realistic shadows. No hard drop-shadows — this isn't 2015.
			boxShadow: {
				xs: "0 1px 2px 0 rgba(16, 24, 40, 0.05)",
				sm: "0 1px 3px 0 rgba(16, 24, 40, 0.1), 0 1px 2px -1px rgba(16, 24, 40, 0.1)",
				md: "0 4px 8px -2px rgba(16, 24, 40, 0.1), 0 2px 4px -2px rgba(16, 24, 40, 0.06)",
				lg: "0 12px 16px -4px rgba(16, 24, 40, 0.08), 0 4px 6px -2px rgba(16, 24, 40, 0.03)",
				xl: "0 20px 24px -4px rgba(16, 24, 40, 0.08), 0 8px 8px -4px rgba(16, 24, 40, 0.03)",
				// Specific shadow for cards in dark mode — subtle blue glow
				"dark-card": "0 4px 24px 0 rgba(59, 130, 246, 0.05)",
				// Inset shadow for inputs
				input: "0 1px 2px 0 rgba(16, 24, 40, 0.05)",
				// Focus ring replacement
				focus: "0 0 0 4px rgba(37, 99, 235, 0.12)",
			},

			// ─── Spacing ─────────────────────────────────────────────────────
			// A few extra values for that precise spacing that Tailwind
			// doesn't cover by default
			spacing: {
				4.5: "18px",
				13: "52px",
				15: "60px",
				18: "72px",
				22: "88px",
				sidebar: "240px",
				"sidebar-collapsed": "68px",
			},

			// ─── Transitions ─────────────────────────────────────────────────
			transitionDuration: {
				250: "250ms",
			},
			transitionTimingFunction: {
				// Snappier than ease-in-out, feels more intentional
				smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
				bounce: "cubic-bezier(0.34, 1.56, 0.64, 1)",
			},

			// ─── Animation ───────────────────────────────────────────────────
			keyframes: {
				// Page-level fade + slight upward drift on enter
				"fade-up": {
					"0%": { opacity: "0", transform: "translateY(8px)" },
					"100%": { opacity: "1", transform: "translateY(0)" },
				},
				// For the sidebar slide-in on mobile
				"slide-in-left": {
					"0%": { transform: "translateX(-100%)" },
					"100%": { transform: "translateX(0)" },
				},
				// Modal slide-in from right
				"slide-in-right": {
					"0%": { transform: "translateX(100%)", opacity: "0" },
					"100%": { transform: "translateX(0)", opacity: "1" },
				},
				// Skeleton loading pulse — softer than Tailwind's default
				shimmer: {
					"0%": { backgroundPosition: "-200% 0" },
					"100%": { backgroundPosition: "200% 0" },
				},
			},
			animation: {
				"fade-up": "fade-up 0.3s cubic-bezier(0.4, 0, 0.2, 1) both",
				"slide-in-left":
					"slide-in-left 0.25s cubic-bezier(0.4, 0, 0.2, 1) both",
				"slide-in-right":
					"slide-in-right 0.3s cubic-bezier(0.4, 0, 0.2, 1) both",
				shimmer: "shimmer 1.5s linear infinite",
			},
		},
	},

	plugins: [],
};
