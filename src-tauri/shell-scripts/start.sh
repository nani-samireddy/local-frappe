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

# Navigate to the project directory
cd "$PROJECT_DIR" || { echo "Failed to navigate to $PROJECT_DIR"; exit 1; }

# Start the Docker Compose setup
echo "Starting the Docker Compose setup for $PROJECT_NAME..."
docker-compose -f "$COMPOSE_FILE" up -d

FRAPPE_CONTAINER_NAME="$PROJECT_NAME-frappe-1"

echo "Waiting for Frappe container to start..."
while [ ! "$(docker inspect -f '{{.State.Running}}' $FRAPPE_CONTAINER_NAME)" == "true" ]; do
  sleep 1
done

# Get the container ID of the Frappe container
FRAPPE_CONTAINER_ID=$(docker ps -aqf "name=$FRAPPE_CONTAINER_NAME")

# Enter interactive mode and start the bench
echo "Starting the bench in the Frappe container..."
docker exec -it "$FRAPPE_CONTAINER_ID" bash -c "cd ./frappe-bench && bench start"


echo "Docker Compose setup started successfully!"
