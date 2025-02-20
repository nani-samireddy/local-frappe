#!/bin/bash

# Ensure the script is executed with one argument (the bench name)
if [ $# -ne 1 ]; then
  echo "Usage: $0 <bench_name>"
  exit 1
fi

BENCH_NAME=$1
BASE_DIR="$HOME/benches"
PROJECT_DIR="$BASE_DIR/$BENCH_NAME"
COMPOSE_FILE="$PROJECT_DIR/$BENCH_NAME-compose.yaml"

# Check if the project directory exists
if [ ! -d "$PROJECT_DIR" ]; then
  echo "Error: Project directory $PROJECT_DIR does not exist."
  exit 1
fi

# Check if the docker-compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
  echo "Error: Docker Compose file $COMPOSE_FILE not found."
  exit 1
fi

# Get the Frappe container ID dynamically
FRAPPE_CONTAINER_NAME="${BENCH_NAME}-frappe-1"
FRAPPE_CONTAINER_ID=$(docker ps -aqf "name=$FRAPPE_CONTAINER_NAME")

# Check if the Frappe container is running
if [ -z "$FRAPPE_CONTAINER_ID" ]; then
  echo "Error: Frappe container $FRAPPE_CONTAINER_NAME is not running."
  exit 1
fi

# Open a new terminal window and run the command in the Frappe container
echo "Opening a new terminal window in the Frappe container..." >> "$PROJECT_DIR/logs/bench.log"

# For macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
  osascript -e "tell application \"Terminal\" to do script \"docker exec -it $FRAPPE_CONTAINER_ID bash -c 'cd ./frappe-bench && /bin/bash'\""
# For Linux
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  gnome-terminal -- bash -c "docker exec -it $FRAPPE_CONTAINER_ID bash -c 'cd ./frappe-bench && /bin/bash'; exec bash"
# For Windows
elif [[ "$OSTYPE" == "msys" ]]; then
  start powershell -Command "docker exec -it $FRAPPE_CONTAINER_ID bash -c 'cd ./frappe-bench && /bin/bash'"
fi
