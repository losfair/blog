create table post (
  id char(36) not null primary key,
  short_key varchar(255) not null,
  author varchar(255) not null,
  title varchar(255) not null,
  body longtext not null,
  is_public boolean not null default false,
  is_listed boolean not null default false,
  inserted_at datetime DEFAULT CURRENT_TIMESTAMP,
  updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  unique index short_key_unique (short_key)
);
