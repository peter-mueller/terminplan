all: client serve

client: ${wildcard ./client/**/*.go} client/main.go
	GOOS=js GOARCH=wasm go generate
	GOOS=js GOARCH=wasm go build -o client/www/main.wasm client/main.go
serve:
	go run ./server

clean:
	rm -f client/www/main.wasm