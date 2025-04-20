package main

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type Role string

const RoleNone Role = ""
const RoleAdmin Role = "admin"

type Token struct {
	BenutzerId string
	Role       Role
}

type TpClaims struct {
	Role Role `json:"role"`
	jwt.RegisteredClaims
}

var alg = jwt.SigningMethodHS256

func SignedJWT(t Token, secret []byte) (string, error) {
	token := jwt.NewWithClaims(alg, TpClaims{
		Role: t.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    "terminplan",
			Subject:   t.BenutzerId,
			ExpiresAt: jwt.NewNumericDate(time.Now().AddDate(2, 0, 0)),
		},
	})
	return token.SignedString(secret)
}

func ParseJWT(tokenString string, secret []byte) (t Token, err error) {
	var claims TpClaims
	_, err = jwt.ParseWithClaims(
		tokenString,
		&claims,
		func(t *jwt.Token) (interface{}, error) {
			return secret, nil
		},
		jwt.WithValidMethods([]string{alg.Alg()}),
	)
	if err != nil {
		return t, err
	}
	return Token{
		BenutzerId: claims.Subject,
		Role:       claims.Role,
	}, nil
}
