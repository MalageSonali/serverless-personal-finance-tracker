# Security & validation tests (Step 17)
Replace $API and $TOKEN (copy the access token from browser DevTools > Application > Local Storage, key ending in `.accessToken`).

1. No token (expect 401):
   curl -i $API/transactions
2. Invalid token (expect 401):
   curl -i -H "Authorization: Bearer abc.def.ghi" $API/transactions
3. Negative amount (expect 400, nothing written):
   curl -i -X POST $API/transactions -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
     -d '{"type":"expense","amount":-50,"category":"Food","date":"2026-10-22"}'
4. Missing field (expect 400):
   curl -i -X POST $API/transactions -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"type":"expense"}'
5. User A deleting User B's transaction id (expect 404; the key includes A's own userId):
   curl -i -X DELETE $API/transactions/<B_TRANSACTION_ID> -H "Authorization: Bearer $TOKEN_A"
6. Nonexistent id (expect 404):
   curl -i -X PUT $API/transactions/does-not-exist -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"amount":10}'
7. Budget alert: set a Food budget of 1000, add a Food expense of 900 -> dashboard shows "90% used".

# Simple load test (Step 16)
npm i -g autocannon
autocannon -c 5 -d 30 -H "Authorization: Bearer $TOKEN" $API/transactions
Raise -c (10, 25, 50), record latency and errors, then check CloudWatch: Invocations, Duration, Errors, Throttles, ConcurrentExecutions.
