#!/bin/bash

# Ensure the script is executed with one argument
if [ $# -ne 1 ]; then
  echo "Usage: $0 <project_name>"
  exit 1
fi

PROJECT_NAME=$1
BASE_DIR="$HOME/benches"
PROJECT_DIR="$BASE_DIR/$PROJECT_NAME"
COMPOSE_FILE="$PROJECT_DIR/$PROJECT_NAME-compose.yaml"

# Check if the project exists
if [ ! -d "$PROJECT_DIR" ]; then
  echo "Error: Project directory $PROJECT_DIR does not exist."
  exit 1
fi

# Check if the docker-compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
  echo "Error: Docker Compose file $COMPOSE_FILE not found."
  exit 1
fi

# Get the container name
FRAPPE_CONTAINER_NAME="$PROJECT_NAME-frappe-1"

# Check if the container is running
if [ "$(docker inspect -f '{{.State.Running}}' $FRAPPE_CONTAINER_NAME)" != "true" ]; then
  echo "Error: Frappe container $FRAPPE_CONTAINER_NAME is not running."
  exit 1
fi

# Find and terminate the bench process inside the container
echo "Stopping the bench process in the container..."
docker exec "$FRAPPE_CONTAINER_NAME" bash -c "
  BENCH_PID=\$(ps aux | grep 'bench start' | awk '{print $2}');
  if [ -n \"\$BENCH_PID\" ]; then
    kill -9 \$BENCH_PID;
    echo 'Bench process stopped.';
  else
    echo 'No bench process found.';
  fi
"

echo "Bench process stopped successfully (if it was running)."
