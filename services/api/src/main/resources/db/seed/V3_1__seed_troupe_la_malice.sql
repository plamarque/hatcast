-- Dev/test seed only (classpath:db/seed). Id aligné sur hatcast.troupe.seed-troupe-id.
-- ON CONFLICT : safe when V3_1 is applied out-of-order (base déjà seedée avant le split OPS-1).
INSERT INTO troupes (id, name, slug, created_at)
VALUES (
    'a0000001-0000-4000-8000-000000000001',
    'La Malice',
    'la-malice',
    CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO NOTHING;
