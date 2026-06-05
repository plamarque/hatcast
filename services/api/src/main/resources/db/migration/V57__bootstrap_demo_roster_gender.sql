-- MIG-7 : genres des personas Démo (@seed.demo.test) inférés du prénom.
-- Portable SQL (H2 test + PostgreSQL) : UPDATE unitaires, pas UPDATE … FROM.
-- Ne met à jour que users.gender IS NULL (ne pas écraser Mon profil).

UPDATE users SET gender = 'male', updated_at = CURRENT_TIMESTAMP
WHERE id = 'd0000001-0000-4000-8000-000000000099' AND gender IS NULL; -- Alex

UPDATE users SET gender = 'female', updated_at = CURRENT_TIMESTAMP
WHERE id = 'd0000002-0000-4000-8000-000000000099' AND gender IS NULL; -- Camille

UPDATE users SET gender = 'male', updated_at = CURRENT_TIMESTAMP
WHERE id = 'd0000003-0000-4000-8000-000000000099' AND gender IS NULL; -- Jordan

UPDATE users SET gender = 'female', updated_at = CURRENT_TIMESTAMP
WHERE id = 'd0000004-0000-4000-8000-000000000099' AND gender IS NULL; -- Léa

UPDATE users SET gender = 'male', updated_at = CURRENT_TIMESTAMP
WHERE id = 'd0000005-0000-4000-8000-000000000099' AND gender IS NULL; -- Marco

UPDATE users SET gender = 'female', updated_at = CURRENT_TIMESTAMP
WHERE id = 'd0000006-0000-4000-8000-000000000099' AND gender IS NULL; -- Noémie

UPDATE users SET gender = 'male', updated_at = CURRENT_TIMESTAMP
WHERE id = 'd0000007-0000-4000-8000-000000000099' AND gender IS NULL; -- Sam

UPDATE users SET gender = 'female', updated_at = CURRENT_TIMESTAMP
WHERE id = 'd0000008-0000-4000-8000-000000000099' AND gender IS NULL; -- Zoé
