package terminplan

type TeilnahmeTyp string

const (
	TeilnahmeUnbekannt TeilnahmeTyp = ""
	TeilnahmeJa        TeilnahmeTyp = "Ja"
	TeilnahmeNein      TeilnahmeTyp = "Nein"
)

type Aufgestellt string

const (
	AufgestelltUnbekannt Aufgestellt = ""
	AufgestelltJa        Aufgestellt = "Ja"
	AufgestelltNein      Aufgestellt = "Nein"
)

type Teilnahme struct {
	TerminId    string       `json:"terminId"`
	BenutzerId  string       `json:"benutzerId"`
	Typ         TeilnahmeTyp `json:"typ"`
	Aufgestellt Aufgestellt  `json:"aufgestellt"`
}

type TeilnahmeStatistik struct {
	Ja        uint `json:"ja"`
	Nein      uint `json:"nein"`
	Unbekannt uint `json:"unbekannt"`
}
