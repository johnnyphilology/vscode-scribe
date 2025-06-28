PROVIDER_ID = JohnnyPhilology
PROJECT = scribe
EXTENSION = $(PROVIDER_ID).$(PROJECT)
VERSION := $(shell grep version package.json | head -1 | cut -d '"' -f4)

# Colors for output
BLUE = \033[34m
GREEN = \033[32m
YELLOW = \033[33m
RED = \033[31m
PURPLE = \033[35m
CYAN = \033[36m
BOLD = \033[1m
RESET = \033[0m

.DEFAULT_GOAL := help

.PHONY: help build clean purge install dependencies bump add-word unit-test test package uninstall release

help: ## 📋 Show this help message
	@echo ""
	@echo "$(BOLD)$(BLUE)🔧 Scribe Extension Build System$(RESET)"
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(RESET)"
	@echo ""
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "$(CYAN)%-15s$(RESET) %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""
	@echo "$(BOLD)$(GREEN)Usage:$(RESET) make $(YELLOW)<target>$(RESET)"
	@echo ""

dependencies: ## 📦 Install npm dependencies
	@npm install

build: dependencies ## 🔨 Build the extension (compile TypeScript)
	@npm run compile

unit-test: build ## 🧪 Run unit tests
	@npm run test:unit

test: build ## 🔍 Run all tests (unit + integration)
	@npm test

package: build ## 📋 Package the extension into .vsix file
	@vsce package

install: package ## 💾 Install the extension locally in VS Code
	@code --install-extension ./$(PROJECT)-${VERSION}.vsix

clean: ## 🧹 Clean build artifacts and test files
	@rm -rf out/ dist/ .vscode-test/
	@rm -f *.vsix

uninstall: ## 🗑️  Uninstall the extension from VS Code
	@code --uninstall-extension $(EXTENSION)

reinstall: uninstall install ## 🔄 Uninstall and reinstall the extension

purge: clean ## 💥 Remove all generated files and node_modules
	@rm -rf node_modules

bump: ## 📈 Bump version number
	@npm run version-bump

add-word: ## ➕ Add a word to the dictionary (interactive)
	@npm run add-word

release: ## 🚀 Create and publish a new release
	@npm run auto-release

setup: ## ⚡ Setup this workstation for development
	@chmod +x .workstation/setup-autocomplete.sh
	@./.workstation/setup-autocomplete.sh
