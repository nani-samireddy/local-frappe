#!/bin/bash

# Ensure the script is executed with one argument (the bench name)
if [ $# -ne 1 ]; then
  echo "Usage: $0 <bench_name>"
  exit 1
fi

BENCH_NAME=$1
BASE_DIR="$HOME/benches"
PROJECT_DIR="$BASE_DIR/$BENCH_NAME"
BENCH_PATH="$PROJECT_DIR/source/frappe-bench"  # Path to the frappe-bench directory

# Check if the project directory exists
if [ ! -d "$PROJECT_DIR" ]; then
  echo "Error: Project directory $PROJECT_DIR does not exist."
  exit 1
fi

# Check if the frappe-bench directory exists
if [ ! -d "$BENCH_PATH" ]; then
  echo "Error: frappe-bench directory $BENCH_PATH not found."
  exit 1
fi

# Open the frappe-bench code in a new VS Code window
echo "Opening frappe-bench code in a new VS Code window..."

# For macOS/Linux/Windows (assuming `code` is in the PATH)
code -n "$BENCH_PATH"
