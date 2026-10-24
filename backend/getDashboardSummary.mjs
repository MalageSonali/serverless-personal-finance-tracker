import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { db, TX_TABLE, BUDGET_TABLE, respond, getUserId } from "./shared/utils.mjs";

export const budgetStatus = (u) => (u > 100 ? "exceeded" : u >= 80 ? "approaching" : "normal");

async function queryAll(table, params) {
  let items = [], key;
  do {
    const r = await db.send(new QueryCommand({ TableName: table, ExclusiveStartKey: key, ...params }));
    items.push(...r.Items); key = r.LastEvaluatedKey;
  } while (key);
  return items;
}

export const handler = async (event) => {
  const userId = getUserId(event);
  if (!userId) return respond(401, { message: "Unauthorized" });

  const month = event.queryStringParameters?.month || new Date().toISOString().slice(0, 7);
  const kc = { KeyConditionExpression: "userId = :u", ExpressionAttributeValues: { ":u": userId } };
  const [txs, budgets] = await Promise.all([
    queryAll(TX_TABLE, kc),
    queryAll(BUDGET_TABLE, { KeyConditionExpression: "userId = :u AND begins_with(budgetKey, :m)", ExpressionAttributeValues: { ":u": userId, ":m": `${month}#` } }),
  ]);

  const inMonth = txs.filter((t) => t.date.startsWith(month));
  const totalIncome = inMonth.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = inMonth.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? +(((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(2) : null;

  const byCategory = {};
  inMonth.filter((t) => t.type === "expense").forEach((t) => (byCategory[t.category] = (byCategory[t.category] || 0) + t.amount));

  const monthly = {};
  txs.forEach((t) => {
    const m = t.date.slice(0, 7);
    monthly[m] ??= { month: m, income: 0, expenses: 0 };
    monthly[m][t.type === "income" ? "income" : "expenses"] += t.amount;
  });

  const budgetProgress = budgets.map((b) => {
    const spent = byCategory[b.category] || 0;
    const utilization = +((spent / b.limit) * 100).toFixed(2);
    return { category: b.category, limit: b.limit, spent, utilization, status: budgetStatus(utilization) };
  });
  const alerts = budgetProgress
    .filter((b) => b.status !== "normal")
    .map((b) => b.status === "exceeded"
      ? `Your ${b.category} budget is exceeded (${b.utilization}% used).`
      : `Your ${b.category} budget is ${b.utilization}% used this month.`);

  return respond(200, {
    month, totalIncome, totalExpenses, balance, savingsRate,
    categoryBreakdown: Object.entries(byCategory).map(([name, value]) => ({ name, value })),
    monthlyTrend: Object.values(monthly).sort((a, b) => a.month.localeCompare(b.month)),
    budgetProgress, alerts,
  });
};
