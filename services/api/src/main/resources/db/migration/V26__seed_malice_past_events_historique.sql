-- Seed dev/test : spectacles passés pour la vue Historique (story 3.6b).
-- Référence « aujourd’hui » dev : 25 mai 2026 (Europe/Paris) — tous les starts_at ci-dessous sont strictement avant ce jour civil.
-- Saison : b0000001-0000-4000-8000-000000000001 (La Malice 2026-2027).
-- Connexion seed utile : patrice@seed.la-malice.test (participant f0000001-…-000022).
-- Slugs préfixés hist- pour éviter les collisions avec V24 (ex. long-form-polar sur c0000019).

INSERT INTO events (
    id,
    season_id,
    slug,
    title,
    description,
    location,
    starts_at,
    archived,
    template_type,
    role_slots,
    equity_tag,
    created_at,
    updated_at
)
VALUES
    (
        'c0000031-0000-4000-8000-000000000031',
        'b0000001-0000-4000-8000-000000000001',
        'hist-aperock-avril',
        'Apérock Avril',
        'Format festif de clôture du mois d’avril',
        'Gare Saint Sauveur, Lille',
        '2026-04-12T17:00:00Z',
        FALSE,
        'catch',
        '{"player":3,"volunteer":0,"mc":1,"dj":1,"referee":0,"assistant_referee":0,"lighting":0,"coach":0,"stage_manager":0}',
        NULL,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'c0000032-0000-4000-8000-000000000032',
        'b0000001-0000-4000-8000-000000000001',
        'hist-match-vs-roubaix',
        'Match vs Roubaix',
        'Derby nordiste amical',
        'Le Colisée, Roubaix',
        '2026-04-05T18:00:00Z',
        FALSE,
        'match',
        '{"player":5,"volunteer":3,"mc":1,"dj":0,"referee":1,"assistant_referee":1,"lighting":0,"coach":0,"stage_manager":0}',
        NULL,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'c0000033-0000-4000-8000-000000000033',
        'b0000001-0000-4000-8000-000000000001',
        'hist-cabaret-de-mars',
        'Cabaret de mars',
        'Thèmes proposés par le public',
        'Maison Folie, Lille',
        '2026-03-14T18:30:00Z',
        FALSE,
        'cabaret',
        '{"player":5,"volunteer":0,"mc":1,"dj":1,"referee":0,"assistant_referee":0,"lighting":0,"coach":0,"stage_manager":0}',
        NULL,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'c0000034-0000-4000-8000-000000000034',
        'b0000001-0000-4000-8000-000000000001',
        'hist-deplacement-valenciennes',
        'Déplacement Valenciennes',
        'Rencontre ligue Hauts-de-France',
        'Théâtre du Casino, Valenciennes',
        '2026-03-01T17:00:00Z',
        FALSE,
        'deplacement',
        '{"player":5,"volunteer":0,"mc":0,"dj":0,"referee":0,"assistant_referee":0,"lighting":0,"coach":0,"stage_manager":0}',
        'deplacements',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'c0000035-0000-4000-8000-000000000035',
        'b0000001-0000-4000-8000-000000000001',
        'hist-long-form-polar',
        'Long form : Polar',
        'Enquête improvisée',
        'Le Prato, Lille',
        '2026-02-21T19:00:00Z',
        FALSE,
        'longform',
        '{"player":4,"volunteer":0,"mc":1,"dj":1,"referee":0,"assistant_referee":0,"lighting":0,"coach":0,"stage_manager":0}',
        NULL,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'c0000036-0000-4000-8000-000000000036',
        'b0000001-0000-4000-8000-000000000001',
        'hist-cabaret-saint-valentin',
        'Cabaret Saint-Valentin',
        'Spécial duos',
        'La Verrière, Lille',
        '2026-02-08T18:00:00Z',
        FALSE,
        'cabaret',
        '{"player":5,"volunteer":0,"mc":1,"dj":1,"referee":0,"assistant_referee":0,"lighting":0,"coach":0,"stage_manager":0}',
        NULL,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'c0000037-0000-4000-8000-000000000037',
        'b0000001-0000-4000-8000-000000000001',
        'hist-jam-de-janvier',
        'Jam de janvier',
        'Format libre tous styles',
        'Le Biplan, Lille',
        '2026-01-18T18:30:00Z',
        FALSE,
        'freeform',
        '{"player":5,"volunteer":0,"mc":1,"dj":1,"referee":0,"assistant_referee":0,"lighting":0,"coach":0,"stage_manager":0}',
        NULL,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'c0000038-0000-4000-8000-000000000038',
        'b0000001-0000-4000-8000-000000000001',
        'hist-match-amicale-arras',
        'Match amical Arras',
        'Tournoi amical hivernal',
        'Théâtre d''Arras',
        '2026-01-11T19:00:00Z',
        FALSE,
        'match',
        '{"player":5,"volunteer":3,"mc":1,"dj":0,"referee":1,"assistant_referee":1,"lighting":0,"coach":0,"stage_manager":0}',
        NULL,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'c0000039-0000-4000-8000-000000000039',
        'b0000001-0000-4000-8000-000000000001',
        'hist-veille-generale-mai',
        'Veille générale mai',
        'Dernier spectacle avant la trêve estivale des répètes',
        'Le Splendid, Lille',
        '2026-05-24T17:00:00Z',
        FALSE,
        'cabaret',
        '{"player":5,"volunteer":0,"mc":1,"dj":1,"referee":0,"assistant_referee":0,"lighting":0,"coach":0,"stage_manager":0}',
        NULL,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'c000003a-0000-4000-8000-00000000003a',
        'b0000001-0000-4000-8000-000000000001',
        'hist-repetition-archivee',
        'Répétition générale (archivée)',
        'Ne doit pas apparaître dans Historique',
        'Local Malice, Lille',
        '2026-05-10T17:00:00Z',
        TRUE,
        'cabaret',
        '{"player":5,"volunteer":0,"mc":1,"dj":1,"referee":0,"assistant_referee":0,"lighting":0,"coach":0,"stage_manager":0}',
        NULL,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );

-- Glossary equity tag pour le déplacement passé (ADR-0013).
INSERT INTO troupe_equity_tags (id, troupe_id, slug, label)
VALUES (
    'a1000001-0000-4000-8000-000000000001',
    'a0000001-0000-4000-8000-000000000001',
    'deplacements',
    'Déplacements'
)
ON CONFLICT (troupe_id, slug) DO NOTHING;

-- Disponibilités (Patrice, Max, Bruno, Camille) — mix Dispo / Pas dispo pour filtres Historique.
INSERT INTO event_availability (id, event_id, user_id, season_participant_id, status, role_keys, created_at, updated_at)
VALUES
    ('h0000001-0000-4000-8000-000000000001', 'c0000031-0000-4000-8000-000000000031', 'd0000001-0000-4000-8000-000000000022', 'f0000001-0000-4000-8000-000000000022', 'AVAILABLE', '["player"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('h0000001-0000-4000-8000-000000000002', 'c0000032-0000-4000-8000-000000000032', 'd0000001-0000-4000-8000-000000000022', 'f0000001-0000-4000-8000-000000000022', 'UNAVAILABLE', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('h0000001-0000-4000-8000-000000000003', 'c0000033-0000-4000-8000-000000000033', 'd0000001-0000-4000-8000-000000000022', 'f0000001-0000-4000-8000-000000000022', 'AVAILABLE', '["mc"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('h0000001-0000-4000-8000-000000000004', 'c0000034-0000-4000-8000-000000000034', 'd0000001-0000-4000-8000-000000000022', 'f0000001-0000-4000-8000-000000000022', 'AVAILABLE', '["player"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('h0000001-0000-4000-8000-000000000005', 'c0000035-0000-4000-8000-000000000035', 'd0000001-0000-4000-8000-000000000022', 'f0000001-0000-4000-8000-000000000022', 'UNAVAILABLE', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('h0000001-0000-4000-8000-000000000006', 'c0000039-0000-4000-8000-000000000039', 'd0000001-0000-4000-8000-000000000022', 'f0000001-0000-4000-8000-000000000022', 'AVAILABLE', '["dj"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('h0000001-0000-4000-8000-000000000007', 'c0000031-0000-4000-8000-000000000031', 'd0000001-0000-4000-8000-000000000018', 'f0000001-0000-4000-8000-000000000018', 'AVAILABLE', '["player"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('h0000001-0000-4000-8000-000000000008', 'c0000031-0000-4000-8000-000000000031', 'd0000001-0000-4000-8000-000000000005', 'f0000001-0000-4000-8000-000000000005', 'AVAILABLE', '["dj"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('h0000001-0000-4000-8000-000000000009', 'c0000032-0000-4000-8000-000000000032', 'd0000001-0000-4000-8000-000000000006', 'f0000001-0000-4000-8000-000000000006', 'AVAILABLE', '["mc"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('h0000001-0000-4000-8000-00000000000a', 'c0000033-0000-4000-8000-000000000033', 'd0000001-0000-4000-8000-000000000006', 'f0000001-0000-4000-8000-000000000006', 'UNAVAILABLE', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Apérock Avril : équipe validée et confirmée (badge « Confirmé »).
INSERT INTO event_compositions (event_id, validated_at, published_at, created_at, updated_at)
VALUES (
    'c0000031-0000-4000-8000-000000000031',
    '2026-04-13T10:00:00Z',
    '2026-04-13T10:00:00Z',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

INSERT INTO event_composition_slots (id, event_id, role_key, slot_index, participant_id, participation_status, waived, created_at, updated_at)
VALUES
    ('90001001-0000-4000-8000-000000000001', 'c0000031-0000-4000-8000-000000000031', 'player', 0, 'f0000001-0000-4000-8000-000000000022', 'CONFIRMED', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('90001001-0000-4000-8000-000000000002', 'c0000031-0000-4000-8000-000000000031', 'player', 1, 'f0000001-0000-4000-8000-000000000018', 'CONFIRMED', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('90001001-0000-4000-8000-000000000003', 'c0000031-0000-4000-8000-000000000031', 'player', 2, 'f0000001-0000-4000-8000-000000000005', 'CONFIRMED', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('90001001-0000-4000-8000-000000000004', 'c0000031-0000-4000-8000-000000000031', 'mc', 0, 'f0000001-0000-4000-8000-000000000006', 'CONFIRMED', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('90001001-0000-4000-8000-000000000005', 'c0000031-0000-4000-8000-000000000031', 'dj', 0, 'f0000001-0000-4000-8000-000000000025', 'CONFIRMED', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Match vs Roubaix : brouillon publié, pas validé (« Préparation »).
INSERT INTO event_compositions (event_id, validated_at, published_at, created_at, updated_at)
VALUES (
    'c0000032-0000-4000-8000-000000000032',
    NULL,
    '2026-04-06T12:00:00Z',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

INSERT INTO event_composition_slots (id, event_id, role_key, slot_index, participant_id, participation_status, waived, created_at, updated_at)
VALUES
    ('90001002-0000-4000-8000-000000000001', 'c0000032-0000-4000-8000-000000000032', 'player', 0, 'f0000001-0000-4000-8000-000000000018', 'PENDING', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('90001002-0000-4000-8000-000000000002', 'c0000032-0000-4000-8000-000000000032', 'mc', 0, 'f0000001-0000-4000-8000-000000000006', 'PENDING', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

UPDATE seasons
SET
    event_count = (SELECT COUNT(*) FROM events e WHERE e.season_id = seasons.id AND e.archived = FALSE),
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'b0000001-0000-4000-8000-000000000001';
