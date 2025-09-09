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

    const prompt = `Je vais te donner un JSON technique de changelog en anglais et je veux que tu le transformes en JSON français orienté utilisateur en suivant ces guidelines :

GUIDELINES POUR LA TRANSFORMATION :
1. **Orientation utilisateur** : Focus sur la valeur utilisateur, pas les détails techniques
2. **Langage accessible** : Éviter le jargon technique (PWA → appli mobile, z-index → superposition, etc.)
3. **Termes spécialisés** : Conserver les termes de l'impro (Long Form, MC, DJ, etc.)
4. **Langage inclusif** : Utiliser féminin/masculin et inclusif
5. **Filtrage automatique** : IGNORER complètement les commits de debug, cleanup, test, et autres changements techniques internes
6. **Synthèse** : Tu peux supprimer des lignes non pertinentes et regrouper des changements similaires
7. **Reformulation** : Reformuler en français pour que ce soit accessible aux utilisateurs finaux
8. **Emojis** : Conserver ✨ 🐛 🔧 📝 🎨
9. **Structure** : Respecter exactement la structure JSON fournie

STRUCTURE JSON À RESPECTER :
{
  "version": "${version}",
  "date": "${date}",
  "changes": [
    "✨ Description de la nouvelle fonctionnalité",
    "🐛 Description de la correction de bug",
    "🔧 Description de l'amélioration"
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
