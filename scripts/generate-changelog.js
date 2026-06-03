#!/usr/bin/env node

const { OpenAI } = require('openai');

// Configuration OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * User-facing release notes for apps/web/public/changelog.json (Story 10.3 « Nouveautés »).
 * Editorial principles: https://www.argil.io/playbooks/product/writing-product-updates-and-releases
 * — outcomes over output, « so what » test, zero noise (empty list beats vague bullets).
 */
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

    const changesText = technicalData.changes.map(change => {
      const cleanChange = change.replace(/^[✨🐛🔧📝] /, '').trim();
      return `- ${cleanChange}`;
    }).join('\n');

    const prompt = `Tu rédiges les « nouveautés » affichées dans l'app HatCast (impro / troupes / saisons / dispos / compositions).
Public : membres de troupe, pas des développeurs. Style : français, « tu » ou « on », direct et concret.

Principes éditoriaux (Argil — product updates) :
1. **Résultat avant livrable** — chaque ligne décrit ce que l'utilisateur peut **faire ou constater**, pas ce que l'équipe a codé.
2. **Test « et alors ? »** — si le bénéfice utilisateur n'est pas évident en 3 secondes, **supprime** la ligne (ne la reformule pas en jargon).
3. **Titre = bénéfice** — « Partage un spectacle avec ton équipe en un clic », pas « Nouveau système de permissions ».
4. **Court et scannable** — max **5** puces par version ; une idée par ligne (~120 caractères).
5. **Zéro bruit** — en cas de doute, **n'inclus pas** la ligne. Mieux vaut une liste vide qu'une liste floue ou technique.

INCLURE seulement si l'utilisateur le remarque ou en tire un bénéfice :
- Nouvelle action ou parcours (connexion, dispos, compo, notifications, compte…)
- Correction d'un bug qui gênait l'usage réel
- Amélioration visible de l'interface ou du confort (mobile, clarté, rapidité perçue)

EXCLURE systématiquement (ne jamais mentionner) :
- Logs, CI, déploiement, migrations, refactors, tests, types, lint, dépendances
- Renommages internes, composants, routes API, scripts, ADR, docs techniques
- Ajustements CSS/padding/z-index non perceptibles
- « Amélioration de la stabilité / performances » sans exemple concret côté utilisateur
- Messages de commit bruts ou traduits mot à mot

Vocabulaire HatCast (OK) : troupe, ligue, saison, spectacle, dispos, compo, MC, DJ, orga, PWA, agenda.
Remplacer « modal/modale » par « fenêtre » ; pas de noms de fichiers ou de classes Angular.

Emojis : ✨ nouveauté, 🐛 correction ressentie, 🔧 amélioration visible (pas 🔧 pour du technique).

Si **aucun** changement ne passe le filtre ci-dessus, renvoie \`"changes": []\` — c'est attendu et préférable au bruit.

Changements techniques à filtrer (source interne, ne pas recopier tel quel) :
${changesText}

Réponds UNIQUEMENT avec ce JSON (pas de markdown, pas de texte autour) :
{
  "version": "${version}",
  "date": "${date}",
  "changes": [
    "✨ …",
    "🐛 …"
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Tu es rédacteur de notes de version produit pour une app grand public. " +
            "Tu appliques le test « et alors ? » : une ligne = un bénéfice utilisateur clair, ou rien. " +
            "Tu réponds UNIQUEMENT avec du JSON valide. Une liste changes vide est un succès si le diff est purement technique."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.25,
      max_tokens: 2000
    });

    const jsonResponse = response.choices[0].message.content.trim();

    // Nettoyer la réponse JSON (supprimer les caractères problématiques)
    let cleanJson = jsonResponse
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .trim();

    // Validate JSON
    try {
      const parsed = JSON.parse(cleanJson);
      if (parsed.version && parsed.date && Array.isArray(parsed.changes)) {
        if (parsed.changes.length === 0) {
          console.error('ℹ️  Aucune nouveauté utilisateur retenue pour cette version (liste vide — OK).');
        }
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
