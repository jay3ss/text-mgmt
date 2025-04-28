#!/bin/bash

docker compose -f compose.yaml -f docker-compose.dev.yml up --build --remove-orphans --watch