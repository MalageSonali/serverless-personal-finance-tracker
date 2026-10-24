# Serverless Personal Finance Tracker

React + API Gateway (HTTP API, JWT authorizer) + Lambda (Node.js 20) + DynamoDB + Cognito + Amplify Hosting.

## Layout
- `backend/`  - 6 Lambda handlers + `shared/utils.mjs`; `build.sh` zips each one
- `frontend/` - Vite React app
- `docs/test-scenarios.md` - security, validation and load tests

## AWS setup (one region, e.g. ap-south-1)
1. DynamoDB: `FinanceTransactions` (PK `userId` S, SK `transactionId` S) and `FinanceBudgets` (PK `userId` S, SK `budgetKey` S). On-demand.
2. Cognito User Pool: email sign-in + verification; app client **without secret**, enable `ALLOW_USER_SRP_AUTH` and `ALLOW_REFRESH_TOKEN_AUTH`.
3. Lambda (Node.js 20.x): create 6 functions named as the files; upload `backend/dist/<name>.zip`; handler `<name>.handler`.
   Env vars: `TX_TABLE`, `BUDGET_TABLE`, `ALLOWED_ORIGIN` (your Amplify URL, or http://localhost:5173 locally).
   Give each function a least-privilege DynamoDB policy (see `backend/iam-policy-example.json`).
4. API Gateway **HTTP API** `FinanceTrackerAPI`:
   | Route | Lambda |
   |---|---|
   | POST /transactions | createTransaction |
   | GET /transactions | listTransactions |
   | PUT /transactions/{id} | updateTransaction |
   | DELETE /transactions/{id} | deleteTransaction |
   | GET /dashboard | getDashboardSummary |
   | GET and POST /budgets | manageBudget |
   - Attach a **JWT authorizer** to every route. Issuer: `https://cognito-idp.<region>.amazonaws.com/<userPoolId>`. Audience: the app client ID.
   - The frontend sends the Cognito **access token**. If the authorizer rejects it, switch `getToken()` in `auth.js` to return `session.getIdToken().getJwtToken()` (ID tokens carry `aud`).
   - CORS: allow only your frontend origin(s); methods GET, POST, PUT, DELETE, OPTIONS; headers `authorization, content-type`.
5. Frontend env: copy `frontend/.env.example` to `frontend/.env.local` and fill in the three values.

## Run locally
```
cd backend && ./build.sh
cd ../frontend && npm install && npm run dev
```

## Deploy frontend (Amplify Hosting)
Connect the GitHub repo, app root `frontend`, build `npm ci && npm run build`, output `dist`, add the three `VITE_*` variables. Add the Amplify URL to API CORS and to `ALLOWED_ORIGIN`.

## Monitoring
CloudWatch Metrics (Lambda): Invocations, Duration, Errors, Throttles, ConcurrentExecutions. Logs: `/aws/lambda/<function>`.
