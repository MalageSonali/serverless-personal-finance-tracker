import { getToken, logout } from "./auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function apiRequest(path, options = {}) {
  const token = await getToken();
  if (!token) { logout(); window.location.href = "/login"; throw new Error("Session expired"); }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...options.headers },
  });
  if (response.status === 401) { logout(); window.location.href = "/login"; throw new Error("Session expired"); }
  const data = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.message || `Request failed: ${response.status}`);
  return data;
}

export const api = {
  listTransactions: (q = "") => apiRequest(`/transactions${q}`),
  createTransaction: (t) => apiRequest("/transactions", { method: "POST", body: JSON.stringify(t) }),
  updateTransaction: (id, t) => apiRequest(`/transactions/${id}`, { method: "PUT", body: JSON.stringify(t) }),
  deleteTransaction: (id) => apiRequest(`/transactions/${id}`, { method: "DELETE" }),
  dashboard: (month) => apiRequest(`/dashboard?month=${month}`),
  listBudgets: (month) => apiRequest(`/budgets?month=${month}`),
  saveBudget: (b) => apiRequest("/budgets", { method: "POST", body: JSON.stringify(b) }),
};

export const CATEGORIES = ["Food", "Travel", "Education", "Shopping", "Bills", "Health", "Salary", "Freelance", "Other"];
export const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
