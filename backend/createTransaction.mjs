import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "node:crypto";
import { db, TX_TABLE, respond, getUserId, parseBody, validateTransaction } from "./shared/utils.mjs";

export const handler = async (event) => {
  const userId = getUserId(event);
  if (!userId) return respond(401, { message: "Unauthorized" });

  const body = parseBody(event);
  const err = validateTransaction(body);
  if (err) { console.warn("Validation failed:", err); return respond(400, { message: err }); }

  const item = {
    userId,
    transactionId: randomUUID(),            // generated on the server
    type: body.type,
    amount: body.amount,
    category: body.category,
    description: (body.description || "").trim(),
    date: body.date,
    createdAt: new Date().toISOString(),
  };
  await db.send(new PutCommand({ TableName: TX_TABLE, Item: item }));
  return respond(201, { message: "Transaction created successfully", transactionId: item.transactionId });
};
