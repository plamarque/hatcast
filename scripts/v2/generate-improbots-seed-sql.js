/**
 * Generates Flyway V17 seed SQL for Les Improbots dev season:
 * - ~32 troupe members from members.csv (obfuscated emails)
 * - Event template_type + role_slots for all 30 seed events
 * - Partial realistic event_availability matrix
 *
 * Usage:
 *   node scripts/v2/generate-improbots-seed-sql.js
 *   node scripts/v2/generate-improbots-seed-sql.js --input=members.csv --output=services/api/src/main/resources/db/seed/V17__seed_improbots_members_events_availability.sql
 *
 * Regenerate after editing members.csv (gitignored at repo root — PII).
 * Only the generated SQL (obfuscated emails) is committed.
 */

import { readFileSync, writeFileSync } from 'fs'
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
  match: { player: 5, mc: 1, referee: 1, assistant_referee: 2, volunteer: 5 },
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

function eventDetailsUpdateSql(event) {
  return (
    `UPDATE events SET title = ${sqlString(event.title)}, description = ${sqlString(event.description)}, ` +
    `location = ${sqlString(event.location)}, starts_at = ${sqlString(event.startsAt)}, updated_at = CURRENT_TIMESTAMP ` +
    `WHERE id = ${sqlString(event.id)};`
  )
}

/** Flyway V6 — INSERT initial des 30 spectacles saison Les Improbots. */
export function buildImprobotsEventsV6Sql() {
  const valueRows = SEED_EVENTS.map((event) => {
    return (
      `    (${sqlString(event.id)}, ${sqlString(SEED_SEASON_ID)}, ${sqlString(event.title)}, ${sqlString(event.description)}, ` +
      `${sqlString(event.location)}, ${sqlString(event.startsAt)}, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
    )
  })

  return `${[
    '-- Seed dev/test : saison complète (~30 spectacles) pour Les Improbots 2026-2027',
    '-- Objectif: alimenter l\'écran saison/agenda avec un volume réaliste (2 à 4 événements / mois).',
    '-- Saison seed : b0000001-0000-4000-8000-000000000001 (V4).',
    '-- Généré par scripts/v2/generate-improbots-seed-sql.js — regénérer: npm run generate:improbots-events-seed',
    '-- Pas de colonne slug ici : V6 s\'exécute avant db/migration V24 qui backfill events.slug depuis title.',
    '',
    'INSERT INTO events (id, season_id, title, description, location, starts_at, archived, created_at, updated_at)',
    'VALUES',
    valueRows.join(',\n'),
    ';',
    '',
    '-- Maintenir les stats saison cohérentes avec les seeds.',
    'UPDATE seasons',
    'SET',
    '    event_count = (SELECT COUNT(*) FROM events e WHERE e.season_id = seasons.id AND e.archived = FALSE),',
    '    updated_at = CURRENT_TIMESTAMP',
    `WHERE id = ${sqlString(SEED_SEASON_ID)};`,
    '',
  ].join('\n')}\n`
}

/** Flyway V49 — enrichit descriptions, lieux et horaires (bases dev déjà migrées). */
export function buildImprobotsEventsEnrichmentSql() {
  const seasonEvents = SEED_EVENTS.filter((event) => !MVP_PILOT_EVENT_IDS.has(event.id))
  const lines = [
    '-- Generated by scripts/v2/generate-improbots-seed-sql.js — do not edit by hand.',
    '-- Regenerate: npm run generate:improbots-events-seed',
    '-- Descriptions, lieux et horaires variés pour QA UI (onglet Infos, cartes agenda).',
    '-- Exclut les spectacles [MVP] (V22) — métadonnées MVP dans le générateur MVP.',
    '',
    `-- ${seasonEvents.length} spectacles saison + ${SEED_PAST_EVENTS.length} passés (V26)`,
    '',
  ]

  for (const event of seasonEvents) {
    lines.push(`-- ${event.title}`)
    lines.push(eventDetailsUpdateSql(event))
  }

  lines.push('', '-- Spectacles passés (Historique, V26)')
  for (const event of SEED_PAST_EVENTS) {
    lines.push(`-- ${event.title}`)
    lines.push(eventDetailsUpdateSql(event))
  }

  lines.push('')
  return `${lines.join('\n')}\n`
}

/**
 * Flyway V22 — MVP pilot recette: 6 spectacles, dispos complètes, états de composition ciblés.
 */
export function buildMalicieMvpPilotSeedSql() {
  const eventIds = MVP_PILOT_EVENTS.map((e) => e.id)
  const roleKeysJson = JSON.stringify(MVP_PILOT_ROLE_SLOTS)
  const availRoleKeys = JSON.stringify(['player', 'mc', 'dj'])
  const lines = [
    '-- Generated by scripts/v2/generate-improbots-seed-sql.js — do not edit by hand.',
    '-- Regenerate: npm run generate:improbots-mvp-pilot-seed',
    '-- MVP pilot: one admin (Patrice) validates composition flows with proxy dispos/confirmations.',
    '',
    `-- ${MVP_PILOT_EVENTS.length} events, cast of ${MVP_PILOT_CAST.length}, 5 slots per spectacle`,
    '',
    '-- Patrice = season organizer (canManageComposition on all season events)',
    `INSERT INTO season_organizers (season_id, user_id, granted_by_user_id, granted_at)`,
    `SELECT ${sqlString(SEED_SEASON_ID)}, ${sqlString(MVP_PILOT_USER_ID)}, ${sqlString(MVP_PILOT_USER_ID)}, CURRENT_TIMESTAMP`,
    `WHERE NOT EXISTS (`,
    `  SELECT 1 FROM season_organizers WHERE season_id = ${sqlString(SEED_SEASON_ID)} AND user_id = ${sqlString(MVP_PILOT_USER_ID)}`,
    `);`,
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
  lines.push(
    `DELETE FROM event_composition_declines WHERE event_id IN (${eventIds.map(sqlString).join(', ')});`,
  )
  lines.push(
    `DELETE FROM event_composition_slots WHERE event_id IN (${eventIds.map(sqlString).join(', ')});`,
  )
  lines.push(
    `DELETE FROM event_compositions WHERE event_id IN (${eventIds.map(sqlString).join(', ')});`,
  )
  lines.push(
    `DELETE FROM event_availability WHERE event_id IN (${eventIds.map(sqlString).join(', ')});`,
  )

  lines.push('', '-- Full availability for MVP cast (Dispo + candidature player/mc/dj)')
  for (const ev of MVP_PILOT_EVENTS) {
    for (const member of MVP_PILOT_CAST) {
      const userId = deterministicUuid('d0000001', member.userSeq)
      lines.push(
        `INSERT INTO event_availability (event_id, user_id, status, role_keys, created_at, updated_at) VALUES (${sqlString(ev.id)}, ${sqlString(userId)}, 'AVAILABLE', ${sqlString(availRoleKeys)}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);`,
      )
    }
  }

  const validatedAt = '2026-06-01T12:00:00Z'
  const publishedAt = '2026-06-01T12:00:00Z'
  let slotIndex = 1

  const awaitingEvent = MVP_PILOT_EVENTS.find((e) => e.scenario === 'awaiting-confirmations')
  const gapsEvent = MVP_PILOT_EVENTS.find((e) => e.scenario === 'gaps-to-fill')
  const completeEvent = MVP_PILOT_EVENTS.find((e) => e.scenario === 'complete')

  lines.push('', '-- [MVP] 03 — validated, all slots filled, participation PENDING')
  lines.push(
    `INSERT INTO event_compositions (event_id, validated_at, published_at, created_at, updated_at) VALUES (${sqlString(awaitingEvent.id)}, ${sqlString(validatedAt)}, ${sqlString(publishedAt)}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);`,
  )
  const awaitingSlots = [
    { roleKey: 'player', slotIndex: 0, participantSeq: 1, status: 'PENDING' },
    { roleKey: 'player', slotIndex: 1, participantSeq: 18, status: 'PENDING' },
    { roleKey: 'player', slotIndex: 2, participantSeq: 28, status: 'PENDING' },
    { roleKey: 'mc', slotIndex: 0, participantSeq: 6, status: 'PENDING' },
    { roleKey: 'dj', slotIndex: 0, participantSeq: 5, status: 'PENDING' },
  ]
  for (const slot of awaitingSlots) {
    lines.push(
      `INSERT INTO event_composition_slots (id, event_id, role_key, slot_index, season_participant_id, event_participant_id, participation_status, waived, created_at, updated_at) VALUES (${sqlString(mvpPilotSlotId(slotIndex))}, ${sqlString(awaitingEvent.id)}, ${sqlString(slot.roleKey)}, ${slot.slotIndex}, ${sqlString(participantIdFromSeq(slot.participantSeq))}, NULL, '${slot.status}', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);`,
    )
    slotIndex += 1
  }

  lines.push('', '-- [MVP] 04 — validated, gap on player slot 2 (Sophie declined)')
  lines.push(
    `INSERT INTO event_compositions (event_id, validated_at, published_at, created_at, updated_at) VALUES (${sqlString(gapsEvent.id)}, ${sqlString(validatedAt)}, ${sqlString(publishedAt)}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);`,
  )
  const gapsSlots = [
    { roleKey: 'player', slotIndex: 0, participantSeq: 1, status: 'CONFIRMED' },
    { roleKey: 'player', slotIndex: 1, participantSeq: 18, status: 'PENDING' },
    { roleKey: 'mc', slotIndex: 0, participantSeq: 6, status: 'CONFIRMED' },
    { roleKey: 'dj', slotIndex: 0, participantSeq: 5, status: 'CONFIRMED' },
  ]
  for (const slot of gapsSlots) {
    lines.push(
      `INSERT INTO event_composition_slots (id, event_id, role_key, slot_index, season_participant_id, event_participant_id, participation_status, waived, created_at, updated_at) VALUES (${sqlString(mvpPilotSlotId(slotIndex))}, ${sqlString(gapsEvent.id)}, ${sqlString(slot.roleKey)}, ${slot.slotIndex}, ${sqlString(participantIdFromSeq(slot.participantSeq))}, NULL, '${slot.status}', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);`,
    )
    slotIndex += 1
  }
  lines.push(
    `INSERT INTO event_composition_declines (id, event_id, role_key, slot_index, season_participant_id, event_participant_id, declined_by_user_id, declined_at, note, created_at) VALUES (${sqlString(deterministicUuid('a0000002', 1))}, ${sqlString(gapsEvent.id)}, 'player', 2, ${sqlString(participantIdFromSeq(28))}, NULL, ${sqlString(deterministicUuid('d0000001', 28))}, ${sqlString(validatedAt)}, NULL, CURRENT_TIMESTAMP);`,
  )

  lines.push('', '-- [MVP] 05 — validated, all CONFIRMED (reference complete state)')
  lines.push(
    `INSERT INTO event_compositions (event_id, validated_at, published_at, created_at, updated_at) VALUES (${sqlString(completeEvent.id)}, ${sqlString(validatedAt)}, ${sqlString(publishedAt)}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);`,
  )
  const completeSlots = [
    { roleKey: 'player', slotIndex: 0, participantSeq: 1, status: 'CONFIRMED' },
    { roleKey: 'player', slotIndex: 1, participantSeq: 18, status: 'CONFIRMED' },
    { roleKey: 'player', slotIndex: 2, participantSeq: 28, status: 'CONFIRMED' },
    { roleKey: 'mc', slotIndex: 0, participantSeq: 6, status: 'CONFIRMED' },
    { roleKey: 'dj', slotIndex: 0, participantSeq: 5, status: 'CONFIRMED' },
  ]
  for (const slot of completeSlots) {
    lines.push(
      `INSERT INTO event_composition_slots (id, event_id, role_key, slot_index, season_participant_id, event_participant_id, participation_status, waived, created_at, updated_at) VALUES (${sqlString(mvpPilotSlotId(slotIndex))}, ${sqlString(completeEvent.id)}, ${sqlString(slot.roleKey)}, ${slot.slotIndex}, ${sqlString(participantIdFromSeq(slot.participantSeq))}, NULL, '${slot.status}', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);`,
    )
    slotIndex += 1
  }

  lines.push('')
  return `${lines.join('\n')}\n`
}

export function buildMalicieCompositionSeedSql() {
  let slotSeq = 1
  const slotCount = SEED_COMPOSITION_DRAFTS.reduce((n, d) => n + d.slots.length, 0)
  const lines = [
    '-- Generated by scripts/v2/generate-improbots-seed-sql.js — do not edit by hand.',
    '-- Regenerate: npm run generate:improbots-composition-seed',
    '-- Story 6.3: draft compositions for Équipe tab QA (requires V18 event_compositions tables).',
    '',
    `-- ${SEED_COMPOSITION_DRAFTS.length} compositions, ${slotCount} assigned slots`,
    '',
    '-- event_compositions',
  ]

  for (const draft of SEED_COMPOSITION_DRAFTS) {
    lines.push(`-- ${draft.label}`)
    lines.push(
      'INSERT INTO event_compositions (event_id, validated_at, published_at, created_at, updated_at) VALUES (' +
        `${sqlString(draft.eventId)}, ${draft.validatedAt ? sqlString(draft.validatedAt) : 'NULL'}, ${draft.publishedAt ? sqlString(draft.publishedAt) : 'NULL'}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);`,
    )
  }

  lines.push('', '-- event_composition_slots')
  for (const draft of SEED_COMPOSITION_DRAFTS) {
    for (const slot of draft.slots) {
      const slotId = compositionSlotIdFromSeq(slotSeq)
      const participantId = participantIdFromSeq(slot.participantSeq)
      slotSeq += 1
      lines.push(
        'INSERT INTO event_composition_slots (id, event_id, role_key, slot_index, participant_id, participation_status, waived, created_at, updated_at) VALUES (' +
          `${sqlString(slotId)}, ${sqlString(draft.eventId)}, ${sqlString(slot.roleKey)}, ${slot.slotIndex}, ${sqlString(participantId)}, '${slot.participationStatus}', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);`,
      )
    }
  }

  lines.push('')
  return `${lines.join('\n')}\n`
}

export function sqlString(value) {
  if (value == null) return 'NULL'
  return `'${String(value).replace(/'/g, "''")}'`
}

export function stripAccents(text) {
  return text.normalize('NFD').replace(/\p{M}/gu, '')
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
          eventId: event.id,
          userId: members[ui].userId,
          status: 'UNAVAILABLE',
          roleKeys: [],
        })
      } else {
        rows.push({
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

export function buildMalicieSeedSql(membersCsvText) {
  const parsed = parseMembersCsv(membersCsvText)
  const obfuscated = assignObfuscatedEmails(parsed)
  const members = buildMembersWithIds(obfuscated)
  const events = SEED_EVENTS.map((e) => ({
    ...e,
    roleSlots: slotsFor(e.templateType, e.customSlots ?? null),
  }))
  const availability = buildAvailabilityRows(members, events)

  const lines = [
    '-- Generated by scripts/v2/generate-improbots-seed-sql.js — do not edit by hand.',
    '-- Regenerate: node scripts/v2/generate-improbots-seed-sql.js',
    '-- Emails are obfuscated (@seed.improbots.test); members.csv at repo root is gitignored.',
    '',
    `-- ${members.length} users, ${events.length} event type updates, ${availability.length} availability rows`,
    '',
  ]

  lines.push('-- Users')
  for (const m of members) {
    lines.push(
      `INSERT INTO users (id, google_sub, idp_uid, email, display_name, activated_at, created_at, updated_at) VALUES (` +
        `${sqlString(m.userId)}, ${sqlString(m.googleSub)}, NULL, ${sqlString(m.obfuscatedEmail)}, ${sqlString(m.displayName)}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);`,
    )
  }

  lines.push('', '-- Troupe memberships (Les Improbots)')
  for (const m of members) {
    lines.push(
      `INSERT INTO troupe_memberships (id, troupe_id, user_id, status, baseline_role, display_name, preferred_role_keys, created_at, updated_at) VALUES (` +
        `${sqlString(m.membershipId)}, ${sqlString(SEED_TROUPE_ID)}, ${sqlString(m.userId)}, 'ACTIVE', '${m.baselineRole}', ${sqlString(m.displayName)}, '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);`,
    )
  }

  lines.push('', '-- Season participants')
  for (const m of members) {
    lines.push(
      `INSERT INTO season_participants (id, season_id, display_name, normalized_email, user_id, troupe_membership_id, status, created_at, updated_at) VALUES (` +
        `${sqlString(m.participantId)}, ${sqlString(SEED_SEASON_ID)}, ${sqlString(m.displayName)}, ${sqlString(m.obfuscatedEmail)}, ${sqlString(m.userId)}, ${sqlString(m.membershipId)}, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);`,
    )
  }

  lines.push('', '-- Event types and role slots')
  for (const event of events) {
    const slotsJson = JSON.stringify(event.roleSlots)
    lines.push(
      `UPDATE events SET template_type = ${sqlString(event.templateType)}, role_slots = ${sqlString(slotsJson)}, updated_at = CURRENT_TIMESTAMP WHERE id = ${sqlString(event.id)};`,
    )
  }

  lines.push('', '-- Event availability (partial matrix)')
  for (const row of availability) {
    const roleKeysJson = JSON.stringify(row.roleKeys)
    lines.push(
      `INSERT INTO event_availability (event_id, user_id, status, role_keys, created_at, updated_at) VALUES (` +
        `${sqlString(row.eventId)}, ${sqlString(row.userId)}, '${row.status}', ${sqlString(roleKeysJson)}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);`,
    )
  }

  lines.push(
    '',
    'UPDATE seasons',
    'SET',
    "    participant_count = (SELECT COUNT(*) FROM season_participants sp WHERE sp.season_id = seasons.id AND sp.status = 'ACTIVE'),",
    '    updated_at = CURRENT_TIMESTAMP',
    `WHERE id = ${sqlString(SEED_SEASON_ID)};`,
    '',
  )

  return `${lines.join('\n')}\n`
}

function parseArgs() {
  const args = process.argv.slice(2)
  let input = join(REPO_ROOT, 'members.csv')
  let output = join(
    REPO_ROOT,
    'services/api/src/main/resources/db/seed/V17__seed_malice_members_events_availability.sql',
  )
  let compositionOutput = join(
    REPO_ROOT,
    'services/api/src/main/resources/db/seed/V19__seed_malice_composition_drafts.sql',
  )
  let compositionOnly = false
  let mvpPilotOnly = false
  let eventsSeedOnly = false
  let mvpPilotOutput = join(
    REPO_ROOT,
    'services/api/src/main/resources/db/seed/V22__seed_mvp_pilot_recette.sql',
  )
  let eventsV6Output = join(
    REPO_ROOT,
    'services/api/src/main/resources/db/seed/V6__seed_events_la_malice_2026_2027.sql',
  )
  let eventsEnrichmentOutput = join(
    REPO_ROOT,
    'services/api/src/main/resources/db/seed/V49__seed_improbots_event_details.sql',
  )
  for (const arg of args) {
    if (arg.startsWith('--input=')) input = arg.slice(8)
    else if (arg.startsWith('--output=')) output = arg.slice(9)
    else if (arg.startsWith('--composition-output=')) compositionOutput = arg.slice(21)
    else if (arg.startsWith('--mvp-pilot-output=')) mvpPilotOutput = arg.slice(19)
    else if (arg.startsWith('--events-v6-output=')) eventsV6Output = arg.slice(19)
    else if (arg.startsWith('--events-enrichment-output=')) eventsEnrichmentOutput = arg.slice(27)
    else if (arg === '--composition-only') compositionOnly = true
    else if (arg === '--mvp-pilot-only') mvpPilotOnly = true
    else if (arg === '--events-seed-only') eventsSeedOnly = true
  }
  return {
    input,
    output,
    compositionOutput,
    compositionOnly,
    mvpPilotOnly,
    eventsSeedOnly,
    mvpPilotOutput,
    eventsV6Output,
    eventsEnrichmentOutput,
  }
}

function main() {
  const {
    input,
    output,
    compositionOutput,
    compositionOnly,
    mvpPilotOnly,
    eventsSeedOnly,
    mvpPilotOutput,
    eventsV6Output,
    eventsEnrichmentOutput,
  } = parseArgs()
  if (eventsSeedOnly) {
    writeFileSync(eventsV6Output, buildImprobotsEventsV6Sql(), 'utf8')
    writeFileSync(eventsEnrichmentOutput, buildImprobotsEventsEnrichmentSql(), 'utf8')
    console.error(`Wrote ${eventsV6Output}`)
    console.error(`Wrote ${eventsEnrichmentOutput}`)
    return
  }
  if (mvpPilotOnly) {
    const sql = buildMalicieMvpPilotSeedSql()
    writeFileSync(mvpPilotOutput, sql, 'utf8')
    console.error(`Wrote ${mvpPilotOutput}`)
    return
  }
  if (compositionOnly) {
    const sql = buildMalicieCompositionSeedSql()
    writeFileSync(compositionOutput, sql, 'utf8')
    console.error(`Wrote ${compositionOutput}`)
    return
  }
  const csvText = readFileSync(input, 'utf8')
  const sql = buildMalicieSeedSql(csvText)
  writeFileSync(output, sql, 'utf8')
  console.error(`Wrote ${output}`)
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
