#!/bin/bash

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_DIR"

mkdir -p test-results

PASS=0
FAIL=0

for i in $(seq 1 10); do
  echo "=== Unit Test Run $i ==="
  if npx vitest run --coverage 2>&1 | tee "test-results/unit-run-$i.log"; then
    PASS=$((PASS + 1))
    echo "Run $i: PASSED"
  else
    FAIL=$((FAIL + 1))
    echo "Run $i: FAILED"
  fi
  echo ""
done

echo "Unit Tests: $PASS passed, $FAIL failed out of 10 runs" | tee test-results/unit-run-summary.txt
