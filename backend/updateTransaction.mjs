import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { db, TX_TABLE, respond, getUserId, parseBody, validateTransaction } from "./shared/utils.mjs";

export const handler = async (event) => {
  const userId = getUserId(event);
  if (!userId) return respond(401, { message: "Unauthorized" });

  const id = event.pathParameters?.id;
  const body = parseBody(event);
  const err = validateTransaction(body, true);
  if (err) return respond(400, { message: err });

  const fields = ["type", "amount", "category", "description", "date"].filter((k) => body[k] !== undefined);
  if (!fields.length) return respond(400, { message: "Nothing to update" });

  try {
    await db.send(new UpdateCommand({
      TableName: TX_TABLE,
      Key: { userId, transactionId: id },     // userId from token => ownership enforced by the key
      UpdateExpression: "SET " + fields.map((k) => `#${k} = :${k}`).join(", ") + ", updatedAt = :ua",
      ExpressionAttributeNames: Object.fromEntries(fields.map((k) => [`#${k}`, k])),
      ExpressionAttributeValues: { ...Object.fromEntries(fields.map((k) => [`:${k}`, body[k]])), ":ua": new Date().toISOString() },
      ConditionExpression: "attribute_exists(userId) AND attribute_exists(transactionId)",
    }));
    return respond(200, { message: "Transaction updated" });
  } catch (e) {
    if (e.name === "ConditionalCheckFailedException") return respond(404, { message: "Transaction not found" });
    console.error(e);
    return respond(500, { message: "Internal error" });
  }
};
