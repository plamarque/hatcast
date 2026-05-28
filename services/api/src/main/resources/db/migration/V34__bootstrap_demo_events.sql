-- Story 18.3 : ~20 pedagogical events (reference « today » : 2026-05-28).
-- Mix : historical complete, preparing, draft, confirmations, gaps, longform, déplacement, archived.

INSERT INTO events (
    id, season_id, slug, title, description, location, starts_at, archived,
    template_type, role_slots, equity_tag, created_at, updated_at
)
SELECT v.id, v.season_id, v.slug, v.title, v.description, v.location, v.starts_at, v.archived,
       v.template_type, v.role_slots, v.equity_tag, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (
    VALUES
        ('c0000001-0000-4000-8000-000000000099', 'b0000001-0000-4000-8000-000000000099', 'demo-hist-cabaret-mai', 'Cabaret de mai', 'Spectacle passé — équipe confirmée', 'Salle Alpha, Lille', TIMESTAMP '2026-05-10T19:30:00Z', FALSE, 'cabaret', '{"player":3,"volunteer":0,"mc":1,"dj":1,"referee":0,"assistant_referee":0,"lighting":0,"coach":0,"stage_manager":0}', NULL),
        ('c0000002-0000-4000-8000-000000000099', 'b0000001-0000-4000-8000-000000000099', 'demo-hist-match-avril', 'Match d''avril', 'Derby amical passé', 'Salle Beta, Lille', TIMESTAMP '2026-04-20T20:00:00Z', FALSE, 'match', '{"player":5,"volunteer":2,"mc":1,"dj":0,"referee":1,"assistant_referee":1,"lighting":0,"coach":0,"stage_manager":0}', NULL),
        ('c0000003-0000-4000-8000-000000000099', 'b0000001-0000-4000-8000-000000000099', 'demo-hist-deplacement-mars', 'Déplacement mars', 'Rencontre ligue passée', 'MJC Gamma, Amiens', TIMESTAMP '2026-03-15T18:00:00Z', FALSE, 'deplacement', '{"player":5,"volunteer":0,"mc":0,"dj":0,"referee":0,"assistant_referee":0,"lighting":0,"coach":0,"stage_manager":0}', 'deplacements'),
        ('c0000004-0000-4000-8000-000000000099', 'b0000001-0000-4000-8000-000000000099', 'demo-cabaret-juin', 'Cabaret juin', 'Disponibilités à renseigner', 'Salle Alpha, Lille', TIMESTAMP '2026-06-20T19:30:00Z', FALSE, 'cabaret', '{"player":5,"volunteer":0,"mc":1,"dj":1,"referee":0,"assistant_referee":0,"lighting":0,"coach":0,"stage_manager":0}', NULL),
        ('c0000005-0000-4000-8000-000000000099', 'b0000001-0000-4000-8000-000000000099', 'demo-match-juillet', 'Match juillet', 'Collecte dispos en cours', 'Salle Beta, Lille', TIMESTAMP '2026-07-15T20:00:00Z', FALSE, 'match', '{"player":5,"volunteer":2,"mc":1,"dj":0,"referee":1,"assistant_referee":1,"lighting":0,"coach":0,"stage_manager":0}', NULL),
        ('c0000006-0000-4000-8000-000000000099', 'b0000001-0000-4000-8000-000000000099', 'demo-cabaret-aout', 'Cabaret août', 'Préparation line-up', 'Parc Delta, Lille', TIMESTAMP '2026-08-10T19:00:00Z', FALSE, 'cabaret', '{"player":5,"volunteer":0,"mc":1,"dj":1,"referee":0,"assistant_referee":0,"lighting":0,"coach":0,"stage_manager":0}', NULL),
        ('c0000007-0000-4000-8000-000000000099', 'b0000001-0000-4000-8000-000000000099', 'demo-jam-septembre', 'Jam septembre', 'Format libre', 'Le Biplan, Lille', TIMESTAMP '2026-09-05T19:30:00Z', FALSE, 'freeform', '{"player":5,"volunteer":0,"mc":1,"dj":1,"referee":0,"assistant_referee":0,"lighting":0,"coach":0,"stage_manager":0}', NULL),
        ('c0000008-0000-4000-8000-000000000099', 'b0000001-0000-4000-8000-000000000099', 'demo-cabaret-octobre', 'Cabaret octobre', 'Brouillon équipe', 'Salle Alpha, Lille', TIMESTAMP '2026-10-12T20:00:00Z', FALSE, 'cabaret', '{"player":5,"volunteer":0,"mc":1,"dj":1,"referee":0,"assistant_referee":0,"lighting":0,"coach":0,"stage_manager":0}', NULL),
        ('c0000009-0000-4000-8000-000000000099', 'b0000001-0000-4000-8000-000000000099', 'demo-match-novembre', 'Match novembre', 'Brouillon partiel', 'Salle Beta, Lille', TIMESTAMP '2026-11-08T20:30:00Z', FALSE, 'match', '{"player":5,"volunteer":2,"mc":1,"dj":0,"referee":1,"assistant_referee":1,"lighting":0,"coach":0,"stage_manager":0}', NULL),
        ('c0000010-0000-4000-8000-000000000099', 'b0000001-0000-4000-8000-000000000099', 'demo-cabaret-decembre', 'Cabaret décembre', 'En attente de confirmations', 'Salle Alpha, Lille', TIMESTAMP '2026-12-12T19:30:00Z', FALSE, 'cabaret', '{"player":3,"volunteer":0,"mc":1,"dj":1,"referee":0,"assistant_referee":0,"lighting":0,"coach":0,"stage_manager":0}', NULL),
        ('c0000011-0000-4000-8000-000000000099', 'b0000001-0000-4000-8000-000000000099', 'demo-match-janvier', 'Match janvier', 'Confirmations partielles', 'Salle Beta, Lille', TIMESTAMP '2027-01-20T20:00:00Z', FALSE, 'match', '{"player":5,"volunteer":2,"mc":1,"dj":0,"referee":1,"assistant_referee":1,"lighting":0,"coach":0,"stage_manager":0}', NULL),
        ('c0000012-0000-4000-8000-000000000099', 'b0000001-0000-4000-8000-000000000099', 'demo-cabaret-fevrier', 'Cabaret février', 'Trou à combler', 'Salle Alpha, Lille', TIMESTAMP '2027-02-15T19:30:00Z', FALSE, 'cabaret', '{"player":5,"volunteer":0,"mc":1,"dj":1,"referee":0,"assistant_referee":0,"lighting":0,"coach":0,"stage_manager":0}', NULL),
        ('c0000013-0000-4000-8000-000000000099', 'b0000001-0000-4000-8000-000000000099', 'demo-match-mars-confirme', 'Match mars confirmé', 'Line-up validée et confirmée', 'Salle Beta, Lille', TIMESTAMP '2027-03-20T20:00:00Z', FALSE, 'match', '{"player":5,"volunteer":2,"mc":1,"dj":0,"referee":1,"assistant_referee":1,"lighting":0,"coach":0,"stage_manager":0}', NULL),
        ('c0000014-0000-4000-8000-000000000099', 'b0000001-0000-4000-8000-000000000099', 'demo-longform-avril', 'Long form : Polar', 'Enquête improvisée', 'Le Prato, Lille', TIMESTAMP '2027-04-10T20:00:00Z', FALSE, 'longform', '{"player":4,"volunteer":0,"mc":1,"dj":1,"referee":0,"assistant_referee":0,"lighting":0,"coach":0,"stage_manager":0}', NULL),
        ('c0000015-0000-4000-8000-000000000099', 'b0000001-0000-4000-8000-000000000099', 'demo-deplacement-mai', 'Déplacement Lyon', 'Week-end ligue', 'Espace Gerson, Lyon', TIMESTAMP '2027-05-01T17:00:00Z', FALSE, 'deplacement', '{"player":5,"volunteer":0,"mc":0,"dj":0,"referee":0,"assistant_referee":0,"lighting":0,"coach":0,"stage_manager":0}', 'deplacements'),
        ('c0000016-0000-4000-8000-000000000099', 'b0000001-0000-4000-8000-000000000099', 'demo-cabaret-mai', 'Cabaret mai', 'Fin de saison', 'Salle Alpha, Lille', TIMESTAMP '2027-05-20T19:30:00Z', FALSE, 'cabaret', '{"player":5,"volunteer":0,"mc":1,"dj":1,"referee":0,"assistant_referee":0,"lighting":0,"coach":0,"stage_manager":0}', NULL),
        ('c0000017-0000-4000-8000-000000000099', 'b0000001-0000-4000-8000-000000000099', 'demo-match-juin', 'Match juin', 'Derby de clôture', 'Salle Beta, Lille', TIMESTAMP '2027-06-05T20:00:00Z', FALSE, 'match', '{"player":5,"volunteer":2,"mc":1,"dj":0,"referee":1,"assistant_referee":1,"lighting":0,"coach":0,"stage_manager":0}', NULL),
        ('c0000018-0000-4000-8000-000000000099', 'b0000001-0000-4000-8000-000000000099', 'demo-cabaret-juillet', 'Cabaret juillet', 'After saison', 'Parc Delta, Lille', TIMESTAMP '2027-07-12T19:00:00Z', FALSE, 'cabaret', '{"player":5,"volunteer":0,"mc":1,"dj":1,"referee":0,"assistant_referee":0,"lighting":0,"coach":0,"stage_manager":0}', NULL),
        ('c0000019-0000-4000-8000-000000000099', 'b0000001-0000-4000-8000-000000000099', 'demo-archive-repetition', 'Répétition (archivée)', 'Visible admin uniquement', 'Local Démo', TIMESTAMP '2027-04-01T17:00:00Z', TRUE, 'cabaret', '{"player":5,"volunteer":0,"mc":1,"dj":1,"referee":0,"assistant_referee":0,"lighting":0,"coach":0,"stage_manager":0}', NULL),
        ('c0000020-0000-4000-8000-000000000099', 'b0000001-0000-4000-8000-000000000099', 'demo-archive-ancien', 'Atelier (archivé)', 'Événement inactif', 'Local Démo', TIMESTAMP '2027-03-01T18:00:00Z', TRUE, 'cabaret', '{"player":5,"volunteer":0,"mc":1,"dj":1,"referee":0,"assistant_referee":0,"lighting":0,"coach":0,"stage_manager":0}', NULL)
) AS v(id, season_id, slug, title, description, location, starts_at, archived, template_type, role_slots, equity_tag)
WHERE NOT EXISTS (SELECT 1 FROM events e WHERE e.id = v.id);

INSERT INTO troupe_equity_tags (id, troupe_id, slug, label)
SELECT
    'a1000099-0000-4000-8000-000000000001',
    'a0000001-0000-4000-8000-000000000099',
    'deplacements',
    'Déplacements'
WHERE NOT EXISTS (
    SELECT 1 FROM troupe_equity_tags
    WHERE troupe_id = 'a0000001-0000-4000-8000-000000000099'
      AND slug = 'deplacements'
);

UPDATE seasons
SET
    event_count = (SELECT COUNT(*) FROM events e WHERE e.season_id = seasons.id AND e.archived = FALSE),
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'b0000001-0000-4000-8000-000000000099';
