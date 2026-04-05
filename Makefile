APP_NAME=calendar-server
REMOTE_HOST ?= 95.163.243.113
REMOTE_USER ?= root
REMOTE_PORT ?= 22
REMOTE_APP_DIR ?= /home/admin/web/system32.ru
REMOTE_SHARED_DIR ?= $(REMOTE_APP_DIR)/private
REMOTE_RELEASES_DIR ?= $(REMOTE_APP_DIR)/releases
REMOTE_CURRENT_DIR ?= $(REMOTE_APP_DIR)/current
REMOTE_ENV_PATH ?= $(REMOTE_SHARED_DIR)/.env
REMOTE_SERVICE ?= calendar-system32

.PHONY: tidy build run down db-up db-down db-tables db-events tw-build tw-watch deploy deploy-mount

tidy:
	go mod tidy

build:
	go build -o $(APP_NAME) ./cmd/server

run:
	set -a; . ./.env; set +a; go run ./cmd/server

down:
	-pkill -f "go run ./cmd/server"
	-pkill -f "./$(APP_NAME)"
	docker compose down

db-up:
	docker compose up -d

db-down:
	docker compose down

db-tables:
	docker exec -it calendar_postgres psql -U postgres -d calendar -c "\\dt"

db-events:
	docker exec -it calendar_postgres psql -U postgres -d calendar -c "SELECT * FROM events ORDER BY id;"

tw-build:
	npm run tw:build

tw-watch:
	npm run tw:watch

deploy:
	@REMOTE_HOST=$(REMOTE_HOST) REMOTE_USER=$(REMOTE_USER) REMOTE_PORT=$(REMOTE_PORT) \
	REMOTE_APP_DIR=$(REMOTE_APP_DIR) REMOTE_SHARED_DIR=$(REMOTE_SHARED_DIR) \
	REMOTE_RELEASES_DIR=$(REMOTE_RELEASES_DIR) REMOTE_CURRENT_DIR=$(REMOTE_CURRENT_DIR) \
	REMOTE_ENV_PATH=$(REMOTE_ENV_PATH) REMOTE_SERVICE=$(REMOTE_SERVICE) \
	APP_NAME=$(APP_NAME) bash ./deploy/deploy.sh

deploy-mount:
	./scripts/deploy-system32.sh
