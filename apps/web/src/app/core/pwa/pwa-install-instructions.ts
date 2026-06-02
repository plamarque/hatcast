import type { PwaBrowserInfo } from './pwa-browser-info';
import { DEV_CERT_INSTALL_WARNING } from './pwa-install-origin';

export interface PwaInstallInstructionContent {
  title: string;
  steps: string[];
  isAlternativeNeeded: boolean;
  browserName: string;
  alternativeText: string;
  successText: string;
  warningText: string;
  canRetry: boolean;
}

export interface PwaInstallInstructionOptions {
  devCertBlocked?: boolean;
  nativePromptFailed?: boolean;
}

const ICON_SNIPPET =
  '<img src="/icons/icon-48x48.png" alt="" width="20" height="20" style="vertical-align:middle;margin:0 4px;border-radius:4px" />';

export function buildPwaInstallInstructions(
  info: PwaBrowserInfo,
  options: PwaInstallInstructionOptions = {},
): PwaInstallInstructionContent {
  const {
    isChromeIOS,
    isFirefoxIOS,
    isEdgeIOS,
    isSafariMobile,
    isSafariDesktop,
    isChromeMobile,
    isChromeDesktop,
    isEdge,
    isFirefox,
    isSamsung,
    isAndroid,
    isIOS,
    isMac,
    isWindows,
    iOSVersion,
  } = info;

  let title = "Installation de l'application";
  const steps: string[] = [];
  let isAlternativeNeeded = false;
  let browserName = '';
  let alternativeText = '';
  let successText = '';
  let warningText = '';

  if (isChromeIOS || isFirefoxIOS || isEdgeIOS) {
    const browserDisplayName = isChromeIOS ? 'Chrome' : isFirefoxIOS ? 'Firefox' : 'Edge';
    title = `${browserDisplayName} sur iPhone/iPad`;
    if (iOSVersion !== null && iOSVersion >= 16.4) {
      steps.push(
        'Appuyez sur <strong>Partager 📤</strong> (barre d\'outils)',
        'Faites défiler et sélectionnez <strong>"Ajouter à l\'écran d\'accueil"</strong>',
        'Appuyez sur <strong>"Ajouter"</strong>',
      );
      successText = `🎉 Cette icône ${ICON_SNIPPET} <strong>HatCast</strong> apparaîtra sur votre écran d'accueil et se lancera en plein écran comme une app native !`;
    } else {
      browserName = `${browserDisplayName} iOS`;
      isAlternativeNeeded = true;
      steps.push(
        'Ouvrez ce site dans <strong>Safari</strong>',
        'Appuyez sur le bouton <strong>Partager 📤</strong> (en bas)',
        'Sélectionnez <strong>"Ajouter à l\'écran d\'accueil"</strong>',
        'Confirmez en appuyant sur <strong>"Ajouter"</strong>',
      );
      alternativeText =
        "Sur iOS < 16.4, copiez cette URL et collez-la dans Safari pour installer l'app.";
      successText = `🎉 Cette icône ${ICON_SNIPPET} <strong>HatCast</strong> apparaîtra sur votre écran d'accueil et fonctionnera comme une app native !`;
    }
  } else if (isSafariMobile) {
    title = 'Safari sur iPhone/iPad';
    if (iOSVersion !== null && iOSVersion >= 16) {
      steps.push(
        'Appuyez sur le bouton <strong>Partager 📤</strong> (en bas de l\'écran)',
        'Faites défiler vers le bas dans le menu',
        'Sélectionnez <strong>"Ajouter à l\'écran d\'accueil"</strong>',
        'Modifiez le nom de l\'app si souhaité',
        'Appuyez sur <strong>"Ajouter"</strong> (en haut à droite)',
      );
    } else {
      steps.push(
        'Appuyez sur le bouton <strong>Partager 📤</strong> (en bas de l\'écran)',
        'Recherchez <strong>"Ajouter à l\'écran d\'accueil"</strong> dans la liste',
        'Appuyez dessus',
        'Confirmez en appuyant sur <strong>"Ajouter"</strong>',
      );
    }
    successText = `🎉 Cette icône ${ICON_SNIPPET} <strong>HatCast</strong> apparaîtra sur votre écran d'accueil pour un accès rapide !`;
  } else if (isChromeMobile) {
    title = 'Chrome sur Android';
    steps.push(
      'Appuyez sur le menu <strong>⋮</strong> (3 points en haut à droite)',
      'Faites défiler vers le bas',
      'Sélectionnez <strong>"Ajouter à l\'écran d\'accueil"</strong>',
      "Confirmez l'ajout",
    );
    alternativeText =
      'Si disponible, vous pouvez aussi chercher une icône "Installer ⊕" dans la barre d\'adresse.';
    successText = `🎉 Cette icône ${ICON_SNIPPET} <strong>HatCast</strong> apparaîtra sur votre écran d'accueil et dans le tiroir d'applications. L'app fonctionnera comme une application native avec ses propres notifications !`;
  } else if (isSamsung) {
    title = 'Samsung Internet';
    steps.push(
      "Cherchez l'icône <strong>＋</strong> dans la barre d'adresse",
      'Appuyez dessus',
      "Confirmez l'ajout à l'écran d'accueil",
    );
    alternativeText =
      "Si l'icône n'est pas visible : Menu ≡ → \"Ajouter page à\" → \"Écran d'accueil\"";
    successText = `🎉 Cette icône ${ICON_SNIPPET} <strong>HatCast</strong> apparaîtra sur votre écran d'accueil. Selon la version, elle s'ouvrira en mode PWA fenêtré ou comme raccourci vers le navigateur.`;
  } else if (isFirefox) {
    title = isAndroid ? 'Firefox sur Android' : 'Firefox - Installation limitée';
    browserName = 'Firefox';
    isAlternativeNeeded = true;
    steps.push(
      "Firefox ne supporte pas l'installation PWA stable",
      'Pour une meilleure expérience, utilisez <strong>Chrome</strong> ou <strong>Edge</strong>',
      'Vous pouvez continuer à utiliser HatCast dans Firefox normalement',
    );
    alternativeText =
      "Recommandation : ouvrez HatCast dans Chrome ou Edge pour pouvoir l'installer comme une vraie application.";
    warningText =
      'Firefox peut créer un raccourci, mais il ouvrira simplement Firefox au lieu d\'une app dédiée.';
  } else if (isAndroid) {
    title = 'Navigateur Android';
    steps.push(
      'Cherchez le menu du navigateur <strong>(⋮ ou ☰)</strong>',
      'Recherchez <strong>"Installer l\'application"</strong> ou <strong>"Ajouter à l\'écran d\'accueil"</strong>',
      "Confirmez l'installation",
    );
    successText = `🎉 Cette icône ${ICON_SNIPPET} <strong>HatCast</strong> apparaîtra sur votre écran d'accueil. Le comportement dépend du navigateur : vraie PWA ou simple raccourci.`;
    warningText =
      'Le résultat varie selon le navigateur utilisé. Pour une meilleure expérience, utilisez Chrome ou Samsung Internet.';
  } else if (isChromeDesktop) {
    title = `Chrome sur ${isWindows ? 'Windows' : isMac ? 'Mac' : 'Linux'}`;
    steps.push(
      "Cherchez l'icône <strong>Installer ⊕</strong> dans la barre d'adresse",
      'Cliquez dessus et sélectionnez <strong>"Installer"</strong>',
      "Confirmez l'installation",
    );
    alternativeText =
      "Si l'icône n'est pas visible : Menu ⋮ → \"Caster, enregistrer et partager\" → \"Installer la page en tant qu'appli\"";
    successText = `🎉 <strong>HatCast</strong> s'installera comme une vraie application ! Cette icône ${ICON_SNIPPET} apparaîtra dans ${
      isMac
        ? 'le dossier Applications et sera accessible via le Launchpad et Spotlight. Vous pourrez l\'épingler au Dock'
        : isWindows
          ? 'le menu Démarrer (section "Chrome Apps") et sera épinglable à la barre des tâches. Recherche Windows la trouvera aussi'
          : "le menu Applications et sera épinglable dans le dock/panel de votre environnement de bureau"
    } !`;
  } else if (isEdge && !isIOS) {
    title = `Edge sur ${isWindows ? 'Windows' : isMac ? 'Mac' : 'Linux'}`;
    steps.push(
      "Cherchez l'icône <strong>Installer ⊕</strong> dans la barre d'adresse",
      'Cliquez dessus et sélectionnez <strong>"Installer"</strong>',
      "Confirmez l'installation",
    );
    alternativeText =
      "Si l'icône n'est pas visible : Menu ⋯ → \"Applications\" → \"Installer ce site en tant qu'application\"";
    successText = `🎉 <strong>HatCast</strong> s'installera comme une application native ! Cette icône ${ICON_SNIPPET} sera ajoutée ${
      isMac
        ? 'au Launchpad et accessible via Spotlight. Épinglable au Dock'
        : isWindows
          ? 'au menu Démarrer et visible dans Paramètres > Applications installées. Épinglable à la barre des tâches'
          : 'au menu Applications et épinglable au dock/panel'
    } !`;
  } else if (isSafariDesktop) {
    title = 'Safari sur Mac';
    steps.push(
      'Menu <strong>"Fichier" → "Ajouter au Dock"</strong>',
      "Confirmez le nom de l'application",
      'Cliquez sur <strong>"Ajouter"</strong>',
    );
    successText = `🎉 <strong>HatCast.app</strong> sera installée dans le dossier Applications ! Cette icône ${ICON_SNIPPET} apparaîtra automatiquement au Dock et fonctionnera comme une app classique (quittable via ⌘Q, listée comme app native) !`;
  } else {
    steps.push(
      'Recherchez dans votre navigateur une icône <strong>⊕</strong> ou <strong>"installer"</strong> dans la barre d\'adresse',
      'OU cherchez dans le menu une option comme :<br>• "Installer cette application/page"<br>• "Ajouter à l\'écran d\'accueil"',
      'OU utilisez le bouton <strong>Partager → "Ajouter au Dock/écran d\'accueil"</strong>',
    );
    warningText =
      "Si aucune option n'est disponible, votre navigateur ne supporte peut-être pas cette fonctionnalité.";
  }

  const canRetry = (isChromeDesktop || isChromeMobile) && !isAlternativeNeeded;

  const devWarnings: string[] = [];
  if (options.devCertBlocked) {
    devWarnings.push(DEV_CERT_INSTALL_WARNING);
  }
  if (options.nativePromptFailed && !options.devCertBlocked) {
    devWarnings.push(
      "Le navigateur n'a pas répondu à la demande d'installation. Utilisez les étapes manuelles ci-dessous ou réessayez depuis https://localhost:4200.",
    );
  }
  if (devWarnings.length > 0) {
    warningText = devWarnings.join('\n\n');
  }

  return {
    title,
    steps,
    isAlternativeNeeded,
    browserName,
    alternativeText,
    successText,
    warningText,
    canRetry,
  };
}
