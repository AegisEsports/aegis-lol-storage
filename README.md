# Aegis Esports Data Storage

## Overview

This is simply a persistent storage microservice that provides a secure, reliable, and scalable data storage layer for the Aegis Esports LoL competition platform. It exposes a RESTful API for creating, reading, updating, and deleting competition-related data, including leagues, splits, player profiles, match data, and statistics.

Developing this service used:

- Node - v22 LTS
- [VSCode](https://code.visualstudio.com/download) - The preferred code IDE (the repo includes a .vscode directory).
  - Recommended VSCode extensions:
    - Git Graph
    - ESLint
    - GitLens (for Git blame annotations)
    - IntelliCode
    - Jest
    - Prettier
- [Docker Desktop](https://docs.docker.com/desktop/) - A local container setup for the application.
- [pgAdmin 4](https://www.pgadmin.org/download/pgadmin-4-windows/) - GUI access to a PostgreSQL databases.
- [Postman](https://www.postman.com/downloads/) - Platform to organize API requests.

---

## Getting Started

### 1. Installation

Once the repo is forked, run the following commands:

```bash
$ npm install
```

A directory `node_modules` will be created containing all the necessary dependencies.

### 2. .env

Create a new `.env` file and add it to the codebase directory.

```
# NODE
NODE_ENV = development

# SERVER
SERVER_PORT = 3000

# DATABASE
DB_USER = postgres
DB_NAME = aegis_lol_storage
DB_PASSWORD = password
DB_PORT = 5432
DB_HOST = localhost
DB_MAX_HOSTS = 10

# LOGS
LOG_DIR = /logs
LOG_FORMAT = dev # other options are "common", "combined", "short", "tiny"

# CORS
ORIGIN = *
CREDENTIALS = true
```

### 3. Start the Service

Install Docker desktop. The Makefile executes the Docker commands to create local containers. Launch the server and database through:

```
$ make up
```

To initiate the database:

```
$ npm run migrate:dev
```

### 4. Shutting Down

If you install a new npm package, you need to reboot the container to see it take effect. Run the following commands to fully shutdown and remove the container.

```
$ make down
$ make remove
$ make clean
```

## Contributing

### Jira

The active JIRA board is under [AEGIS](https://aegisesports.atlassian.net/jira/software/projects/AEGIS/boards/1/backlog). Ask Doowan for permission to access.

### Pushing Code

`husky` Git hooks:

- When _committing_ code, a pre-commit hook will run ESLint and Prettier to enforce coding practices. VSCode settings should automatically format the code upon saving. Sometimes that may not be the case and the changes can happen after committing.

Though highly unadvised, the hooks can be temporarily disabled by:

```
$ HUSKY=0 git commit ... # To skip pre-commit hook
```

### Testing

TBD

### API Documentation

TBD

## Project Structure

### Overview

All development files are under `/src`.

```
├── config/          # Configuration files (env, db, logger)
├── database/        # DB connection & migration scripts
├── router/          # DB models or query builders
├── util/            # Utility/helper functions
```
