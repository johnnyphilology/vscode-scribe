PROVIDER_ID = JohnnyPhilology
PROJECT = scribe
EXTENSION = $(PROVIDER_ID).$(PROJECT)
VERSION := $(shell grep version package.json | cut -d '"' -f4)
.DEFAULT_GOAL := unit-test

.PHONY: build clean purge install dependencies bump

dependencies:
	@npm install

build: dependencies
	@npm run compile

unit-test: build
	@npm run test:unit

test: build
	@npm test

package: dependencies
	@vsce package

install: package
	@code --install-extension ./$(PROJECT)-${VERSION}.vsix

clean:
	@rm -rf out/ dist/ .vscode-test/
	@rm -f *.vsix

uninstall:	
	@code --uninstall-extension $(EXTENSION)

purge: clean
	@rm -rf node_modules

bump:
	@npm run version-bump