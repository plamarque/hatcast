/**
 * Generates Les Improbots dev demo data as a single idempotent Flyway repeatable seed
 * (PostgreSQL + H2 test/e2e via seed-postgresql classpath).
 *
 * Usage:
 *   npm run generate:improbots-dev-seed
 *   node scripts/v2/generate-improbots-seed-sql.js --input=members.csv
 *
 * Regenerate after editing members.csv (gitignored at repo root — PII).
 * Only the generated SQL (obfuscated emails) is committed.
 */

import { mkdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, '..', '..')

export const SEED_TROUPE_ID = 'a0000001-0000-4000-8000-000000000001'
export const SEED_SEASON_ID = 'b0000001-0000-4000-8000-000000000001'
export const SEED_EMAIL_DOMAIN = 'seed.improbots.test'

const ROLE_KEYS = [
  'player',
  'volunteer',
  'mc',
  'dj',
  'referee',
  'assistant_referee',
  'lighting',
  'coach',
  'stage_manager',
]

const ROLE_PRESETS = {
  match: { player: 5, mc: 1, referee: 1, assistant_referee: 2, volunteer: 5, coach: 1 },
  catch: { player: 9, mc: 1, dj: 1 },
  cabaret: { player: 5, mc: 1, dj: 1 },
  longform: { player: 4, mc: 1, dj: 1 },
  freeform: { player: 5, mc: 1, dj: 1 },
  deplacement: { player: 5 },
  survey: {},
  custom: {},
}

/**
 * Past events for Historique (story 3.6b) — maintained in Flyway V26, not regenerated here.
 * @see services/api/src/main/resources/db/seed/V26__seed_malice_past_events_historique.sql
 */
export const SEED_PAST_EVENTS = [
  {
    id: 'c0000031-0000-4000-8000-000000000031',
    templateType: 'catch',
    slug: 'hist-aperock-avril',
    title: 'Apérock Avril',
    description:
      'Format festif de clôture du mois d\'avril. Apéro partagé dès 18h30, scène ouverte à 19h30. Musicien invité pour le jam final. Édition 2026 sold out — reprendre le même créneau l\'an prochain.',
    location: 'Gare Saint-Sauveur, 74 avenue de Saint-Sauveur, 59000 Lille',
    startsAt: '2026-04-12T16:00:00Z',
  },
  {
    id: 'c0000032-0000-4000-8000-000000000032',
    templateType: 'match',
    slug: 'hist-match-vs-roubaix',
    title: 'Match vs Roubaix',
    description:
      'Derby nordiste amical contre les Roubaisiens. Public très chaud — salle comble. Manches serrées (12-11 aux points). Brouillon publié mais équipe non validée (cas test Historique).',
    location: 'Le Colisée, 13 rue Jean Lebas, 59100 Roubaix',
    startsAt: '2026-04-05T16:00:00Z',
  },
  {
    id: 'c0000033-0000-4000-8000-000000000033',
    templateType: 'cabaret',
    slug: 'hist-cabaret-de-mars',
    title: 'Cabaret de mars',
    description:
      'Thèmes proposés par le public via urne à l\'entrée. Trois équipes, neuf formats différents. MC a dû improviser les transitions — bonne énergie. Photos sur le drive troupe.',
    location: 'Maison Folie de Wazemmes, 68 rue de Wazemmes, 59000 Lille',
    startsAt: '2026-03-14T17:30:00Z',
  },
  {
    id: 'c0000034-0000-4000-8000-000000000034',
    templateType: 'deplacement',
    slug: 'hist-deplacement-valenciennes',
    title: 'Déplacement Valenciennes',
    description:
      'Rencontre ligue Hauts-de-France. Départ 14h00 depuis Lille, retour 23h45. Covoiturage : 4 places restantes au tableau. Catégorie « Déplacements » pour filtre agenda.',
    location: 'Théâtre du Casino, 18 rue du Général Sarrail, 59300 Valenciennes',
    startsAt: '2026-03-01T16:00:00Z',
    category: 'deplacements',
  },
  {
    id: 'c0000035-0000-4000-8000-000000000035',
    templateType: 'longform',
    slug: 'hist-long-form-polar',
    title: 'Long form : Polar',
    description:
      'Enquête improvisée sur 45 minutes. Personnage du détective revenu trois fois dans la saison. Public a deviné le coupable à 70 % — bon signe pour la lisibilité.',
    location: 'Le Prato, 12 rue du Prato, 59000 Lille',
    startsAt: '2026-02-21T18:00:00Z',
  },
  {
    id: 'c0000036-0000-4000-8000-000000000036',
    templateType: 'cabaret',
    slug: 'hist-cabaret-saint-valentin',
    title: 'Cabaret Saint-Valentin',
    description:
      'Spécial duos — chaque numéro en binôme. Concours du duo le plus crédible (vote public). Chocolats offerts à la sortie. Salle chauffée à fond, prévoir eau sur scène.',
    location: 'La Verrière, 16 rue Gosselet, 59000 Lille',
    startsAt: '2026-02-08T17:00:00Z',
  },
  {
    id: 'c0000037-0000-4000-8000-000000000037',
    templateType: 'freeform',
    slug: 'hist-jam-de-janvier',
    title: 'Jam de janvier',
    description:
      'Format libre tous styles après la trêve. Beaucoup de nouveaux formats testés. MC tour à tour. Séance 19h30-22h00 sans entracte officiel — pause boisson informelle.',
    location: 'Le Biplan, 81 rue de Cambrai, 59000 Lille',
    startsAt: '2026-01-18T18:30:00Z',
  },
  {
    id: 'c0000038-0000-4000-8000-000000000038',
    templateType: 'match',
    slug: 'hist-match-amicale-arras',
    title: 'Match amical Arras',
    description:
      'Tournoi amical hivernal à Arras. Aller-retour dans la journée (bus privatisé). Match à 20h00 heure locale ; repas midi inclus. Patrice indisponible — cas test filtre Historique.',
    location: 'Théâtre d\'Arras, 2 place du Théâtre, 62000 Arras',
    startsAt: '2026-01-11T18:00:00Z',
  },
  {
    id: 'c0000039-0000-4000-8000-000000000039',
    templateType: 'cabaret',
    slug: 'hist-veille-generale-mai',
    title: 'Veille générale mai',
    description:
      'Dernier spectacle avant la trêve estivale des répètes. Équipe validée et confirmée (badge vert). Clôture à 21h30 pour libérer la salle. Merci aux bénévoles bar.',
    location: 'Le Splendid, 68 rue de la Barre, 59000 Lille',
    startsAt: '2026-05-24T15:00:00Z',
  },
  {
    id: 'c000003a-0000-4000-8000-00000000003a',
    templateType: 'cabaret',
    slug: 'hist-repetition-archivee',
    title: 'Répétition générale (archivée)',
    description:
      'Ne doit pas apparaître dans Historique — événement archivé. Répétition technique sans public. Cas limite pour filtres agenda et compteurs saison.',
    location: 'Local Les Improbots, 8 rue du Molinel, 59000 Lille',
    startsAt: '2026-05-10T15:00:00Z',
    archived: true,
  },
]

/** Disponibilités Historique (story 3.6b) — mix Dispo / Pas dispo pour filtres. */
const SEED_HISTORIQUE_AVAILABILITY = [
  { id: 'e0000001-0000-4000-8000-000000000001', eventId: 'c0000031-0000-4000-8000-000000000031', participantId: 'f0000001-0000-4000-8000-000000000022', status: 'AVAILABLE', roleKeys: ['player'] },
  { id: 'e0000001-0000-4000-8000-000000000002', eventId: 'c0000032-0000-4000-8000-000000000032', participantId: 'f0000001-0000-4000-8000-000000000022', status: 'UNAVAILABLE', roleKeys: [] },
  { id: 'e0000001-0000-4000-8000-000000000003', eventId: 'c0000033-0000-4000-8000-000000000033', participantId: 'f0000001-0000-4000-8000-000000000022', status: 'AVAILABLE', roleKeys: ['mc'] },
  { id: 'e0000001-0000-4000-8000-000000000004', eventId: 'c0000034-0000-4000-8000-000000000034', participantId: 'f0000001-0000-4000-8000-000000000022', status: 'AVAILABLE', roleKeys: ['player'] },
  { id: 'e0000001-0000-4000-8000-000000000005', eventId: 'c0000035-0000-4000-8000-000000000035', participantId: 'f0000001-0000-4000-8000-000000000022', status: 'UNAVAILABLE', roleKeys: [] },
  { id: 'e0000001-0000-4000-8000-000000000006', eventId: 'c0000039-0000-4000-8000-000000000039', participantId: 'f0000001-0000-4000-8000-000000000022', status: 'AVAILABLE', roleKeys: ['dj'] },
  { id: 'e0000001-0000-4000-8000-000000000007', eventId: 'c0000031-0000-4000-8000-000000000031', participantId: 'f0000001-0000-4000-8000-000000000018', status: 'AVAILABLE', roleKeys: ['player'] },
  { id: 'e0000001-0000-4000-8000-000000000008', eventId: 'c0000031-0000-4000-8000-000000000031', participantId: 'f0000001-0000-4000-8000-000000000005', status: 'AVAILABLE', roleKeys: ['dj'] },
  { id: 'e0000001-0000-4000-8000-000000000009', eventId: 'c0000032-0000-4000-8000-000000000032', participantId: 'f0000001-0000-4000-8000-000000000006', status: 'AVAILABLE', roleKeys: ['mc'] },
  { id: 'e0000001-0000-4000-8000-00000000000a', eventId: 'c0000033-0000-4000-8000-000000000033', participantId: 'f0000001-0000-4000-8000-000000000006', status: 'UNAVAILABLE', roleKeys: [] },
]

const SEED_HISTORIQUE_COMPOSITIONS = [
  {
    eventId: 'c0000031-0000-4000-8000-000000000031',
    validatedAt: '2026-04-13T10:00:00Z',
    publishedAt: '2026-04-13T10:00:00Z',
    slots: [
      { id: '90001001-0000-4000-8000-000000000001', roleKey: 'player', slotIndex: 0, participantSeq: 22, status: 'CONFIRMED' },
      { id: '90001001-0000-4000-8000-000000000002', roleKey: 'player', slotIndex: 1, participantSeq: 18, status: 'CONFIRMED' },
      { id: '90001001-0000-4000-8000-000000000003', roleKey: 'player', slotIndex: 2, participantSeq: 5, status: 'CONFIRMED' },
      { id: '90001001-0000-4000-8000-000000000004', roleKey: 'mc', slotIndex: 0, participantSeq: 6, status: 'CONFIRMED' },
      { id: '90001001-0000-4000-8000-000000000005', roleKey: 'dj', slotIndex: 0, participantSeq: 25, status: 'CONFIRMED' },
    ],
  },
  {
    eventId: 'c0000032-0000-4000-8000-000000000032',
    validatedAt: null,
    publishedAt: '2026-04-06T12:00:00Z',
    slots: [
      { id: '90001002-0000-4000-8000-000000000001', roleKey: 'player', slotIndex: 0, participantSeq: 18, status: 'PENDING' },
      { id: '90001002-0000-4000-8000-000000000002', roleKey: 'mc', slotIndex: 0, participantSeq: 6, status: 'PENDING' },
    ],
  },
]

const FLYWAY_IMPROBOTS_SUPERSEDED_STUB = `-- Superseded by db/seed-postgresql/R__seed_improbots_dev_demo.sql
-- Regenerate: npm run generate:improbots-dev-seed
SELECT 1 WHERE 1 = 0;
`

const SUPERSEDED_VERSIONED_SEED_FILES = [
  'V6__seed_events_la_malice_2026_2027.sql',
  'V17__seed_malice_members_events_availability.sql',
  'V19__seed_malice_composition_drafts.sql',
  'V22__seed_mvp_pilot_recette.sql',
  'V26__seed_malice_past_events_historique.sql',
  'V49__seed_improbots_event_details.sql',
  'V48__seed_availability_opened_at_backfill.sql',
]

/** Sync with V6 event IDs c0000001 … c0000030 — descriptions, lieux et horaires variés pour QA UI. */
export const SEED_EVENTS = [
  {
    id: 'c0000001-0000-4000-8000-000000000001',
    templateType: 'cabaret',
    title: 'Cabaret de rentrée',
    description:
      'Premier cabaret de la saison 2026-2027. Montage technique dès 17h30, accueil du public à 19h00. Formats courts (12 à 15 min), relances possibles entre les équipes. Buvette et restauration légère sur place.',
    location: 'Théâtre Molière, 5 place Sébastopol, 59000 Lille',
    startsAt: '2026-09-11T17:30:00Z',
  },
  {
    id: 'c0000002-0000-4000-8000-000000000002',
    templateType: 'match',
    title: 'Match vs Bruxelles',
    description:
      "Match d'impro franco-belge en deux manches. Briefing arbitres à 19h30, coup d'envoi à 20h00. Public invité à voter entre les manches — prévoir un MC dynamique et une équipe de bénévoles pour la billetterie.",
    location: 'Salle Pasteur, 12 rue Pasteur, 59000 Lille',
    startsAt: '2026-09-25T18:00:00Z',
  },
  {
    id: 'c0000003-0000-4000-8000-000000000003',
    templateType: 'deplacement',
    title: 'Déplacement Amiens',
    description:
      'Rencontre ligue régionale à Amiens. Départ car partagé depuis Lille à 15h30 (RDV gare Lille-Flandres). Repas prévu sur place à 18h00 avant le spectacle. Retour estimé vers 23h30.',
    location: 'MJC Jules Verne, 2 rue des Otages, 80000 Amiens',
    startsAt: '2026-10-03T16:30:00Z',
  },
  {
    id: 'c0000004-0000-4000-8000-000000000004',
    templateType: 'longform',
    title: 'Format long : Science-fiction',
    description:
      'Long form thématique SF sur 45 minutes. Répétition exploratoire le mardi précédent (obligatoire pour les joueuses et joueurs retenus). Ambiance sonore et lumières travaillées — DJ et régisseur lumière convoqués dès 18h30.',
    location: 'Le Spotlight, 68 rue de la Barre, 59000 Lille',
    startsAt: '2026-10-16T18:00:00Z',
  },
  {
    id: 'c0000005-0000-4000-8000-000000000005',
    templateType: 'cabaret',
    title: 'Cabaret Halloween',
    description:
      'Spécial frissons et costumes encouragés. Décorations sur place dès 16h00. Spectacle en deux vagues (20h00 et 22h00) — indiquer votre créneau préféré dans les dispos. Contenu tout public avec quelques surprises.',
    location: 'La Halle aux Toiles, 25 rue de la Halle, 59200 Tourcoing',
    startsAt: '2026-10-30T18:30:00Z',
  },
  {
    id: 'c0000006-0000-4000-8000-000000000006',
    templateType: 'match',
    title: 'Match vs Gand',
    description:
      "Match international amical contre les Gantoises. Échauffement collectif à 19h00, match à 20h00. Équipe belge confirmée ; arbitrage bilingue FR/NL. Billetterie en ligne ouverte jusqu'au jeudi précédent.",
    location: 'Théâtre de la Gare, 185 rue Colbert, 59000 Lille',
    startsAt: '2026-11-07T19:00:00Z',
  },
  {
    id: 'c0000007-0000-4000-8000-000000000007',
    templateType: 'cabaret',
    title: 'Cabaret des voisins',
    description:
      'Scène ouverte aux troupes locales du Nord. Chaque troupe passe 20 minutes ; Les Improbots clôture la soirée. Accueil des troupes invitées à 18h00, montage mutualisé. Pot de fin de soirée prévu.',
    location: 'Maison Folie de Wazemmes, 68 rue de Wazemmes, 59000 Lille',
    startsAt: '2026-11-20T17:30:00Z',
  },
  {
    id: 'c0000008-0000-4000-8000-000000000008',
    templateType: 'deplacement',
    title: 'Déplacement Paris',
    description:
      "Festival hivernal parisien — créneau matinal pour enchaîner avec un atelier l'après-midi. TGV depuis Lille à 07h12 recommandé. Hébergement non pris en charge ; liste de collocations sur le canal troupe.",
    location: 'Théâtre du Marais, 37 rue Volta, 75003 Paris',
    startsAt: '2026-12-05T09:00:00Z',
  },
  {
    id: 'c0000009-0000-4000-8000-000000000009',
    templateType: 'cabaret',
    title: 'Cabaret de Noël',
    description:
      "Impro et chants de fin d'année. Chorale invitée pour deux reprises en ouverture et clôture. Dress code rouge et vert bienvenu. Tombola au profit du fonds de roulement de la troupe.",
    location: 'La Verrière, 16 rue Gosselet, 59000 Lille',
    startsAt: '2026-12-18T19:00:00Z',
  },
  {
    id: 'c0000010-0000-4000-8000-000000000010',
    templateType: 'freeform',
    title: 'Jam Impro Nouvel An',
    description:
      'Format libre tous styles — propositions du public tirées au sort. Pas de fil rouge imposé ; MC facilite les transitions. Séance de 2h30 avec pause à mi-parcours. Débutants et confirmé·es sur scène.',
    location: 'Le Biplan, 81 rue de Cambrai, 59000 Lille',
    startsAt: '2027-01-08T18:30:00Z',
  },
  {
    id: 'c0000011-0000-4000-8000-000000000011',
    templateType: 'match',
    title: 'Match vs Rouen',
    description:
      'Tournoi inter-ligues en best-of-three. Chaque manche dure 25 minutes. Rouennais en déplacement — prévoir hébergement pour 4 personnes si vous pouvez loger. Diffusion en direct sur la page Facebook de la troupe.',
    location: 'Théâtre Sébastopol, 15 place Sébastopol, 59000 Lille',
    startsAt: '2027-01-22T19:00:00Z',
  },
  {
    id: 'c0000012-0000-4000-8000-000000000012',
    templateType: 'cabaret',
    title: 'Cabaret court format',
    description:
      'Scènes courtes rythmées (8 min chrono). Chronomètre visible du public. Trois slots par demi-équipe ; changement de décor rapide. Idéal pour tester de nouveaux formats avant le gala.',
    location: 'Le Colisée, 13 rue Jean Lebas, 59100 Roubaix',
    startsAt: '2027-01-29T19:30:00Z',
  },
  {
    id: 'c0000013-0000-4000-8000-000000000013',
    templateType: 'deplacement',
    title: 'Déplacement Reims',
    description:
      "Invité·es par la Ligue d'Improvisation de Reims. Spectacle unique en soirée ; atelier partagé l'après-midi (14h-16h) avec les Reims·oises. Covoiturage organisé via le tableur partagé.",
    location: 'Comédie de Reims, 39 rue Chanzy, 51100 Reims',
    startsAt: '2027-02-06T17:00:00Z',
  },
  {
    id: 'c0000014-0000-4000-8000-000000000014',
    templateType: 'custom',
    customSlots: { player: 2, mc: 1, dj: 1 },
    title: 'Duo impro musical',
    description:
      'Improvisation en duo avec piano live. Répétition musicale le lundi précédent à 20h00 au local. Répertoire jazz et chanson française ; partitions fournies. Public assis, salle intimiste (120 places).',
    location: 'Le Splendid, 68 rue de la Barre, 59000 Lille',
    startsAt: '2027-02-19T19:00:00Z',
  },
  {
    id: 'c0000015-0000-4000-8000-000000000015',
    templateType: 'cabaret',
    title: 'Cabaret printanier',
    description:
      "Thèmes imposés par le public via ardoises à l'entrée. Tirage des thèmes à 20h05 — pas de thème choisi à l'avance. Ambiance conviviale ; terrasse ouverte si météo clémente.",
    location: "Salle Concorde, 1 avenue de la Créativité, 59650 Villeneuve-d'Ascq",
    startsAt: '2027-03-05T19:00:00Z',
  },
  {
    id: 'c0000016-0000-4000-8000-000000000016',
    templateType: 'match',
    title: 'Match vs Namur',
    description:
      "Aller du derby transfrontalier. Namurois en visite ; retour match prévu à Namur en avril. Supporters belges attendus — renforcer l'accueil et la billeterie. After au café voisin.",
    location: 'Le Nouveau Siècle, 45 boulevard des Cités Unies, 59000 Lille',
    startsAt: '2027-03-19T19:30:00Z',
  },
  {
    id: 'c0000017-0000-4000-8000-000000000017',
    templateType: 'deplacement',
    title: 'Déplacement Strasbourg',
    description:
      'Week-end ligue Est — deux spectacles sur la journée du samedi. Nuitée en auberge de jeunesse réservée (participation 35 €). Départ vendredi 16h00, retour dimanche soir.',
    location: 'Kafteur, 18 rue de la Krutenau, 67000 Strasbourg',
    startsAt: '2027-03-27T08:00:00Z',
  },
  {
    id: 'c0000018-0000-4000-8000-000000000018',
    templateType: 'cabaret',
    title: 'Cabaret du printemps',
    description:
      "Soirée multi-formats : match, long form court et cabaret. Trois blocs de 30 minutes avec pause unique. Programmation dévoilée le jour J — place à l'improvisation dans l'organisation aussi.",
    location: 'La Condition Publique, 14 place Faidherbe, 59100 Roubaix',
    startsAt: '2027-04-09T17:30:00Z',
  },
  {
    id: 'c0000019-0000-4000-8000-000000000019',
    templateType: 'longform',
    title: 'Long form : Polar',
    description:
      "Enquête improvisée sur une soirée entière. Personnages récurrents ; le public note ses indices sur une fiche remise à l'entrée. Durée 50 minutes sans entracte — concentration maximale.",
    location: 'Le Prato, 12 rue du Prato, 59000 Lille',
    startsAt: '2027-04-23T18:00:00Z',
  },
  {
    id: 'c0000020-0000-4000-8000-000000000020',
    templateType: 'catch',
    title: 'Apérock Mai',
    description:
      'Format festif mêlant impro et musique live. Apéro dès 18h30, premier slot à 19h30. Food trucks sur le parvis. En cas de pluie, report au dimanche suivant (même horaire).',
    location: 'Gare Saint-Sauveur, 74 avenue de Saint-Sauveur, 59000 Lille',
    startsAt: '2027-05-07T17:00:00Z',
  },
  {
    id: 'c0000021-0000-4000-8000-000000000021',
    templateType: 'custom',
    customSlots: { player: 6, mc: 1 },
    title: 'Braquage',
    description:
      'Concept braquage improvisé : six joueuses et joueurs, un fil rouge policier, twists garantis. Répétition bloquante le mercredi (19h-21h). Masques et accessoires fournis par la troupe.',
    location: 'Le Spotlight, 68 rue de la Barre, 59000 Lille',
    startsAt: '2027-05-15T17:30:00Z',
  },
  {
    id: 'c0000022-0000-4000-8000-000000000022',
    templateType: 'match',
    title: 'Match vs Belgique',
    description:
      'Retour du derby — sélection nationale belge B. Enjeu amical mais public nombreux attendu. Diffusion possible ; éviter spoilers sur les réseaux avant 22h00. Équipement audio renforcé.',
    location: 'Théâtre de la Digue, 42 rue de la Digue, 59000 Lille',
    startsAt: '2027-05-21T18:30:00Z',
  },
  {
    id: 'c0000023-0000-4000-8000-000000000023',
    templateType: 'custom',
    customSlots: { player: 4, stage_manager: 1, mc: 1 },
    title: "Commis d'Office",
    description:
      'Format cuisine / impro : quatre commis, un chef MC, régie scène pour les changements de plateau. Ingrédients mystère révélés 10 minutes avant chaque manche. Public goûte les créations en fin de show.',
    location: 'Le Grand Sud, 21 rue du Grand Sud, 59000 Lille',
    startsAt: '2027-06-04T17:30:00Z',
  },
  {
    id: 'c0000024-0000-4000-8000-000000000024',
    templateType: 'match',
    title: 'Match vs France',
    description:
      'Rencontre nationale exhibition — cadre prestigieux. Presse locale conviée ; interview possible avant le match. Tenue sombre recommandée pour la photo officielle à 19h00.',
    location: 'Opéra de Lille (salle du Nouveau Siècle), 45 boulevard des Cités Unies, 59000 Lille',
    startsAt: '2027-06-18T18:00:00Z',
  },
  {
    id: 'c0000025-0000-4000-8000-000000000025',
    templateType: 'deplacement',
    title: 'Déplacement Lyon',
    description:
      "Invité·es au festival d'été lyonnais. Créneau en fin d'après-midi pour profiter de la ville le matin. Billets TGV groupés — contacter les orgas avant le 15 juin pour la réservation.",
    location: 'Espace Gerson, 55 rue Vauban, 69006 Lyon',
    startsAt: '2027-07-03T14:00:00Z',
  },
  {
    id: 'c0000026-0000-4000-8000-000000000026',
    templateType: 'cabaret',
    title: "Cabaret d'été #1",
    description:
      'Open air improvisé dans le parc. Repas partagé type picnic à 18h00 ; spectacle à 20h00 quand la lumière baisse. Prévoir tenue décontractée et anti-moustiques. Annulé si orage.',
    location: 'Parc Jean-Baptiste Lebas, entrée rue Solférino, 59000 Lille',
    startsAt: '2027-07-10T18:00:00Z',
  },
  {
    id: 'c0000027-0000-4000-8000-000000000027',
    templateType: 'cabaret',
    title: "Cabaret d'été #2",
    description:
      'Best-of de saison : reprises des formats qui ont marché en 2026-2027. Vote du public pour le numéro de clôture. Bar mobile sur site ; paiement CB uniquement.',
    location: 'Parc Barbieux, allée du Parc, 59100 Roubaix',
    startsAt: '2027-07-24T17:00:00Z',
  },
  {
    id: 'c0000028-0000-4000-8000-000000000028',
    templateType: 'cabaret',
    title: 'Gala de clôture',
    description:
      'Finale de la saison — soirée habillée. Remise des trophées internes (vote troupe). Toutes les personnes disponibles sur les dispos seront convoquées au montage dès 16h00. Standing ovation encouragée.',
    location: 'Théâtre du Nord, 1 place Sébastopol, 59000 Lille',
    startsAt: '2027-08-06T18:30:00Z',
  },
  {
    id: 'c0000029-0000-4000-8000-000000000029',
    templateType: 'deplacement',
    title: 'Déplacement Bruxelles',
    description:
      'Clôture internationale à Bruxelles. Train 15h18 depuis Lille-Europe ; arrivée à la gare du Midi. Repas belge prévu à 18h00. Retour TGV 23h12 — qui peut propose covoiturage gare.',
    location: 'Théâtre Marni, 37 rue de la Réforme, 1050 Bruxelles',
    startsAt: '2027-08-14T15:30:00Z',
  },
  {
    id: 'c0000030-0000-4000-8000-000000000030',
    templateType: 'cabaret',
    title: "Cabaret de fin d'été",
    description:
      "After de clôture en mode décontracté. Pas de billetterie — chapeau à l'entrée. Formats libres, scène ouverte aux membres de la troupe qui n'ont pas joué au gala. Fin vers minuit.",
    location: 'Le Splendid, 68 rue de la Barre, 59000 Lille',
    startsAt: '2027-08-27T18:00:00Z',
  },
]

/**
 * Story 6.3 — composition drafts for Équipe tab QA (V19, after V18 schema).
 * participantSeq indexes into deterministic season_participants f0000001-…-0000000000NN.
 */
/** Minimal cabaret template for MVP pilot recette (5 slots). */
export const MVP_PILOT_ROLE_SLOTS = { player: 3, mc: 1, dj: 1 }

/**
 * Six linked members — enough for draw/manual/gap-fill without scrolling 32 names.
 * participantSeq indexes season_participants f0000001-…-0000000000NN.
 */
export const MVP_PILOT_CAST = [
  { seq: 1, displayName: 'Angie', userSeq: 1 },
  { seq: 5, displayName: 'Bruno', userSeq: 5 },
  { seq: 6, displayName: 'Camille', userSeq: 6 },
  { seq: 18, displayName: 'Max', userSeq: 18 },
  { seq: 28, displayName: 'Sophie', userSeq: 28 },
  { seq: 22, displayName: 'Patrice', userSeq: 22 },
]

const MVP_PILOT_USER_ID = 'd0000001-0000-4000-8000-000000000022'

/**
 * Repurposed seed events (V6 ids) — titles prefixed [MVP] for agenda search.
 * Dates: June 2026 (upcoming from local dev in May 2026).
 */
export const MVP_PILOT_EVENTS = [
  {
    id: 'c0000009-0000-4000-8000-000000000009',
    title: '[MVP] 00 · Bandeau navigation',
    description:
      'Spectacle pilote — scénario navigation-only. Aucune composition attendue ; sert à valider le bandeau et les onglets Infos / Dispos / Équipe. Lieu fictif pour recette UI.',
    location: 'Studio QA HatCast, 1 rue du Test, 59000 Lille',
    startsAt: '2026-06-03T19:30:00Z',
    scenario: 'navigation-only',
  },
  {
    id: 'c0000014-0000-4000-8000-000000000014',
    title: '[MVP] 01 · Tirage pondéré',
    description:
      'Spectacle pilote — tirage pondéré des rôles. Cast réduit à 6 membres avec dispos complètes. Vérifier les probabilités et le feedback visuel post-tirage.',
    location: 'Salle Recette A, 10 avenue des Tests, 59000 Lille',
    startsAt: '2026-06-05T20:00:00Z',
    scenario: 'draw',
  },
  {
    id: 'c0000010-0000-4000-8000-000000000010',
    title: '[MVP] 02 · Assignation manuelle',
    description:
      'Spectacle pilote — assignation manuelle slot par slot. Prévoir drag-and-drop ou sélection depuis la liste des disponibles. Horaire décalé (21h30 Paris) pour tester l\'affichage.',
    location: 'Salle Recette B, 12 avenue des Tests, 59100 Roubaix',
    startsAt: '2026-06-07T19:30:00Z',
    scenario: 'manual',
  },
  {
    id: 'c0000012-0000-4000-8000-000000000012',
    title: '[MVP] 03 · Validations en attente',
    description:
      'Spectacle pilote — équipe validée, participations PENDING. Cas nominal pour relances et badges « En attente ». Créneau en milieu de semaine, 22h30 Paris.',
    location: 'Le Laboratoire, 3 rue des Scénarios, 59000 Lille',
    startsAt: '2026-06-09T20:30:00Z',
    scenario: 'awaiting-confirmations',
  },
  {
    id: 'c0000018-0000-4000-8000-000000000018',
    title: '[MVP] 04 · Déclin et compléter',
    description:
      'Spectacle pilote — slot vacant après déclin (Sophie). Tester compléter l\'équipe et l\'historique des déclins. Matinée pour couvrir un créneau hors heures de pointe.',
    location: 'Centre Culturel QA, 5 place du Recette, 59200 Tourcoing',
    startsAt: '2026-06-11T10:30:00Z',
    scenario: 'gaps-to-fill',
  },
  {
    id: 'c0000020-0000-4000-8000-000000000020',
    title: '[MVP] 05 · Équipe complète',
    description:
      'Spectacle pilote — référence « Équipe complète » : tous les slots CONFIRMED. État cible après boucle dispos → composition → validations. Apéro fictif à 21h00 Paris.',
    location: 'La Scène Verte, 20 boulevard du Done, 59000 Lille',
    startsAt: '2026-06-13T19:00:00Z',
    scenario: 'complete',
  },
]

export const SEED_COMPOSITION_DRAFTS = [
  {
    eventId: 'c0000001-0000-4000-8000-000000000001',
    label: 'Cabaret de rentrée — brouillon non publié (test Publier)',
    publishedAt: null,
    validatedAt: null,
    slots: [
      { roleKey: 'player', slotIndex: 0, participantSeq: 1, participationStatus: 'PENDING' },
      { roleKey: 'player', slotIndex: 1, participantSeq: 2, participationStatus: 'PENDING' },
      { roleKey: 'player', slotIndex: 2, participantSeq: 3, participationStatus: 'PENDING' },
      { roleKey: 'mc', slotIndex: 0, participantSeq: 6, participationStatus: 'PENDING' },
      { roleKey: 'dj', slotIndex: 0, participantSeq: 5, participationStatus: 'PENDING' },
    ],
  },
  {
    eventId: 'c0000002-0000-4000-8000-000000000002',
    label: 'Match vs Bruxelles — brouillon non publié (line-up partielle)',
    publishedAt: null,
    validatedAt: null,
    slots: [
      { roleKey: 'player', slotIndex: 0, participantSeq: 18, participationStatus: 'PENDING' },
      { roleKey: 'player', slotIndex: 1, participantSeq: 22, participationStatus: 'PENDING' },
      { roleKey: 'player', slotIndex: 2, participantSeq: 25, participationStatus: 'PENDING' },
      { roleKey: 'player', slotIndex: 3, participantSeq: 4, participationStatus: 'PENDING' },
      { roleKey: 'player', slotIndex: 4, participantSeq: 7, participationStatus: 'PENDING' },
      { roleKey: 'mc', slotIndex: 0, participantSeq: 9, participationStatus: 'PENDING' },
      { roleKey: 'referee', slotIndex: 0, participantSeq: 12, participationStatus: 'PENDING' },
      { roleKey: 'assistant_referee', slotIndex: 0, participantSeq: 16, participationStatus: 'PENDING' },
      { roleKey: 'assistant_referee', slotIndex: 1, participantSeq: 28, participationStatus: 'PENDING' },
    ],
  },
  {
    eventId: 'c0000005-0000-4000-8000-000000000005',
    label: 'Cabaret Halloween — brouillon déjà publié (visible membres)',
    publishedAt: '2026-10-15T12:00:00Z',
    validatedAt: null,
    slots: [
      { roleKey: 'player', slotIndex: 0, participantSeq: 14, participationStatus: 'PENDING' },
      { roleKey: 'player', slotIndex: 1, participantSeq: 17, participationStatus: 'PENDING' },
      { roleKey: 'player', slotIndex: 2, participantSeq: 27, participationStatus: 'PENDING' },
      { roleKey: 'mc', slotIndex: 0, participantSeq: 21, participationStatus: 'PENDING' },
      { roleKey: 'dj', slotIndex: 0, participantSeq: 19, participationStatus: 'PENDING' },
    ],
  },
  {
    eventId: 'c0000011-0000-4000-8000-000000000011',
    label: 'Match vs Rouen — brouillon non publié (second scénario Publier)',
    publishedAt: null,
    validatedAt: null,
    slots: [
      { roleKey: 'player', slotIndex: 0, participantSeq: 10, participationStatus: 'PENDING' },
      { roleKey: 'player', slotIndex: 1, participantSeq: 11, participationStatus: 'PENDING' },
      { roleKey: 'mc', slotIndex: 0, participantSeq: 30, participationStatus: 'PENDING' },
      { roleKey: 'referee', slotIndex: 0, participantSeq: 26, participationStatus: 'PENDING' },
    ],
  },
]

export function participantIdFromSeq(seq) {
  return deterministicUuid('f0000001', seq)
}

export function compositionSlotIdFromSeq(seq) {
  return deterministicUuid('90000001', seq)
}

function mvpPilotSlotId(index) {
  return deterministicUuid('90000002', index)
}

const MVP_PILOT_EVENT_IDS = new Set(MVP_PILOT_EVENTS.map((event) => event.id))

function slugFromTitle(title) {
  const trimmed = (title || '').trim()
  if (!trimmed) return ''
  const lower = stripAccents(trimmed).toLowerCase()
  const alnum = lower.replace(/[^a-z0-9]+/g, '-')
  const collapsed = alnum.replace(/-+/g, '-').replace(/^-+|-+$/g, '')
  return collapsed.slice(0, 128)
}

/** Slugs uniques par saison — aligné sur EventSlugGenerator.allocateUniqueSlug (API). */
function allocateEventSlugs(events) {
  const used = new Set()
  return events.map((event) => {
    let base = slugFromTitle(event.title)
    if (!base) {
      base = `event-${event.id.replace(/-/g, '').slice(0, 12)}`
    }
    let n = 1
    let candidate = base
    while (used.has(candidate)) {
      n += 1
      const suffix = `-${n}`
      const maxBase = Math.max(1, 128 - suffix.length)
      candidate = base.slice(0, maxBase).replace(/-+$/, '') + suffix
    }
    used.add(candidate)
    return { ...event, slug: candidate }
  })
}

function buildSeasonEventInsertPlain(event) {
  const slots = event.roleSlots ?? slotsFor(event.templateType, event.customSlots ?? null)
  const slotsJson = JSON.stringify(slots)
  const id = sqlString(event.id)
  return [
    `INSERT INTO events (id, season_id, slug, title, description, location, starts_at, archived, template_type, role_slots, created_at, updated_at)`,
    `SELECT CAST(${id} AS uuid), CAST(${sqlString(SEED_SEASON_ID)} AS uuid), ${sqlString(event.slug)}, ${sqlString(event.title)}, ${sqlString(event.description)}, ${sqlString(event.location)}, ${sqlString(event.startsAt)}, FALSE, ${sqlString(event.templateType)}, ${sqlString(slotsJson)}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP`,
    `WHERE NOT EXISTS (SELECT 1 FROM events e WHERE e.id = CAST(${id} AS uuid));`,
  ].join('\n')
}

function buildPastEventInsertPlain(event) {
  const slots = event.roleSlots ?? slotsFor(event.templateType, event.customSlots ?? null)
  const slotsJson = JSON.stringify(slots)
  const category = event.category ? sqlString(event.category) : 'NULL'
  const archived = event.archived ? 'TRUE' : 'FALSE'
  const id = sqlString(event.id)
  return [
    `INSERT INTO events (id, season_id, slug, title, description, location, starts_at, archived, template_type, role_slots, category, created_at, updated_at)`,
    `SELECT CAST(${id} AS uuid), CAST(${sqlString(SEED_SEASON_ID)} AS uuid), ${sqlString(event.slug)}, ${sqlString(event.title)}, ${sqlString(event.description)}, ${sqlString(event.location)}, ${sqlString(event.startsAt)}, ${archived}, ${sqlString(event.templateType)}, ${sqlString(slotsJson)}, ${category}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP`,
    `WHERE NOT EXISTS (SELECT 1 FROM events e WHERE e.id = CAST(${id} AS uuid));`,
  ].join('\n')
}

function buildHistoriqueTroupeCategoryInsert() {
  return [
    'INSERT INTO troupe_categories (id, troupe_id, slug, label)',
    'SELECT',
    "    'a1000001-0000-4000-8000-000000000001',",
    "    'a0000001-0000-4000-8000-000000000001',",
    "    'deplacements',",
    "    'Déplacements'",
    'WHERE NOT EXISTS (',
    "    SELECT 1 FROM troupe_categories",
    "    WHERE troupe_id = 'a0000001-0000-4000-8000-000000000001'",
    "      AND slug = 'deplacements'",
    ');',
  ].join('\n')
}

function buildHistoriqueAvailabilityInsert(row) {
  const roleKeysJson = JSON.stringify(row.roleKeys)
  return [
    'INSERT INTO event_availability (id, event_id, user_id, season_participant_id, status, role_keys, created_at, updated_at)',
    `SELECT CAST(${sqlString(row.id)} AS uuid), CAST(${sqlString(row.eventId)} AS uuid), NULL, CAST(${sqlString(row.participantId)} AS uuid), '${row.status}', ${sqlString(roleKeysJson)}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP`,
    `WHERE NOT EXISTS (SELECT 1 FROM event_availability ea WHERE ea.id = CAST(${sqlString(row.id)} AS uuid));`,
  ].join('\n')
}

function buildHistoriqueCompositionInsert(composition) {
  const validated = composition.validatedAt ? sqlString(composition.validatedAt) : 'NULL'
  const published = composition.publishedAt ? sqlString(composition.publishedAt) : 'NULL'
  return [
    'INSERT INTO event_compositions (event_id, validated_at, published_at, created_at, updated_at)',
    `SELECT CAST(${sqlString(composition.eventId)} AS uuid), ${validated}, ${published}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP`,
    `WHERE NOT EXISTS (SELECT 1 FROM event_compositions ec WHERE ec.event_id = CAST(${sqlString(composition.eventId)} AS uuid));`,
  ].join('\n')
}

function buildHistoriqueCompositionSlotInsert(composition, slot) {
  const participantId = participantIdFromSeq(slot.participantSeq)
  return [
    'INSERT INTO event_composition_slots (id, event_id, role_key, slot_index, season_participant_id, participation_status, waived, created_at, updated_at)',
    `SELECT CAST(${sqlString(slot.id)} AS uuid), CAST(${sqlString(composition.eventId)} AS uuid), ${sqlString(slot.roleKey)}, ${slot.slotIndex}, CAST(${sqlString(participantId)} AS uuid), '${slot.status}', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP`,
    `WHERE NOT EXISTS (SELECT 1 FROM event_composition_slots ecs WHERE ecs.id = CAST(${sqlString(slot.id)} AS uuid));`,
  ].join('\n')
}

function buildHistoriquePastSqlLines() {
  const lines = [
    '-- Glossaire catégorie pour le déplacement passé (ADR-0013).',
    buildHistoriqueTroupeCategoryInsert(),
    '',
    '-- Disponibilités passées (filtres Historique).',
  ]
  for (const row of SEED_HISTORIQUE_AVAILABILITY) {
    lines.push(buildHistoriqueAvailabilityInsert(row))
  }
  lines.push('', '-- Compositions passées (Historique).')
  for (const composition of SEED_HISTORIQUE_COMPOSITIONS) {
    lines.push(buildHistoriqueCompositionInsert(composition))
    for (const slot of composition.slots) {
      lines.push(buildHistoriqueCompositionSlotInsert(composition, slot))
    }
  }
  return lines
}

function seedGenderSqlLiteral(displayName) {
  const gender = inferSeedGenderFromDisplayName(displayName)
  return gender === 'non_specified' ? 'NULL' : sqlString(gender)
}

function buildV17InsertWithSlugPlain(member) {
  const id = sqlString(member.userId)
  const gender = seedGenderSqlLiteral(member.displayName)
  return [
    `INSERT INTO users (id, google_sub, idp_uid, email, display_name, slug, gender, activated_at, created_at, updated_at)`,
    `SELECT CAST(${id} AS uuid), ${sqlString(member.googleSub)}, NULL, ${sqlString(member.obfuscatedEmail)}, ${sqlString(member.displayName)}, ${sqlString(member.slug)}, ${gender}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP`,
    `WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.id = CAST(${id} AS uuid));`,
  ].join('\n')
}

function buildImprobotsGenderBackfillLines(members) {
  const lines = [
    '',
    '-- MIG-7 : genres seed Improbots inférés du prénom (gender IS NULL seulement).',
  ]
  for (const member of members) {
    const gender = inferSeedGenderFromDisplayName(member.displayName)
    if (gender === 'non_specified') {
      continue
    }
    lines.push(
      `UPDATE users SET gender = ${sqlString(gender)}, updated_at = CURRENT_TIMESTAMP`,
      `WHERE id = ${sqlString(member.userId)} AND gender IS NULL;`,
    )
  }
  return lines
}

function buildV17MembershipInsertPlain(member) {
  const id = sqlString(member.membershipId)
  return [
    `INSERT INTO troupe_memberships (id, troupe_id, user_id, status, baseline_role, display_name, preferred_role_keys, created_at, updated_at)`,
    `SELECT CAST(${id} AS uuid), CAST(${sqlString(SEED_TROUPE_ID)} AS uuid), CAST(${sqlString(member.userId)} AS uuid), 'ACTIVE', '${member.baselineRole}', ${sqlString(member.displayName)}, '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP`,
    `WHERE NOT EXISTS (SELECT 1 FROM troupe_memberships tm WHERE tm.id = CAST(${id} AS uuid));`,
  ].join('\n')
}

function buildV17ParticipantInsertPlain(member) {
  const id = sqlString(member.participantId)
  return [
    `INSERT INTO season_participants (id, season_id, display_name, normalized_email, user_id, troupe_membership_id, status, created_at, updated_at)`,
    `SELECT CAST(${id} AS uuid), CAST(${sqlString(SEED_SEASON_ID)} AS uuid), ${sqlString(member.displayName)}, ${sqlString(member.obfuscatedEmail)}, CAST(${sqlString(member.userId)} AS uuid), CAST(${sqlString(member.membershipId)} AS uuid), 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP`,
    `WHERE NOT EXISTS (SELECT 1 FROM season_participants sp WHERE sp.id = CAST(${id} AS uuid));`,
  ].join('\n')
}

export function availabilityIdFromSeq(seq) {
  return `80000001-0000-4000-8000-${String(seq).padStart(12, '0')}`
}

function buildV17AvailabilityInsertPlain(row) {
  const roleKeysJson = JSON.stringify(row.roleKeys)
  const id = sqlString(row.id)
  return [
    `INSERT INTO event_availability (id, event_id, user_id, status, role_keys, created_at, updated_at)`,
    `SELECT CAST(${id} AS uuid), CAST(${sqlString(row.eventId)} AS uuid), CAST(${sqlString(row.userId)} AS uuid), '${row.status}', ${sqlString(roleKeysJson)}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP`,
    `WHERE NOT EXISTS (`,
    `    SELECT 1 FROM event_availability ea`,
    `    WHERE ea.event_id = CAST(${sqlString(row.eventId)} AS uuid) AND ea.user_id = CAST(${sqlString(row.userId)} AS uuid)`,
    `);`,
  ].join('\n')
}

function buildV17SeasonParticipantCountUpdatePlain() {
  return [
    'UPDATE seasons',
    'SET',
    "    participant_count = (SELECT COUNT(*) FROM season_participants sp WHERE sp.season_id = seasons.id AND sp.status = 'ACTIVE'),",
    '    updated_at = CURRENT_TIMESTAMP',
    `WHERE id = ${sqlString(SEED_SEASON_ID)};`,
  ].join('\n')
}

function buildAvailabilityOpenedAtBackfillLines() {
  return [
    '-- Story 3.21: ouvrir les dispos sur les spectacles seedés (après inserts availability).',
    'UPDATE events e',
    'SET availability_opened_at = e.created_at,',
    '    updated_at = CURRENT_TIMESTAMP',
    'WHERE availability_opened_at IS NULL',
    '  AND EXISTS (',
    '    SELECT 1',
    '    FROM event_availability ea',
    '    WHERE ea.event_id = e.id',
    '  );',
    '',
    '-- QA drafts (V47): garder deux spectacles fermés pour recette publish flow.',
    'UPDATE events',
    'SET availability_opened_at = NULL,',
    '    updated_at = CURRENT_TIMESTAMP',
    'WHERE id IN (',
    "    'c0000025-0000-4000-8000-000000000025',",
    "    'c0000026-0000-4000-8000-000000000026'",
    ');',
  ]
}

function buildV6SeasonCountUpdate() {
  return [
    '-- Maintenir les stats saison cohérentes avec les seeds.',
    'UPDATE seasons',
    'SET',
    '    event_count = (SELECT COUNT(*) FROM events e WHERE e.season_id = seasons.id AND e.archived = FALSE),',
    '    updated_at = CURRENT_TIMESTAMP',
    `WHERE id = ${sqlString(SEED_SEASON_ID)};`,
  ].join('\n')
}

/** Single idempotent dev demo seed — schéma courant (slug, season_participant_id, availability.id). */
export function buildImprobotsDevDemoSql(members, availability) {
  const seasonEvents = allocateEventSlugs(
    SEED_EVENTS.map((event) => ({
      ...event,
      roleSlots: slotsFor(event.templateType, event.customSlots ?? null),
    })),
  )
  const pastEvents = SEED_PAST_EVENTS.map((event) => ({
    ...event,
    roleSlots: slotsFor(event.templateType, event.customSlots ?? null),
  }))

  return `${[
    '-- Generated by scripts/v2/generate-improbots-seed-sql.js — do not edit by hand.',
    '-- Regenerate: npm run generate:improbots-dev-seed',
    '-- Les Improbots dev demo : events, roster, dispos, compositions, MVP pilot, Historique.',
    '-- Idempotent (NOT EXISTS) — safe on Neon reset depuis prod et sur H2 test/e2e.',
    '',
    `-- ${members.length} members, ${seasonEvents.length} season events, ${pastEvents.length} past events, ${availability.length} availability rows`,
    '',
    '-- Season events (Les Improbots 2026-2027)',
    ...seasonEvents.map((event) => buildSeasonEventInsertPlain(event)),
    '',
    '-- Past events (Historique, story 3.6b)',
    ...pastEvents.map((event) => buildPastEventInsertPlain(event)),
    '',
    '-- Users (@seed.improbots.test — members.csv gitignored)',
    ...members.flatMap((member) => buildV17InsertWithSlugPlain(member)),
    '',
    '-- Troupe memberships',
    ...members.flatMap((member) => buildV17MembershipInsertPlain(member)),
    '',
    '-- Season participants',
    ...members.flatMap((member) => buildV17ParticipantInsertPlain(member)),
    '',
    '-- Event availability (partial matrix)',
    ...availability.flatMap((row) => buildV17AvailabilityInsertPlain(row)),
    '',
    '-- Historique (catégories, dispos et compositions passées)',
    ...buildHistoriquePastSqlLines(),
    '',
    '-- Composition drafts (story 6.3)',
    ...buildCompositionSqlLines({ repair: true }),
    '',
    '-- MVP pilot recette',
    ...buildMvpPilotSqlLines({ repair: true }),
    '',
    ...buildAvailabilityOpenedAtBackfillLines(),
    '',
    ...buildImprobotsGenderBackfillLines(members),
    '',
    buildV17SeasonParticipantCountUpdatePlain(),
    buildV6SeasonCountUpdate(),
    '',
  ].join('\n')}\n`
}

export function buildFlywaySupersededVersionedStubs() {
  return SUPERSEDED_VERSIONED_SEED_FILES.map((file) => ({
    file,
    sql: `${FLYWAY_IMPROBOTS_SUPERSEDED_STUB}\n`,
  }))
}

function buildCompositionCompositionInsert(draft, { repair }) {
  const validated = draft.validatedAt ? sqlString(draft.validatedAt) : 'NULL'
  const published = draft.publishedAt ? sqlString(draft.publishedAt) : 'NULL'
  if (repair) {
    return [
      'INSERT INTO event_compositions (event_id, validated_at, published_at, created_at, updated_at)',
      `SELECT CAST(${sqlString(draft.eventId)} AS uuid), ${validated}, ${published}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP`,
      `WHERE NOT EXISTS (SELECT 1 FROM event_compositions ec WHERE ec.event_id = CAST(${sqlString(draft.eventId)} AS uuid));`,
    ].join('\n')
  }
  return (
    'INSERT INTO event_compositions (event_id, validated_at, published_at, created_at, updated_at) VALUES (' +
    `${sqlString(draft.eventId)}, ${validated}, ${published}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);`
  )
}

function buildCompositionSlotInsert(draft, slot, slotId, { repair }) {
  const participantId = participantIdFromSeq(slot.participantSeq)
  if (repair) {
    return [
      'INSERT INTO event_composition_slots (id, event_id, role_key, slot_index, season_participant_id, event_participant_id, participation_status, waived, created_at, updated_at)',
      `SELECT CAST(${sqlString(slotId)} AS uuid), CAST(${sqlString(draft.eventId)} AS uuid), ${sqlString(slot.roleKey)}, ${slot.slotIndex}, CAST(${sqlString(participantId)} AS uuid), NULL, '${slot.participationStatus}', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP`,
      `WHERE NOT EXISTS (SELECT 1 FROM event_composition_slots ecs WHERE ecs.id = CAST(${sqlString(slotId)} AS uuid));`,
    ].join('\n')
  }
  return (
    'INSERT INTO event_composition_slots (id, event_id, role_key, slot_index, participant_id, participation_status, waived, created_at, updated_at) VALUES (' +
    `${sqlString(slotId)}, ${sqlString(draft.eventId)}, ${sqlString(slot.roleKey)}, ${slot.slotIndex}, ${sqlString(participantId)}, '${slot.participationStatus}', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);`
  )
}

/** SQL lines for V19 (fresh participant_id) or R__ repair (season_participant_id, idempotent). */
export function buildCompositionSqlLines({ repair = false } = {}) {
  let slotSeq = 1
  const lines = ['-- event_compositions']
  for (const draft of SEED_COMPOSITION_DRAFTS) {
    lines.push(`-- ${draft.label}`)
    lines.push(buildCompositionCompositionInsert(draft, { repair }))
  }
  lines.push('', '-- event_composition_slots')
  for (const draft of SEED_COMPOSITION_DRAFTS) {
    for (const slot of draft.slots) {
      const slotId = compositionSlotIdFromSeq(slotSeq)
      slotSeq += 1
      lines.push(buildCompositionSlotInsert(draft, slot, slotId, { repair }))
    }
  }
  return lines
}

export function mvpPilotAvailabilityIdFromSeq(seq) {
  return `80000002-0000-4000-8000-${String(seq).padStart(12, '0')}`
}

function buildMvpAvailabilityInsert(ev, userId, availId, availRoleKeys, { repair }) {
  if (repair) {
    return [
      'INSERT INTO event_availability (id, event_id, user_id, status, role_keys, created_at, updated_at)',
      `SELECT CAST(${sqlString(availId)} AS uuid), CAST(${sqlString(ev.id)} AS uuid), CAST(${sqlString(userId)} AS uuid), 'AVAILABLE', ${sqlString(availRoleKeys)}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP`,
      'WHERE NOT EXISTS (',
      '    SELECT 1 FROM event_availability ea',
      `    WHERE ea.event_id = CAST(${sqlString(ev.id)} AS uuid) AND ea.user_id = CAST(${sqlString(userId)} AS uuid)`,
      ');',
    ].join('\n')
  }
  return `INSERT INTO event_availability (event_id, user_id, status, role_keys, created_at, updated_at) VALUES (${sqlString(ev.id)}, ${sqlString(userId)}, 'AVAILABLE', ${sqlString(availRoleKeys)}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);`
}

function buildMvpCompositionInsert(eventId, validatedAt, publishedAt, { repair }) {
  if (repair) {
    return [
      'INSERT INTO event_compositions (event_id, validated_at, published_at, created_at, updated_at)',
      `SELECT CAST(${sqlString(eventId)} AS uuid), ${sqlString(validatedAt)}, ${sqlString(publishedAt)}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP`,
      `WHERE NOT EXISTS (SELECT 1 FROM event_compositions ec WHERE ec.event_id = CAST(${sqlString(eventId)} AS uuid));`,
    ].join('\n')
  }
  return `INSERT INTO event_compositions (event_id, validated_at, published_at, created_at, updated_at) VALUES (${sqlString(eventId)}, ${sqlString(validatedAt)}, ${sqlString(publishedAt)}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);`
}

function buildMvpCompositionSlotInsert(eventId, slot, slotId, { repair }) {
  const participantId = participantIdFromSeq(slot.participantSeq)
  if (repair) {
    return [
      'INSERT INTO event_composition_slots (id, event_id, role_key, slot_index, season_participant_id, event_participant_id, participation_status, waived, created_at, updated_at)',
      `SELECT CAST(${sqlString(slotId)} AS uuid), CAST(${sqlString(eventId)} AS uuid), ${sqlString(slot.roleKey)}, ${slot.slotIndex}, CAST(${sqlString(participantId)} AS uuid), NULL, '${slot.status}', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP`,
      `WHERE NOT EXISTS (SELECT 1 FROM event_composition_slots ecs WHERE ecs.id = CAST(${sqlString(slotId)} AS uuid));`,
    ].join('\n')
  }
  return `INSERT INTO event_composition_slots (id, event_id, role_key, slot_index, season_participant_id, event_participant_id, participation_status, waived, created_at, updated_at) VALUES (${sqlString(slotId)}, ${sqlString(eventId)}, ${sqlString(slot.roleKey)}, ${slot.slotIndex}, ${sqlString(participantId)}, NULL, '${slot.status}', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);`
}

function buildMvpDeclineInsert(gapsEventId, validatedAt, { repair }) {
  const declineId = deterministicUuid('a0000002', 1)
  if (repair) {
    return [
      'INSERT INTO event_composition_declines (id, event_id, role_key, slot_index, season_participant_id, event_participant_id, declined_by_user_id, declined_at, note, created_at)',
      `SELECT CAST(${sqlString(declineId)} AS uuid), CAST(${sqlString(gapsEventId)} AS uuid), 'player', 2, CAST(${sqlString(participantIdFromSeq(28))} AS uuid), NULL, CAST(${sqlString(deterministicUuid('d0000001', 28))} AS uuid), ${sqlString(validatedAt)}, NULL, CURRENT_TIMESTAMP`,
      `WHERE NOT EXISTS (SELECT 1 FROM event_composition_declines ecd WHERE ecd.id = CAST(${sqlString(declineId)} AS uuid));`,
    ].join('\n')
  }
  return `INSERT INTO event_composition_declines (id, event_id, role_key, slot_index, season_participant_id, event_participant_id, declined_by_user_id, declined_at, note, created_at) VALUES (${sqlString(declineId)}, ${sqlString(gapsEventId)}, 'player', 2, ${sqlString(participantIdFromSeq(28))}, NULL, ${sqlString(deterministicUuid('d0000001', 28))}, ${sqlString(validatedAt)}, NULL, CURRENT_TIMESTAMP);`
}

/** SQL lines for V22 (fresh) or R__ repair (availability with id, idempotent). */
export function buildMvpPilotSqlLines({ repair = false } = {}) {
  const eventIds = MVP_PILOT_EVENTS.map((e) => e.id)
  const eventIdsSql = eventIds.map(sqlString).join(', ')
  const roleKeysJson = JSON.stringify(MVP_PILOT_ROLE_SLOTS)
  const availRoleKeys = JSON.stringify(['player', 'mc', 'dj'])
  const validatedAt = '2026-06-01T12:00:00Z'
  const publishedAt = '2026-06-01T12:00:00Z'

  const lines = [
    '-- Patrice = season organizer (canManageComposition on all season events)',
    'INSERT INTO season_organizers (season_id, user_id, granted_by_user_id, granted_at)',
    `SELECT CAST(${sqlString(SEED_SEASON_ID)} AS uuid), CAST(${sqlString(MVP_PILOT_USER_ID)} AS uuid), CAST(${sqlString(MVP_PILOT_USER_ID)} AS uuid), CURRENT_TIMESTAMP`,
    'WHERE NOT EXISTS (',
    `  SELECT 1 FROM season_organizers WHERE season_id = CAST(${sqlString(SEED_SEASON_ID)} AS uuid) AND user_id = CAST(${sqlString(MVP_PILOT_USER_ID)} AS uuid)`,
    ');',
    '',
    '-- Spectacles MVP (titles, dates, minimal role_slots)',
  ]

  for (const ev of MVP_PILOT_EVENTS) {
    lines.push(`-- ${ev.scenario}`)
    lines.push(
      `UPDATE events SET title = ${sqlString(ev.title)}, description = ${sqlString(ev.description)}, location = ${sqlString(ev.location)}, starts_at = ${sqlString(ev.startsAt)}, template_type = 'cabaret', role_slots = ${sqlString(roleKeysJson)}, updated_at = CURRENT_TIMESTAMP WHERE id = ${sqlString(ev.id)};`,
    )
  }

  lines.push('', '-- Reset availability + composition on MVP events only')
  lines.push(`DELETE FROM event_composition_declines WHERE event_id IN (${eventIdsSql});`)
  lines.push(`DELETE FROM event_composition_slots WHERE event_id IN (${eventIdsSql});`)
  lines.push(`DELETE FROM event_compositions WHERE event_id IN (${eventIdsSql});`)
  lines.push(`DELETE FROM event_availability WHERE event_id IN (${eventIdsSql});`)

  lines.push('', '-- Full availability for MVP cast (Dispo + candidature player/mc/dj)')
  let availSeq = 1
  for (const ev of MVP_PILOT_EVENTS) {
    for (const member of MVP_PILOT_CAST) {
      const userId = deterministicUuid('d0000001', member.userSeq)
      const availId = mvpPilotAvailabilityIdFromSeq(availSeq)
      availSeq += 1
      lines.push(buildMvpAvailabilityInsert(ev, userId, availId, availRoleKeys, { repair }))
    }
  }

  const awaitingEvent = MVP_PILOT_EVENTS.find((e) => e.scenario === 'awaiting-confirmations')
  const gapsEvent = MVP_PILOT_EVENTS.find((e) => e.scenario === 'gaps-to-fill')
  const completeEvent = MVP_PILOT_EVENTS.find((e) => e.scenario === 'complete')

  let slotIndex = 1
  lines.push('', '-- [MVP] 03 — validated, all slots filled, participation PENDING')
  lines.push(buildMvpCompositionInsert(awaitingEvent.id, validatedAt, publishedAt, { repair }))
  const awaitingSlots = [
    { roleKey: 'player', slotIndex: 0, participantSeq: 1, status: 'PENDING' },
    { roleKey: 'player', slotIndex: 1, participantSeq: 18, status: 'PENDING' },
    { roleKey: 'player', slotIndex: 2, participantSeq: 28, status: 'PENDING' },
    { roleKey: 'mc', slotIndex: 0, participantSeq: 6, status: 'PENDING' },
    { roleKey: 'dj', slotIndex: 0, participantSeq: 5, status: 'PENDING' },
  ]
  for (const slot of awaitingSlots) {
    lines.push(buildMvpCompositionSlotInsert(awaitingEvent.id, slot, mvpPilotSlotId(slotIndex), { repair }))
    slotIndex += 1
  }

  lines.push('', '-- [MVP] 04 — validated, gap on player slot 2 (Sophie declined)')
  lines.push(buildMvpCompositionInsert(gapsEvent.id, validatedAt, publishedAt, { repair }))
  const gapsSlots = [
    { roleKey: 'player', slotIndex: 0, participantSeq: 1, status: 'CONFIRMED' },
    { roleKey: 'player', slotIndex: 1, participantSeq: 18, status: 'PENDING' },
    { roleKey: 'mc', slotIndex: 0, participantSeq: 6, status: 'CONFIRMED' },
    { roleKey: 'dj', slotIndex: 0, participantSeq: 5, status: 'CONFIRMED' },
  ]
  for (const slot of gapsSlots) {
    lines.push(buildMvpCompositionSlotInsert(gapsEvent.id, slot, mvpPilotSlotId(slotIndex), { repair }))
    slotIndex += 1
  }
  lines.push(buildMvpDeclineInsert(gapsEvent.id, validatedAt, { repair }))

  lines.push('', '-- [MVP] 05 — validated, all CONFIRMED (reference complete state)')
  lines.push(buildMvpCompositionInsert(completeEvent.id, validatedAt, publishedAt, { repair }))
  const completeSlots = [
    { roleKey: 'player', slotIndex: 0, participantSeq: 1, status: 'CONFIRMED' },
    { roleKey: 'player', slotIndex: 1, participantSeq: 18, status: 'CONFIRMED' },
    { roleKey: 'player', slotIndex: 2, participantSeq: 28, status: 'CONFIRMED' },
    { roleKey: 'mc', slotIndex: 0, participantSeq: 6, status: 'CONFIRMED' },
    { roleKey: 'dj', slotIndex: 0, participantSeq: 5, status: 'CONFIRMED' },
  ]
  for (const slot of completeSlots) {
    lines.push(buildMvpCompositionSlotInsert(completeEvent.id, slot, mvpPilotSlotId(slotIndex), { repair }))
    slotIndex += 1
  }

  return lines
}

/** Parse user INSERT lines from an existing dev demo / legacy seed SQL file. */
export function parseLegacyUserInsertsFromV17(sql) {
  const members = []
  const valuesRe =
    /INSERT INTO users \(id, google_sub, idp_uid, email, display_name, activated_at, created_at, updated_at\) VALUES \('([^']+)', '([^']+)', NULL, '([^']+)', '((?:''|[^'])*)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP\);/g
  let match
  while ((match = valuesRe.exec(sql)) !== null) {
    const obfuscatedEmail = match[3]
    members.push({
      userId: match[1],
      googleSub: match[2],
      obfuscatedEmail,
      displayName: match[4].replace(/''/g, "'"),
      slug: obfuscatedEmail.split('@')[0],
    })
  }
  if (members.length > 0) return members

  const selectWithSlugGenderRe =
    /SELECT CAST\('([^']+)' AS uuid\), '([^']+)', NULL, '([^']+)', '((?:''|[^'])*)', '([^']+)', (?:'(male|female|non_specified)'|NULL), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP/g
  while ((match = selectWithSlugGenderRe.exec(sql)) !== null) {
    members.push({
      userId: match[1],
      googleSub: match[2],
      obfuscatedEmail: match[3],
      displayName: match[4].replace(/''/g, "'"),
      slug: match[5],
    })
  }
  if (members.length > 0) return members

  const selectWithSlugRe =
    /SELECT CAST\('([^']+)' AS uuid\), '([^']+)', NULL, '([^']+)', '((?:''|[^'])*)', '([^']+)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP/g
  while ((match = selectWithSlugRe.exec(sql)) !== null) {
    members.push({
      userId: match[1],
      googleSub: match[2],
      obfuscatedEmail: match[3],
      displayName: match[4].replace(/''/g, "'"),
      slug: match[5],
    })
  }
  if (members.length > 0) return members

  const selectRe =
    /SELECT CAST\('([^']+)' AS uuid\), '([^']+)', NULL, '([^']+)', '((?:''|[^'])*)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP/g
  while ((match = selectRe.exec(sql)) !== null) {
    const obfuscatedEmail = match[3]
    members.push({
      userId: match[1],
      googleSub: match[2],
      obfuscatedEmail,
      displayName: match[4].replace(/''/g, "'"),
      slug: obfuscatedEmail.split('@')[0],
    })
  }
  return members
}

/** Parse dependent rows (memberships, participants) from dev demo / legacy seed SQL. */
export function parseLegacyMalicieMembersFromV17(sql) {
  const users = parseLegacyUserInsertsFromV17(sql)
  const byUserId = new Map(users.map((user, index) => {
    const seq = index + 1
    return [user.userId, {
      ...user,
      membershipId: deterministicUuid('e0000001', seq),
      participantId: deterministicUuid('f0000001', seq),
      baselineRole: 'MEMBER',
    }]
  }))
  const membershipValuesRe =
    /INSERT INTO troupe_memberships \(id, troupe_id, user_id, status, baseline_role, display_name, preferred_role_keys, created_at, updated_at\) VALUES \('([^']+)', '[^']+', '([^']+)', 'ACTIVE', '([^']+)', '((?:''|[^'])*)', '\[\]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP\);/g
  let match
  while ((match = membershipValuesRe.exec(sql)) !== null) {
    const user = byUserId.get(match[2])
    if (!user) continue
    user.membershipId = match[1]
    user.baselineRole = match[3]
    user.displayName = match[4].replace(/''/g, "'")
  }
  const membershipSelectRe =
    /SELECT CAST\('([^']+)' AS uuid\), CAST\('[^']+' AS uuid\), CAST\('([^']+)' AS uuid\), 'ACTIVE', '([^']+)', '((?:''|[^'])*)', '\[\]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP/g
  while ((match = membershipSelectRe.exec(sql)) !== null) {
    const user = byUserId.get(match[2])
    if (!user) continue
    user.membershipId = match[1]
    user.baselineRole = match[3]
    user.displayName = match[4].replace(/''/g, "'")
  }
  const participantValuesRe =
    /INSERT INTO season_participants \(id, season_id, display_name, normalized_email, user_id, troupe_membership_id, status, created_at, updated_at\) VALUES \('([^']+)', '[^']+', '((?:''|[^'])*)', '([^']+)', '([^']+)', '([^']+)', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP\);/g
  while ((match = participantValuesRe.exec(sql)) !== null) {
    const user = byUserId.get(match[4])
    if (!user) continue
    user.participantId = match[1]
    user.obfuscatedEmail = match[3]
  }
  const participantSelectRe =
    /SELECT CAST\('([^']+)' AS uuid\), CAST\('[^']+' AS uuid\), '((?:''|[^'])*)', '([^']+)', CAST\('([^']+)' AS uuid\), CAST\('([^']+)' AS uuid\), 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP/g
  while ((match = participantSelectRe.exec(sql)) !== null) {
    const user = byUserId.get(match[4])
    if (!user) continue
    user.participantId = match[1]
    user.obfuscatedEmail = match[3]
  }
  return [...byUserId.values()].filter((member) => member.membershipId && member.participantId)
}

export function parseLegacyAvailabilityFromV17(sql) {
  const withIdRe =
    /INSERT INTO event_availability \(id, event_id, user_id, status, role_keys, created_at, updated_at\)\s+SELECT CAST\('([^']+)' AS uuid\), CAST\('([^']+)' AS uuid\), CAST\('([^']+)' AS uuid\), '([^']+)', '((?:''|\\'|[^'])*)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP/g
  const rows = []
  let match
  while ((match = withIdRe.exec(sql)) !== null) {
    rows.push({
      id: match[1],
      eventId: match[2],
      userId: match[3],
      status: match[4],
      roleKeys: JSON.parse(match[5].replace(/''/g, "'")),
    })
  }
  if (rows.length > 0) return rows

  const valuesRe =
    /INSERT INTO event_availability \(event_id, user_id, status, role_keys, created_at, updated_at\) VALUES \('([^']+)', '([^']+)', '([^']+)', '((?:''|\\'|[^'])*)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP\);/g
  while ((match = valuesRe.exec(sql)) !== null) {
    rows.push({
      eventId: match[1],
      userId: match[2],
      status: match[3],
      roleKeys: JSON.parse(match[4].replace(/''/g, "'")),
    })
  }
  if (rows.length === 0) {
    const selectRe =
      /INSERT INTO event_availability \(event_id, user_id, status, role_keys, created_at, updated_at\)\s+SELECT CAST\('([^']+)' AS uuid\), CAST\('([^']+)' AS uuid\), '([^']+)', '((?:''|\\'|[^'])*)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP/g
    while ((match = selectRe.exec(sql)) !== null) {
      rows.push({
        eventId: match[1],
        userId: match[2],
        status: match[3],
        roleKeys: JSON.parse(match[4].replace(/''/g, "'")),
      })
    }
  }
  return rows.map((row, index) => ({
    ...row,
    id: row.id ?? availabilityIdFromSeq(index + 1),
  }))
}

export function sqlString(value) {
  if (value == null) return 'NULL'
  return `'${String(value).replace(/'/g, "''")}'`
}

export function stripAccents(text) {
  return text.normalize('NFD').replace(/\p{M}/gu, '')
}

/** First word of display name — seed gender inference (MIG-7). */
export function firstTokenFromDisplayName(displayName) {
  const trimmed = (displayName || '').trim()
  if (!trimmed) return ''
  const token = trimmed.split(/[\s+]+/)[0] ?? ''
  return stripAccents(token.replace(/[.,]+$/g, '')).toLowerCase()
}

const SEED_FEMALE_FIRST_NAMES = new Set([
  'angie',
  'anneke',
  'camille',
  'celine',
  'charlene',
  'emilie',
  'eve',
  'gigi',
  'helene',
  'laetita',
  'laura',
  'marjo',
  'sandrine',
  'sophie',
  'stephanie',
  'vero',
  'viviane',
])

const SEED_MALE_FIRST_NAMES = new Set([
  'antoine',
  'aurelien',
  'bruno',
  'edouard',
  'fermin',
  'max',
  'nico',
  'nicolas',
  'olivier',
  'patrice',
  'patrick',
  'pierrick',
  'rachid',
  'will',
])

/**
 * Infer male/female for fictitious seed personas from given name.
 * Returns `non_specified` when unknown — composition parity hint stays hidden.
 */
export function inferSeedGenderFromDisplayName(displayName) {
  const lower = (displayName || '').trim().toLowerCase()
  if (lower.includes('auryl')) {
    return 'male'
  }
  const token = firstTokenFromDisplayName(displayName)
  if (!token) {
    return 'non_specified'
  }
  if (SEED_FEMALE_FIRST_NAMES.has(token)) {
    return 'female'
  }
  if (SEED_MALE_FIRST_NAMES.has(token)) {
    return 'male'
  }
  if (token.endsWith('a') || token.endsWith('e') || token.endsWith('ine')) {
    return 'female'
  }
  if (token.endsWith('o') || token.endsWith('as') || token.endsWith('el') || token.endsWith('ien')) {
    return 'male'
  }
  return 'non_specified'
}

export function slugFromDisplayName(displayName) {
  const trimmed = (displayName || '').trim()
  const lower = stripAccents(trimmed).toLowerCase()
  if (lower.includes('auryl')) return 'auryl'
  const slug = lower
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'member'
}

export function assignObfuscatedEmails(members) {
  const used = new Set()
  return members.map((member) => {
    let base = slugFromDisplayName(member.displayName)
    let candidate = base
    let suffix = 2
    while (used.has(candidate)) {
      candidate = `${base}-${suffix}`
      suffix += 1
    }
    used.add(candidate)
    return {
      ...member,
      obfuscatedEmail: `${candidate}@${SEED_EMAIL_DOMAIN}`,
      slug: candidate,
    }
  })
}

export function parseMembersCsv(csvText) {
  const lines = csvText.trim().split(/\r?\n/)
  if (lines.length < 2) return []
  const header = lines[0].split(',').map((h) => h.trim())
  const emailIdx = header.indexOf('email')
  const nameIdx = header.indexOf('displayName')
  const roleIdx = header.indexOf('baselineRole')
  if (emailIdx < 0 || nameIdx < 0) {
    throw new Error('members.csv must contain email and displayName columns')
  }
  const rows = []
  for (let i = 1; i < lines.length; i += 1) {
    const line = lines[i].trim()
    if (!line) continue
    const cols = line.split(',')
    const displayName = cols[nameIdx]?.trim()
    if (!displayName) continue
    const baselineRole = (cols[roleIdx]?.trim() || 'MEMBER').toUpperCase()
    rows.push({
      displayName,
      baselineRole: baselineRole === 'TROUPE_ADMIN' ? 'TROUPE_ADMIN' : 'MEMBER',
    })
  }
  return rows
}

export function emptySlots() {
  return Object.fromEntries(ROLE_KEYS.map((k) => [k, 0]))
}

export function slotsFor(templateType, customSlots = null) {
  const base = emptySlots()
  const partial = customSlots ?? ROLE_PRESETS[templateType] ?? {}
  for (const [key, count] of Object.entries(partial)) {
    if (ROLE_KEYS.includes(key)) base[key] = count
  }
  return base
}

export function rolesWithSlots(slots) {
  return ROLE_KEYS.filter((k) => (slots[k] ?? 0) > 0)
}

export function deterministicUuid(prefix, index) {
  const nn = String(index).padStart(2, '0')
  return `${prefix}-0000-4000-8000-0000000000${nn}`
}

export function shouldHaveAvailability(userIndex, eventIndex) {
  const h = (userIndex * 17 + eventIndex * 13) % 100
  return h < 65
}

export function isUnavailable(userIndex, eventIndex) {
  const h = (userIndex * 31 + eventIndex * 7) % 100
  return h < 25
}

const MATCH_ROLE_VARIANTS = [
  ['player', 'volunteer'],
  ['referee'],
  ['assistant_referee'],
  ['mc'],
  [],
  ['volunteer'],
]

const STAGE_ROLE_VARIANTS = [
  ['player'],
  ['player', 'mc'],
  ['dj'],
  ['player', 'dj'],
  ['mc'],
  [],
]

export function pickRoleKeys(userIndex, eventIndex, templateType, slots) {
  const positive = rolesWithSlots(slots)
  if (positive.length === 0) return []

  const pick = (variants) => variants[(userIndex + eventIndex) % variants.length]

  if (templateType === 'match') {
    return pick(MATCH_ROLE_VARIANTS)
  }
  if (templateType === 'deplacement') {
    return pick([['player'], []])
  }
  if (templateType === 'custom') {
    if (positive.length === 1) return [positive[0]]
    const idx = (userIndex * 3 + eventIndex) % positive.length
    const count = 1 + ((userIndex + eventIndex) % Math.min(2, positive.length))
    const keys = []
    for (let i = 0; i < count; i += 1) {
      keys.push(positive[(idx + i) % positive.length])
    }
    return [...new Set(keys)]
  }
  return pick(STAGE_ROLE_VARIANTS)
}

export function buildAvailabilityRows(members, events) {
  const rows = []
  for (let ui = 0; ui < members.length; ui += 1) {
    for (let ei = 0; ei < events.length; ei += 1) {
      if (!shouldHaveAvailability(ui, ei)) continue
      const event = events[ei]
      const slots = slotsFor(event.templateType, event.customSlots ?? null)
      if (isUnavailable(ui, ei)) {
        rows.push({
          id: availabilityIdFromSeq(rows.length + 1),
          eventId: event.id,
          userId: members[ui].userId,
          status: 'UNAVAILABLE',
          roleKeys: [],
        })
      } else {
        rows.push({
          id: availabilityIdFromSeq(rows.length + 1),
          eventId: event.id,
          userId: members[ui].userId,
          status: 'AVAILABLE',
          roleKeys: pickRoleKeys(ui, ei, event.templateType, slots),
        })
      }
    }
  }
  return rows
}

export function buildMembersWithIds(obfuscatedMembers) {
  return obfuscatedMembers.map((member, index) => {
    const seq = index + 1
    return {
      ...member,
      userId: deterministicUuid('d0000001', seq),
      membershipId: deterministicUuid('e0000001', seq),
      participantId: deterministicUuid('f0000001', seq),
      googleSub: `seed-improbots-${String(seq).padStart(2, '0')}`,
    }
  })
}

function parseArgs() {
  const args = process.argv.slice(2)
  let input = join(REPO_ROOT, 'members.csv')
  let devDemoOutput = join(
    REPO_ROOT,
    'services/api/src/main/resources/db/seed-postgresql/R__seed_improbots_dev_demo.sql',
  )
  let seedDir = join(REPO_ROOT, 'services/api/src/main/resources/db/seed')
  for (const arg of args) {
    if (arg.startsWith('--input=')) input = arg.slice(8)
    else if (arg.startsWith('--dev-demo-output=')) devDemoOutput = arg.slice(18)
  }
  return { input, devDemoOutput, seedDir }
}

function loadMembersAndAvailability(input, devDemoOutput) {
  let parsed = []
  try {
    parsed = parseMembersCsv(readFileSync(input, 'utf8'))
  } catch (err) {
    if (err.code !== 'ENOENT') throw err
  }

  if (parsed.length > 0) {
    const obfuscated = assignObfuscatedEmails(parsed)
    const members = buildMembersWithIds(obfuscated)
    const events = SEED_EVENTS.map((event) => ({
      ...event,
      roleSlots: slotsFor(event.templateType, event.customSlots ?? null),
    }))
    return { members, availability: buildAvailabilityRows(members, events) }
  }

  const fallbackPaths = [
    devDemoOutput,
    join(REPO_ROOT, 'services/api/src/main/resources/db/seed/V17__seed_malice_members_events_availability.sql'),
  ]
  for (const path of fallbackPaths) {
    try {
      const sql = readFileSync(path, 'utf8')
      const members = parseLegacyMalicieMembersFromV17(sql)
      if (members.length === 0) continue
      const availability = parseLegacyAvailabilityFromV17(sql)
      console.error(`No members in ${input} — loaded ${members.length} members from ${path}`)
      return { members, availability }
    } catch (err) {
      if (err.code !== 'ENOENT') throw err
    }
  }

  throw new Error(`No members in ${input} and no existing dev demo seed to parse`)
}

function main() {
  const { input, devDemoOutput, seedDir } = parseArgs()
  const { members, availability } = loadMembersAndAvailability(input, devDemoOutput)

  mkdirSync(dirname(devDemoOutput), { recursive: true })
  writeFileSync(devDemoOutput, buildImprobotsDevDemoSql(members, availability), 'utf8')
  console.error(`Wrote ${devDemoOutput}`)

  for (const { file, sql } of buildFlywaySupersededVersionedStubs()) {
    const path = join(seedDir, file)
    writeFileSync(path, sql, 'utf8')
    console.error(`Wrote ${path}`)
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
