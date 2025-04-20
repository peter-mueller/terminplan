package main

import (
	"fmt"
	"log"
	"log/slog"
	"time"

	_ "embed"

	"github.com/jmoiron/sqlx"
	_ "github.com/ncruces/go-sqlite3/driver"
	_ "github.com/ncruces/go-sqlite3/embed"
	"github.com/peter-mueller/terminplan"
)

func OpenSqlite3() *sqlx.DB {
	slog.Info("Open sqlite3")
	db, err := sqlx.Connect("sqlite3", "file:terminplan.sqlite")
	if err != nil {
		log.Fatal("failed to open database:", err)
	}
	err = CreateTables(db)
	if err != nil {
		log.Fatal("failed to create tables:", err)
	}
	return db
}

//go:embed schema.sql
var schemaSql string

func CreateTables(db *sqlx.DB) error {
	_, err := db.Exec(schemaSql)
	return err
}

func DeleteAllBenutzer(tx *sqlx.Tx) error {
	_, err := tx.Exec("delete from benutzer")
	return err
}

func DeleteAllTermin(tx *sqlx.Tx) error {
	_, err := tx.Exec("delete from termin")
	return err
}

func DeleteAllTeilnahme(tx *sqlx.Tx) error {
	_, err := tx.Exec("delete from teilnahme")
	return err
}

func SelectAllBenutzer(tx *sqlx.Tx) (benutzer []terminplan.Benutzer, err error) {
	benutzer = make([]terminplan.Benutzer, 0)
	err = tx.Select(&benutzer, "select * from benutzer")
	return benutzer, err
}

func SelectAllTermin(tx *sqlx.Tx, terminAb time.Time) (termine []terminplan.Termin, err error) {
	termine = make([]terminplan.Termin, 0)
	err = selectNamed(
		tx,
		&termine,
		"select * from termin t "+
			"where datetime(t.spielbeginn) >= datetime(:terminAb) "+
			"order by datetime(t.spielbeginn) asc",
		map[string]any{
			"terminAb": terminAb,
		})
	return termine, err
}

func SelectTerminById(tx *sqlx.Tx, id string) (termin terminplan.Termin, err error) {
	err = getNamed(tx, &termin, "select * from termin t where t.id = :id", map[string]any{
		"id": id,
	})
	return termin, err
}

func SelectAllTeilnahmenByTermin(tx *sqlx.Tx, terminId string) (teilnahmen []terminplan.Teilnahme, err error) {
	teilnahmen = make([]terminplan.Teilnahme, 0)
	err = selectNamed(tx, &teilnahmen, "select * from teilnahme t where t.terminid = :terminid", map[string]any{
		"terminid": terminId,
	})
	return teilnahmen, err
}
func InsertBenutzer(tx *sqlx.Tx, benutzer terminplan.Benutzer) error {
	query := fmt.Sprint(
		"insert into benutzer (id, name) ",
		"values (:id, :name)",
	)

	_, err := tx.NamedExec(query, benutzer)
	if err != nil {
		return err
	}
	return nil
}

func DeleteBenutzer(tx *sqlx.Tx, id string) error {
	query := fmt.Sprint(
		"delete from benutzer ",
		"where id = :id",
	)

	_, err := tx.NamedExec(query, map[string]any{
		"id": id,
	})
	if err != nil {
		return err
	}
	return nil
}

func SelectBenutzerById(tx *sqlx.Tx, id string) (benutzer terminplan.Benutzer, err error) {
	err = getNamed(tx, &benutzer, "select * from benutzer b where b.id = :id", map[string]any{
		"id": id,
	})
	return benutzer, err
}

func DeleteTeilnahmeByBenutzerId(tx *sqlx.Tx, id string) error {
	query := fmt.Sprint(
		"delete from teilnahme ",
		"where benutzerId = :id",
	)

	_, err := tx.NamedExec(query, map[string]any{
		"id": id,
	})
	if err != nil {
		return err
	}
	return nil
}

func InsertTermin(tx *sqlx.Tx, termin terminplan.Termin) error {
	query := fmt.Sprint(
		"insert into termin (id, name, gegner, ort, treffpunkt, spielbeginn) ",
		"values (:id, :name, :gegner, :ort, :treffpunkt, :spielbeginn)",
	)

	_, err := tx.NamedExec(query, termin)
	if err != nil {
		return err
	}
	return nil
}

func ReplaceTermin(tx *sqlx.Tx, termin terminplan.Termin) error {
	query := fmt.Sprint(
		"update termin ",
		"set (name, gegner, ort, treffpunkt, spielbeginn) ",
		"= (:name, :gegner, :ort, :treffpunkt, :spielbeginn) ",
		"where termin.id = :id",
	)

	_, err := tx.NamedExec(query, termin)
	if err != nil {
		return err
	}
	return nil
}

func UpsertTeilnahme(tx *sqlx.Tx, teilnahme terminplan.Teilnahme) error {
	query := fmt.Sprint(
		"insert into teilnahme (terminid, benutzerid, typ, aufgestellt)",
		"values (:terminid, :benutzerid, :typ, :aufgestellt)",
		"on conflict (terminid, benutzerid) do update set",
		"  typ=:typ, aufgestellt=:aufgestellt",
	)

	_, err := tx.NamedExec(query, teilnahme)
	if err != nil {
		return err
	}
	return nil
}

func selectNamed(tx *sqlx.Tx, dest any, query string, arg any) error {
	rows, err := tx.NamedQuery(query, arg)
	if err != nil {
		return err
	}
	return sqlx.StructScan(rows, dest)

}

func getNamed(tx *sqlx.Tx, dest any, query string, arg any) error {
	query, args, err := tx.BindNamed(query, arg)
	if err != nil {
		return err
	}
	return tx.Get(dest, query, args...)

}
