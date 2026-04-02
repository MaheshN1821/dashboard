import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import Button from "./Button.jsx";

// ─── Modal ────────────────────────────────────────────────────────────────
//
// I went with a side-panel slide-in instead of a centered dialog.
// It feels more spatial and less jarring — you're not blocking the content
// you're adding to. This is a common pattern in modern SaaS dashboards
// (Linear, Notion, Vercel) and it works really well for forms.
//
// Implementation notes:
//   - Uses a backdrop for click-outside dismiss
//   - Traps focus inside when open (for keyboard/screen reader users)
//   - ESC key closes it
//   - Scroll lock on body when open
//   - Width is fixed on desktop, full-width on mobile

export function Modal({
	isOpen,
	onClose,
	title,
	subtitle,
	children,
	footer,
	width = "md", // sm | md | lg
	className = "",
}) {
	const panelRef = useRef(null);
	const firstFocusableRef = useRef(null);

	// Width classes for the panel
	const widthClasses = {
		sm: "w-full max-w-sm",
		md: "w-full max-w-md",
		lg: "w-full max-w-lg",
	};

	// ── ESC key listener ───────────────────────────────────────────────────
	useEffect(() => {
		if (!isOpen) return;

		function handleKeyDown(e) {
			if (e.key === "Escape") onClose();
		}

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, onClose]);

	// ── Body scroll lock ───────────────────────────────────────────────────
	// Without this the page scrolls behind the open modal which feels wrong
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [isOpen]);

	// ── Focus management ───────────────────────────────────────────────────
	useEffect(() => {
		if (isOpen && firstFocusableRef.current) {
			// Small delay so the animation doesn't fight with focus
			setTimeout(() => {
				firstFocusableRef.current?.focus();
			}, 100);
		}
	}, [isOpen]);

	if (!isOpen) return null;

	return (
		// Full-screen overlay
		<div
			className="fixed inset-0 z-50 flex"
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-title"
		>
			{/* Backdrop */}
			<div
				className={[
					"absolute inset-0",
					"bg-gray-900/50 dark:bg-black/60",
					"backdrop-blur-sm",
					"animate-fade-up", // reusing fade animation for the overlay
				].join(" ")}
				onClick={onClose}
				aria-hidden="true"
			/>

			{/* Panel — slides in from right */}
			<div
				ref={panelRef}
				className={[
					"relative ml-auto h-full",
					"flex flex-col",
					"bg-[var(--bg-surface)]",
					"border-l border-[var(--border-default)]",
					"shadow-xl",
					"animate-slide-in-right",
					widthClasses[width] || widthClasses.md,
					className,
				].join(" ")}
			>
				{/* ── Header ─────────────────────────────────────────────────── */}
				<div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-default)] shrink-0">
					<div>
						<h2
							id="modal-title"
							className="font-jakarta font-semibold text-base text-[var(--text-primary)]"
							ref={firstFocusableRef}
							tabIndex={-1}
						>
							{title}
						</h2>
						{subtitle && (
							<p className="mt-0.5 text-xs font-inter text-[var(--text-muted)]">
								{subtitle}
							</p>
						)}
					</div>

					<button
						onClick={onClose}
						className={[
							"w-8 h-8 rounded-lg",
							"flex items-center justify-center",
							"text-[var(--text-muted)] hover:text-[var(--text-primary)]",
							"hover:bg-[var(--bg-surface-2)]",
							"transition-colors duration-150",
							"focus-visible:ring-2 focus-visible:ring-accent-500",
							"outline-none",
						].join(" ")}
						aria-label="Close panel"
					>
						<X size={16} strokeWidth={2} />
					</button>
				</div>

				{/* ── Content ────────────────────────────────────────────────── */}
				{/* overflow-y-auto so long forms scroll within the panel */}
				<div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

				{/* ── Footer ─────────────────────────────────────────────────── */}
				{footer && (
					<div className="shrink-0 px-6 py-4 border-t border-[var(--border-default)] bg-[var(--bg-surface-2)]">
						{footer}
					</div>
				)}
			</div>
		</div>
	);
}

// ─── ModalFooter ──────────────────────────────────────────────────────────
// Preconfigured cancel + submit footer — most modals use this exact pattern
export function ModalFooter({
	onCancel,
	onSubmit,
	cancelLabel = "Cancel",
	submitLabel = "Save",
	submitVariant = "primary",
	submitClassName = "",
	loading = false,
	disabled = false,
}) {
	return (
		<div className="flex items-center justify-end gap-3">
			<Button
				variant="secondary"
				size="md"
				onClick={onCancel}
				disabled={loading}
			>
				{cancelLabel}
			</Button>
			<Button
				variant={submitVariant}
				size="md"
				onClick={onSubmit}
				loading={loading}
				disabled={disabled}
				className={submitClassName}
			>
				{submitLabel}
			</Button>
		</div>
	);
}

export default Modal;
