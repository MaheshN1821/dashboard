// ─── exportUtils.js ───────────────────────────────────────────────────────
//
// Utility functions for exporting transaction data.
// Both functions create a temporary <a> element, trigger a download, then
// clean up — the standard browser download pattern, no library needed.
//
// These export whatever array is passed in — so the caller decides whether
// to export all transactions or just the filtered set. TransactionsPage
// passes filteredTransactions, which is the right UX decision (export what
// you're looking at, not the whole database).

/**
 * Exports an array of transactions to a CSV file.
 * @param {Array} transactions
 * @param {string} filename - optional custom filename
 */
export function exportToCSV(transactions, filename) {
	if (!transactions || transactions.length === 0) return;

	const headers = [
		"ID",
		"Date",
		"Description",
		"Merchant",
		"Category",
		"Type",
		"Amount (INR)",
		"Note",
	];

	// Map each transaction to a row, escaping commas and quotes properly
	const rows = transactions.map((tx) => [
		tx.id,
		tx.date,
		// Wrap string fields in quotes and escape any internal quotes
		`"${(tx.description || "").replace(/"/g, '""')}"`,
		`"${(tx.merchant || "").replace(/"/g, '""')}"`,
		tx.category,
		tx.type,
		tx.amount,
		`"${(tx.note || "").replace(/"/g, '""')}"`,
	]);

	const csvContent = [
		headers.join(","),
		...rows.map((row) => row.join(",")),
	].join("\n");

	// Add BOM for Excel — without this, ₹ and other special chars render wrong
	const BOM = "\uFEFF";
	const blob = new Blob([BOM + csvContent], {
		type: "text/csv;charset=utf-8;",
	});
	const url = URL.createObjectURL(blob);

	const link = document.createElement("a");
	link.href = url;
	link.download =
		filename || `transactions-${new Date().toISOString().split("T")[0]}.csv`;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);

	// Release the object URL after a short delay
	setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Exports an array of transactions to a JSON file.
 * @param {Array} transactions
 * @param {string} filename - optional custom filename
 */
export function exportToJSON(transactions, filename) {
	if (!transactions || transactions.length === 0) return;

	// Pretty-print with 2-space indent — readable when opened in a text editor
	const json = JSON.stringify(
		{
			exportedAt: new Date().toISOString(),
			count: transactions.length,
			transactions,
		},
		null,
		2,
	);

	const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
	const url = URL.createObjectURL(blob);

	const link = document.createElement("a");
	link.href = url;
	link.download =
		filename || `transactions-${new Date().toISOString().split("T")[0]}.json`;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);

	setTimeout(() => URL.revokeObjectURL(url), 100);
}
