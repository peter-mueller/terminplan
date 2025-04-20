package terminplan

import "time"

type Termin struct {
	Id string `json:"id"`

	Name   string `json:"name"`
	Ort    string `json:"ort"`
	Gegner string `json:"gegner"`

	Treffpunkt  time.Time `json:"treffpunkt"`
	SpielBeginn time.Time `json:"spielbeginn"`
}
