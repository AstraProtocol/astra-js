bootstrap:
	@rm -rf  **/package-lock.json  **/node_modules
	@npm install
	@npx lerna bootstrap
