package main

import (
	"errors"
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/peter-mueller/terminplan"
)

func TestdatenAnlegen(tx *sqlx.Tx) (err error) {

	var (
		franz = BenutzerFranz()
		hans  = BenutzerHans()

		spiel = TerminSpiel()
	)

	err = errors.Join(
		DeleteAllTeilnahme(tx),
		DeleteAllBenutzer(tx),
		DeleteAllTermin(tx),

		InsertBenutzer(tx, franz),
		InsertBenutzer(tx, hans),

		InsertTermin(tx, spiel),

		UpsertTeilnahme(tx, terminplan.Teilnahme{
			TerminId:    spiel.Id,
			BenutzerId:  franz.Id,
			Typ:         terminplan.TeilnahmeJa,
			Aufgestellt: terminplan.AufgestelltNein,
		}),
	)

	return err
}

func TerminSpiel() (t terminplan.Termin) {
	t.Id = "990accf6-fd3f-4610-89f9-c55c579509df"
	t.Name = "Spiel"
	t.Gegner = "Gegnerteam"
	t.Ort = "Ort"

	now := time.Now()
	t.Treffpunkt = localDate(now.Year(), now.Month(), now.Day(), 12, 30)
	t.SpielBeginn = localDate(now.Year(), now.Month(), now.Day(), 13, 0)

	return t
}

func BenutzerFranz() (b terminplan.Benutzer) {
	b.Id = "3a87df2d-0b61-431a-a6b5-67290675cfcb"
	b.Name = "02 Franz"
	return b
}

func BenutzerHans() (b terminplan.Benutzer) {
	b.Id = "6ce06649-414a-4390-b24f-ee6fba2df0d3"
	b.Name = "11 Hans"
	return b
}

func localDate(jahr int, monat time.Month, tag, stunde, minute int) time.Time {
	return time.Date(jahr, monat, tag, stunde, minute, 0, 0, time.Local)
}
