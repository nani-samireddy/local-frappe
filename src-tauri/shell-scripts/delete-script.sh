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

# Stop the Docker Compose setup
echo "Stopping the Docker Compose setup for $PROJECT_NAME..."
docker-compose -f "$COMPOSE_FILE" down

# Remove the project directory
echo "Deleting project directory $PROJECT_DIR..."
rm -rf "$PROJECT_DIR"

echo "Docker Compose setup stopped and project deleted successfully!"
