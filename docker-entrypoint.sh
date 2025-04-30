#!/usr/bin/env bash
set -e

# Wait for DB to be ready
until python manage.py showmigrations >/dev/null 2>&1; do
  echo "Waiting for database…"
  sleep 1
done

# Run migrations
python manage.py migrate --no-input

# If no command given, run the dev server
if [ $# -eq 0 ]; then
  echo "Starting Django dev server…"
  exec python manage.py runserver 0.0.0.0:8000
else
  # Otherwise exec whatever was passed in
  exec "$@"
fi