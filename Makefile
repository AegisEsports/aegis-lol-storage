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

## Clean: remove images created for this project (the artifacts)
clean:
	$(DC) down --rmi local --remove-orphans

## Remove: delete volumes created by this project (the data mounted)
wipe: down -v --remove-orphans
