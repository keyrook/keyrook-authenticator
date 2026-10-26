// Français. Vouvoiement, espaces insécables avant : ; ? ! et entre « ».
import type { Dictionary } from './en.js';

export const fr: Dictionary = {
  // --- Erreurs ------------------------------------------------------------------
  'error.vaultLocked': 'Le coffre est verrouillé.',
  'error.vaultExists': 'Un coffre existe déjà sur cet appareil.',
  'error.noVault': 'Aucun coffre sur cet appareil pour l’instant.',
  'error.vaultCorrupt': 'Le coffre enregistré est endommagé ou a été écrit par une autre application.',
  'error.wrongMasterPassword': 'Mot de passe principal incorrect.',
  'error.enterCurrentMasterPassword': 'Saisissez votre mot de passe principal actuel.',
  'error.currentPasswordWrong': 'Le mot de passe actuel est incorrect.',
  'error.masterPasswordShort': 'Le mot de passe principal doit comporter au moins 8 caractères.',
  'error.notPassphraseVault': 'Ce coffre n’est pas protégé par un mot de passe principal.',
  'error.recoveryKeyMalformed': 'Cela ne ressemble pas à une clé de récupération.',
  'error.recoveryKeyNoMatch': 'Cette clé de récupération ne correspond pas.',
  'error.recoverOnAccountPage': 'Votre clé de récupération est la bonne, mais le mot de passe de ce compte se réinitialise désormais sur la page du compte, pour toutes les apps Keyrook à la fois.',
  'error.kitOnAccountPage': 'La clé de récupération de ce compte se crée désormais sur la page du compte, pour toutes les apps Keyrook à la fois.',
  'error.restoreEmpty': 'Il ne reste rien de ce compte à récupérer : il a été supprimé sur un autre appareil avant que celui-ci ne l’ait jamais eu.',
  'error.noAccountSheet': 'Ce compte n’a pas encore de clé de récupération. Créez-en une sur la page du compte.',
  'error.recoveryKeyWrong': 'Cette clé de récupération ne correspond pas à ce compte.',
  'error.noRecoveryKit': 'Ce coffre n’a pas de clé de récupération.',
  'error.syncUnavailable': 'La synchronisation n’est pas disponible dans cette version.',
  'error.notSignedIn': 'Non connecté.',
  'error.alreadySignedIn': 'Déjà connecté.',
  'error.signedOutElsewhere':
    'Cet appareil a été déconnecté de la synchronisation — le mot de passe a été changé ou l’appareil a été retiré depuis un autre. Reconnectez-vous.',
  'error.removedFromAccount':
    'Un autre appareil a retiré celui-ci de votre compte Keyrook, les codes du compte ont donc été supprimés ici. Reconnectez-vous pour les récupérer.',
  'error.signOutUnsynced':
    'Certaines modifications faites dans ce navigateur ne sont pas encore arrivées dans votre compte, et se déconnecter maintenant les perdrait. Connectez-vous à Internet et réessayez.',
  'error.enterAccountPassword': 'Saisissez le mot de passe de votre compte.',
  'error.accountPasswordWrong': 'Ce n’est pas le mot de passe de votre compte.',
  'error.accountPasswordWeak':
    'Ce mot de passe est trop faible pour protéger une copie de votre coffre qui quitte cet appareil. Utilisez au moins 12 caractères mêlant majuscules, minuscules, chiffres et symboles — ou quatre ou cinq mots sans rapport entre eux.',
  'error.lockOnlyWithAccountPassword':
    'Ce n’est pas le mot de passe de votre compte. Tant que vous êtes connecté, c’est le seul mot de passe avec lequel ce coffre peut se verrouiller.',
  'error.signupWrongMasterPassword':
    'Ce n’est pas le mot de passe principal de ce coffre. Il devient aussi le mot de passe de votre compte.',
  'error.masterPasswordTooWeakForAccount':
    'Votre mot de passe principal est trop faible pour protéger une copie de votre coffre qui quitte cet appareil. Changez-le d’abord dans Sécurité — au moins 12 caractères variés, ou quatre ou cinq mots sans rapport entre eux.',
  'error.passwordsDiverged':
    'Le mot de passe de votre compte diffère de celui de ce coffre. Déconnectez-vous de la synchronisation puis reconnectez-vous pour les aligner, et réessayez.',
  'error.kitRace':
    'Un autre de vos appareils vient de changer la clé de récupération. Rien n’a été modifié ici — réessayez.',
  'error.providerHasNoPassword': 'Ce compte se connecte avec Google ou GitHub et n’a pas de mot de passe.',
  'error.noActiveTab': 'Aucun onglet actif.',
  'error.autofillNotHere': 'Le remplissage automatique ne fonctionne que sur les pages web ordinaires.',
  'error.autofillBlocked':
    'Chrome n’a pas laissé l’extension lire cette page. Ouvrez la fenêtre de l’extension depuis la page que vous voulez remplir.',
  'error.signinCancelled': 'La connexion a été annulée.',
  'error.signinStateMismatch': 'Cette connexion n’est pas revenue comme elle est partie. Réessayez.',
  'error.signinUnfinished': 'La connexion n’a pas abouti. Réessayez.',
  'error.signupPendingExpired': 'Cette connexion a expiré. Recommencez.',
  'error.signInFirst': 'Connectez-vous d’abord.',
  'error.joinNeedsMasterPassword': 'Saisissez le mot de passe principal de ce coffre pour terminer.',
  'error.notThisVaultsPassword': 'Ce n’est pas le mot de passe principal de ce coffre.',
  'error.nothingWaiting': 'Rien n’attend d’approbation.',
  'error.pairingExpired': 'La demande a pris fin — elle a été refusée, ou dix minutes se sont écoulées. Redemandez.',
  'error.pairingWrongKey':
    'La clé reçue n’est pas celle de ce compte. Rien n’a été modifié. Réessayez depuis l’autre appareil.',
  'error.pairingForged': 'Cette approbation ne vient pas de l’appareil dont vous avez vérifié le code.',
  'error.pairingForgedAsk':
    'Cette approbation ne vient pas de l’appareil dont le code a été vérifié. Rien n’a été modifié. Redemandez.',
  'error.pairingEnded': 'Cette demande a pris fin.',
  'error.approveAgain': 'Recommencez l’approbation de cette demande.',
  'error.backupPasswordShort': 'Le mot de passe de la sauvegarde doit comporter au moins 8 caractères.',
  'error.backupNotOurs': 'Ce fichier n’est pas une sauvegarde Keyrook Authenticator.',
  'error.backupNewer': 'Cette sauvegarde a été faite par une version plus récente de l’application.',
  'error.backupUnknownCipher': 'Cette sauvegarde utilise une méthode de chiffrement que cette version ne connaît pas.',
  'error.backupTooCostly': 'Ouvrir cette sauvegarde demanderait un travail déraisonnable. Elle est ignorée.',
  'error.backupMalformed': 'Cette sauvegarde est mal formée.',
  'error.uriNotOtpauth': 'Ce n’est pas un lien otpauth://.',
  'error.uriMalformed': 'Ce lien otpauth:// est mal formé.',
  'error.uriNoSecret': 'Ce lien ne contient pas de secret.',
  'error.uriBadSecret': 'Le secret de ce lien n’est pas du base32 valide.',
  'error.uriNoCounter': 'Un lien HOTP doit contenir un compteur.',
  'error.secretEmpty': 'La clé de configuration est vide.',
  'error.migrationNotOurs': 'Ce n’est pas un export de Google Authenticator.',
  'error.migrationMalformed': 'Cet export de Google Authenticator est endommagé ou incomplet.',
  'error.offline': 'Impossible de joindre le serveur de synchronisation. Vérifiez votre connexion et réessayez.',
  'error.passkey.wrongOrigin': 'Une clé d’accès ne répond qu’à la page et aux applications de Keyrook.',
  'error.passkey.notOffered': 'La connexion par clé d’accès n’est pas proposée ici.',
  'error.passkey.unchecked': 'Cette clé d’accès n’a pas pu être vérifiée. Réessayez.',
  'error.passkey.unknown': 'Aucun compte Keyrook ne connaît cette clé d’accès. Elle a peut-être été supprimée.',
  'error.passkey.ended': 'La demande pour cette clé d’accès a expiré. Réessayez.',
  'error.passkey.noUnlock': 'Cette clé d’accès n’ouvre pas la clé de ce compte. Connectez-vous plutôt avec le mot de passe.',
  'error.passkey.noUnlockProvider':
    'Cette clé d’accès n’ouvre pas la clé de ce compte. Continuez plutôt avec Google ou GitHub.',
  'error.passkey.masterPassword':
    'Un coffre verrouillé par un mot de passe principal ne peut pas se connecter avec une clé d’accès. Connectez-vous avec le mot de passe du compte, ou avec Google ou GitHub.',
  'error.passkey.permission':
    'Keyrook Authenticator a besoin de l’autorisation de Chrome pour utiliser les clés d’accès d’account.keyrook.com. Choisissez de nouveau la clé d’accès et autorisez-la.',
  'error.passkey.cancelled': 'Aucune clé d’accès n’a été utilisée. Réessayez, ou connectez-vous autrement.',
  'error.passkey.failed': 'Chrome n’a pas pu demander de clé d’accès. Réessayez, ou connectez-vous autrement.',
  'error.secondStep.missing': 'Saisissez aussi le code de votre application d’authentification.',
  'error.secondStep.wrongCode': 'Ce code n’est pas le bon. Saisissez celui que votre application d’authentification affiche maintenant.',
  'error.secondStep.expired': 'Cette connexion a expiré. Reconnectez-vous.',
  'error.secondStep.used': 'Ce code vient de servir à vous connecter. Attendez que votre application affiche le suivant.',
  'error.provider.refusedBy': '{provider} a refusé la connexion.',
  'error.provider.unreachable': '{provider} est injoignable. Réessayez dans un instant.',
  'error.provider.refused': 'La connexion a été refusée. Réessayez.',
  'error.provider.githubRefused': 'GitHub a refusé la connexion.',
  'error.provider.noReauth': 'Google ne vous a pas redemandé de vous connecter.',
  'error.provider.unverifiedEmail': 'Google n’a pas vérifié cette adresse e-mail.',
  'error.provider.githubNoEmail': 'Votre compte GitHub n’a pas d’adresse e-mail principale vérifiée.',
  'error.server.badRequest': 'Le serveur de synchronisation n’a pas pu lire cette requête.',
  'error.server.session': 'Cette session n’est plus valide.',
  'error.server.accountGone': 'Ce compte n’existe plus.',
  'error.server.signupExpired': 'Cette inscription a expiré. Reconnectez-vous.',
  'error.server.signinExpired': 'Cette connexion a expiré. Réessayez.',
  'error.server.tooManyCodes': 'Trop de codes erronés. Demandez-en un nouveau.',
  'error.server.tooManyPairings':
    'Trop d’appareils attendent de rejoindre ce compte. Réessayez dans quelques minutes.',
  'error.server.wrongKey': 'Cet appareil ne détient pas la clé du compte.',
  'error.server.providerAccount': 'Ce compte se connecte avec Google ou GitHub, pas avec un mot de passe.',
  'error.server.mailFailed': 'L’e-mail n’a pas pu être envoyé. Réessayez dans une minute.',
  'error.server.pairingTaken': 'Cette demande a pris fin, ou un autre appareil est en train de l’approuver.',
  'error.server.passwordWrong': 'Ce mot de passe est incorrect.',
  'error.server.badCredentials': 'E-mail ou mot de passe incorrect.',
  'error.server.badCode':
    'Ce code n’est pas bon, ou il a expiré. Vérifiez l’e-mail, ou demandez-en un nouveau.',
  'error.server.reauthMismatch':
    'Pour confirmer, reconnectez-vous avec le compte que vous utilisez pour Keyrook.',
  'error.server.kitRace': 'Un autre appareil vient de changer la clé de récupération.',
  'error.server.unavailable': 'Le serveur de synchronisation n’a pas pu le faire pour l’instant. Réessayez dans un instant.',
  'error.server.lockedOut': {
    one: 'Trop de tentatives échouées. Réessayez dans {count} seconde.',
    other: 'Trop de tentatives échouées. Réessayez dans {count} secondes.',
  },
  'error.server.rateLimited': {
    one: 'Trop de tentatives. Réessayez dans {count} seconde.',
    other: 'Trop de tentatives. Réessayez dans {count} secondes.',
  },
  'error.server.emailTaken': '{email} a déjà un compte Keyrook.',
  'error.server.recordTooLarge': 'L’un de vos comptes est trop volumineux pour être synchronisé ({id}).',
  'error.server.codeTooSoon': 'Un code vient d’être envoyé. Patientez un peu avant d’en demander un autre.',
  'error.server.keyRace': 'Un autre appareil vient de configurer la clé. Réessayez.',
  'error.server.archiveNeedsOldKeys': 'Seuls l’ancien mot de passe ou l’ancienne clé de récupération peuvent supprimer ce qui a été conservé avant son expiration.',
  'error.server.signupNeedsKeys': 'Ce compte n’a pas pu être créé. Mettez à jour Keyrook Authenticator et réessayez.',
  'error.server.accountIdTaken': 'Cet identifiant de compte est déjà pris. Inscrivez-vous à nouveau.',
  'error.server.archiveWrongKey': 'Cela n’ouvre pas ce qui a été conservé.',
  'error.server.flowExpired': 'Cela a expiré. Demandez un nouveau code et recommencez.',
  'error.server.archiveGone': 'Ce n’est plus conservé.',
  'error.server.notProductKey': 'Cette clé n’appartient pas à Keyrook Authenticator.',
  'error.server.foreignRecord': 'Cet enregistrement appartient à un autre produit Keyrook.',
  'error.server.rootChanged': 'Les clés du compte ont changé sur un autre appareil. Réessayez.',
  'error.server.rootExists': 'Ce compte a déjà une clé racine.',
  'error.server.noRoot': 'Ce compte n’a pas encore de clé racine.',
  'error.server.startOverLimit': 'Ce compte a recommencé à zéro trop souvent ces derniers temps. Réessayez après le {date}.',
  'error.server.wrongRootKey': 'Cet appareil ne détient pas la clé racine du compte.',
  'error.server.sessionReplayed': 'Cet appareil a été déconnecté, car sa session a été utilisée ailleurs. Reconnectez-vous.',
  'error.server.noProductKey': 'Keyrook Authenticator n’a pas encore de clé sur ce compte.',
  'error.server.productKeyChanged': 'La clé de Keyrook Authenticator sur ce compte a changé. Réessayez.',
  'error.server.productKeyReplaced': 'La clé de Keyrook Authenticator a été remplacée sur un autre appareil. Reconnectez-vous.',
  'error.server.updateRequired': 'Mettez à jour Keyrook Authenticator pour continuer à utiliser ce compte.',
  'error.server.olderBuildsRetired': 'Les anciennes versions de Keyrook Authenticator ne peuvent plus utiliser ce compte.',
  'error.server.emailTakenOtherProvider': '{email} a déjà un compte Keyrook qui se connecte avec un autre fournisseur.',
  'error.server.emailTakenPassword': '{email} a déjà un compte Keyrook avec un mot de passe. Connectez-vous plutôt avec votre e-mail et votre mot de passe.',
  'error.server.signInWithPassword': 'Ce compte se connecte avec un mot de passe. Connectez-vous ici avec votre e-mail et votre mot de passe.',
  'error.server.pageCodeWrong': 'Ce code n’est pas celui qu’affiche la page du compte. Vérifiez-le, ou recommencez là-bas.',
  'error.server.pageRequestEnded': 'Cette demande a expiré ou est terminée. Recommencez sur la page du compte.',
  'error.server.noKeyrookAccount': 'Ce compte Google ou GitHub n’a pas de compte Keyrook. Créez-en un dans Keyrook Authenticator ou Passhold.',
  'error.account.productKeyMismatch': 'La clé de {product} ne s’ouvre pas avec la clé racine de ce compte. Rien n’a été modifié.',
  'error.account.confirmWithPassword': 'Ce compte a un mot de passe. Confirmez avec celui-ci.',
  'error.account.chooseNewPassword': 'Choisissez un nouveau mot de passe pour ce compte.',
  'error.account.archiveNotOpened': 'Rien de ce qui a été conservé pour Keyrook Authenticator ne s’ouvre avec cela.',
  'error.account.keyNotConfirmed': 'La clé du compte n’est pas celle que vous avez confirmée. Vérifiez à nouveau.',
  'error.account.serverMismatch': 'La réponse du serveur de synchronisation ne correspond pas à ce compte. Rien n’a été ouvert avec elle.',
  'error.account.archiveNoPassword': 'Ce compte n’avait pas de mot de passe à ce moment-là.',
  'error.account.noPasswordForKeys': 'Ce compte n’a pas de mot de passe pour ouvrir ses clés.',
  'error.account.noRecoveryKey': 'Ce compte n’a pas encore de clé de récupération.',

  // --- Déverrouillage -----------------------------------------------------------
  'unlock.prompt': 'Saisissez votre mot de passe principal pour déverrouiller.',
  'unlock.placeholder': 'Mot de passe principal',
  'unlock.submit': 'Déverrouiller',
  'unlock.forgot': 'Vous l’avez oublié ? <link>Utiliser votre clé de récupération</link>',
  'platformUnlock.unlock': 'Déverrouiller avec l’empreinte, le visage ou le code PIN',
  'platformUnlock.title': 'Empreinte, visage ou code PIN',
  'platformUnlock.body': 'Ouvrez le coffre avec la vérification propre à cet ordinateur — Touch ID, Windows Hello ou son code PIN — au lieu de saisir le mot de passe principal. Le mot de passe l’ouvre toujours, et les modifications le demandent toujours.',
  'platformUnlock.on': 'Le coffre s’ouvre aussi avec la vérification propre à cet ordinateur. Retirer le mot de passe principal la désactive.',
  'passkeyUnlock.turnOn': 'Activer',
  'passkeyUnlock.turnOff': 'Désactiver',
  'platformUnlock.confirm': 'Votre ordinateur vous demandera ensuite votre empreinte, votre visage ou votre code PIN.',
  'error.passkeyUnlock.cancelled': 'La vérification a été annulée ou a pris trop de temps. Réessayez, ou utilisez le mot de passe principal.',
  'error.platformUnlock.noPrf': 'L’endroit où cette clé d’accès a été enregistrée ne peut pas conserver de clé, elle ne peut donc pas ouvrir le coffre. Réactivez ceci et choisissez un autre endroit quand on vous demande où l’enregistrer — ou continuez avec le mot de passe principal.',
  'error.passkeyUnlock.failed': 'Cela n’a pas ouvert le coffre. Utilisez le mot de passe principal, puis réactivez ceci dans Sécurité.',
  'securityKey.unlock': 'Déverrouiller avec une clé de sécurité',
  'securityKey.title': 'Clé de sécurité',
  'securityKey.body': 'Ouvrez le coffre avec une clé de sécurité USB et son code PIN au lieu de saisir le mot de passe principal. Quiconque détient la clé et connaît son code PIN pourra alors ouvrir le coffre sur cet ordinateur. Si la clé est perdue, le mot de passe principal ouvre toujours le coffre.',
  'securityKey.on': 'Le coffre s’ouvre aussi avec votre clé de sécurité et son code PIN sur cet ordinateur. Quiconque détient la clé et connaît son code PIN peut l’ouvrir ici : si la clé est perdue, désactivez ceci. Retirer le mot de passe principal la désactive.',
  'securityKey.confirm': 'Insérez ensuite votre clé de sécurité, saisissez son code PIN et touchez-la. Certaines clés le demandent deux fois.',
  'error.securityKey.noPrf': 'Cette clé de sécurité ne peut pas conserver de clé, elle ne peut donc pas ouvrir le coffre. Les clés conçues uniquement pour la connexion en deux étapes ne le peuvent pas. Essayez une autre clé, ou continuez avec le mot de passe principal.',

  // --- Coffre impossible à ouvrir -----------------------------------------------
  'unrecoverable.title': 'Ce coffre ne peut plus être ouvert',
  'unrecoverable.why':
    'Sa clé de chiffrement se trouvait dans ce profil de navigateur et a disparu — en général parce que les données de navigation ont été effacées, que l’extension a été réinstallée, ou qu’il s’agit d’un autre profil. Sans cette clé, personne ne peut déchiffrer les comptes enregistrés, pas même nous.',
  'unrecoverable.hasKit':
    'Vous avez créé une clé de récupération pour ce coffre. Elle protège les mêmes données, indépendamment de la clé disparue — elle ouvrira tout.',
  'unrecoverable.useKit': 'Utiliser ma clé de récupération',
  'unrecoverable.noKit':
    'Recommencez et restaurez à partir d’un fichier de sauvegarde si vous en avez un. Sinon, vous devrez reconfigurer l’authentification à deux facteurs sur chaque site, à l’aide des codes de secours qu’ils vous ont donnés.',
  'unrecoverable.confirmErase': 'Oui, tout effacer et recommencer',
  'common.cancel': 'Annuler',
  'unrecoverable.startOver': 'Recommencer',

  // --- Robustesse du mot de passe -----------------------------------------------
  'strength.0': 'très faible',
  'strength.1': 'faible',
  'strength.2': 'moyen',
  'strength.3': 'fort',
  'strength.4': 'très fort',
  'strength.line': 'Robustesse : {label}',
  'strength.lineWithWarning': 'Robustesse : {label} — {warning}',
  'strength.tooShort': 'Utilisez au moins 10 caractères — la longueur compte le plus.',
  'strength.digitsOnly': 'Des chiffres seuls se devinent facilement.',
  'strength.repeated': 'Évitez les caractères répétés.',

  // --- Premier lancement --------------------------------------------------------
  'setup.prompt': 'Choisissez comment vos secrets 2FA sont protégés.',
  'setup.device.title': 'Commencer tout de suite',
  'setup.device.badge': 'Recommandé',
  'setup.device.description':
    'Vos secrets sont chiffrés avec une clé que ce navigateur garde pour vous. Rien à retenir, rien à saisir.',
  'setup.device.footnote':
    'Protège contre tout ce qui peut exécuter des scripts ou lire les données de votre extension. Pas contre un logiciel malveillant qui s’exécute sous votre compte sur cette machine.',
  'setup.password.title': 'Ajouter un mot de passe principal',
  'setup.password.description':
    'Un mot de passe déverrouille le coffre, puis il se reverrouille quand vous ne l’utilisez plus.',
  'setup.password.footnote':
    'L’option la plus sûre : une fois verrouillé, rien sur cet ordinateur ne peut ouvrir le coffre sans le mot de passe.',
  'setup.footer': 'Dans les deux cas, AES-256-GCM. Modifiable à tout moment ; la synchronisation est facultative, dans les Paramètres.',
  'setup.footer.noSync': 'Dans les deux cas, AES-256-GCM. Modifiable à tout moment, dans les Paramètres.',
  'setup.source': 'Open source — lire le code',
  'common.back': 'Retour',
  'setup.passwordStep.title': 'Définir un mot de passe principal',
  'setup.passwordStep.warning':
    'Personne ne peut réinitialiser ce mot de passe. Si vous l’oubliez, seule une clé de récupération ouvre le coffre — créez-en une dans Paramètres → Sécurité, et notez le mot de passe en lieu sûr.',
  'setup.passwordStep.label': 'Mot de passe principal',
  'setup.passwordStep.placeholder': 'Au moins 8 caractères',
  'setup.passwordStep.confirm': 'Confirmer le mot de passe',
  'common.passwordsDiffer': 'Les mots de passe ne correspondent pas.',
  'setup.passwordStep.submit': 'Créer mon coffre',
  'setup.passwordStep.footer': 'AES-256-GCM · clé dérivée par PBKDF2 (600 000 itérations)',

  // --- Clé de récupération, ouvrir un coffre ------------------------------------
  'recover.title': 'Utiliser votre clé de récupération',
  'recover.intro':
    'La clé de 32 caractères de la feuille que vous avez conservée en créant ce coffre. L’utiliser remplace la façon dont le coffre se verrouille : choisissez-la aussi ci-dessous.',
  'recover.keyLabel': 'Clé de récupération',
  'recover.hintEmpty': 'Lettres et chiffres uniquement — les espaces n’ont pas d’importance.',
  'recover.hintRight': 'Le format est bon.',
  'recover.hintCount': '{count} caractères sur 32.',
  'recover.lockQuestion': 'Comment ce coffre doit-il se verrouiller désormais ?',
  'recover.lockPassword': 'Définir un nouveau mot de passe principal',
  'recover.lockDevice': 'Pas de mot de passe — cet appareil garde la clé',
  'recover.newPassword': 'Nouveau mot de passe principal',
  'recover.atLeast8': 'Au moins 8 caractères.',
  'recover.submit': 'Déverrouiller et reverrouiller ce coffre',

  // --- Champ de mot de passe ----------------------------------------------------
  'meter.0': 'Trop faible',
  'meter.1': 'Faible',
  'meter.2': 'Moyen',
  'meter.3': 'Fort',
  'meter.4': 'Très fort',
  'password.show': 'Afficher le mot de passe',
  'password.hide': 'Masquer le mot de passe',

  // --- Fenêtre : la liste -------------------------------------------------------
  'vault.search': 'Rechercher des comptes',
  'vault.add': 'Ajouter un compte',
  'vault.settings': 'Paramètres',
  'vault.lock': 'Verrouiller maintenant',
  'vault.count': { one: '{count} compte', other: '{count} comptes' },
  'vault.syncedWith': 'Synchronisé avec {email}',
  'vault.syncedAs': 'synchronisé en tant que {email}',
  'vault.changeOrder': 'Changer l’ordre',
  'vault.byName': 'Par nom',
  'vault.orderAdded': 'Ordre d’ajout',
  'vault.joinRequests': {
    one: 'Un appareil demande à rejoindre votre compte.',
    other: '{count} appareils demandent à rejoindre votre compte.',
  },
  'vault.joinRequestsHint': 'N’approuvez que celui sur lequel vous êtes vous-même en train de vous connecter.',
  'vault.reviewInSettings': 'Examiner dans les Paramètres',
  'vault.noMatch': 'Aucun compte ne correspond à « {query} ».',
  'vault.forHost': 'Pour {host}',
  'vault.fieldDetected': 'champ de code détecté',
  'common.encryptedHere': 'Chiffré sur cet appareil',
  'vault.fillWarning':
    '<b>{account}</b> est pour <b>{domain}</b>, mais cette page est <b>{host}</b>. Si vous ne vous y attendiez pas, la page se fait peut-être passer pour le site.',
  'vault.dontFill': 'Ne pas remplir',
  'vault.fillAnyway': 'Remplir quand même',
  'vault.empty.title': 'Aucun compte pour l’instant',
  'vault.empty.body':
    'Ouvrez la page de configuration de la double authentification d’un site, puis scannez son QR code directement depuis l’onglet.',
  'vault.empty.add': 'Ajouter votre premier compte',

  // --- Fenêtre : un compte ------------------------------------------------------
  'common.untitled': 'Sans titre',
  'row.copyHint': 'Cliquer pour copier',
  'row.share': 'Partager ou transférer',
  'row.shareHint': 'Envoyer ses codes pour un moment, ou le transférer vers une autre app',
  'row.favouriteAdd': 'Ajouter aux favoris',
  'row.favouriteRemove': 'Retirer des favoris',
  'row.fillHint': 'Remplir ce code dans la page',
  'row.fill': 'Remplir',
  'row.copied': 'Copié',
  'row.copy': 'Copier le code',
  'row.next': 'Générer le code suivant',
  'row.counter': 'Compteur : {counter}',

  // --- Fenêtre : demande d’avis -------------------------------------------------
  'rate.region': 'Noter Keyrook Authenticator',
  'rate.body': '<b>Keyrook Authenticator vous est utile ?</b> Une note sur {store}, c’est ainsi que d’autres le découvrent.',
  'rate.store.chrome': 'le Chrome Web Store',
  'rate.store.edge': 'les modules complémentaires Edge',
  'rate.notNow': 'Pas maintenant',
  'rate.rate': 'Noter',

  // --- Éléments communs ---------------------------------------------------------
  'common.openSource': 'Open source',

  // --- Ajouter un compte --------------------------------------------------------
  'add.title.manual': 'Saisir une clé de configuration',
  'add.title.camera': 'Scanner avec la caméra',
  'add.title.quick': 'Obtenir un code, sans enregistrer',
  'add.title.choose': 'Ajouter un compte',
  'add.page.title': 'Scanner le QR code de cette page',
  'add.page.description': 'Prend une capture de l’onglet visible et y lit le code.',
  'add.camera.title': 'Scanner avec la caméra',
  'add.camera.description': 'Pour un code affiché sur votre téléphone — y compris un export de Google Authenticator.',
  'add.camera.elsewhere':
    'Ouvre une fois les Paramètres pour que Chrome puisse demander l’accès à la caméra. Ensuite, cela fonctionne directement ici.',
  'add.upload.title': 'Importer une image de QR code',
  'add.upload.description': 'Une capture d’écran ou une photo enregistrée plus tôt.',
  'add.manual.title': 'Saisir une clé de configuration à la main',
  'add.manual.description': 'Pour les sites qui affichent un code au lieu d’un QR.',
  'add.quick.title': 'Juste obtenir un code',
  'add.quick.description': 'Collez une clé et voyez son code tout de suite. Rien n’est enregistré.',
  'add.fromGoogle':
    'Vous venez de Google Authenticator ? Exportez-y vos comptes, puis scannez le code qu’il affiche avec la caméra ou importez-en une capture d’écran. S’il en affiche plusieurs, faites-les un par un.',
  'common.done': 'Terminé',
  'add.noNativeReader':
    'Sur cet ordinateur, Chrome n’a pas de lecteur de QR intégré : un gros code — comme un export de Google Authenticator — passe souvent mal à la caméra. Si le vôtre ne passe pas, faites une capture d’écran sur votre téléphone et utilisez plutôt « Importer une image de QR code ».',
  'add.openScannerInSettings': 'Ouvrir le scanner dans les Paramètres',
  'add.noneFound': 'Aucun compte trouvé.',
  'add.noQrOnPage':
    'Aucun QR code trouvé dans la partie visible de la page. Faites-le défiler à l’écran et réessayez.',
  'add.noQrInImage': 'Aucun QR code trouvé dans cette image.',
  'add.cannotReadUri': 'Impossible de lire cet URI.',
  'add.enterKey': 'Saisissez la clé de configuration fournie par le site.',
  'add.offeredOn': 'Les codes pour {domain} seront proposés sur ce site.',
  'add.startTyping': 'Commencez à taper — les services connus remplissent eux-mêmes leurs informations.',
  'add.account': 'Compte',
  'add.accountPlaceholder': 'vous@exemple.fr',
  'add.setupKey': 'Clé de configuration',
  'add.linkDetected': 'Lien otpauth:// détecté — le service et le compte seront remplis à partir de celui-ci.',
  'add.spacesFine': 'Les espaces et les minuscules ne posent pas de problème.',
  'add.submit': 'Ajouter le compte',
  'add.summary': { one: 'Le {count} code a été scanné.', other: 'Les {count} codes ont été scannés.' },
  'add.summaryAdded': { one: '{count} compte ajouté.', other: '{count} comptes ajoutés.' },
  'add.summarySkipped': {
    one: '{count} était déjà dans votre coffre et a été laissé tel quel.',
    other: '{count} étaient déjà dans votre coffre et ont été laissés tels quels.',
  },
  'error.badKey':
    'Une clé de configuration n’utilise que les lettres A–Z et les chiffres 2–7. Vérifiez qu’elle a été copiée en entier, sans rien de plus.',
  'error.quickIsMigration':
    'C’est un lien de transfert Google Authenticator, pour plusieurs comptes à la fois. Importez-le plutôt.',
  'error.keyTooShort': 'C’est trop court pour être une clé de configuration.',
  'error.fileTooLarge': 'Ce fichier est trop volumineux pour être lu.',
  'error.notSetupQr': 'Ce QR code n’est pas un code de configuration 2FA.',
  'error.alreadyInVault': 'Ce compte est déjà dans votre coffre.',
  'error.gaSkipPeriod': 'Google Authenticator ne garde que les codes de 30 secondes ; celui-ci utilise {period}.',
  'error.gaSkipDigits': 'Google Authenticator ne garde que les codes à 6 ou 8 chiffres ; celui-ci en a {digits}.',
  'error.gaSkipSteam': 'Google Authenticator ne sait pas produire de codes Steam Guard.',

  // --- Scan avec la caméra ------------------------------------------------------
  'scan.progressBatch': 'Code {seen} sur {total} scanné — {accounts}. Affichez le code suivant.',
  'scan.progress': '{accounts}.',
  'scan.added': { one: '{count} compte ajouté', other: '{count} comptes ajoutés' },
  'scan.found': { one: '{count} compte trouvé', other: '{count} comptes trouvés' },
  'scan.skippedVault': {
    one: '{count} était déjà dans votre coffre.',
    other: '{count} étaient déjà dans votre coffre.',
  },
  'scan.skippedScanned': { one: '{count} était déjà scanné.', other: '{count} étaient déjà scannés.' },
  'camera.noCamera': 'Ce navigateur ne donne pas accès à une caméra à l’extension.',
  'camera.preview': 'Aperçu de la caméra',
  'camera.failedHint':
    'Vous pouvez toujours ajouter un compte en important une photo du QR code, ou en saisissant la clé de configuration.',
  'camera.hint':
    'Placez le QR code dans le cadre. Vous venez de Google Authenticator ? Ouvrez son écran d’export sur votre téléphone et pointez la caméra dessus — s’il affiche plusieurs codes, montrez-les l’un après l’autre.',
  'camera.privacy':
    'L’image est lue sur cet appareil puis jetée. Rien n’est enregistré et rien n’est envoyé.',
  'camera.blocked':
    'Chrome a bloqué l’accès à la caméra. Autorisez-le pour cette page, ou utilisez une autre façon d’ajouter un compte.',
  'camera.none': 'Aucune caméra trouvée sur cet ordinateur.',
  'camera.busy': 'La caméra est utilisée par un autre programme.',

  // --- Images et QR codes -------------------------------------------------------
  'image.unreadable': 'Ce fichier n’a pas pu être lu comme une image.',
  'image.wrongType': 'Utilisez une image PNG, JPEG, WebP, GIF ou BMP.',
  'image.tooBig': 'Cette image est très volumineuse. Essayez-en une de moins de 8 Mo.',
  'image.cannotPrepare': 'Impossible de préparer l’image.',
  'image.wontCompress':
    'Cette image ne se compresse pas assez. Un logo simple convient mieux qu’une photo.',
  'image.wrongScreenshotType': 'Utilisez une capture d’écran PNG, JPEG, WebP, GIF ou BMP.',
  'brand.account': 'Compte',
  'brand.unknown': 'Service inconnu',

  // --- Champ de service ---------------------------------------------------------
  'service.label': 'Service',
  'service.matches': 'Services correspondants',

  // --- Transférer un compte vers une autre app ----------------------------------
  'share.intro':
    'Scannez-le avec Google Authenticator, Microsoft Authenticator, 1Password, Authy — n’importe quelle app d’authentification — et elle générera les mêmes codes que celle-ci.',
  'share.warning':
    'Quiconque voit ou photographie ce code peut générer vos codes pour {account}, tant que le compte existe. Ne le montrez qu’à l’app vers laquelle vous passez.',
  'share.show': 'Afficher le QR code',
  'share.qrLabel': 'QR code de configuration pour {account}',
  'share.hidesIn': 'Scannez-le avec l’autre app. Il se masque dans {seconds} s.',
  'share.linkCopied': 'Lien copié',
  'share.copyLink': 'Copier le lien de configuration',
  'share.saveImage': 'Enregistrer en image',
  'share.linkWarning':
    'Le lien contient aussi le secret. Collez-le dans l’autre app, puis copiez autre chose par-dessus.',
  'share.hideNow': 'Masquer maintenant',
  'shareCodes.modeLabel': 'Partager ou transférer',
  'shareCodes.modeCodes': 'Envoyer des codes',
  'shareCodes.modeMove': 'Transférer vers une autre app',
  'shareCodes.noSecret': 'Ce compte n’a pas de clé de configuration : il ne génère aucun code et il n’y a rien à partager ni à transférer. Supprimez-le, puis ajoutez de nouveau le compte depuis son code QR.',
  'shareCodes.intro': 'Créez un lien qui affiche les codes de ce compte jusqu’à son expiration — jamais la clé qui les produit.',
  'shareCodes.lengthLabel': 'Valable',
  'shareCodes.min5': '5 minutes',
  'shareCodes.min15': '15 minutes',
  'shareCodes.hour': '1 heure',
  'shareCodes.cannotRecall': 'Un lien ne peut pas être repris. Quiconque l’a peut utiliser les codes jusqu’à son expiration, alors ne l’envoyez qu’à la personne qui en a besoin.',
  'shareCodes.copy': 'Copier le lien',
  'shareCodes.copied': 'Lien copié. Il est valable jusqu’à {time}.',
  'shareCodes.counter': 'Les codes à compteur ne peuvent pas être envoyés ainsi : chacun est consommé dès qu’il est produit. Transférez plutôt le compte.',

  // --- Obtenir un code sans enregistrer -----------------------------------------
  'quick.label': 'Clé de configuration ou lien otpauth://',
  'quick.copyHint': 'Cliquer pour copier',
  'quick.current': 'Code actuel',
  'quick.next': 'Suivant : <code>{code}</code>',
  'quick.notSaved': 'Enregistré nulle part. Fermez ceci et la clé disparaît.',
  'quick.save': 'L’enregistrer plutôt comme compte',
  'quick.settings': '{digits} chiffres · toutes les {period} s · {algorithm}',
  'quick.change': 'modifier',
  'quick.digits': 'Chiffres',
  'quick.every': 'Toutes les',
  'quick.seconds': '{seconds} s',
  'quick.hash': 'Hachage',

  // --- Paramètres : cadre -------------------------------------------------------
  'nav.accounts': 'Comptes',
  'nav.backup': 'Sauvegarde',
  'nav.security': 'Sécurité',
  'nav.about': 'À propos',
  'options.count': { one: '{count} compte', other: '{count} comptes' },
  'options.sourceOnGithub': 'Open source sur GitHub',
  // --- Une nouvelle clé de récupération -----------------------------------------
  'sheet.once':
    'C’est la seule fois que cette clé s’affiche. Elle n’est enregistrée nulle part — si vous la perdez, créez-en une nouvelle.',
  'sheet.print': 'Imprimer',
  'sheet.apart': 'Gardez-la à l’écart de votre messagerie et ne vous l’envoyez jamais par e-mail : avec cette clé et votre adresse e-mail, quelqu’un peut définir un nouveau mot de passe et ouvrir vos codes.',
  'sheet.apartProvider': 'Gardez-la à l’écart du compte Google ou GitHub avec lequel vous vous connectez, et ne la rangez jamais dans la messagerie ou le stockage de ce compte : avec cette clé et ce compte, quelqu’un peut ouvrir vos codes.',
  'sheet.kept': 'Je l’ai enregistrée',
  'sheet.checkHeading': 'Vérifiez que vous l’avez enregistrée',
  'sheet.checkLead': 'Saisissez deux groupes de la clé d’après ce que vous avez enregistré. Les groupes sont les blocs de quatre entre les tirets, comptés depuis la gauche.',
  'sheet.group': 'Groupe {position}',
  'sheet.check': 'Vérifier',
  'sheet.mismatch': 'Ce n’est pas ce qu’indique votre clé. Regardez à nouveau ce que vous avez enregistré, ou affichez de nouveau la clé et enregistrez-la maintenant.',
  'sheet.showAgain': 'Afficher de nouveau la clé',
  'sheet.download': 'Télécharger la feuille',
  'sheet.copy': 'Copier',

  // --- Groupes ------------------------------------------------------------------
  'groups.title': 'Groupes',
  'groups.description':
    'Des titres dans la liste, pour qu’un grand coffre se lise d’un coup d’œil. On range un compte dans un groupe depuis son propre écran Modifier.',
  'groups.new': 'Nouveau groupe',
  'groups.newPlaceholder': 'Travail',
  'groups.add': 'Ajouter',
  'groups.none':
    'Aucun groupe pour l’instant. Tout s’affiche dans une seule liste, ce qui convient jusqu’à ce qu’elle soit assez longue pour être divisée.',
  'groups.moveUp': 'Monter {name}',
  'groups.moveDown': 'Descendre {name}',
  'common.save': 'Enregistrer',
  'groups.count': { one: '{count} compte', other: '{count} comptes' },
  'groups.removeNote': 'Les comptes restent, sans groupe.',
  'common.remove': 'Supprimer',
  'groups.rename': 'Renommer',
  'groups.removeNamed': 'Supprimer {name}',
  'groups.ungrouped': {
    one: '{count} compte n’est dans aucun groupe et apparaît sous « Sans groupe » à la fin de la liste.',
    other: '{count} comptes ne sont dans aucun groupe et apparaissent sous « Sans groupe » à la fin de la liste.',
  },

  // --- À propos -----------------------------------------------------------------
  'about.fact.sync.title': 'Vos secrets sont chiffrés avant que quoi que ce soit ne quitte cet appareil',
  'about.fact.sync.body':
    'La synchronisation est facultative. Avec elle, seul du texte chiffré atteint le serveur, qui n’a aucun moyen de le déchiffrer. Les codes sont toujours calculés localement. Il n’y a aucune télémétrie.',
  'about.fact.local.title': 'Vos secrets ne quittent jamais cet appareil',
  'about.fact.local.body':
    'Cette version n’a ni serveur, ni compte, ni télémétrie. Les codes sont calculés localement à partir de secrets stockés dans un coffre chiffré.',
  'about.fact.keys.title': 'Deux façons de garder la clé, toutes deux AES-256-GCM',
  'about.fact.keys.body':
    'Vos comptes sont chiffrés avec une clé de données elle-même enveloppée. Avec un mot de passe principal, la clé d’enveloppe provient de PBKDF2 à 600 000 itérations et n’existe qu’en mémoire tant que le coffre est déverrouillé. Sans, c’est une clé non exportable gardée par ce navigateur — aucun script ne peut en lire les octets, même si elle n’est pas protégée par le matériel.',
  'about.fact.access.title': 'Aucun accès global aux sites',
  'about.fact.access.body':
    'L’extension ne demande aucune autorisation d’hôte. Lire un QR code sur une page, ou y remplir un code, passe par activeTab — une autorisation que Chrome accorde uniquement pour l’onglet sur lequel vous avez ouvert l’extension.',
  'about.fact.standards.title': 'Des standards, pas d’enfermement',
  'about.fact.standards.body':
    'TOTP RFC 6238 et HOTP RFC 4226, avec import et export otpauth://. Vous pouvez passer à une autre app à tout moment en emportant tout.',
  'about.version': 'Version {version}',
  'about.source': 'Code source',
  'about.viewOnGithub': 'Voir sur GitHub',
  'about.securityModel': 'Modèle de sécurité',
  'about.securityModelDescription': 'Ce que l’extension garantit, y compris face au serveur de synchronisation.',
  'about.readIt': 'Le lire',
  'about.rate': 'Noter Keyrook Authenticator',
  'about.rateWhere': 'Sur {store}. Cela prend quelques secondes.',
  'about.report': 'Signaler un problème ou suggérer quelque chose',
  'about.reportDescription':
    'Sur GitHub, où tout le monde peut le lire. N’y collez jamais une clé de configuration, un code ou une sauvegarde.',
  'about.openIssue': 'Ouvrir un ticket',
  'about.how': 'Comment cela fonctionne',
  'about.logos.title': 'Logos des services',
  'about.logos.description':
    'Les logos sont intégrés à l’extension, jamais téléchargés. Demander un logo au réseau révélerait à celui qui répond les services sur lesquels vous utilisez la double authentification.',
  'about.logos.body':
    '{count} services ont un vrai logo. Illustrations de <simple>Simple Icons</simple> (CC0 1.0), LobeHub Icons, SVG Logos, CoreUI Brands, Arcticons et <fa>Font Awesome Free</fa> (icônes, CC BY 4.0). Tous les noms de produits et logos appartiennent à leurs propriétaires et servent uniquement à identifier le service d’un compte. Un service sans logo dans ces collections reçoit une tuile avec une lettre.',
  'about.shortcut.change': 'Modifiable dans chrome://extensions/shortcuts.',
  // --- Paramètres : comptes -----------------------------------------------------
  'accounts.title': 'Comptes',
  'accounts.description':
    'Tout ce qui est stocké dans ce coffre. Les codes sont générés sur cet appareil, jamais par un serveur.',
  'accounts.empty': 'Aucun compte pour l’instant. Ajoutez-en un pour commencer.',
  'accounts.digits': '{type} {digits} chiffres',
  'accounts.period': ' · {seconds} s',
  'accounts.counter': ' · compteur {counter}',
  'accounts.steam': 'Steam Guard',
  'accounts.moveNamed': 'Partager ou transférer {name}',
  'accounts.edit': 'Modifier',
  'common.delete': 'Supprimer',
  'accounts.deleteNamed': 'Supprimer {name}',
  'accounts.deleted.title': 'Supprimés récemment',
  'accounts.deleted.description':
    'Conservés pour que les autres appareils apprennent la suppression une fois la synchronisation activée. Restaurez ce que vous avez supprimé par erreur.',
  'accounts.deleted.on': 'Supprimé le {date}',
  'accounts.restore': 'Restaurer',
  'common.close': 'Fermer',
  'editor.title': 'Modifier le compte',
  'editor.picture': 'Image',
  'editor.pictureOwn': 'Votre propre image, utilisée à la place du logo du service.',
  'editor.pictureNone': 'Choisissez-en une pour les services sans logo ici, ou pour distinguer deux comptes.',
  'editor.replace': 'Remplacer',
  'editor.choose': 'Choisir une image…',
  'editor.websites': 'Sites web',
  'editor.websitesHint': 'Séparés par des virgules. Sert à proposer ce compte sur les sites correspondants.',
  'editor.note': 'Note',
  'editor.group': 'Groupe',
  'editor.ungrouped': 'Sans groupe',
  'editor.noGroups': 'Créez d’abord un groupe dans Comptes.',
  'editor.setupKey': 'Clé de configuration',
  'editor.setupKeyHint': 'Le secret derrière ce compte. Quiconque le voit peut générer vos codes.',
  'editor.hide': 'Masquer',
  'editor.reveal': 'Afficher',
  'editor.revealWarning':
    'N’affichez ceci que sur un écran que personne d’autre ne voit. Copier ce lien dans une autre app d’authentification permet de transférer le compte sur un téléphone.',
  'editor.save': 'Enregistrer les modifications',

  // --- Paramètres : import ------------------------------------------------------
  'import.incomplete': {
    one: 'Ces captures contiennent {seen} des {total} codes de cet export Google Authenticator : les comptes de celui qui manque ne sont donc pas là. Choisissez toutes les captures de l’export ensemble pour tout récupérer.',
    other: 'Ces captures contiennent {seen} des {total} codes de cet export Google Authenticator : les comptes des {count} autres ne sont donc pas là. Choisissez toutes les captures de l’export ensemble pour tout récupérer.',
  },
  'import.oneOrScreenshots': 'Choisissez un fichier de sauvegarde, ou une ou plusieurs captures de QR codes.',
  'import.noQrInThis': 'Aucun QR code trouvé dans cette image.',
  'import.noAccountsInImages': 'Ces images ne contenaient aucun compte.',
  'import.tooLarge': 'Ce fichier est trop volumineux pour être une sauvegarde.',
  'import.noAccountsInFile': 'Ce fichier ne contenait aucun compte.',
  'import.description':
    'Récupérez des comptes depuis un fichier de sauvegarde, depuis l’export d’une autre app d’authentification — scanné avec la caméra ou choisi en captures — ou en collant des liens otpauth://.',
  'import.stopAndReview': 'Arrêter et vérifier {count}',
  'import.noNativeReader':
    'Sur cet ordinateur, Chrome n’a pas de lecteur de QR intégré : un gros code — comme un export de Google Authenticator — passe souvent mal à la caméra. Si le vôtre ne passe pas, faites une capture de chaque code sur votre téléphone et choisissez-les toutes avec « Choisir des fichiers ».',
  'import.encrypted': 'Cette sauvegarde est chiffrée. Saisissez le mot de passe avec lequel elle a été créée.',
  'import.backupPassword': 'Mot de passe de la sauvegarde',
  'import.open': 'Ouvrir la sauvegarde',
  'import.found': { one: '{count} nouveau compte trouvé', other: '{count} nouveaux comptes trouvés' },
  'import.skipping': ', {count} déjà dans votre coffre ignorés',
  'import.unreadable': ', et {count} illisibles',
  'import.foundEnd': '.',
  'import.showFailed': 'Afficher les lignes en échec',
  'import.import': 'Importer {count}',
  'import.scan': 'Scanner avec la caméra',
  'import.choose': 'Choisir des fichiers…',
  'import.paste': '… ou collez des liens otpauth://, un par ligne',
  'import.read': 'Lire les liens',

  // --- Tout transférer vers une autre app ---------------------------------------
  'dest.google.steps':
    'Dans Google Authenticator : menu → Transférer des comptes → Importer des comptes, puis scannez les codes dans l’ordre.',
  'dest.microsoft.steps':
    'Microsoft Authenticator ne peut pas importer depuis une autre app : les comptes passent donc un par un. Dans l’app : + → Autre compte, scannez, puis Suivant ici.',
  'dest.apple.steps':
    'Mots de passe n’importe les codes qu’un par un. Dans l’app Mots de passe : Codes → +, scannez, puis Suivant ici.',
  'dest.authy.steps':
    'Authy ne peut pas importer depuis une autre app : les comptes passent donc un par un. Dans Authy : + → Scanner un QR code, puis Suivant ici.',
  'dest.1password.steps':
    '1Password ajoute les codes identifiant par identifiant. Ouvrez ou créez l’identifiant → Modifier → ajoutez un mot de passe à usage unique → scannez, puis Suivant ici. Sur ordinateur, il peut lire le code directement sur cet écran.',
  'dest.bitwarden.steps':
    'Gestionnaire de mots de passe : Importer des données → format « Bitwarden (json) » → choisissez le fichier. App Bitwarden Authenticator : importez depuis Google Authenticator et scannez les codes de transfert.',
  'dest.proton.steps':
    'Dans Proton Authenticator, importez depuis Google Authenticator et scannez les codes de transfert — ou importez depuis Aegis et choisissez le fichier.',
  'dest.ente.steps':
    'Dans Ente Auth, importez les codes depuis Google Authenticator et scannez les codes de transfert — ou choisissez « Texte brut » et le fichier .txt.',
  'dest.aegis.steps': 'Dans Aegis : Importer et exporter → Importer depuis un fichier → Aegis, et choisissez le fichier.',
  'dest.2fas.steps':
    'Dans 2FAS, importez depuis Google Authenticator et scannez les codes de transfert — ou importez depuis Aegis et choisissez le fichier.',
  'dest.other.steps':
    'Toute app d’authentification scanne un code de configuration : un par un, ça marche toujours. Beaucoup importent aussi les codes de transfert de Google Authenticator, ou un fichier de liens otpauth:// — cherchez une option d’import.',
  'dest.other.name': 'Une autre app',

  // --- Paramètres : export ------------------------------------------------------
  'export.what': 'Quoi exporter',
  'export.all': { one: 'Le {count} compte.', other: 'Les {count} comptes.' },
  'export.someChosen': '{chosen} sur {total} choisis.',
  'export.choose': 'Choisir…',
  'export.chipAll': 'Tous',
  'export.chipNone': 'Aucun',
  'export.encrypted.description':
    'Un fichier verrouillé par un mot de passe que vous choisissez ici. Gardez-en une copie en lieu sûr — si cet appareil lâche, c’est ce fichier qui vous rendra vos comptes.',
  'export.encrypted.hint': 'Au moins 8 caractères. Peut différer de votre mot de passe principal.',
  'export.encrypted.download': 'Télécharger la sauvegarde chiffrée ({count})',
  'export.move.title': 'Transférer vers une autre app',
  'export.move.description':
    'Des exports lisibles, pour passer à une autre app d’authentification ou garder sur papier. Contrairement à une sauvegarde, aucun n’est chiffré.',
  'export.move.danger':
    'Ils contiennent vos secrets 2FA en clair. Quiconque voit les codes ou ouvre les fichiers peut générer vos codes tant que les comptes existent. Supprimez les fichiers, et détruisez le papier, une fois terminé.',
  'export.move.understood': 'Je comprends qu’ils ne sont pas chiffrés.',
  'common.continue': 'Continuer',
  'export.move.which': 'Vers quelle app passez-vous ?',
  'export.filesAndPaper': 'Fichiers et papier :',
  'export.aegis': 'Aegis .json',
  'export.bitwarden': 'Bitwarden .json',
  'export.text': 'otpauth .txt',
  'export.print': 'Imprimer une feuille',
  'export.closesIn': {
    one: '{accounts}. Se referme dans {count} minute.',
    other: '{accounts}. Se referme dans {count} minutes.',
  },
  'export.closesSoon': '{accounts}. Se referme bientôt.',
  'export.accounts': { one: '{count} compte', other: '{count} comptes' },
  'export.closeNow': 'Fermer maintenant',
  'export.method.transfer': 'Afficher les codes de transfert',
  'export.method.oneByOne': 'Scanner un par un',
  'export.method.aegis': 'Télécharger le fichier Aegis',
  'export.method.bitwarden': 'Télécharger le fichier Bitwarden',
  'export.method.text': 'Télécharger le fichier texte',
  'export.allAtOnce': 'Tout d’un coup',
  'export.oneAtATime': 'Un par un',
  'export.transfer.label': 'Codes de transfert pour {app}',
  'export.transfer.title': 'Codes de transfert Google Authenticator',
  'export.moveTo': 'Transférer vers {app}',
  'export.transfer.none': 'Aucun des comptes choisis ne peut aller dans Google Authenticator.',
  'export.transfer.codeLabel': 'Code de transfert {index} sur {total}',
  'export.previous': 'Précédent',
  'export.next': 'Suivant',
  'export.transfer.code': 'Code {index} sur {total}',
  'export.transfer.oneHolds': {
    one: 'Un seul code contient le {count} compte.',
    other: 'Un seul code contient les {count} comptes.',
  },
  'export.transfer.notIncluded': 'Non inclus — transférez-les plutôt un par un :',
  'export.oneByOne.label': 'Codes de configuration pour {app}, un par un',
  'export.oneByOne.title': 'Un compte à la fois',
  'export.oneByOne.progress': 'Comptes affichés',
  'export.oneByOne.position': 'Compte {index} sur {total}',
  'export.oneByOne.keys': '→ ou Espace pour le suivant, Échap pour arrêter',
  'export.steamRefused': '{app} ne sait pas produire de codes Steam Guard, et n’acceptera donc pas ce compte.',
  'export.print.label': 'QR codes à imprimer ou scanner',
  'export.print.title': 'Keyrook Authenticator — codes de configuration',
  'export.print.body':
    '{accounts}, {date}. Chaque code configure le compte dans n’importe quelle app d’authentification. Quiconque détient ceci peut générer vos codes : gardez-le sous clé.',
  'export.print.print': 'Imprimer ou enregistrer en PDF',

  // --- Paramètres : sécurité, en haut -------------------------------------------
  'security.locking': 'Verrouillage',
  'security.lockAfter': 'Verrouiller après inactivité',
  'security.lockAfter.passphrase':
    'La clé de déchiffrement est effacée de la mémoire. Votre mot de passe principal sera de nouveau demandé.',
  'security.lockAfter.device':
    'Ne s’applique qu’avec un mot de passe principal — un coffre à clé d’appareil n’a rien à déverrouiller.',
  'security.autoLock': 'Délai de verrouillage automatique',
  'security.minutes': { one: '{count} minute', other: '{count} minutes' },
  'security.hour': '1 heure',
  'security.never': 'Jamais',
  'security.needsPassword': 'Nécessite un mot de passe principal',
  'security.blur': 'Flouter les codes jusqu’au survol',
  'security.blurDescription': 'Garde les codes hors de l’écran pendant un partage d’écran.',
  'security.blurToggle': 'Flouter les codes',
  'security.autofill': 'Remplissage automatique',
  'security.autofillRow': 'Proposer de remplir les codes sur les pages web',
  'security.appearance': 'Apparence',
  'security.theme': 'Thème',
  'security.theme.system': 'Comme le système',
  'security.theme.light': 'Clair',
  'security.theme.dark': 'Sombre',
  'security.sortBy': 'Trier les comptes par',
  'security.sortOrder': 'Ordre de tri',
  'security.sort.added': 'Ordre d’ajout',
  'security.sort.name': 'Nom',
  'security.language': 'Langue',
  'security.languageBrowser': 'Langue du navigateur ({language})',
  // --- Paramètres : protection du coffre ----------------------------------------
  'protect.msg.removedSignedIn':
    'Cet appareil s’ouvre désormais sans mot de passe. Le mot de passe de votre compte n’a pas changé.',
  'protect.msg.removed': 'Mot de passe principal supprimé. Ce coffre se déverrouille désormais automatiquement sur cet appareil.',
  'protect.msg.setSignedIn': 'Cet appareil se verrouille désormais avec le mot de passe de votre compte.',
  'protect.msg.set': 'Mot de passe principal défini. Il vous sera demandé une fois le coffre verrouillé.',
  'protect.msg.changedSignedIn':
    'Mot de passe changé, pour ce coffre et votre compte. Vos autres appareils vous demanderont de vous reconnecter avec.',
  'protect.msg.changed': 'Mot de passe principal changé.',
  'protect.state.accountPassword': 'Se verrouille avec le mot de passe du compte',
  'protect.state.master': 'Mot de passe principal',
  'protect.state.device': 'Clé d’appareil (sans mot de passe)',
  'protect.lockWithAccount': 'Verrouiller avec le mot de passe du compte',
  'protect.addMaster': 'Ajouter un mot de passe principal',
  'protect.changePassword': 'Changer le mot de passe',
  'protect.note.passphrase':
    'C’est aussi le mot de passe de votre compte de synchronisation. Le changer ici le change là-bas, et vos autres appareils vous demanderont de vous reconnecter.',
  'protect.note.device':
    'Votre compte de synchronisation a son propre mot de passe, que cet appareil ne demande pas. Il vous le faut sur un nouvel appareil, et pour modifier le compte ou sa clé de récupération.',
  'protect.removeWarning':
    'Le coffre reste chiffré, mais il se déverrouillera tout seul chaque fois que ce profil de navigateur est ouvert. Quiconque utilise cet ordinateur pourra alors voir vos codes.',
  'protect.removeWarningSignedIn':
    ' Votre compte garde son mot de passe — il vous le faudra toujours sur un nouvel appareil.',
  'protect.currentPassword': 'Mot de passe actuel',
  'protect.currentMaster': 'Mot de passe principal actuel',
  'protect.accountPassword': 'Mot de passe du compte',
  'protect.accountPasswordHint':
    'Le mot de passe avec lequel vous vous connectez à la synchronisation. Cet appareil le demandera une fois verrouillé.',
  'protect.newPassword': 'Nouveau mot de passe',
  'protect.hint12': 'Au moins 12 caractères variés, ou quatre ou cinq mots sans rapport entre eux.',
  'protect.confirmNew': 'Confirmer le nouveau mot de passe',
  'protect.removePassword': 'Supprimer le mot de passe',
  'protect.lockWithIt': 'Verrouiller avec',
  'protect.setPassword': 'Définir le mot de passe',
  'danger.title': 'Supprimer ce coffre',
  'danger.description':
    'Supprime tous les comptes et le coffre chiffré de cet appareil. Aucune annulation possible, et aucune copie ailleurs.',
  'danger.open': 'Supprimer ce coffre…',
  'danger.warning':
    'Assurez-vous d’abord d’avoir un autre accès à chaque compte — un fichier de sauvegarde, des codes de secours, ou les mêmes comptes sur votre téléphone.',
  'common.typeToConfirm': 'Tapez {word} pour confirmer',
  'danger.confirm': 'Tout supprimer',

  // --- Paramètres : clé de récupération -----------------------------------------
  'kit.title': 'Clé de récupération',
  'kit.provider':
    'Votre compte n’a pas de mot de passe. Une clé de récupération est le moyen de revenir si tous les appareils connectés sont perdus : elle laisse un nouvel appareil entrer dans votre compte sans qu’un autre ait à l’approuver. {provider} ne peut pas le faire pour vous.',
  'kit.signedIn':
    'Personne ne peut réinitialiser votre mot de passe à votre place — pas même nous. Une clé de récupération est le seul moyen de revenir si vous l’oubliez : elle ouvre ce coffre, vos autres appareils, et votre compte sur un nouvel appareil.',
  'kit.passphrase':
    'Personne ne peut réinitialiser votre mot de passe principal — pas même nous. C’est ce qui empêche quiconque d’ouvrir votre coffre, et c’est aussi pourquoi une clé de récupération est le seul moyen de revenir si vous l’oubliez.',
  'kit.device':
    'Ce coffre se déverrouille avec une clé gardée par votre navigateur. Si cette clé disparaît — données de navigation effacées, nouveau profil, réinstallation —, seule une clé de récupération peut encore l’ouvrir.',
  'kit.none': 'Pas encore de clé de récupération',
  'kit.vaultOnly': 'Ouvre ce coffre, mais pas votre compte',
  'kit.issued': 'Une clé de récupération a été créée',
  'kit.issueNew': 'En créer une nouvelle',
  'kit.create': 'Créer une clé de récupération',
  'kit.beforeSignIn':
    'Cette clé a été créée avant votre connexion, votre compte ne l’a donc pas. Elle ouvre toujours ce coffre ici, mais pas sur un nouvel appareil. Créez-en une nouvelle pour couvrir les deux.',
  'kit.replaces':
    'Créer une nouvelle clé désactive la précédente : une ancienne feuille imprimée peut être jetée une fois remplacée.',
  'kit.replacesSignedIn':
    'Créer une nouvelle clé désactive la précédente, ici et sur vos autres appareils : une ancienne feuille imprimée peut être jetée une fois remplacée.',
  'kit.withoutProvider':
    'Sans elle, perdre tous les appareils connectés à votre compte signifie perdre pour de bon tous les comptes de ce coffre.',
  'kit.withoutPassword':
    'Sans elle, oublier votre mot de passe signifie perdre pour de bon tous les comptes de ce coffre.',
  'kit.withoutDevice':
    'Sans elle, perdre la clé gardée par ce navigateur signifie perdre pour de bon tous les comptes de ce coffre.',
  'kit.noSupport': 'Aucune demande d’assistance ne peut y remédier.',
  'kit.removeProvider':
    'Sans elle, seul un appareil déjà connecté peut laisser entrer un nouvel appareil dans votre compte.',
  'kit.removePassword': 'Sans elle, votre mot de passe reste le seul moyen d’entrer.',
  'kit.removePasswordSignedIn':
    'Sans elle, votre mot de passe reste le seul moyen d’entrer — sur cet appareil, vos autres appareils et votre compte.',
  'kit.reauth':
    'Une clé de récupération peut laisser entrer un appareil dans votre compte : {provider} vous demande donc d’abord de vous reconnecter.',
  'kit.passwordHint': 'Une clé de récupération peut réinitialiser votre compte : la modifier demande votre mot de passe.',
  'kit.removeConfirm': 'Supprimer la clé de récupération',
  'kit.createConfirm': 'Créer la clé',

  // --- Paramètres : compte et synchronisation -----------------------------------
  'account.title': 'Compte',
  'facts.stored': 'Comptes stockés',
  'facts.noLimit': 'Sans limite',
  'facts.encryption': 'Chiffrement',
  'facts.autofill': 'Remplissage et scan de QR',
  'facts.included': 'Inclus',
  'facts.backup': 'Fichier de sauvegarde chiffré',
  'facts.sync': 'Synchronisation entre appareils',
  'facts.needsAccount': 'Nécessite un compte',
  'facts.notYet': 'Pas encore disponible',
  'facts.withoutAccount': 'Sans compte, sur cet appareil',
  'facts.title': 'Ce qu’offre un coffre local gratuit',
  'facts.description':
    'Pas de compte, pas d’e-mail, pas de serveur — et aucune limite sur ce qui compte pour la sécurité.',
  'account.localOnly': 'Local uniquement — non connecté',
  'account.noServer':
    'Cette version a été construite sans serveur de synchronisation : rien de ce que vous ajoutez ici ne quitte votre machine.',
  'account.signedInWith': 'Connecté avec {provider} · ',
  'account.lastSynced': 'Dernière synchronisation à {time}',
  'account.notSynced': 'Pas encore synchronisé',
  'account.every5': ' · synchronise toutes les 5 minutes',
  'account.syncNow': 'Synchroniser',
  'account.signOut': 'Se déconnecter',
  'account.noKitProvider':
    'Votre compte n’a pas de clé de récupération. Si tous les appareils connectés sont perdus, rien ne pourra récupérer vos comptes — ni nous, ni {provider}.',
  'account.noKit':
    'Votre compte n’a pas de clé de récupération. Si vous oubliez votre mot de passe et perdez cet appareil, rien ne pourra récupérer vos comptes — ni nous, ni personne.',
  'account.createUnderSecurity': 'En créer une dans Sécurité',
  'summary.sentReceived': '{sent} envoyés, {received} reçus',
  'summary.conflicts': ', version de cet appareil conservée pour {count}',
  'summary.overLimit': ', {count} n’ont pas tenu — un compte contient jusqu’à 10 000 entrées — et sont restés sur cet appareil',
  'summary.end': '.',
  'summary.deleted': {
    one: ' {count} compte a été supprimé sur un autre appareil — vous pouvez le restaurer dans Comptes.',
    other: ' {count} comptes ont été supprimés sur un autre appareil — vous pouvez les restaurer dans Comptes.',
  },
  'summary.rejected': {
    one: ' {count} enregistrement n’a pas pu être déchiffré et a été ignoré. Si cela se reproduit, la copie stockée a un problème.',
    other: ' {count} enregistrements n’ont pas pu être déchiffrés et ont été ignorés. Si cela se reproduit, la copie stockée a un problème.',
  },
  'account.signOutNote':
    'Se déconnecter retire vos codes de ce navigateur. Ils restent dans votre compte Keyrook — reconnectez-vous pour les récupérer.',
  'accountPage.title': 'Votre compte Keyrook',
  'accountPage.body': 'Son mot de passe, sa clé de récupération, le recommencer et le supprimer se trouvent sur la page du compte, pour toutes les apps Keyrook à la fois.',
  'accountPage.bodyNoRoot': 'Son mot de passe et sa suppression se trouvent sur la page du compte. Sa clé de récupération se crée ici, dans Sécurité, tant qu’aucune autre app Keyrook n’utilise le compte.',
  'accountPage.bodyProvider': 'Sa clé de récupération, le recommencer et le supprimer se trouvent sur la page du compte, pour toutes les apps Keyrook à la fois.',
  'accountPage.bodyNoRootProvider': 'Sa suppression se trouve sur la page du compte. Sa clé de récupération se crée ici, dans Sécurité, tant qu’aucune autre app Keyrook n’utilise le compte.',
  'sheetCheck.lead': 'Saisissez une fois la clé de récupération que vous avez enregistrée, pour que cette app sache qu’elle peut récupérer vos codes. Elle est vérifiée sur cet appareil et n’est envoyée nulle part.',
  'sheetCheck.submit': 'La vérifier',
  'sheetCheck.lost': 'Perdue, ou jamais eue ? Créez-en une nouvelle sur la page du compte.',
  'accountPage.noSheetYet': 'Rien n’indique encore que votre clé de récupération protège Keyrook Authenticator. Sans elle, un mot de passe oublié peut vous coûter vos codes. Saisissez-la une fois dans Sécurité, ou créez-en une nouvelle sur la page du compte.',
  'account.checkUnderSecurity': 'La vérifier dans Sécurité',
  'accountPage.open': 'Ouvrir la page du compte',
  'accountPage.recoveryKey': 'La clé de récupération d’un coffre connecté est celle du compte Keyrook. Elle se crée et se change sur la page du compte.',
  'accountPage.sheetProtects': 'La clé de récupération du compte protège Keyrook Authenticator',
  'accountPage.sheetUnknown': 'On ne sait pas encore si elle protège Keyrook Authenticator',
  'secondStep.title': 'Encore une étape',
  'secondStep.lead': 'Votre compte Keyrook demande une deuxième étape. Saisissez le code à 6 chiffres que votre application d’authentification affiche pour lui.',
  'secondStep.field': 'Code ou clé de récupération',
  'secondStep.hint': 'Vous avez perdu cette application ? Saisissez plutôt la clé de récupération de votre compte.',
  'secondStep.passkey': 'Utiliser plutôt une clé d’accès',
  'secondStep.where': 'La connexion en deux étapes s’active et se désactive sur account.keyrook.com.',
  'secondStep.ownerLead': 'Votre compte demande aussi une deuxième étape pour ceci : le code de votre application d’authentification, ou votre clé de récupération.',
  'secondStep.nextCode': 'Chaque code ne sert qu’une fois. Si vous venez de vous connecter avec l’un d’eux, attendez que votre application affiche le suivant.',
  'secondStepTip.title': 'Connexion en deux étapes',
  'secondStepTip.suggest': 'Demandez aussi un code chaque fois que ce compte se connecte sur un autre appareil. Activez-la sur account.keyrook.com et gardez le code ici : sur cette page, ouvrez Keyrook Authenticator et choisissez « {scan} ».',
  'secondStepTip.kept': 'Le code de connexion de ce compte lui-même est gardé ici, sur chaque appareil connecté à ce compte.',
  'secondStepTip.warning': 'Si vous perdez tous les appareils qui le gardent, connectez-vous avec votre clé de récupération à la place du code. Gardez la clé de récupération à part.',
  'secondStepTip.open': 'L’activer',
  'signin.providerHasPassword': '{provider} a confirmé que c’est bien vous, et {email} a aussi un mot de passe. Saisissez-le pour ouvrir vos codes ici.',
  'provider.addOnPage': 'Pour vous connecter aussi avec Google ou GitHub, connectez-vous à la page du compte avec votre mot de passe et ajoutez-le là-bas.',
  'startOver.title': 'Votre compte Keyrook recommencera à zéro le {date}',
  'startOver.lead': 'Quelqu’un sur « {device} » l’a demandé le {date}, avec le code que nous vous avons envoyé par e-mail : un nouveau mot de passe et de nouvelles clés, et vos applications repartiraient vides.',
  'startOver.ifYou': 'Si c’était vous, vous n’avez rien à faire. Sinon, annulez-le maintenant, puis changez le mot de passe de votre messagerie : la personne qui l’a demandé peut lire vos e-mails.',
  'startOver.cancel': 'Ce n’était pas moi — annuler',
  'kept.title': 'Conservé d’avant le nouveau départ du compte',
  'kept.body': 'Quand ce compte a recommencé à zéro, ce que Keyrook Authenticator y avait a été conservé, jusqu’au {date}. Récupérez-le avec le mot de passe du compte à l’époque, ou sa clé de récupération d’alors.',
  'kept.password': 'Mot de passe d’alors',
  'kept.recoveryKey': 'Clé de récupération d’alors',
  'kept.usePassword': 'Utiliser plutôt le mot de passe d’alors',
  'kept.useRecoveryKey': 'Utiliser plutôt la clé de récupération d’alors',
  'kept.bring': 'Le récupérer',
  'kept.done': 'C’est de retour dans ce coffre, et en route vers vos autres appareils.',
  'error.keys.awaitingConfirmation': 'Une autre app Keyrook a remplacé les clés de ce compte, et celle de Keyrook Authenticator n’a pas encore suivi. Ouvrez la page du compte pour les vérifier, puis reconnectez-vous.',
  'password.changedBoth':
    'Mot de passe changé, pour votre compte et ce coffre. Vos autres appareils vous demanderont de vous reconnecter avec.',
  'password.changedAccount':
    'Mot de passe du compte changé. Vos autres appareils vous demanderont de vous reconnecter avec.',
  'password.title': 'Mot de passe',
  'password.row': 'Mot de passe du compte',
  'password.rowDescription':
    'Ce avec quoi vous vous connectez sur un nouvel appareil. Personne ne peut le réinitialiser pour vous — gardez votre clé de récupération en lieu sûr.',
  'password.change': 'Changer le mot de passe…',
  'password.formTitle': 'Changer le mot de passe de votre compte',
  'devices.title': 'Appareils connectés',
  'devices.description':
    'Déconnectez un appareil que vous n’utilisez plus ou que vous n’avez plus. S’il utilise une version à jour de Keyrook Authenticator, il retire lui-même les codes de ce compte à sa prochaine connexion, et ne garde que ce qu’il n’a jamais envoyé. D’ici là, ou s’il ne se reconnecte jamais, il garde ce qu’il avait, derrière le même mot de passe.',
  'devices.descriptionProvider':
    'Déconnectez un appareil que vous n’utilisez plus ou que vous n’avez plus. S’il utilise une version à jour de Keyrook Authenticator, il retire lui-même les codes de ce compte à sa prochaine connexion, et ne garde que ce qu’il n’a jamais envoyé. D’ici là, ou s’il ne se reconnecte jamais, il garde ce qu’il avait, verrouillé comme l’est son coffre sur cet appareil.',
  'devices.this': 'Cet appareil',
  'devices.when': 'Connecté le {created} · actif pour la dernière fois le {seen}',
  'removed.kept': 'Les codes ajoutés ou modifiés ici qui n’avaient pas atteint le compte sont toujours là.',
  'delete.row': 'Supprimer votre compte',
  'delete.rowDescription':
    'Supprime toutes les copies chiffrées détenues par le serveur. Cet appareil garde son coffre tel quel ; les autres appareils cessent de se synchroniser.',
  'delete.open': 'Supprimer le compte…',
  'delete.warning':
    'Aucune annulation possible. Si cet appareil est le seul endroit où vos comptes existeront encore après cela, gardez-le — ou exportez d’abord une sauvegarde.',
  'delete.reauth': '{provider} vous demande de vous reconnecter avant que quoi que ce soit ne soit supprimé.',
  'delete.confirm': 'Supprimer le compte',

  // --- Connexion : la première carte --------------------------------------------
  'intro.benefit1': 'Les mêmes codes sur chaque appareil où vous vous connectez.',
  'intro.benefit2': 'Un ordinateur perdu ou cassé n’est pas un coffre perdu.',
  'intro.benefit3': 'Gratuit et facultatif — tout continue de fonctionner sur cet appareil sans.',
  'intro.title': 'Synchroniser votre coffre',
  'intro.subtitle':
    'Chiffré sur cet appareil avant de partir. Le serveur stocke ce qu’il ne peut pas lire — et nous non plus.',
  'intro.signedOutProvider':
    'Cet appareil a été déconnecté de {email} — il a été retiré depuis un autre. Continuez avec {provider} pour vous reconnecter.',
  'intro.orEmail': 'ou par e-mail',
  'intro.create': 'Créer un compte',
  'intro.signIn': 'Se connecter',
  'intro.source': 'Open source — voyez comment vos codes sont chiffrés',

  // --- Connexion : formulaires par e-mail ---------------------------------------
  'form.email': 'E-mail',
  'form.emailPlaceholder': 'vous@exemple.fr',
  'create.checkEmail': 'Vérifiez vos e-mails',
  'create.codeSent': 'Nous avons envoyé un code à six chiffres à <b>{email}</b>. Il ne sert qu’une fois, pendant 15 minutes.',
  'create.code': 'Code',
  'create.spam':
    'Pas dans votre boîte de réception ? Cherchez dans les <b>Spams</b> un message de <b>Keyrook</b>, et marquez-le comme <b>Non spam</b>.',
  'create.submit': 'Créer le compte',
  'create.existing':
    'Si cette adresse a déjà un compte, l’e-mail l’indique à la place — connectez-vous alors à ce compte.',
  'create.stillNothing': 'Toujours rien ?',
  'create.resendIn': 'Envoyer un nouveau code dans {seconds} s',
  'create.resend': 'Envoyer un nouveau code',
  'create.wrongAddress': '. Mauvaise adresse ?',
  'create.changeIt': 'La modifier',
  'create.title': 'Créer votre compte',
  'create.choosing': 'Ce mot de passe vous sera nécessaire sur un nouvel appareil. Celui-ci continue de s’ouvrir sans.',
  'create.sharing': 'Votre mot de passe principal devient aussi celui de votre compte — un seul, toujours.',
  'create.password': 'Mot de passe',
  'create.master': 'Mot de passe principal',
  'create.next':
    'Ensuite, nous vous envoyons un code pour confirmer l’adresse, puis vous enregistrez une clé de récupération — le seul moyen de revenir si vous oubliez le mot de passe.',
  'create.agree': 'Créer un compte implique d’accepter la <link>politique de confidentialité</link>.',
  'create.haveAccount': 'Vous avez déjà un compte ?',
  'signin.subtitle': 'Les codes déjà sur cet appareil sont ajoutés à votre compte.',
  'signin.signedOut':
    'Cet appareil a été déconnecté de {email} — le mot de passe a été changé ou l’appareil a été retiré depuis un autre. Reconnectez-vous pour continuer à synchroniser.',
  'signin.forgot': 'Mot de passe oublié ?',
  'signin.locksWithAccount': 'Cet appareil se verrouillera désormais avec le mot de passe de votre compte.',
  'signin.keepsOpening': 'Cet appareil continue de s’ouvrir sans mot de passe.',
  'signin.newHere': 'Nouveau ?',
  'recoverAccount.title': 'Récupérer votre compte',
  'recoverAccount.subtitle':
    'Utilisez la clé de récupération enregistrée lors de sa création, puis choisissez un nouveau mot de passe.',
  'recoverAccount.keyHint': '32 caractères de votre feuille imprimée. Les espaces et tirets n’ont pas d’importance.',
  'recoverAccount.submit': 'Récupérer et se connecter',
  'recoverAccount.elsewhere': 'Si une autre app Keyrook utilise aussi ce compte, son mot de passe se réinitialise sur la page du compte.',
  'recoverAccount.note':
    'Tous les appareils du compte sont déconnectés et le nouveau mot de passe leur sera demandé. Votre clé de récupération reste valable.',

  // --- Connexion : ensuite ------------------------------------------------------
  'ready.empty': 'Votre compte est prêt.',
  'ready.all': {
    one: 'Votre compte est prêt, et le compte de cet appareil y est sauvegardé.',
    other: 'Votre compte est prêt, et les {count} comptes de cet appareil y sont sauvegardés.',
  },
  'ready.some':
    'Votre compte est prêt. {done} comptes sur {total} sont sauvegardés pour l’instant ; les autres suivront à la prochaine synchronisation.',
  'fresh.title': 'Enregistrez votre clé de récupération',
  'fresh.provider':
    'Si tous les appareils connectés à votre compte sont perdus, cette clé est le seul moyen de revenir — {provider} ne peut pas restaurer votre coffre, et nous non plus.',
  'fresh.password':
    'Si vous oubliez votre mot de passe, cette clé est le seul moyen de revenir — personne ne peut le réinitialiser pour vous, pas même nous.',
  'welcome.fromAccount': '{count} depuis votre compte',
  'welcome.fromDevice': '{count} ajoutés depuis cet appareil',
  'welcome.inSync': 'Déjà synchronisé.',
  'welcome.nothing': 'Rien ici pour l’instant.',
  'welcome.failed': 'Connecté — la première synchronisation n’a pas abouti',
  'welcome.back': 'Vous êtes de retour',
  'welcome.signedIn': 'Vous êtes connecté',
  'welcome.nothingLost':
    'Rien n’est perdu : vos codes arriveront à la prochaine synchronisation. Réessayez maintenant, ou elle se fera d’elle-même dans les cinq minutes.',
  'welcome.onDevice': { one: 'compte sur cet appareil', other: 'comptes sur cet appareil' },
  'welcome.uploading': {
    one: ' · {count} est encore en cours d’envoi et suivra à la prochaine synchronisation',
    other: ' · {count} sont encore en cours d’envoi et suivront à la prochaine synchronisation',
  },
  'welcome.othersSignedOut': 'Tous les autres appareils ont été déconnectés et demanderont le nouveau mot de passe.',
  'welcome.tryAgain': 'Réessayer',
  'welcome.seeAccounts': 'Voir vos comptes',
  'welcome.toolbar': 'Ils sont aussi à un clic : l’icône Keyrook Authenticator dans votre barre d’outils.',

  // --- Connexion avec Google ou GitHub ------------------------------------------
  'provider.continue': 'Continuer avec {provider}',
  'provider.finishInWindow': 'Terminez dans la fenêtre {provider} qui s’est ouverte.',
  'provider.confirmed': '{provider} a confirmé <b>{email}</b>. Aucun compte n’utilise encore cette adresse.',
  'provider.point1':
    'Pas de mot de passe. Sur un nouvel appareil, vous continuez avec {provider}, et un appareil déjà connecté le laisse entrer après que vous avez vérifié que les deux affichent le même code.',
  'provider.point2':
    '{provider} prouve que c’est vous. Il ne voit jamais vos codes : ils sont chiffrés ici, avec une clé qui reste sur vos appareils.',
  'provider.point3':
    'Ensuite, vous enregistrez une clé de récupération — le moyen de revenir si tous les appareils connectés au compte sont perdus. {provider} ne peut pas restaurer votre coffre.',
  'provider.notRight': 'Ce n’est pas le bon compte ?',
  'provider.startAgain': 'Recommencer',
  'passkey.continue': 'Continuer avec une clé d’accès',
  'passkey.where':
    'Une clé que vous avez ajoutée sur <link>la page du compte</link>, dans « Clés d’accès ». La première fois, Chrome vous demande d’autoriser Keyrook Authenticator à l’utiliser.',
  'pairing.codeLabel': 'Code {code}',
  'join.title': 'Laisser entrer ce navigateur',
  'join.subtitle':
    '<b>{email}</b> a déjà un compte. Approuvez ce navigateur depuis un appareil qui y est connecté.',
  'join.masterPassword': 'Mot de passe principal de ce coffre',
  'join.masterHint': 'Il continue de verrouiller ce coffre ici ; le compte lui-même n’a pas de mot de passe.',
  'join.ask': 'Demander à rejoindre',
  'join.step1':
    'Sur un appareil déjà connecté, ouvrez Keyrook Authenticator. La demande s’y affiche — au-dessus des codes, et dans les paramètres, sous Synchronisation.',
  'join.step2': 'Vérifiez qu’il affiche le même code que cette page, puis approuvez-le.',
  'join.askAgain': 'Redemander',
  'join.compare': 'L’autre appareil affiche aussi un code. N’approuvez là-bas que s’il est exactement celui-ci.',
  'join.waiting': 'En attente d’un autre appareil…',
  'join.noOther': 'Plus aucun autre appareil ?',
  'join.useKey': 'Utiliser votre clé de récupération',
  'join.wrongAccount': 'Connecté avec {provider} au mauvais compte ?',
  'joinKey.subtitle':
    'La clé enregistrée lors de la création du compte. Elle laisse entrer ce navigateur sans avoir besoin d’un autre appareil.',
  'joinKey.submit': 'Rejoindre le compte',
  'approve.approved': 'Approuvé. L’autre appareil ouvre votre coffre dans un instant.',
  'approve.mismatch':
    'Refusé. Si vous n’étiez pas en train de vous connecter vous-même à l’instant, quelqu’un d’autre peut se connecter à votre compte {provider} — changez son mot de passe et vérifiez ses paramètres de sécurité.',
  'approve.declined': 'Refusé. Rien n’a été envoyé.',
  'approve.title': 'Appareils demandant à rejoindre',
  'approve.description':
    'Chaque demande vient de quelqu’un qui vient de se connecter avec votre compte {provider}. N’approuvez qu’un appareil sur lequel vous êtes vous-même en train de vous connecter.',
  'approve.descriptionAny':
    'Chaque demande vient de quelqu’un qui vient de se connecter avec votre compte Google ou GitHub. N’approuvez qu’un appareil sur lequel vous êtes vous-même en train de vous connecter.',
  'approve.mismatchAny':
    'Refusé. Si vous n’étiez pas en train de vous connecter vous-même à l’instant, quelqu’un d’autre peut se connecter à votre compte Google ou GitHub — changez son mot de passe et vérifiez ses paramètres de sécurité.',
  'approve.askedAt': 'Demandé à {time}',
  'approve.review': 'Examiner',
  'approve.deny': 'Refuser',
  'approve.question':
    'L’appareil qui demande affiche-t-il exactement ce code ? Sinon, quelqu’un d’autre essaie d’entrer.',
  'approve.matches': 'Il correspond — le laisser entrer',
  'approve.doesNotMatch': 'Il ne correspond pas',

  // --- Erreurs, suite -----------------------------------------------------------
  'error.vaultNewer':
    'Ce coffre a été créé par une version plus récente de Keyrook Authenticator. Mettez à jour avant de l’ouvrir.',
  'error.uriUnsupported': 'Ce lien utilise un réglage que cette app ne sait pas lire ({value}).',
  'editor.websitesPlaceholder': 'github.com, gist.github.com',
  'error.noWorker': 'L’extension n’a pas répondu. Fermez ceci et rouvrez-le.',
  'nav.sync': 'Synchronisation',
  'nav.general': 'Général',
  'nav.needsAttention': 'Action requise',
  'sync.description':
    'Les mêmes codes sur chaque appareil où vous vous connectez, chiffrés ici avant de partir.',
  'backup.description':
    'Gardez une copie chiffrée, importez des comptes ou transférez-les vers une autre app.',
  'backup.choice.backup.title': 'Sauvegarder',
  'backup.choice.backup.body': 'Un fichier chiffré, protégé par un mot de passe de votre choix.',
  'backup.choice.import.title': 'Importer',
  'backup.choice.import.body': 'Depuis une sauvegarde, l’export d’une autre app ou des liens otpauth://.',
  'backup.choice.move.body': 'Codes de transfert, page à imprimer ou fichier lisible. Non chiffré.',
  'security.description': 'Comment ce coffre s’ouvre, et comment y revenir si ce navigateur est perdu.',
  'security.deviceKeyHint':
    'Rien à saisir. Ne protège pas d’un logiciel malveillant qui tourne sous votre session sur cet ordinateur.',
  'security.passwordHint': 'Demandé chaque fois que le coffre s’est verrouillé.',
  'general.description': 'L’apparence et le comportement de l’extension, et d’où elle vient.',
  'general.inBrowser': 'Dans le navigateur',
  'general.autofillHint':
    'Ouvrir la fenêtre sur une page de connexion propose le bon code. Seul cet onglet est lu.',
  'vault.signInToSync': 'Se connecter pour synchroniser',
  'vault.empty.signIn':
    'Vous utilisez Keyrook Authenticator sur un autre appareil ? <link>Connectez-vous</link> pour retrouver vos codes ici.',
  'setup.haveAccount':
    'Vous utilisez déjà Keyrook Authenticator ? <link>Connectez-vous</link> pour retrouver vos codes ici.',
  'popup.signInOpensTab': 'S’ouvre dans un nouvel onglet et se termine dans les paramètres.',
  'error.backupWrongPassword': 'Ce mot de passe n’ouvre pas ce fichier.',
  'error.foreign.steamFolder': 'Choisissez ensemble tous les fichiers du dossier maFiles de Steam Desktop Authenticator : manifest.json et les fichiers .maFile à côté.',
  'error.foreign.locked':
    'Cet export est verrouillé par un mot de passe que Keyrook Authenticator ne sait pas ouvrir. Exportez de nouveau sans mot de passe.',
  'import.lockedFrom':
    '{app} a verrouillé cet export par un mot de passe. Saisissez celui que vous y avez choisi.',
  'import.fromApps':
    'Les exports d’Aegis, 2FAS, Bitwarden, Proton, Ente Auth, andOTP, FreeOTP+, Steam Desktop Authenticator, de l’extension Authenticator et de Google Authenticator fonctionnent aussi — ainsi qu’un CSV d’Apple Mots de passe, 1Password ou d’un autre gestionnaire.',
  'shortcut.open': 'Ouvrir Keyrook Authenticator',
  'shortcut.fill': 'Remplir le code de cette page',
  'shortcut.fillHint': 'Ne remplit que si un seul compte appartient au site ; ailleurs, la liste s’ouvre.',
  'shortcut.notSet': 'Non défini',
  'vault.shortcutHint': '{keys} le remplit sans ouvrir cette fenêtre.',
  'import.csvWarning':
    'Ce fichier contient vos mots de passe en clair. Seules les clés à deux facteurs ont été lues, rien d’autre n’est gardé — supprimez le fichier une fois terminé.',
  'import.noKeysInCsv': 'Ce fichier ne contient aucune clé à deux facteurs, seulement des mots de passe.',
  'crash.title': 'Un problème est survenu',
  'crash.body':
    'Cet écran a rencontré un problème et s’est arrêté. Vos comptes stockés ne sont pas touchés. Le recharger suffit en général.',
  'crash.reload': 'Recharger',
  'setup.device.description.phone':
    'Vos secrets sont chiffrés avec une clé que ce téléphone garde pour vous. Rien à retenir, rien à saisir.',
  'setup.device.footnote.phone':
    'Protège contre une copie des fichiers de l’app. Pas contre quelqu’un qui peut déverrouiller ce téléphone.',
  'setup.password.footnote.phone':
    'L’option la plus sûre : une fois verrouillé, rien sur ce téléphone ne peut ouvrir le coffre sans le mot de passe.',
  'unrecoverable.why.phone':
    'Sa clé de chiffrement était gardée par ce téléphone et a disparu — en général parce que les données de l’app ont été effacées, que l’app a été réinstallée, ou que le coffre vient de la sauvegarde d’un autre téléphone. Sans cette clé, personne ne peut déchiffrer les comptes enregistrés, pas même nous.',
  'vault.empty.body.phone':
    'Quand un site affiche un QR code pour configurer la double authentification, scannez-le avec la caméra de ce téléphone.',
  'add.camera.description.phone':
    'Pour un code affiché sur un autre écran — y compris un export de Google Authenticator.',
  'add.fromGoogle.phone':
    'Vous venez de Google Authenticator sur un autre téléphone ? Exportez-y vos comptes, puis scannez le code qu’il affiche avec la caméra de ce téléphone. S’il en affiche plusieurs, faites-les un par un.',
  'camera.noCamera.phone': 'Ce téléphone ne donne pas accès à une caméra à l’app.',
  'camera.blocked.phone':
    'L’app n’est pas autorisée à utiliser la caméra. Autorisez-la dans les réglages du téléphone, ou utilisez une autre façon d’ajouter un compte.',
  'camera.none.phone': 'Aucune caméra trouvée sur ce téléphone.',
  'security.languageBrowser.phone': 'Langue du téléphone ({language})',
  'protect.removeWarning.phone':
    'Le coffre reste chiffré, mais il se déverrouillera tout seul chaque fois que l’app s’ouvre. Quiconque peut déverrouiller ce téléphone pourra alors voir vos codes.',
  'kit.device.phone':
    'Ce coffre se déverrouille avec une clé gardée par votre téléphone. Si cette clé disparaît — données de l’app effacées, réinstallation, nouveau téléphone —, seule une clé de récupération peut encore l’ouvrir.',
  'kit.withoutDevice.phone':
    'Sans elle, perdre la clé gardée par ce téléphone signifie perdre pour de bon tous les comptes de ce coffre.',
  'security.description.phone': 'Comment ce coffre s’ouvre, et comment y revenir si ce téléphone est perdu.',
  'security.deviceKeyHint.phone': 'Rien à saisir. Quiconque peut déverrouiller ce téléphone peut l’ouvrir.',
  'general.description.phone': 'L’apparence et le comportement de l’app, et d’où elle vient.',
  'about.securityModelDescription.phone': 'Ce que l’app garantit, et ce qu’elle ne garantit pas.',
  'about.logos.description.phone':
    'Les logos sont intégrés à l’app, jamais téléchargés. Demander un logo au réseau révélerait à celui qui répond les services sur lesquels vous utilisez la double authentification.',
  'about.fact.access.title.phone': 'La caméra, et seulement pour scanner',
  'about.fact.access.body.phone':
    'L’app ne demande aucune autorisation hormis la caméra, et seulement quand vous choisissez de scanner un code. Ce que voit la caméra ne quitte jamais le téléphone.',
  'about.fact.keys.body.phone':
    'Vos comptes sont chiffrés avec une clé de données elle-même enveloppée. Avec un mot de passe principal, la clé d’enveloppe provient de PBKDF2 à 600 000 itérations et n’existe qu’en mémoire tant que le coffre est déverrouillé. Sans, c’est une clé scellée par le magasin de clés du téléphone lui-même : une copie des fichiers de l’app ne peut donc pas ouvrir le coffre.',
  'rate.store.play': 'Google Play',
  'add.noNativeReader.phone':
    'Un gros code — comme un export de Google Authenticator — passe souvent mal à la caméra ici. Si le vôtre ne passe pas, prenez-le en photo avec l’app Appareil photo du téléphone et utilisez plutôt « Importer une image de QR code ».',
  'import.noNativeReader.phone':
    'Un gros code — comme un export de Google Authenticator — passe souvent mal à la caméra ici. Si le vôtre ne passe pas, prenez chaque code en photo avec l’app Appareil photo du téléphone et choisissez-les toutes avec « Choisir des fichiers ».',
  'error.signOutUnsynced.phone':
    'Certaines modifications faites sur ce téléphone ne sont pas encore arrivées dans votre compte, et se déconnecter maintenant les perdrait. Connectez-vous à Internet et réessayez.',
  'account.signOutNote.phone':
    'Se déconnecter retire vos codes de ce téléphone. Ils restent dans votre compte Keyrook — reconnectez-vous pour les récupérer.',
  'secondStepTip.suggest.phone':
    'Demandez aussi un code chaque fois que ce compte se connecte sur un autre appareil. Activez-la sur account.keyrook.com et gardez le code ici : ajoutez un compte dans cette app et scannez le code QR qu’affiche cette page.',
  'intro.benefit2.phone': 'Un téléphone perdu ou cassé n’est pas un coffre perdu.',
  'provider.finishInWindow.phone': 'Terminez sur la page {provider} qui s’est ouverte dans votre navigateur.',
  'join.title.phone': 'Laisser entrer ce téléphone',
  'join.subtitle.phone':
    '<b>{email}</b> a déjà un compte. Approuvez ce téléphone depuis un appareil qui y est connecté.',
  'joinKey.subtitle.phone':
    'La clé enregistrée lors de la création du compte. Elle laisse entrer ce téléphone sans avoir besoin d’un autre appareil.',
  'facts.autofill.phone': 'Scan de QR',
};
