package main

import (
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/peter-mueller/terminplan"
)

var ErrBadAuthorization = errors.New("bad authorization header")
var ErrUserNotFound = errors.New("user not found")

func (server *Server) authenticate(r *http.Request) (t Token, err error) {

	auth := r.Header.Get("Authorization")
	fields := strings.Fields(auth)
	if len(fields) != 2 || fields[0] != "Bearer" {
		return t, ErrBadAuthorization
	}
	tokenString := fields[1]
	t, err = ParseJWT(tokenString, server.tokenSecret)
	if err != nil {
		return t, err
	}

	_, err = TxProduce(server.db, func(tx *sqlx.Tx) (terminplan.Benutzer, error) {
		return SelectBenutzerById(tx, t.BenutzerId)
	})
	switch {
	case err == sql.ErrNoRows:
		if t.Role == RoleAdmin {
			// ok
			break
		}
		return t, ErrUserNotFound
	case err != nil:
		return t, err
	}

	return t, nil
}

func authenticateError(w http.ResponseWriter, err error) {
	logError("authenticate error", err)
	if err == ErrBadAuthorization {
		httpError(w, http.StatusBadRequest)
		return
	}
	if err == ErrUserNotFound {
		httpError(w, http.StatusForbidden)
		return
	}
	httpError(w, http.StatusUnauthorized)
}

func (server *Server) PostBenutzer(w http.ResponseWriter, r *http.Request) {

	token, err := server.authenticate(r)
	if err != nil {
		authenticateError(w, err)
		return
	}
	if token.Role != RoleAdmin {
		httpError(w, http.StatusForbidden)
		return
	}

	var b terminplan.Benutzer
	err = json.NewDecoder(r.Body).Decode(&b)
	if err != nil {
		logError("failed to decode json", err)
		httpError(w, http.StatusBadRequest)
		return
	}

	b.Id = uuid.NewString()
	err = TxRun(server.db, func(tx *sqlx.Tx) error {
		return InsertBenutzer(tx, b)
	})
	if err != nil {
		logError("failed to insert benutzer", err)
	}

	encodeJson(w, http.StatusCreated, b)

}

func (server *Server) DeleteBenutzer(w http.ResponseWriter, r *http.Request) {

	token, err := server.authenticate(r)
	if err != nil {
		authenticateError(w, err)
		return
	}
	if token.Role != RoleAdmin {
		httpError(w, http.StatusForbidden)
		return
	}

	benutzerId := r.PathValue("id")
	if benutzerId == "" {
		httpError(w, http.StatusBadRequest)
		return
	}

	err = TxRun(server.db, func(tx *sqlx.Tx) error {
		err := DeleteTeilnahmeByBenutzerId(tx, benutzerId)
		if err != nil {
			return err
		}
		return DeleteBenutzer(tx, benutzerId)
	})
	if err != nil {
		logError("failed to delete benutzer", err)
		httpError(w, http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)

}

func (server *Server) PostTermin(w http.ResponseWriter, r *http.Request) {
	token, err := server.authenticate(r)
	if err != nil {
		authenticateError(w, err)
		return
	}
	if token.Role != RoleAdmin {
		httpError(w, http.StatusForbidden)
		return
	}

	var t terminplan.Termin
	err = json.NewDecoder(r.Body).Decode(&t)
	if err != nil {
		logError("failed to decode json", err)
		httpError(w, http.StatusBadRequest)
		return
	}

	t.Id = uuid.NewString()
	err = TxRun(server.db, func(tx *sqlx.Tx) error {
		return InsertTermin(tx, t)
	})
	if err != nil {
		logError("failed to insert termin", err)
	}

	encodeJson(w, http.StatusCreated, t)
}

func (server *Server) PutTermin(w http.ResponseWriter, r *http.Request) {
	token, err := server.authenticate(r)
	if err != nil {
		authenticateError(w, err)
		return
	}
	if token.Role != RoleAdmin {
		httpError(w, http.StatusForbidden)
		return
	}

	terminId := r.PathValue("id")
	if terminId == "" {
		httpError(w, http.StatusBadRequest)
		return
	}

	var t terminplan.Termin
	err = json.NewDecoder(r.Body).Decode(&t)
	if err != nil {
		logError("failed to decode json", err)
		httpError(w, http.StatusBadRequest)
		return
	}

	if terminId != t.Id {
		httpError(w, http.StatusBadRequest)
	}

	err = TxRun(server.db, func(tx *sqlx.Tx) error {
		return ReplaceTermin(tx, t)
	})
	if err != nil {
		logError("failed to replace termin", err)
	}

	encodeJson(w, http.StatusOK, t)
}

func (server *Server) PutTeilnahme(w http.ResponseWriter, r *http.Request) {
	token, err := server.authenticate(r)
	if err != nil {
		authenticateError(w, err)
		return
	}

	var t terminplan.Teilnahme
	err = json.NewDecoder(r.Body).Decode(&t)
	if err != nil {
		logError("failed to decode json", err)
		httpError(w, http.StatusBadRequest)
		return
	}

	var (
		isAdmin    = token.Role == RoleAdmin
		isBenutzer = token.BenutzerId == t.BenutzerId
	)
	if !(isAdmin || isBenutzer) {
		httpError(w, http.StatusForbidden)
		return
	}

	err = TxRun(server.db, func(tx *sqlx.Tx) error {
		return UpsertTeilnahme(tx, t)
	})
	if err != nil {
		logError("failed to upsert teilnahme", err)
		httpError(w, http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (server *Server) GetTeilnahmeByTermin(w http.ResponseWriter, r *http.Request) {
	terminId := r.PathValue("id")
	if terminId == "" {
		httpError(w, http.StatusBadRequest)
		return
	}

	teilnahmen, err := TxProduce(server.db, func(tx *sqlx.Tx) ([]terminplan.Teilnahme, error) {
		return SelectAllTeilnahmenByTermin(tx, terminId)
	})
	if err != nil {
		logError("failed to select teilnahmen für termin", err)
	}

	encodeJson(w, http.StatusOK, teilnahmen)
}

func (server *Server) GetAllBenutzer(w http.ResponseWriter, r *http.Request) {

	benutzer, err := TxProduce(server.db, func(tx *sqlx.Tx) ([]terminplan.Benutzer, error) {
		return SelectAllBenutzer(tx)
	})
	if err != nil {
		logError("failed to select all benutzer", err)
		httpError(w, http.StatusInternalServerError)
		return
	}

	encodeJson(w, http.StatusOK, benutzer)
}

func (server *Server) GetTokenByBenutzer(w http.ResponseWriter, r *http.Request) {
	token, err := server.authenticate(r)
	if err != nil {
		authenticateError(w, err)
		return
	}
	if token.Role != RoleAdmin {
		httpError(w, http.StatusForbidden)
		return
	}

	benutzerId := r.PathValue("id")
	if benutzerId == "" {
		httpError(w, http.StatusBadRequest)
		return
	}

	benutzer, err := TxProduce(server.db, func(tx *sqlx.Tx) (terminplan.Benutzer, error) {
		return SelectBenutzerById(tx, benutzerId)
	})
	if errors.Is(err, sql.ErrNoRows) {
		httpError(w, http.StatusNotFound)
		return
	}
	if err != nil {
		logError("failed to find benutzer by id", err)
		httpError(w, http.StatusInternalServerError)
		return
	}

	t := Token{
		BenutzerId: benutzer.Id,
		Role:       RoleNone,
	}
	tokenString, err := SignedJWT(t, server.tokenSecret)
	if err != nil {
		logError("failed to find benutzer by id", err)
		httpError(w, http.StatusInternalServerError)
		return
	}

	encodeJson(w, http.StatusOK, tokenString)
}

func (server *Server) GetAllTermin(w http.ResponseWriter, r *http.Request) {

	var err error
	var terminAb time.Time

	query := r.URL.Query()
	terminAbQuery := query.Get("terminAb")
	if terminAbQuery != "" {
		terminAb, err = time.Parse(time.RFC3339, terminAbQuery)
		if err != nil {
			httpError(w, http.StatusBadRequest)
			return
		}
	}

	benutzer, err := TxProduce(server.db, func(tx *sqlx.Tx) ([]terminplan.Termin, error) {
		return SelectAllTermin(tx, terminAb)
	})
	if err != nil {
		logError("failed to select all termin", err)
		httpError(w, http.StatusInternalServerError)
		return
	}

	encodeJson(w, http.StatusOK, benutzer)
}

func (server *Server) GetTermin(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		httpError(w, http.StatusBadRequest)
		return
	}

	termin, err := TxProduce(server.db, func(tx *sqlx.Tx) (terminplan.Termin, error) {
		return SelectTerminById(tx, id)
	})
	if err != nil {
		logError("failed to select termin", err)
		httpError(w, http.StatusInternalServerError)
		return
	}

	encodeJson(w, http.StatusOK, termin)
}

func httpError(w http.ResponseWriter, code int) {
	http.Error(w, http.StatusText(code), code)
}

func encodeJson(w http.ResponseWriter, code int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	err := json.NewEncoder(w).Encode(v)
	if err != nil {
		logError("failed to encode json", err)
	}
}
