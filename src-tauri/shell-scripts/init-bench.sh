#!/bin/bash

# echo present working directory
echo "Present working directory: $(pwd)"

# Ensure the script is executed with one argument
if [ $# -ne 1 ]; then
  echo "Usage: $0 <project_name>"
  exit 1
fi

PROJECT_NAME=$1
BASE_DIR="$HOME/benches"
PROJECT_DIR="$BASE_DIR/$PROJECT_NAME"

SOURCE_DOCKER_COMPOSE="docker-compose.yaml"  # Path to your source docker-compose file
INSTALLER_SCRIPT="installer.py"  # Path to your installer.py file
UPDATED_COMPOSE_FILE="$PROJECT_DIR/$PROJECT_NAME-compose.yaml"
UPDATED_INSTALLER_SCRIPT="$PROJECT_DIR/source/installer.py"

# Function to get a list of unused ports
get_unused_ports() {
    used_ports=$( { lsof -i -P -n | awk 'NR>1 {print $9}' | awk -F: '{print $NF}' | grep -E '^[0-9]+$' | sort -u; \
                    docker ps --format '{{.Ports}}' | grep -o '[0-9]*' | sort -u; } | sort -u )
    comm -23 <(seq 1024 65535 | sort) <(echo "$used_ports")
}


# Get a list of available ports
AVAILABLE_PORTS=($(get_unused_ports))

# Assign ports sequentially
FRAPPE_PORT_START=${AVAILABLE_PORTS[0]}
FRAPPE_PORT_END=$((FRAPPE_PORT_START + 5))
FRAPPE_ALT_PORT_START=${AVAILABLE_PORTS[6]}  # Ensure it's different from HTTP range
FRAPPE_ALT_PORT_END=$((FRAPPE_ALT_PORT_START + 5))
DB_VIEWER_PORT=${AVAILABLE_PORTS[12]}  

echo "Assigning ports:"
echo "  - HTTP: $FRAPPE_PORT_START to $FRAPPE_PORT_END"
echo "  - ALT: $FRAPPE_ALT_PORT_START to $FRAPPE_ALT_PORT_END"
echo "  - ADMINER: $DB_VIEWER_PORT"

# Create project directory structure
echo "Creating project directory at $PROJECT_DIR..."
mkdir -p "$PROJECT_DIR"

# Create source directory
echo "Creating source directory at $PROJECT_DIR/source..."
mkdir -p "$PROJECT_DIR/source"

# Create logs directory
echo "Creating logs directory at $PROJECT_DIR/logs..."
mkdir -p "$PROJECT_DIR/logs"

# Create bench logs file
echo "Creating bench logs file at $PROJECT_DIR/logs/bench.log..."
touch "$PROJECT_DIR/logs/bench.log"

# Copy docker-compose and installer.py files
echo "Copying $SOURCE_DOCKER_COMPOSE to $UPDATED_COMPOSE_FILE..."
cp "$SOURCE_DOCKER_COMPOSE" "$UPDATED_COMPOSE_FILE"

echo "Copying $INSTALLER_SCRIPT to $PROJECT_DIR..."
cp "$INSTALLER_SCRIPT" "$UPDATED_INSTALLER_SCRIPT"

# Update the installer file permission to executable
chmod +x "$UPDATED_INSTALLER_SCRIPT"

# Update network name in docker-compose.yaml
echo "Updating network name in $UPDATED_COMPOSE_FILE..."
sed -i '' "s/project_name/$PROJECT_NAME/g" "$UPDATED_COMPOSE_FILE"

# Navigate to the project directory
cd "$PROJECT_DIR" || { echo "Failed to navigate to $PROJECT_DIR"; exit 1; }

# Start Docker Compose with environment variables
export FRAPPE_PORT_START FRAPPE_PORT_END FRAPPE_ALT_PORT_START FRAPPE_ALT_PORT_END DB_VIEWER_PORT
docker-compose -f "$PROJECT_NAME-compose.yaml" up -d

FRAPPE_CONTAINER_NAME="$PROJECT_NAME-frappe-1"

# convert the container name to lowercase
FRAPPE_CONTAINER_NAME=$(echo "$FRAPPE_CONTAINER_NAME" | tr '[:upper:]' '[:lower:]')

echo "Waiting for Frappe container to start..."
while [ ! "$(docker inspect -f '{{.State.Running}}' $FRAPPE_CONTAINER_NAME)" == "true" ]; do
  sleep 1
done

# Get the container ID of the Frappe container
FRAPPE_CONTAINER_ID=$(docker ps -aqf "name=$FRAPPE_CONTAINER_NAME")

# Enter interactive mode and run installer.py
echo "Running installer script in Frappe container..."
docker exec -i "$FRAPPE_CONTAINER_ID" ./installer.py
