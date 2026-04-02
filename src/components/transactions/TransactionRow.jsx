// ─── TransactionRow.jsx ───────────────────────────────────────────────────
//
// A single row in the transactions table. Renders:
//   - Category icon
//   - Description + merchant (secondary line)
//   - Date
//   - Category badge
//   - Type badge
//   - Amount (right-aligned, DM Mono, color-coded)
//   - Edit + Delete actions (admin only)
//
// The note field (from mock data) shows as a tooltip on the description.
// Not every transaction has a note — only the ones with meaningful context.
//
// Row hover state uses a very subtle background tint rather than a hard
// highlight. The alternating row color (striped) is handled in the table.

import * as Icons from "lucide-react";
import { CategoryBadge, TypeBadge } from "../ui/Badge";
import Button from "../ui/Button";
import { Tooltip } from "../ui/Tooltip";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { CATEGORIES } from "../../utils/constants";
import { useAppContext } from "../../context/AppContext";

export default function TransactionRow({
	transaction,
	onEdit,
	onDelete,
	isAdmin,
}) {
	const { description, merchant, category, type, amount, date, note } =
		transaction;

	const { isDark } = useAppContext();
	const isIncome = type === "income";
	const categoryConfig = CATEGORIES[category] || CATEGORIES.OTHER;
	const Icon = Icons[categoryConfig.icon] || Icons.Circle;

	return (
		<tr
			className={[
				"group border-b border-[var(--border-default)] last:border-0",
				"hover:bg-[var(--bg-surface-2)] transition-colors duration-100",
			].join(" ")}
		>
			{/* ── Category icon ─────────────────────────────────────────── */}
			<td className="py-3 pl-5 pr-3 w-10">
				<div
					className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0"
					style={{
						backgroundColor: isDark ? categoryConfig.darkBg : categoryConfig.bg,
					}}
				>
					<Icon
						size={14}
						style={{ color: categoryConfig.color }}
						strokeWidth={2}
					/>
				</div>
			</td>

			{/* ── Description + merchant ────────────────────────────────── */}
			<td className="py-3 pr-4 min-w-0 max-w-[240px]">
				<div className="flex items-center gap-1.5 min-w-0">
					<p className="truncate text-sm font-medium text-[var(--text-primary)] font-inter leading-tight">
						{description}
					</p>
					{/* Info icon shows if there's a note — tooltip reveals it */}
					{note && (
						<Tooltip content={note} position="top">
							<Icons.Info
								size={12}
								className="shrink-0 text-[var(--text-muted)] cursor-default"
								strokeWidth={1.75}
							/>
						</Tooltip>
					)}
				</div>
				{merchant && (
					<p className="mt-0.5 truncate text-xs text-[var(--text-muted)] font-inter">
						{merchant}
					</p>
				)}
			</td>

			{/* ── Date ──────────────────────────────────────────────────── */}
			<td className="py-3 pr-4 hidden sm:table-cell whitespace-nowrap">
				<span className="text-sm text-[var(--text-secondary)] font-inter">
					{formatDate(date, "short")}
				</span>
			</td>

			{/* ── Category badge ────────────────────────────────────────── */}
			<td className="py-3 pr-4 hidden md:table-cell">
				<CategoryBadge category={category} size="sm" />
			</td>

			{/* ── Type badge ────────────────────────────────────────────── */}
			<td className="py-3 pr-4 hidden lg:table-cell">
				<TypeBadge type={type} size="sm" />
			</td>

			{/* ── Amount ────────────────────────────────────────────────── */}
			<td className="py-3 pr-4 text-right whitespace-nowrap">
				<span
					className={[
						"text-sm font-medium font-mono tabular-nums",
						isIncome
							? "text-success-600 dark:text-success-500"
							: "text-[var(--text-primary)]",
					].join(" ")}
				>
					{isIncome ? "+" : "−"}
					{formatCurrency(amount, "INR")}
				</span>
			</td>

			{/* ── Actions (admin only) ──────────────────────────────────── */}
			{/* Always reserve the column space so the table doesn't shift width
          when switching between Viewer and Admin modes */}
			<td className="py-3 pl-2 pr-5 w-20 text-right">
				{isAdmin && (
					<div className="flex items-center justify-end gap-1 transition-opacity duration-150">
						<Button
							variant="ghost"
							size="sm"
							icon={Icons.Pencil}
							onClick={() => onEdit(transaction)}
							aria-label={`Edit ${description}`}
						/>
						<Button
							variant="ghost"
							size="sm"
							icon={Icons.Trash2}
							onClick={() => onDelete(transaction)}
							aria-label={`Delete ${description}`}
							className="hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-500/10"
						/>
					</div>
				)}
			</td>
		</tr>
	);
}
