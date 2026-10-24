import { DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { db, TX_TABLE, respond, getUserId } from "./shared/utils.mjs";

export const handler = async (event) => {
  const userId = getUserId(event);
  if (!userId) return respond(401, { message: "Unauthorized" });
  try {
    await db.send(new DeleteCommand({
      TableName: TX_TABLE,
      Key: { userId, transactionId: event.pathParameters?.id },
      ConditionExpression: "attribute_exists(transactionId)",
    }));
    return respond(200, { message: "Transaction deleted" });
  } catch (e) {
    if (e.name === "ConditionalCheckFailedException") return respond(404, { message: "Transaction not found" });
    console.error(e);
    return respond(500, { message: "Internal error" });
  }
};
