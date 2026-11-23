SHELL := /bin/bash

.PHONY: help setup start fetch-schedule lint lint-repository lint-fix build test ci npm-update npm-audit-fix

MAKEFLAGS += --silent
.DEFAULT_GOAL := help

FILTER ?=
LINTER_IMAGE := cloudnative-provence-landing-page-linter:local

help: ## Show help message
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m\033[0m\n"} /^[$$()% a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

setup: ## Prepare stack to run
	npm --prefix application ci --ignore-scripts

start: ## Start application in dev mode
	npm --prefix application run start

fetch-schedule: ## Update the program from Conference Hall (requires CONFERENCE_HALL_API_KEY)
	node --experimental-strip-types scripts/fetch-schedule/cli.mjs

lint: ## Run linters
	npm --prefix application run lint:ci
	$(MAKE) lint-repository

lint-repository: ## Run repository checks (optional FILTER=regex)
	$(call run_linter,)

lint-fix: ## Apply application and repository lint fixes
	npm --prefix application run lint:fix
	$(call run_linter, \
		-e FIX_SPELL_CODESPELL=true \
		-e FIX_MARKDOWN=true \
		-e FIX_MARKDOWN_PRETTIER=true \
		-e FIX_YAML_PRETTIER=true \
		-e FIX_NATURAL_LANGUAGE=true \
		-e FIX_SHELL_SHFMT=true \
		-e FIX_BIOME_LINT=true \
		-e FIX_BIOME_FORMAT=true \
	)

build: ## Build libs and applications
	npm --prefix application run build

test: ## Run tests
	npm --prefix application run test:ci

ci: ## Run lint, build, and tests without fixers or dependency updates
	$(MAKE) lint
	$(MAKE) build
	$(MAKE) test

npm-update: ## Update application dependencies within their declared ranges
	npm --prefix application update

npm-audit-fix: ## Apply npm security fixes and update the lockfile
	npm --prefix application audit fix

define run_linter
	set -eu; \
	DEFAULT_WORKSPACE="$(CURDIR)"; \
	DEFAULT_BRANCH="$$(git symbolic-ref --quiet --short refs/remotes/origin/HEAD || git branch --show-current)"; \
	DEFAULT_BRANCH="$${DEFAULT_BRANCH#origin/}"; \
	docker build --platform=linux/amd64 --build-arg UID=$(shell id -u) --build-arg GID=$(shell id -g) --tag "$(LINTER_IMAGE)" .; \
	docker run \
	--platform=linux/amd64 \
	-v "$$DEFAULT_WORKSPACE:$$DEFAULT_WORKSPACE" \
	--rm \
	-e DEFAULT_WORKSPACE="$$DEFAULT_WORKSPACE" \
	-e DEFAULT_BRANCH="$$DEFAULT_BRANCH" \
	-e USE_FIND_ALGORITHM=false \
	-e FILTER_REGEX_INCLUDE="$(FILTER)" \
	$(1) \
	"$(LINTER_IMAGE)"
endef
