// Handles GET /budgets and POST /budgets
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { db, BUDGET_TABLE, respond, getUserId, parseBody, CATEGORIES } from "./shared/utils.mjs";

export const handler = async (event) => {
  const userId = getUserId(event);
  if (!userId) return respond(401, { message: "Unauthorized" });

  if (event.requestContext.http.method === "GET") {
    const month = event.queryStringParameters?.month;
    const res = await db.send(new QueryCommand({
      TableName: BUDGET_TABLE,
      KeyConditionExpression: month ? "userId = :u AND begins_with(budgetKey, :m)" : "userId = :u",
      ExpressionAttributeValues: month ? { ":u": userId, ":m": `${month}#` } : { ":u": userId },
    }));
    return respond(200, { budgets: res.Items });
  }

  const b = parseBody(event);
  if (!b || !/^\d{4}-\d{2}$/.test(b.month || "")) return respond(400, { message: "month must be YYYY-MM" });
  if (!CATEGORIES.includes(b.category)) return respond(400, { message: "invalid category" });
  if (typeof b.limit !== "number" || b.limit <= 0) return respond(400, { message: "limit must be a positive number" });

  await db.send(new PutCommand({
    TableName: BUDGET_TABLE,
    Item: { userId, budgetKey: `${b.month}#${b.category}`, month: b.month, category: b.category, limit: b.limit },
  }));
  return respond(200, { message: "Budget saved" });
};
