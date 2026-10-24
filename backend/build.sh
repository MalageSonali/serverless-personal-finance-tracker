#!/usr/bin/env bash
# Builds one zip per Lambda (each bundles shared/ + node_modules). Handler name: <file>.handler
set -e
npm install --omit=dev
mkdir -p dist
for f in createTransaction listTransactions updateTransaction deleteTransaction manageBudget getDashboardSummary; do
  rm -f dist/$f.zip
  zip -qr dist/$f.zip $f.mjs shared node_modules package.json
  echo "built dist/$f.zip"
done
