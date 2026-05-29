-- Story 18.3 : fictitious roster (≥ 8 personas, @seed.demo.test) + partial availability.

INSERT INTO users (id, google_sub, idp_uid, email, display_name, slug, activated_at, created_at, updated_at)
SELECT CAST(v.id AS uuid), v.google_sub, NULL, v.email, v.display_name, v.slug, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (
    VALUES
        ('d0000001-0000-4000-8000-000000000099', 'seed-demo-01', 'alex@seed.demo.test', 'Alex', 'demo-alex'),
        ('d0000002-0000-4000-8000-000000000099', 'seed-demo-02', 'camille@seed.demo.test', 'Camille', 'demo-camille'),
        ('d0000003-0000-4000-8000-000000000099', 'seed-demo-03', 'jordan@seed.demo.test', 'Jordan', 'demo-jordan'),
        ('d0000004-0000-4000-8000-000000000099', 'seed-demo-04', 'lea@seed.demo.test', 'Léa', 'demo-lea'),
        ('d0000005-0000-4000-8000-000000000099', 'seed-demo-05', 'marco@seed.demo.test', 'Marco', 'demo-marco'),
        ('d0000006-0000-4000-8000-000000000099', 'seed-demo-06', 'noemie@seed.demo.test', 'Noémie', 'demo-noemie'),
        ('d0000007-0000-4000-8000-000000000099', 'seed-demo-07', 'sam@seed.demo.test', 'Sam', 'demo-sam'),
        ('d0000008-0000-4000-8000-000000000099', 'seed-demo-08', 'zoe@seed.demo.test', 'Zoé', 'demo-zoe')
) AS v(id, google_sub, email, display_name, slug)
WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.id = CAST(v.id AS uuid));

INSERT INTO troupe_memberships (id, troupe_id, user_id, status, baseline_role, display_name, preferred_role_keys, created_at, updated_at)
SELECT CAST(v.id AS uuid), CAST('a0000001-0000-4000-8000-000000000099' AS uuid), CAST(v.user_id AS uuid), 'ACTIVE', 'MEMBER', v.display_name, '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (
    VALUES
        ('e0000001-0000-4000-8000-000000000099', 'd0000001-0000-4000-8000-000000000099', 'Alex'),
        ('e0000002-0000-4000-8000-000000000099', 'd0000002-0000-4000-8000-000000000099', 'Camille'),
        ('e0000003-0000-4000-8000-000000000099', 'd0000003-0000-4000-8000-000000000099', 'Jordan'),
        ('e0000004-0000-4000-8000-000000000099', 'd0000004-0000-4000-8000-000000000099', 'Léa'),
        ('e0000005-0000-4000-8000-000000000099', 'd0000005-0000-4000-8000-000000000099', 'Marco'),
        ('e0000006-0000-4000-8000-000000000099', 'd0000006-0000-4000-8000-000000000099', 'Noémie'),
        ('e0000007-0000-4000-8000-000000000099', 'd0000007-0000-4000-8000-000000000099', 'Sam'),
        ('e0000008-0000-4000-8000-000000000099', 'd0000008-0000-4000-8000-000000000099', 'Zoé')
) AS v(id, user_id, display_name)
WHERE NOT EXISTS (SELECT 1 FROM troupe_memberships tm WHERE tm.id = CAST(v.id AS uuid));

INSERT INTO season_participants (id, season_id, display_name, normalized_email, user_id, troupe_membership_id, status, created_at, updated_at)
SELECT CAST(v.id AS uuid), CAST('b0000001-0000-4000-8000-000000000099' AS uuid), v.display_name, v.email, CAST(v.user_id AS uuid), CAST(v.membership_id AS uuid), 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (
    VALUES
        ('f0000001-0000-4000-8000-000000000099', 'Alex', 'alex@seed.demo.test', 'd0000001-0000-4000-8000-000000000099', 'e0000001-0000-4000-8000-000000000099'),
        ('f0000002-0000-4000-8000-000000000099', 'Camille', 'camille@seed.demo.test', 'd0000002-0000-4000-8000-000000000099', 'e0000002-0000-4000-8000-000000000099'),
        ('f0000003-0000-4000-8000-000000000099', 'Jordan', 'jordan@seed.demo.test', 'd0000003-0000-4000-8000-000000000099', 'e0000003-0000-4000-8000-000000000099'),
        ('f0000004-0000-4000-8000-000000000099', 'Léa', 'lea@seed.demo.test', 'd0000004-0000-4000-8000-000000000099', 'e0000004-0000-4000-8000-000000000099'),
        ('f0000005-0000-4000-8000-000000000099', 'Marco', 'marco@seed.demo.test', 'd0000005-0000-4000-8000-000000000099', 'e0000005-0000-4000-8000-000000000099'),
        ('f0000006-0000-4000-8000-000000000099', 'Noémie', 'noemie@seed.demo.test', 'd0000006-0000-4000-8000-000000000099', 'e0000006-0000-4000-8000-000000000099'),
        ('f0000007-0000-4000-8000-000000000099', 'Sam', 'sam@seed.demo.test', 'd0000007-0000-4000-8000-000000000099', 'e0000007-0000-4000-8000-000000000099'),
        ('f0000008-0000-4000-8000-000000000099', 'Zoé', 'zoe@seed.demo.test', 'd0000008-0000-4000-8000-000000000099', 'e0000008-0000-4000-8000-000000000099')
) AS v(id, display_name, email, user_id, membership_id)
WHERE NOT EXISTS (SELECT 1 FROM season_participants sp WHERE sp.id = CAST(v.id AS uuid));

-- Disponibilités sur événements « preparing » + brouillons (c0000004–c0000009).
INSERT INTO event_availability (id, event_id, user_id, season_participant_id, event_participant_id, status, role_keys, created_at, updated_at)
SELECT CAST(v.id AS uuid), CAST(v.event_id AS uuid), CAST(v.user_id AS uuid), NULL, NULL, v.status, v.role_keys, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (
    VALUES
        ('a2000001-0000-4000-8000-000000000099', 'c0000004-0000-4000-8000-000000000099', 'd0000001-0000-4000-8000-000000000099', 'AVAILABLE', '["player"]'),
        ('a2000002-0000-4000-8000-000000000099', 'c0000004-0000-4000-8000-000000000099', 'd0000002-0000-4000-8000-000000000099', 'AVAILABLE', '["mc"]'),
        ('a2000003-0000-4000-8000-000000000099', 'c0000004-0000-4000-8000-000000000099', 'd0000003-0000-4000-8000-000000000099', 'UNAVAILABLE', '[]'),
        ('a2000004-0000-4000-8000-000000000099', 'c0000005-0000-4000-8000-000000000099', 'd0000004-0000-4000-8000-000000000099', 'AVAILABLE', '["player"]'),
        ('a2000005-0000-4000-8000-000000000099', 'c0000005-0000-4000-8000-000000000099', 'd0000005-0000-4000-8000-000000000099', 'AVAILABLE', '["referee"]'),
        ('a2000006-0000-4000-8000-000000000099', 'c0000006-0000-4000-8000-000000000099', 'd0000006-0000-4000-8000-000000000099', 'AVAILABLE', '["player","dj"]'),
        ('a2000007-0000-4000-8000-000000000099', 'c0000007-0000-4000-8000-000000000099', 'd0000007-0000-4000-8000-000000000099', 'AVAILABLE', '["player"]'),
        ('a2000008-0000-4000-8000-000000000099', 'c0000008-0000-4000-8000-000000000099', 'd0000001-0000-4000-8000-000000000099', 'AVAILABLE', '["player"]'),
        ('a2000009-0000-4000-8000-000000000099', 'c0000008-0000-4000-8000-000000000099', 'd0000008-0000-4000-8000-000000000099', 'AVAILABLE', '["dj"]'),
        ('a2000010-0000-4000-8000-000000000099', 'c0000009-0000-4000-8000-000000000099', 'd0000002-0000-4000-8000-000000000099', 'AVAILABLE', '["mc"]'),
        ('a2000011-0000-4000-8000-000000000099', 'c0000009-0000-4000-8000-000000000099', 'd0000003-0000-4000-8000-000000000099', 'AVAILABLE', '["player"]')
) AS v(id, event_id, user_id, status, role_keys)
WHERE NOT EXISTS (SELECT 1 FROM event_availability ea WHERE ea.id = CAST(v.id AS uuid));

UPDATE seasons
SET
    participant_count = (
        SELECT COUNT(*) FROM season_participants sp
        WHERE sp.season_id = seasons.id AND sp.status = 'ACTIVE'
    ),
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'b0000001-0000-4000-8000-000000000099';
