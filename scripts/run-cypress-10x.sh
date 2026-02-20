#!/bin/bash
set -e

mkdir -p test-results

echo "==============================="
echo "  Cypress E2E 10x Stability Run"
echo "==============================="

echo "Starting dev server..."
npx vite --host 0.0.0.0 &
SERVER_PID=$!

echo "Waiting for dev server to be ready..."
npx wait-on http://localhost:5173 --timeout 30000

PASS=0
FAIL=0

for i in $(seq 1 10); do
  echo "=== Cypress E2E Run $i ==="
  if npx cypress run 2>&1 | tee "test-results/e2e-run-$i.log"; then
    ((PASS++))
    echo "Run $i: PASSED"
  else
    ((FAIL++))
    echo "Run $i: FAILED"
  fi
done

echo ""
echo "Cypress E2E: $PASS passed, $FAIL failed out of 10 runs" | tee -a test-results/run-summary.txt

echo "Stopping dev server..."
kill $SERVER_PID 2>/dev/null || true
