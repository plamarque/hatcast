-- Identity Platform (Firebase Auth compatible): optional stable uid; google_sub only for legacy GIS path.
ALTER TABLE users ALTER COLUMN google_sub DROP NOT NULL;

ALTER TABLE users ADD COLUMN idp_uid VARCHAR(128) NULL;
ALTER TABLE users ADD CONSTRAINT users_idp_uid_unique UNIQUE (idp_uid);
