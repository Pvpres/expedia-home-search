#!/bin/bash
set -e

cd "$(dirname "$0")/.."
mkdir -p test-results

echo "=== Starting 10x Unit Test Runs ==="
PASS=0
FAIL=0

for i in $(seq 1 10); do
  echo "=== Unit Test Run $i ==="
  if npx vitest run 2>&1 | tee "test-results/unit-run-$i.log"; then
    ((PASS++))
    echo "--- Run $i: PASSED ---"
  else
    ((FAIL++))
    echo "--- Run $i: FAILED ---"
  fi
done

echo ""
echo "========================================="
echo "Unit Tests: $PASS passed, $FAIL failed out of 10 runs"
echo "========================================="
echo "Unit Tests: $PASS passed, $FAIL failed out of 10 runs" > test-results/unit-run-summary.txt
