# Makefile — docker compose helpers scoped to this project

PROJECT ?= $(notdir "aegis-lol-storage")
COMPOSE_FILE ?= docker-compose.yml
DC := docker compose -p $(PROJECT) -f $(COMPOSE_FILE)

.PHONY: up down clean remove

## Up: start containers
up:
	$(DC) up -d

## Down: stop and remove containers (keeps volumes)
down:
	$(DC) down --remove-orphans

## Clean: remove images created for this project (does NOT touch others)
clean:
	$(DC) down --rmi local --remove-orphans

## Remove: delete volumes created by this project (safe-scoped)
remove: down
	@vols=$$(docker volume ls -q --filter label=com.docker.compose.project=$(PROJECT)); \
	if [ -n "$$vols" ]; then \
		echo "Removing volumes: $$vols"; \
		docker volume rm $$vols; \
	else \
		echo "No project volumes to remove."; \
	fi