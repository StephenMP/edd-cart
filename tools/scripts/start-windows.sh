#!/bin/bash -e
ROOT_DIR=$(git rev-parse --show-toplevel)
TOPICS_DIR="$ROOT_DIR/tools/scripts/topics"
LOG_FILE="./.github/log.local"

function stop() {
    echo
    echo
    echo "======================================"
    echo "Stopping local development environment"
    echo "======================================"
    
    echo "--------------------------------------"
    echo "Stopping docker"
    echo "--------------------------------------"
    docker-compose down --remove-orphans
    echo
    
    echo "======================================"
    echo "Local development environment stopped!"
    echo "======================================"
    exit 0
}

function startDockerEnv() {
    echo "--------------------------------------"
    echo "Running docker-compose"
    echo "--------------------------------------"
    docker-compose up -d
    
    echo "Waiting for broker to be available"
    local brokerId=""
    while [[ "$brokerId" != "localhost:9092" ]]
    do
        printf '%0.s*' $(seq 1 1)
        sleep 1
        brokerId=$(docker-compose exec -T broker kafka-broker-api-versions --bootstrap-server broker:9092 2> /dev/null | awk '/id/{print $1}')
    done
    echo -e "\r\033[K"
}

function runMigrations() {
    echo "--------------------------------------"
    echo "Running prisma migrations/generatin"
    echo "--------------------------------------"
    echo -n "Running prisma migrations..."
    yarn prisma:migrate:up 2&> /dev/null
    echo " Done"

    echo -n "Running client generation..."
    yarn prisma:generate 2&> /dev/null
    echo " Done"
    echo
}

function waitForExit() {
    echo "======================================"
    echo "Local development environment started!"
    echo "======================================"
    read -n 1 -s -r -p "Press any key to exit when done"
}

function start() {
    echo "======================================"
    echo "Starting local development environment"
    echo "======================================"
    startDockerEnv
    runMigrations
    waitForExit
}

trap stop EXIT
start