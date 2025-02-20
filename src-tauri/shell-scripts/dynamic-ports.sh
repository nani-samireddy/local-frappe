#!/bin/bash

# Function to get a list of unused ports
get_unused_ports() {
    # Get all in-use ports from both system and Docker
    used_ports=$( { ss -tuln | awk 'NR>1 {print $4}' | awk -F: '{print $NF}'; \
                    docker ps --format '{{.Ports}}' | grep -o '[0-9]*' | sort -u; } | sort -u )

    # Find the first available ports
    comm -23 <(seq 1024 65535 | sort) <(echo "$used_ports")
}


# Get a list of available ports
AVAILABLE_PORTS=($(get_unused_ports))

# Assign ports sequentially
FRAPPE_PORT_START=${AVAILABLE_PORTS[0]}
FRAPPE_PORT_END=$((FRAPPE_PORT_START + 5))
FRAPPE_ALT_PORT_START=${AVAILABLE_PORTS[6]}  # Ensure it's different from HTTP range
FRAPPE_ALT_PORT_END=$((FRAPPE_ALT_PORT_START + 5))

echo "Assigning ports:"
echo "  - HTTP: $FRAPPE_PORT_START to $FRAPPE_PORT_END"
echo "  - ALT: $FRAPPE_ALT_PORT_START to $FRAPPE_ALT_PORT_END"

# Run docker-compose with dynamic ports
# FRAPPE_PORT_START=$FRAPPE_PORT_START \
# FRAPPE_PORT_END=$FRAPPE_PORT_END \
# FRAPPE_ALT_PORT_START=$FRAPPE_ALT_PORT_START \
# FRAPPE_ALT_PORT_END=$FRAPPE_ALT_PORT_END \
# docker-compose -p "frappe-instance-$FRAPPE_PORT_START" up -d
