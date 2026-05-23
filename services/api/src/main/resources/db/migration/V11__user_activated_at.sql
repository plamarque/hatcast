-- Comptes importés (migration V1) : activated_at NULL jusqu'à la première connexion V2.
ALTER TABLE users ADD COLUMN activated_at TIMESTAMP NULL;

UPDATE users
SET activated_at = updated_at
WHERE google_sub IS NOT NULL OR idp_uid IS NOT NULL;
