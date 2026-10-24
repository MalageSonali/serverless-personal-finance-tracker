import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { db, TX_TABLE, respond, getUserId } from "./shared/utils.mjs";

export const handler = async (event) => {
  const userId = getUserId(event);
  if (!userId) return respond(401, { message: "Unauthorized" });

  const { from, to } = event.queryStringParameters || {};
  let items = [], lastKey;
  do {
    const res = await db.send(new QueryCommand({
      TableName: TX_TABLE,
      KeyConditionExpression: "userId = :u",
      ExpressionAttributeValues: { ":u": userId },
      ExclusiveStartKey: lastKey,
    }));
    items.push(...res.Items);
    lastKey = res.LastEvaluatedKey;
  } while (lastKey);

  if (from) items = items.filter((t) => t.date >= from);
  if (to) items = items.filter((t) => t.date <= to);
  items.sort((a, b) => b.date.localeCompare(a.date));
  return respond(200, { transactions: items });
};
