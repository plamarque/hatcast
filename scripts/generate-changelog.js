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

    const prompt = `Je vais te donner un JSON technique de changelog en anglais et je veux que tu le transformes en JSON français avec un style très orienté utilisateur et bénéfice concret.

STYLE ET TON À ADOPTER :
- **Ton personnel et direct** : Utiliser "tu", "nous", "on" - parler directement à l'utilisateur
- **Focus bénéfice** : Décrire ce que l'utilisateur peut faire maintenant, pas ce qui a été développé
- **Langage simple** : Éviter le jargon technique, utiliser des mots du quotidien
- **Ton décontracté** : Un peu d'humour et de personnalité (😅, 🤖, etc.)
- **Concret et pratique** : Expliquer l'impact réel sur l'expérience utilisateur

EXEMPLES DE TRANSFORMATION :
❌ "Ajout d'une fonctionnalité pour permettre le remplissage manuel des emplacements"
✅ "Tu peux désormais remplir manuellement les emplacements même quand la compo est verrouillée"

❌ "Amélioration de la gestion des types de modèles et protection de la personnalisation"
✅ "Tes modèles d'événements sont maintenant mieux protégés contre les modifications accidentelles"

❌ "Mise en place d'un système d'audit complet"
✅ "On garde désormais un journal de tous les changements de compositions"

RÈGLES SPÉCIFIQUES :
1. **Orientation bénéfice** : Toujours expliquer ce que l'utilisateur gagne
2. **Termes impro** : Garder Long Form, MC, DJ, compo, etc.
3. **Langage inclusif** : Utiliser féminin/masculin et inclusif
4. **Filtrage** : IGNORER les commits de debug, cleanup, test, techniques internes
5. **Regroupement** : Fusionner les changements similaires
6. **Emojis** : Conserver ✨ 🐛 🔧 📝 🎨
7. **Structure** : Respecter exactement la structure JSON

STRUCTURE JSON À RESPECTER :
{
  "version": "${version}",
  "date": "${date}",
  "changes": [
    "✨ Bénéfice utilisateur concret",
    "🐛 Problème résolu pour l'utilisateur",
    "🔧 Amélioration de l'expérience"
  ]
}

JSON TECHNIQUE À TRANSFORMER :
${JSON.stringify(technicalData, null, 2)}

Réponds UNIQUEMENT avec le JSON transformé, sans explication ni texte supplémentaire.`;

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
      max_tokens: 1000
    });

    const jsonResponse = response.choices[0].message.content.trim();
    
    // Validate JSON
    try {
      const parsed = JSON.parse(jsonResponse);
      if (parsed.version && parsed.date && Array.isArray(parsed.changes)) {
        return jsonResponse;
      } else {
        console.error('❌ JSON invalide: structure incorrecte');
        return null;
      }
    } catch (parseError) {
      console.error('❌ JSON invalide:', parseError.message);
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
