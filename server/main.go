package main

import (
	"fmt"
	"log"
	"log/slog"
	"net/http"
	"os"
	"strconv"

	"github.com/jmoiron/sqlx"
	"github.com/peter-mueller/terminplan/www"
)

type Server struct {
	db               *sqlx.DB
	port             uint
	tokenSecret      []byte
	testdatenAnlegen bool
}

const help = `
help
	terminplan help
	terminplan admintoken
	terminplan serve
`

func main() {

	var server Server

	var (
		portEnv      = os.Getenv("TERMINPLAN_PORT")
		tokenEnv     = os.Getenv("TERMINPLAN_TOKENSECRET")
		testdatenEnv = os.Getenv("TERMINPLAN_TESTDATEN")
	)
	if portEnv == "" {
		server.port = 8080
	} else {
		port, err := strconv.Atoi(portEnv)
		if err != nil {
			log.Fatal("could not parse", "err", err)
		}
		server.port = uint(port)
	}

	if tokenEnv == "" {
		log.Fatal("TERMINPLAN_TOKENSECRET muss gesetzt sein")
	}
	server.tokenSecret = []byte(tokenEnv)

	if testdatenEnv == "true" {
		server.testdatenAnlegen = true
	}

	args := os.Args[1:]
	if len(args) == 0 {
		fmt.Print(help)
		log.Fatal()
	}
	switch args[0] {
	case "help":
		fmt.Print(help)
	case "admintoken":
		token, err := SignedJWT(Token{
			BenutzerId: "admin",
			Role:       RoleAdmin,
		}, server.tokenSecret)
		if err != nil {
			log.Fatal(err)
		}
		fmt.Println("http://localhost:" + strconv.Itoa(int(server.port)) + "/anmelden.html?token=" + token)
	case "serve":
		server.Serve()
	}

}

func logError(text string, err error) {
	slog.Error(text, "err", err)
}

func (server *Server) Serve() {

	server.db = OpenSqlite3()
	defer server.db.Close()

	if server.testdatenAnlegen {
		err := TxRun(server.db, func(tx *sqlx.Tx) error {
			return TestdatenAnlegen(tx)
		})
		if err != nil {
			log.Fatal(err)
		}
	}

	http.HandleFunc("GET /benutzer", server.GetAllBenutzer)
	http.HandleFunc("POST /benutzer", server.PostBenutzer)
	http.HandleFunc("DELETE /benutzer/{id}", server.DeleteBenutzer)
	http.HandleFunc("GET /benutzer/{id}/token", server.GetTokenByBenutzer)

	http.HandleFunc("GET /termin", server.GetAllTermin)
	http.HandleFunc("POST /termin", server.PostTermin)
	http.HandleFunc("PUT /termin/{id}", server.PutTermin)

	http.HandleFunc("GET /termin/{id}", server.GetTermin)

	http.HandleFunc("PUT /teilnahme", server.PutTeilnahme)
	http.HandleFunc("GET /termin/{id}/teilnahme", server.GetTeilnahmeByTermin)

	slog.Info("starting to serve", "port", server.port)

	http.Handle("/", http.FileServer(http.FS(www.FS)))

	err := http.ListenAndServe(fmt.Sprintf(":%d", server.port), nil)
	if err != nil {
		logError("failed to server", err)
	}
}
