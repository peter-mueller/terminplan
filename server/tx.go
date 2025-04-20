package main

import (
	"log/slog"

	"github.com/jmoiron/sqlx"
)

func TxRun(db *sqlx.DB, stmt func(tx *sqlx.Tx) error) error {
	_, err := TxProduce(db, func(tx *sqlx.Tx) (struct{}, error) {
		return struct{}{}, stmt(tx)
	})
	return err
}

func TxProduce[T any](db *sqlx.DB, stmt func(tx *sqlx.Tx) (T, error)) (T, error) {
	tx := db.MustBegin()
	result, err := stmt(tx)
	if err != nil {
		errRollback := tx.Rollback()
		if errRollback != nil {
			slog.Error("tx rollback failed", "err", errRollback.Error())
		}
		return result, err
	}
	err = tx.Commit()
	if err != nil {
		slog.Error("tx commit failed", "err", err.Error())
		return result, err
	}
	return result, nil
}
