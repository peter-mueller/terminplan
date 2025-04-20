create table if not exists benutzer (
    id text not null,
    name text not null,

    primary key(id)
);

create table if not exists termin (
    id text not null,
    name text not null,

    gegner text not null,
    ort text not null,

    treffpunkt timestamp not null,
    spielbeginn timestamp not null,
    

    primary key(id)
);

create table if not exists teilnahme (
    terminid text not null references termin(id),
    benutzerid text not null references benutzer(id),

    typ text not null,
    aufgestellt text not null,

    primary key(terminid, benutzerid)
);
