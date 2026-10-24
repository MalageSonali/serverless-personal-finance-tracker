import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

export const db = DynamoDBDocumentClient.from(new DynamoDBClient({}));
export const TX_TABLE = process.env.TX_TABLE || "FinanceTransactions";
export const BUDGET_TABLE = process.env.BUDGET_TABLE || "FinanceBudgets";

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "http://localhost:5173";

export const respond = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  },
  body: body === null ? "" : JSON.stringify(body),
});

// Identity comes ONLY from the JWT validated by API Gateway, never from the request body.
export const getUserId = (event) =>
  event.requestContext?.authorizer?.jwt?.claims?.sub || null;

export const parseBody = (event) => {
  try { return JSON.parse(event.body || "{}"); } catch { return null; }
};

export const CATEGORIES = ["Food", "Travel", "Education", "Shopping", "Bills", "Health", "Salary", "Freelance", "Other"];

// Returns an error string or null.
export function validateTransaction(t, partial = false) {
  if (!t || typeof t !== "object") return "Invalid body";
  const need = (k) => !partial && (t[k] === undefined || t[k] === "");
  for (const k of ["type", "amount", "category", "date"]) if (need(k)) return `${k} is required`;
  if (t.type !== undefined && !["income", "expense"].includes(t.type)) return "type must be income or expense";
  if (t.amount !== undefined && (typeof t.amount !== "number" || !isFinite(t.amount) || t.amount <= 0)) return "amount must be a positive number";
  if (t.category !== undefined && !CATEGORIES.includes(t.category)) return "invalid category";
  if (t.date !== undefined && (!/^\d{4}-\d{2}-\d{2}$/.test(t.date) || isNaN(Date.parse(t.date)))) return "date must be YYYY-MM-DD";
  if (t.description !== undefined && String(t.description).length > 200) return "description too long";
  return null;
}
