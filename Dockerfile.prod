# backend/Dockerfile.prod
# Production Dockerfile for the Django backend

# Use a base image with Python
FROM python:3.12-alpine as builder

# Prevent Python from writing .pyc files and buffer stdout/stderr
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install dependencies
WORKDIR /app
COPY requirements.prod.txt .
RUN pip install --no-cache-dir -r requirements.prod.txt

# Copy the application code
COPY . .

# Stage 2: Final production image
FROM python:3.12-alpine

# Set working directory
WORKDIR /app

# Copy installed dependencies from the builder stage
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages

# Copy the application code
COPY . .

# Collect static files (if not served by Nginx) - Often better to collect locally and volume mount or use WhiteNoise
# RUN python manage.py collectstatic --noinput

# Expose the port the production server (Gunicorn/uWSGI) will run on
EXPOSE 8000

# Command to run the production server (overridden in docker-compose.prod.yml)
# CMD ["gunicorn", "myproject.wsgi:application", "--bind", "0.0.0.0:8000"] # Replace myproject