PROVIDER_ID = JohnnyPhilology
PROJECT = scribe
EXTENSION = $(PROVIDER_ID).$(PROJECT)
VERSION := $(shell grep version package.json | cut -d '"' -f4)

.PHONY: build clean purge install dependencies

dependencies:
	@npm install

build: dependencies
	@npm run compile

test: build
	@npm test

package: test
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