.PHONY: dev prod clean

clean-pyc:
	find . -type f -name "*.pyc" -print -delete
	find . -type d -name "__pycache__" -print -exec rm -r {} +

clean:
	docker compose down --remove-orphans

dev:
	docker compose -f compose.yaml -f docker-compose.dev.yml up --build --remove-orphans

prod:
	docker compose -f compose.yaml -f docker-compose.prod