8#!/bin/bash
# Quick script to sum up AI costs from ai_cost_total.json file
# Usage: ./scripts/sum_ai_costs.sh <path_to_ai_cost_total.json>

if [ $# -eq 0 ]; then
    echo "Usage: $0 <path_to_ai_cost_total.json>"
    echo ""
    echo "Example:"
    echo "  $0 app/subtiter_warehouse/user123/video456/ai_cost_total.json"
    exit 1
fi

JSON_FILE="$1"

if [ ! -f "$JSON_FILE" ]; then
    echo "Error: File not found: $JSON_FILE"
    exit 1
fi

echo "Calculating total AI costs from: $JSON_FILE"
echo ""

# Sum up all cost values using jq (if available) or python
if command -v jq &> /dev/null; then
    TOTAL=$(jq '.total_cost' "$JSON_FILE")
    COUNT=$(jq '.ai_cost_items | length' "$JSON_FILE")
    echo "Total Cost: \$$TOTAL"
    echo "Total Operations: $COUNT"
else
    # Fallback to python if jq is not available
    python3 -c "
import json
import sys

with open('$JSON_FILE', 'r') as f:
    data = json.load(f)

total = data.get('total_cost', 0.0)
count = len(data.get('ai_cost_items', []))
print(f'Total Cost: \${total:.6f}')
print(f'Total Operations: {count}')
"
fi

