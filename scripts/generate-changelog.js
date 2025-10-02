#!/usr/bin/env node

const { OpenAI } = require('openai');

// Configuration OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function generateUserFocusedChangelog(technicalJson, version) {
  try {
    // Parse the technical JSON
    let technicalData;
    try {
      technicalData = JSON.parse(technicalJson);
    } catch (parseError) {
      console.error('❌ Erreur parsing JSON technique:', parseError.message);
      return null;
    }

    const date = technicalData.date || new Date().toISOString().split('T')[0];

    // Créer un prompt plus simple et robuste
    const changesText = technicalData.changes.map(change => {
      // Nettoyer le changement (supprimer l'emoji et le préfixe)
      const cleanChange = change.replace(/^[✨🐛🔧📝] /, '').trim();
      return `- ${cleanChange}`;
    }).join('\n');

    const prompt = `Traduis ces changements techniques en français utilisateur, style décontracté et direct (utilise "tu", "on"). 

RÈGLES IMPORTANTES :
- FILTRE et EXCLUT automatiquement :
  * Les ajouts de logs de débogage (debug logs, console.log, logger.debug, etc.)
  * Les corrections de logs ou suppression de logs
  * Les modifications de props, CSS, styles, padding, margins
  * Les corrections de types TypeScript
  * Les ajustements de z-index, positioning
  * Les nettoyages de code (cleanup, refactor sans impact utilisateur)
  * Les corrections de warnings de compilation
  * Les améliorations de performance internes non visibles
- INCLUS SEULEMENT :
  * Les nouvelles fonctionnalités visibles par l'utilisateur
  * Les corrections de bugs qui affectent l'expérience utilisateur
  * Les améliorations substantielles de l'interface
  * Les nouvelles options, boutons, fenêtres
- REGROUPE les changements similaires en grandes catégories (max 6-8 points au total)
- REMPLACE "modal/modale" par "fenêtre" pour plus de clarté utilisateur
- REMPLACE les noms techniques de composants par des descriptions user-friendly :
  * "PlayerModal" → "fenêtre de détail de joueur"
  * "EventDetailsModal" → "fenêtre de détail d'événement"
  * "SelectionModal" → "fenêtre de sélection"
  * "AvailabilityModal" → "fenêtre de disponibilité"
  * "ViewHeader" → "en-tête de vue"
  * "AvailabilityCell" → "cellule de disponibilité"
- Garde les termes techniques comme "MC", "DJ", "compo", "Long Form", etc.
- Utilise les emojis appropriés : ✨ pour les nouvelles fonctionnalités, 🐛 pour les corrections, 🔧 pour les améliorations
- Réponds UNIQUEMENT avec le JSON suivant, sans texte avant ou après
- Chaque changement doit être une chaîne de caractères valide JSON (échapper les guillemets)
- Ne mets PAS de guillemets autour du JSON entier

EXEMPLES DE FILTRAGE :
- EXCLURE : "Add debug logs", "Remove console.log", "Fix TypeScript types", "Adjust padding", "Cleanup unused code"
- INCLURE : "Add new button", "Fix login issue", "Improve mobile layout", "Add new feature"

Changements à traduire :
${changesText}

Réponds UNIQUEMENT avec ce JSON :
{
  "version": "${version}",
  "date": "${date}",
  "changes": [
    "✨ changement traduit 1",
    "🐛 changement traduit 2"
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Modèle rapide et économique
      messages: [
        {
          role: "system",
          content: "Tu es un expert en rédaction de changelogs orientés utilisateur. Tu génères des JSON de changelogs en français en les rendant accessibles et centrés sur la valeur utilisateur. Tu réponds UNIQUEMENT avec du JSON valide."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3, // Faible température pour plus de cohérence
      max_tokens: 2000 // Plus de tokens pour éviter les réponses tronquées
    });

    const jsonResponse = response.choices[0].message.content.trim();
    
    // Nettoyer la réponse JSON (supprimer les caractères problématiques)
    let cleanJson = jsonResponse
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Supprimer les caractères de contrôle
      .replace(/\n/g, '\\n') // Échapper les retours à la ligne
      .replace(/\r/g, '\\r') // Échapper les retours chariot
      .trim();
    
    // Validate JSON
    try {
      const parsed = JSON.parse(cleanJson);
      if (parsed.version && parsed.date && Array.isArray(parsed.changes)) {
        return cleanJson;
      } else {
        console.error('❌ JSON invalide: structure incorrecte');
        return null;
      }
    } catch (parseError) {
      console.error('❌ JSON invalide après nettoyage:', parseError.message);
      console.error('📝 Réponse OpenAI (premiers 200 caractères):', cleanJson.substring(0, 200) + '...');
      return null;
    }

  } catch (error) {
    console.error('❌ Erreur OpenAI:', error.message);
    return null;
  }
}

// Interface en ligne de commande
if (require.main === module) {
  const technicalJson = process.argv[2];
  const version = process.argv[3] || 'unknown';

  if (!technicalJson) {
    console.error('❌ Usage: node generate-changelog.js "<technical_json>" [version]');
    process.exit(1);
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY environment variable is required');
    process.exit(1);
  }

  generateUserFocusedChangelog(technicalJson, version)
    .then(result => {
      if (result) {
        console.log(result);
      } else {
        console.error('❌ Failed to generate changelog');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Error:', error.message);
      process.exit(1);
    });
}

module.exports = { generateUserFocusedChangelog };
