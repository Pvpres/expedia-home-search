#!/bin/bash
set -e

cd "$(dirname "$0")/.."
mkdir -p test-results

echo "=== Starting 10x Cypress E2E Test Runs ==="
PASS=0
FAIL=0

for i in $(seq 1 10); do
  echo "=== Cypress E2E Run $i ==="
  if npx cypress run 2>&1 | tee "test-results/cypress-run-$i.log"; then
    ((PASS++))
    echo "--- Run $i: PASSED ---"
  else
    ((FAIL++))
    echo "--- Run $i: FAILED ---"
  fi
done

echo ""
echo "========================================="
echo "Cypress E2E: $PASS passed, $FAIL failed out of 10 runs"
echo "========================================="
echo "Cypress E2E: $PASS passed, $FAIL failed out of 10 runs" > test-results/cypress-run-summary.txt
