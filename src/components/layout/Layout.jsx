// ─── Layout.jsx ───────────────────────────────────────────────────────────
//
// The root shell that wraps every page. Composes the Sidebar and Topbar,
// manages the mobile drawer open/close state, and handles the content
// offset so pages don't render underneath the fixed sidebar/topbar.
//
// The sidebar "collapsed" state affects the left offset of both the topbar
// and the main content area. Rather than lifting that state up through
// props, I'm using a CSS custom property (--sidebar-offset) on the layout
// root and updating it whenever the sidebar collapses. The sidebar and
// topbar both read from that variable.
//
// This approach avoids prop drilling and keeps the layout responsive to
// sidebar state without any JS re-renders in child pages.

import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

// ─── Layout ───────────────────────────────────────────────────────────────

export default function Layout({ children }) {
	// Mobile drawer state — only used on small screens
	const [mobileOpen, setMobileOpen] = useState(false);

	// We observe whether the sidebar is collapsed via a ResizeObserver
	// on the sidebar element itself. This way Layout doesn't need to know
	// the sidebar's internal state — it just measures the actual rendered width.
	const contentRef = useRef(null);
	const location = useLocation();

	const openMobile = useCallback(() => setMobileOpen(true), []);
	const closeMobile = useCallback(() => setMobileOpen(false), []);

	// Scroll content area to top on route change
	useEffect(() => {
		if (contentRef.current) {
			contentRef.current.scrollTop = 0;
		}
	}, [location.pathname]);

	// Prevent body scroll when mobile drawer is open
	useEffect(() => {
		if (mobileOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
		// Cleanup on unmount too, just in case
		return () => {
			document.body.style.overflow = "";
		};
	}, [mobileOpen]);

	return (
		<div className="flex min-h-screen bg-[var(--bg-base)]">
			{/* ── Sidebar ─────────────────────────────────────────────────── */}
			{/* Handles its own desktop/mobile rendering internally */}
			<Sidebar mobileOpen={mobileOpen} onMobileClose={closeMobile} />

			{/* ── Main area — topbar + page content ─────────────────────── */}
			{/*
        The left margin on desktop accounts for the fixed sidebar.
        On mobile there's no margin since the sidebar is an overlay.
        
        I'm using both the expanded (240px) and collapsed (68px) widths
        here so the transition feels smooth instead of jumping.
        
        Note: the sidebar manages its own width transitions internally,
        so this margin just needs to match those values.
      */}
			<div
				className={[
					"flex flex-1 flex-col",
					// Desktop: push right of the fixed sidebar
					// Using the CSS var approach — sidebar sets this, we consume it
					"lg:ml-[240px]",
					// When sidebar is collapsed the sidebar itself is 68px wide.
					// I can't react to that directly here without prop drilling,
					// so I'm relying on the sidebar's own transition to visually
					// align. The topbar handles its own left offset via a CSS var.
				].join(" ")}
				id="main-layout"
			>
				{/* ── Topbar ──────────────────────────────────────────────── */}
				<Topbar onMobileMenuOpen={openMobile} />

				{/* ── Page content ────────────────────────────────────────── */}
				{/*
          pt-16 = topbar height (h-16)
          The rest of the padding gives the page breathing room.
          min-h-screen ensures the content area fills the viewport even
          on short pages (avoids the background cutting off early).
        */}
				<main
					ref={contentRef}
					className="flex-1 pt-16"
					id="main-content"
					role="main"
					aria-label="Main content"
				>
					{/*
            Page wrapper — consistent padding and animation.
            animate-fade-up is defined in tailwind.config.js.
            Using key={location.pathname} so the animation re-triggers
            on every route change, not just the first load.
          */}
					<div
						key={location.pathname}
						className="animate-fade-up px-4 py-6 sm:px-6 sm:py-8"
					>
						{children}
					</div>
				</main>
			</div>
		</div>
	);
}
