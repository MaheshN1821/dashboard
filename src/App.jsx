// ─── App.jsx ──────────────────────────────────────────────────────────────
//
// Root component. Sets up routing and wraps the app in both providers.
//
// Provider order matters here:
//   AppProvider first → handles theme (applies .dark class to <html>)
//   TransactionProvider second → can access AppContext if it ever needs to
//
// BrowserRouter wraps both because our contexts use navigation hooks
// (useLocation, useSearchParams) that need to be inside the Router.
//
// Route structure is intentionally flat — 3 pages, no nested routes.
// The Layout component renders around every page route.

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { TransactionProvider } from "./context/TransactionContext";
import Layout from "./components/layout/Layout";
import DashboardPage from "./pages/DashboardPage";
import TransactionsPage from "./pages/TransactionsPage";
import InsightsPage from "./pages/InsightsPage";

export default function App() {
	return (
		<BrowserRouter>
			<AppProvider>
				<TransactionProvider>
					{/*
            Layout wraps all routes. It renders the sidebar + topbar
            and provides the main content area as a slot ({children}).
          */}
					<Layout>
						<Routes>
							<Route path="/" element={<DashboardPage />} />
							<Route path="/transactions" element={<TransactionsPage />} />
							<Route path="/insights" element={<InsightsPage />} />

							{/* Catch-all — redirects unknown paths to dashboard */}
							{/* Not using a 404 page here — for an assignment demo
                  a redirect is more graceful than an error screen */}
							<Route path="*" element={<DashboardPage />} />
						</Routes>
					</Layout>
				</TransactionProvider>
			</AppProvider>
		</BrowserRouter>
	);
}
