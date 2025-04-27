#!/bin/bash

docker compose -f compose.yaml -f docker-compose.prod.yml up --build --remove-orphans