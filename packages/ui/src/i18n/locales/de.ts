// Deutsch. Formal („Sie“), wie Chrome und die meisten Sicherheitsprodukte.
import type { Dictionary } from './en.js';

export const de: Dictionary = {
  // --- Fehler -------------------------------------------------------------------
  'error.vaultLocked': 'Der Tresor ist gesperrt.',
  'error.vaultExists': 'Auf diesem Gerät gibt es bereits einen Tresor.',
  'error.noVault': 'Auf diesem Gerät gibt es noch keinen Tresor.',
  'error.vaultCorrupt': 'Der gespeicherte Tresor ist beschädigt oder stammt aus einer anderen App.',
  'error.wrongMasterPassword': 'Falsches Master-Passwort.',
  'error.enterCurrentMasterPassword': 'Geben Sie Ihr aktuelles Master-Passwort ein.',
  'error.currentPasswordWrong': 'Das aktuelle Passwort ist falsch.',
  'error.masterPasswordShort': 'Das Master-Passwort muss mindestens 8 Zeichen lang sein.',
  'error.notPassphraseVault': 'Dieser Tresor ist nicht mit einem Master-Passwort geschützt.',
  'error.recoveryKeyMalformed': 'Das sieht nicht wie ein Wiederherstellungsschlüssel aus.',
  'error.recoveryKeyNoMatch': 'Dieser Wiederherstellungsschlüssel passt nicht.',
  'error.recoverOnAccountPage': 'Ihr Wiederherstellungsschlüssel stimmt, aber das Passwort dieses Kontos wird jetzt auf der Kontoseite zurückgesetzt – für alle Keyrook-Apps zugleich.',
  'error.kitOnAccountPage': 'Der Wiederherstellungsschlüssel dieses Kontos wird jetzt auf der Kontoseite erstellt – für alle Keyrook-Apps zugleich.',
  'error.restoreEmpty': 'Von diesem Konto ist nichts mehr da, das sich zurückholen ließe: Es wurde auf einem anderen Gerät gelöscht, bevor dieses es je hatte.',
  'error.recoveryKeyWrong': 'Dieser Wiederherstellungsschlüssel passt nicht zu diesem Konto.',
  'error.noRecoveryKit': 'Dieser Tresor hat keinen Wiederherstellungsschlüssel.',
  'error.syncUnavailable': 'In dieser Version ist keine Synchronisierung verfügbar.',
  'error.notSignedIn': 'Nicht angemeldet.',
  'error.alreadySignedIn': 'Bereits angemeldet.',
  'error.signedOutElsewhere':
    'Dieses Gerät wurde von der Synchronisierung abgemeldet – das Passwort wurde geändert oder das Gerät auf einem anderen entfernt. Melden Sie sich erneut an.',
  'error.signOutUnsynced':
    'Einige Änderungen in diesem Browser sind noch nicht in Ihrem Konto angekommen, und eine Abmeldung jetzt würde sie verlieren. Verbinden Sie sich mit dem Internet und versuchen Sie es erneut.',
  'error.enterAccountPassword': 'Geben Sie Ihr Kontopasswort ein.',
  'error.accountPasswordWrong': 'Das ist nicht Ihr Kontopasswort.',
  'error.accountPasswordWeak':
    'Dieses Passwort ist zu schwach, um eine Kopie Ihres Tresors zu schützen, die dieses Gerät verlässt. Verwenden Sie mindestens 12 Zeichen aus Groß- und Kleinbuchstaben, Ziffern und Sonderzeichen – oder vier bis fünf Wörter, die nichts miteinander zu tun haben.',
  'error.lockOnlyWithAccountPassword':
    'Das ist nicht Ihr Kontopasswort. Solange Sie angemeldet sind, ist es das einzige Passwort, mit dem dieser Tresor sperren kann.',
  'error.signupWrongMasterPassword':
    'Das ist nicht das Master-Passwort dieses Tresors. Es wird auch Ihr Kontopasswort.',
  'error.masterPasswordTooWeakForAccount':
    'Ihr Master-Passwort ist zu schwach, um eine Kopie Ihres Tresors zu schützen, die dieses Gerät verlässt. Ändern Sie es zuerst unter Sicherheit – mindestens 12 gemischte Zeichen oder vier bis fünf voneinander unabhängige Wörter.',
  'error.passwordsDiverged':
    'Ihr Kontopasswort unterscheidet sich von dem dieses Tresors. Melden Sie sich von der Synchronisierung ab und wieder an, um beide anzugleichen, und versuchen Sie es dann erneut.',
  'error.kitRace':
    'Ein anderes Ihrer Geräte hat den Wiederherstellungsschlüssel gerade geändert. Hier wurde nichts geändert – versuchen Sie es erneut.',
  'error.providerHasNoPassword': 'Dieses Konto meldet sich mit Google oder GitHub an und hat kein Passwort.',
  'error.noActiveTab': 'Kein aktiver Tab.',
  'error.autofillNotHere': 'Automatisches Ausfüllen funktioniert nur auf normalen Webseiten.',
  'error.autofillBlocked':
    'Chrome hat der Erweiterung nicht erlaubt, diese Seite zu lesen. Öffnen Sie das Popup auf der Seite, die Sie ausfüllen möchten.',
  'error.signinCancelled': 'Die Anmeldung wurde abgebrochen.',
  'error.signinStateMismatch': 'Diese Anmeldung kam nicht so zurück, wie sie gestartet wurde. Versuchen Sie es erneut.',
  'error.signinUnfinished': 'Die Anmeldung wurde nicht abgeschlossen. Versuchen Sie es erneut.',
  'error.signupPendingExpired': 'Diese Anmeldung ist abgelaufen. Beginnen Sie von vorn.',
  'error.signInFirst': 'Melden Sie sich zuerst an.',
  'error.joinNeedsMasterPassword': 'Geben Sie das Master-Passwort dieses Tresors ein, um den Beitritt abzuschließen.',
  'error.notThisVaultsPassword': 'Das ist nicht das Master-Passwort dieses Tresors.',
  'error.nothingWaiting': 'Es wartet nichts auf eine Freigabe.',
  'error.pairingExpired':
    'Die Anfrage ist beendet – sie wurde abgelehnt oder zehn Minuten sind vergangen. Fragen Sie erneut an.',
  'error.pairingWrongKey':
    'Der empfangene Schlüssel gehört nicht zu diesem Konto. Es wurde nichts geändert. Versuchen Sie es vom anderen Browser aus erneut.',
  'error.pairingForged': 'Diese Freigabe kam nicht von dem Browser, dessen Code Sie geprüft haben.',
  'error.pairingForgedAsk':
    'Diese Freigabe kam nicht von dem Browser, dessen Code geprüft wurde. Es wurde nichts geändert. Fragen Sie erneut an.',
  'error.pairingEnded': 'Diese Anfrage ist beendet.',
  'error.approveAgain': 'Beginnen Sie die Freigabe dieser Anfrage erneut.',
  'error.backupPasswordShort': 'Das Backup-Passwort muss mindestens 8 Zeichen lang sein.',
  'error.backupNotOurs': 'Diese Datei ist kein Keyrook-Authenticator-Backup.',
  'error.backupNewer': 'Dieses Backup wurde mit einer neueren Version der App erstellt.',
  'error.backupUnknownCipher': 'Dieses Backup verwendet ein Verschlüsselungsverfahren, das diese Version nicht kennt.',
  'error.backupTooCostly': 'Das Öffnen dieses Backups verlangt unvernünftig viel Rechenaufwand. Es wird ignoriert.',
  'error.backupMalformed': 'Dieses Backup ist fehlerhaft.',
  'error.uriNotOtpauth': 'Kein otpauth://-Link.',
  'error.uriMalformed': 'Dieser otpauth://-Link ist fehlerhaft.',
  'error.uriNoSecret': 'Dieser Link enthält kein Geheimnis.',
  'error.uriBadSecret': 'Das Geheimnis in diesem Link ist kein gültiges Base32.',
  'error.uriNoCounter': 'Ein HOTP-Link muss einen Zähler enthalten.',
  'error.secretEmpty': 'Der Einrichtungsschlüssel ist leer.',
  'error.migrationNotOurs': 'Kein Export aus Google Authenticator.',
  'error.migrationMalformed': 'Dieser Export aus Google Authenticator ist beschädigt oder unvollständig.',
  'error.offline': 'Der Synchronisierungsserver ist nicht erreichbar. Prüfen Sie Ihre Verbindung und versuchen Sie es erneut.',
  'error.provider.refusedBy': '{provider} hat die Anmeldung abgelehnt.',
  'error.provider.unreachable': '{provider} ist nicht erreichbar. Versuchen Sie es gleich noch einmal.',
  'error.provider.refused': 'Die Anmeldung wurde abgelehnt. Versuchen Sie es erneut.',
  'error.provider.githubRefused': 'GitHub hat die Anmeldung abgelehnt.',
  'error.provider.noReauth': 'Google hat Sie nicht erneut zur Anmeldung aufgefordert.',
  'error.provider.unverifiedEmail': 'Google hat diese E-Mail-Adresse nicht bestätigt.',
  'error.provider.githubNoEmail': 'Ihr GitHub-Konto hat keine bestätigte primäre E-Mail-Adresse.',
  'error.server.badRequest': 'Der Synchronisierungsserver konnte diese Anfrage nicht lesen.',
  'error.server.session': 'Diese Sitzung ist nicht mehr gültig.',
  'error.server.accountGone': 'Dieses Konto existiert nicht mehr.',
  'error.server.signupExpired': 'Diese Registrierung ist abgelaufen. Melden Sie sich erneut an.',
  'error.server.signinExpired': 'Diese Anmeldung ist abgelaufen. Versuchen Sie es erneut.',
  'error.server.tooManyCodes': 'Zu viele falsche Codes. Fordern Sie einen neuen an.',
  'error.server.tooManyPairings':
    'Zu viele Browser warten darauf, diesem Konto beizutreten. Versuchen Sie es in ein paar Minuten erneut.',
  'error.server.wrongKey': 'Dieses Gerät besitzt den Kontoschlüssel nicht.',
  'error.server.providerAccount': 'Dieses Konto meldet sich mit Google oder GitHub an, nicht mit einem Passwort.',
  'error.server.mailFailed': 'Die E-Mail konnte nicht gesendet werden. Versuchen Sie es in einer Minute erneut.',
  'error.server.pairingTaken': 'Diese Anfrage ist beendet oder wird gerade von einem anderen Browser freigegeben.',
  'error.server.passwordWrong': 'Dieses Passwort ist nicht korrekt.',
  'error.server.badCredentials': 'E-Mail oder Passwort ist falsch.',
  'error.server.badCode':
    'Dieser Code ist falsch oder abgelaufen. Prüfen Sie die E-Mail oder fordern Sie einen neuen an.',
  'error.server.reauthMismatch':
    'Melden Sie sich zur Bestätigung erneut mit dem Konto an, das Sie für Keyrook verwenden.',
  'error.server.kitRace': 'Ein anderes Gerät hat den Wiederherstellungsschlüssel gerade geändert.',
  'error.server.unavailable': 'Der Synchronisierungsserver konnte das gerade nicht ausführen. Versuchen Sie es gleich noch einmal.',
  'error.server.lockedOut': {
    one: 'Zu viele fehlgeschlagene Versuche. Versuchen Sie es in {count} Sekunde erneut.',
    other: 'Zu viele fehlgeschlagene Versuche. Versuchen Sie es in {count} Sekunden erneut.',
  },
  'error.server.rateLimited': {
    one: 'Zu viele Versuche. Versuchen Sie es in {count} Sekunde erneut.',
    other: 'Zu viele Versuche. Versuchen Sie es in {count} Sekunden erneut.',
  },
  'error.server.emailTaken': '{email} hat bereits ein Keyrook-Konto.',
  'error.server.recordTooLarge': 'Eines Ihrer Konten ist zu groß für die Synchronisierung ({id}).',
  'error.server.codeTooSoon': 'Gerade wurde ein Code gesendet. Warten Sie kurz, bevor Sie einen neuen anfordern.',
  'error.server.keyRace': 'Ein anderes Gerät hat den Schlüssel gerade eingerichtet. Versuchen Sie es erneut.',
  'error.server.archiveNeedsOldKeys': 'Nur das alte Passwort oder der alte Wiederherstellungsschlüssel kann das Aufbewahrte vor Ablauf löschen.',
  'error.server.signupNeedsKeys': 'Dieses Konto konnte nicht erstellt werden. Aktualisieren Sie Keyrook Authenticator und versuchen Sie es erneut.',
  'error.server.accountIdTaken': 'Diese Konto-ID ist vergeben. Registrieren Sie sich erneut.',
  'error.server.archiveWrongKey': 'Damit lässt sich das Aufbewahrte nicht öffnen.',
  'error.server.flowExpired': 'Das ist abgelaufen. Fordern Sie einen neuen Code an und beginnen Sie von vorn.',
  'error.server.archiveGone': 'Das wird nicht mehr aufbewahrt.',
  'error.server.notProductKey': 'Dieser Schlüssel gehört nicht zu Keyrook Authenticator.',
  'error.server.foreignRecord': 'Dieser Eintrag gehört zu einem anderen Keyrook-Produkt.',
  'error.server.rootChanged': 'Die Schlüssel des Kontos wurden auf einem anderen Gerät geändert. Versuchen Sie es erneut.',
  'error.server.rootExists': 'Dieses Konto hat bereits einen Stammschlüssel.',
  'error.server.noRoot': 'Dieses Konto hat noch keinen Stammschlüssel.',
  'error.server.startOverLimit': 'Dieses Konto wurde in letzter Zeit zu oft neu begonnen. Versuchen Sie es nach dem {date} erneut.',
  'error.server.wrongRootKey': 'Dieses Gerät hat den Stammschlüssel des Kontos nicht.',
  'error.server.sessionReplayed': 'Dieses Gerät wurde abgemeldet, weil seine Sitzung anderswo verwendet wurde. Melden Sie sich erneut an.',
  'error.server.noProductKey': 'Keyrook Authenticator hat noch keinen Schlüssel in diesem Konto.',
  'error.server.productKeyChanged': 'Der Schlüssel von Keyrook Authenticator in diesem Konto hat sich geändert. Versuchen Sie es erneut.',
  'error.server.productKeyReplaced': 'Der Schlüssel von Keyrook Authenticator wurde auf einem anderen Gerät ersetzt. Melden Sie sich erneut an.',
  'error.server.updateRequired': 'Aktualisieren Sie Keyrook Authenticator, um dieses Konto weiter zu nutzen.',
  'error.server.olderBuildsRetired': 'Ältere Versionen von Keyrook Authenticator können dieses Konto nicht mehr verwenden.',
  'error.server.emailTakenOtherProvider': '{email} hat bereits ein Keyrook-Konto, das sich über einen anderen Anbieter anmeldet.',
  'error.server.emailTakenPassword': '{email} hat bereits ein Keyrook-Konto mit Passwort. Melden Sie sich stattdessen mit E-Mail und Passwort an.',
  'error.server.signInWithPassword': 'Dieses Konto meldet sich mit einem Passwort an. Melden Sie sich hier mit E-Mail und Passwort an.',
  'error.server.pageCodeWrong': 'Dieser Code wird auf der Kontoseite nicht angezeigt. Prüfen Sie ihn oder beginnen Sie dort von vorn.',
  'error.server.pageRequestEnded': 'Diese Anfrage ist abgelaufen oder beendet. Beginnen Sie auf der Kontoseite von vorn.',
  'error.server.noKeyrookAccount': 'Für dieses Google- oder GitHub-Konto gibt es kein Keyrook-Konto. Erstellen Sie eines in Keyrook Authenticator oder Passhold.',
  'error.account.productKeyMismatch': 'Der Schlüssel von {product} lässt sich mit dem Stammschlüssel dieses Kontos nicht öffnen. Es wurde nichts geändert.',
  'error.account.confirmWithPassword': 'Dieses Konto hat ein Passwort. Bestätigen Sie damit.',
  'error.account.chooseNewPassword': 'Wählen Sie ein neues Passwort für dieses Konto.',
  'error.account.archiveNotOpened': 'Nichts, was für Keyrook Authenticator aufbewahrt wurde, lässt sich damit öffnen.',
  'error.account.keyNotConfirmed': 'Der Kontoschlüssel ist nicht der, den Sie bestätigt haben. Sehen Sie noch einmal nach.',
  'error.account.serverMismatch': 'Die Antwort des Synchronisierungsservers passt nicht zu diesem Konto. Damit wurde nichts geöffnet.',
  'error.account.archiveNoPassword': 'Dieses Konto hatte damals kein Passwort.',
  'error.account.noPasswordForKeys': 'Dieses Konto hat kein Passwort, mit dem sich seine Schlüssel öffnen lassen.',
  'error.account.noRecoveryKey': 'Dieses Konto hat noch keinen Wiederherstellungsschlüssel.',

  // --- Entsperren ---------------------------------------------------------------
  'unlock.prompt': 'Geben Sie Ihr Master-Passwort ein, um zu entsperren.',
  'unlock.placeholder': 'Master-Passwort',
  'unlock.submit': 'Entsperren',
  'unlock.forgot': 'Vergessen? <link>Wiederherstellungsschlüssel verwenden</link>',

  // --- Tresor lässt sich nicht öffnen ------------------------------------------
  'unrecoverable.title': 'Dieser Tresor lässt sich nicht mehr öffnen',
  'unrecoverable.why':
    'Sein Schlüssel lag in diesem Browserprofil und ist verschwunden – meist, weil Browserdaten gelöscht, die Erweiterung neu installiert oder ein anderes Profil verwendet wurde. Ohne diesen Schlüssel kann niemand die gespeicherten Konten entschlüsseln, auch wir nicht.',
  'unrecoverable.hasKit':
    'Sie haben für diesen Tresor einen Wiederherstellungsschlüssel ausgestellt. Er schützt dieselben Daten unabhängig vom verlorenen Schlüssel – damit öffnet sich alles.',
  'unrecoverable.useKit': 'Meinen Wiederherstellungsschlüssel verwenden',
  'unrecoverable.noKit':
    'Beginnen Sie neu und stellen Sie aus einer Backup-Datei wieder her, falls Sie eine haben. Andernfalls müssen Sie die Zwei-Faktor-Authentifizierung auf jeder Website neu einrichten, mit den Wiederherstellungscodes, die Sie dort erhalten haben.',
  'unrecoverable.confirmErase': 'Ja, löschen und neu beginnen',
  'common.cancel': 'Abbrechen',
  'unrecoverable.startOver': 'Neu beginnen',

  // --- Passwortstärke -----------------------------------------------------------
  'strength.0': 'sehr schwach',
  'strength.1': 'schwach',
  'strength.2': 'mittel',
  'strength.3': 'stark',
  'strength.4': 'sehr stark',
  'strength.line': 'Stärke: {label}',
  'strength.lineWithWarning': 'Stärke: {label} – {warning}',
  'strength.tooShort': 'Verwenden Sie mindestens 10 Zeichen – die Länge zählt am meisten.',
  'strength.digitsOnly': 'Nur Ziffern sind leicht zu erraten.',
  'strength.repeated': 'Vermeiden Sie wiederholte Zeichen.',

  // --- Erster Start -------------------------------------------------------------
  'setup.prompt': 'Wählen Sie, wie Ihre 2FA-Geheimnisse geschützt werden.',
  'setup.device.title': 'Einfach loslegen',
  'setup.device.badge': 'Empfohlen',
  'setup.device.description':
    'Ihre Geheimnisse werden mit einem Schlüssel verschlüsselt, den dieser Browser für Sie aufbewahrt. Nichts merken, nichts eintippen.',
  'setup.device.footnote':
    'Schützt vor allem, was Skripte ausführen oder die Daten Ihrer Erweiterung lesen kann. Nicht vor Schadsoftware, die unter Ihrem Benutzer auf diesem Rechner läuft.',
  'setup.password.title': 'Master-Passwort hinzufügen',
  'setup.password.description':
    'Ein Passwort entsperrt den Tresor, und er sperrt sich wieder, wenn Sie ihn nicht mehr verwenden.',
  'setup.password.footnote':
    'Die stärkste Option: Ist er gesperrt, kann nichts auf diesem Computer den Tresor ohne das Passwort öffnen.',
  'setup.footer': 'In beiden Fällen AES-256-GCM. Jederzeit umstellbar; Synchronisierung ist optional, in den Einstellungen.',
  'setup.source': 'Open Source – den Code lesen',
  'common.back': 'Zurück',
  'setup.passwordStep.title': 'Master-Passwort festlegen',
  'setup.passwordStep.warning':
    'Niemand kann dieses Passwort zurücksetzen. Wenn Sie es vergessen, öffnet nur ein Wiederherstellungsschlüssel den Tresor – erstellen Sie einen unter Einstellungen → Sicherheit, und notieren Sie das Passwort an einem sicheren Ort.',
  'setup.passwordStep.label': 'Master-Passwort',
  'setup.passwordStep.placeholder': 'Mindestens 8 Zeichen',
  'setup.passwordStep.confirm': 'Passwort bestätigen',
  'common.passwordsDiffer': 'Die Passwörter stimmen nicht überein.',
  'setup.passwordStep.submit': 'Meinen Tresor erstellen',
  'setup.passwordStep.footer': 'AES-256-GCM · Schlüssel abgeleitet mit PBKDF2 (600.000 Runden)',

  // --- Wiederherstellungsschlüssel, Tresor öffnen --------------------------------
  'recover.title': 'Wiederherstellungsschlüssel verwenden',
  'recover.intro':
    'Der 32-stellige Schlüssel von dem Blatt, das Sie beim Einrichten dieses Tresors gespeichert haben. Er ersetzt, wie der Tresor gesperrt wird – wählen Sie das unten ebenfalls.',
  'recover.keyLabel': 'Wiederherstellungsschlüssel',
  'recover.hintEmpty': 'Nur Buchstaben und Ziffern – Abstände spielen keine Rolle.',
  'recover.hintRight': 'Das hat die richtige Form.',
  'recover.hintCount': '{count} von 32 Zeichen.',
  'recover.lockQuestion': 'Wie soll dieser Tresor künftig sperren?',
  'recover.lockPassword': 'Neues Master-Passwort festlegen',
  'recover.lockDevice': 'Kein Passwort – dieses Gerät verwahrt den Schlüssel',
  'recover.newPassword': 'Neues Master-Passwort',
  'recover.atLeast8': 'Mindestens 8 Zeichen.',
  'recover.submit': 'Entsperren und neu sperren',

  // --- Passwortfeld -------------------------------------------------------------
  'meter.0': 'Zu schwach',
  'meter.1': 'Schwach',
  'meter.2': 'Mittel',
  'meter.3': 'Stark',
  'meter.4': 'Sehr stark',
  'password.show': 'Passwort anzeigen',
  'password.hide': 'Passwort verbergen',

  // --- Popup: die Liste ---------------------------------------------------------
  'vault.search': 'Konten durchsuchen',
  'vault.add': 'Konto hinzufügen',
  'vault.settings': 'Einstellungen',
  'vault.lock': 'Jetzt sperren',
  'vault.count': { one: '{count} Konto', other: '{count} Konten' },
  'vault.syncedWith': 'Synchronisiert mit {email}',
  'vault.syncedAs': 'synchronisiert als {email}',
  'vault.changeOrder': 'Reihenfolge ändern',
  'vault.byName': 'Nach Name',
  'vault.orderAdded': 'Hinzugefügt',
  'vault.joinRequests': {
    one: 'Ein Browser möchte Ihrem Konto beitreten.',
    other: '{count} Browser möchten Ihrem Konto beitreten.',
  },
  'vault.joinRequestsHint': 'Geben Sie nur einen frei, bei dem Sie sich gerade selbst anmelden.',
  'vault.reviewInSettings': 'In den Einstellungen prüfen',
  'vault.noMatch': 'Keine Konten passen zu „{query}“.',
  'vault.forHost': 'Für {host}',
  'vault.fieldDetected': 'Codefeld erkannt',
  'common.encryptedHere': 'Auf diesem Gerät verschlüsselt',
  'vault.fillWarning':
    '<b>{account}</b> gehört zu <b>{domain}</b>, diese Seite ist aber <b>{host}</b>. Wenn Sie das nicht erwartet haben, gibt sich die Seite womöglich als die Website aus.',
  'vault.dontFill': 'Nicht ausfüllen',
  'vault.fillAnyway': 'Trotzdem ausfüllen',
  'vault.empty.title': 'Noch keine Konten',
  'vault.empty.body':
    'Öffnen Sie auf einer Website die Seite zur Einrichtung der Zwei-Faktor-Authentifizierung und scannen Sie den QR-Code direkt aus dem Tab.',
  'vault.empty.add': 'Erstes Konto hinzufügen',

  // --- Popup: ein Konto ---------------------------------------------------------
  'common.untitled': 'Ohne Namen',
  'row.copyHint': 'Zum Kopieren klicken',
  'row.share': 'Teilen oder übertragen',
  'row.shareHint': 'Seine Codes eine Weile senden oder es in eine andere App übertragen',
  'row.favouriteAdd': 'Zu Favoriten hinzufügen',
  'row.favouriteRemove': 'Aus Favoriten entfernen',
  'row.fillHint': 'Diesen Code in die Seite eintragen',
  'row.fill': 'Ausfüllen',
  'row.copied': 'Kopiert',
  'row.copy': 'Code kopieren',
  'row.next': 'Nächsten Code erzeugen',
  'row.counter': 'Zähler: {counter}',

  // --- Popup: Bitte um Bewertung -------------------------------------------------
  'rate.region': 'Keyrook Authenticator bewerten',
  'rate.body': '<b>Ist Keyrook Authenticator nützlich für Sie?</b> Über eine Bewertung im {store} finden andere die App.',
  'rate.store.chrome': 'Chrome Web Store',
  'rate.store.edge': 'Edge-Add-ons-Store',
  'rate.notNow': 'Nicht jetzt',
  'rate.rate': 'Bewerten',

  // --- Gemeinsames --------------------------------------------------------------
  'common.openSource': 'Open Source',

  // --- Konto hinzufügen ---------------------------------------------------------
  'add.title.manual': 'Einrichtungsschlüssel eingeben',
  'add.title.camera': 'Mit der Kamera scannen',
  'add.title.quick': 'Code abrufen, ohne zu speichern',
  'add.title.choose': 'Konto hinzufügen',
  'add.page.title': 'QR-Code auf dieser Seite scannen',
  'add.page.description': 'Macht einen Screenshot des sichtbaren Tabs und liest den Code daraus.',
  'add.camera.title': 'Mit der Kamera scannen',
  'add.camera.description': 'Für einen Code auf Ihrem Handy – auch einen Export aus Google Authenticator.',
  'add.camera.elsewhere':
    'Öffnet einmal die Einstellungen, damit Chrome nach der Kamera fragen kann. Danach funktioniert es direkt hier.',
  'add.upload.title': 'QR-Bild hochladen',
  'add.upload.description': 'Ein Screenshot oder Foto, das Sie zuvor gespeichert haben.',
  'add.manual.title': 'Einrichtungsschlüssel manuell eingeben',
  'add.manual.description': 'Für Websites, die statt eines QR-Codes einen Code anzeigen.',
  'add.quick.title': 'Nur einen Code abrufen',
  'add.quick.description': 'Schlüssel einfügen und sofort den Code sehen. Es wird nichts gespeichert.',
  'add.fromGoogle':
    'Sie kommen von Google Authenticator? Exportieren Sie dort Ihre Konten und scannen Sie den angezeigten Code mit der Kamera oder laden Sie einen Screenshot davon hoch. Zeigt es mehrere an, nehmen Sie jeden einzeln.',
  'common.done': 'Fertig',
  'add.noNativeReader':
    'Chrome hat auf diesem Computer keinen eingebauten QR-Leser, daher lässt sich ein großer Code – etwa ein Export aus Google Authenticator – mit der Kamera oft nicht scannen. Klappt es nicht, machen Sie auf dem Handy einen Screenshot und nutzen Sie „QR-Bild hochladen“.',
  'add.openScannerInSettings': 'Scanner in den Einstellungen öffnen',
  'add.noneFound': 'Keine Konten gefunden.',
  'add.noQrOnPage':
    'Im sichtbaren Teil der Seite wurde kein QR-Code gefunden. Scrollen Sie ihn ins Bild und versuchen Sie es erneut.',
  'add.noQrInImage': 'In diesem Bild wurde kein QR-Code gefunden.',
  'add.cannotReadUri': 'Diese URI konnte nicht gelesen werden.',
  'add.enterKey': 'Geben Sie den Einrichtungsschlüssel der Website ein.',
  'add.offeredOn': 'Codes für {domain} werden auf dieser Website angeboten.',
  'add.startTyping': 'Tippen Sie los – bekannte Dienste ergänzen ihre Angaben selbst.',
  'add.account': 'Konto',
  'add.accountPlaceholder': 'sie@beispiel.de',
  'add.setupKey': 'Einrichtungsschlüssel',
  'add.linkDetected': 'otpauth://-Link erkannt – Dienst und Konto werden daraus übernommen.',
  'add.spacesFine': 'Leerzeichen und Kleinbuchstaben sind kein Problem.',
  'add.submit': 'Konto hinzufügen',
  'add.summary': { one: 'Alle {count} Code gescannt.', other: 'Alle {count} Codes gescannt.' },
  'add.summaryAdded': { one: '{count} Konto hinzugefügt.', other: '{count} Konten hinzugefügt.' },
  'add.summarySkipped': {
    one: '{count} war bereits in Ihrem Tresor und blieb unverändert.',
    other: '{count} waren bereits in Ihrem Tresor und blieben unverändert.',
  },
  'error.badKey':
    'Ein Einrichtungsschlüssel besteht nur aus den Buchstaben A–Z und den Ziffern 2–7. Prüfen Sie, ob er vollständig und ohne Zusätze kopiert wurde.',
  'error.quickIsMigration':
    'Das ist ein Übertragungslink aus Google Authenticator für mehrere Konten auf einmal. Importieren Sie ihn stattdessen.',
  'error.keyTooShort': 'Das ist zu kurz für einen Einrichtungsschlüssel.',
  'error.fileTooLarge': 'Diese Datei ist zu groß zum Lesen.',
  'error.notSetupQr': 'Dieser QR-Code ist kein 2FA-Einrichtungscode.',
  'error.alreadyInVault': 'Dieses Konto ist bereits in Ihrem Tresor.',
  'error.gaSkipPeriod': 'Google Authenticator speichert nur 30-Sekunden-Codes; dieser verwendet {period}.',
  'error.gaSkipDigits': 'Google Authenticator speichert nur 6- oder 8-stellige Codes; dieser hat {digits}.',

  // --- Scannen mit der Kamera ---------------------------------------------------
  'scan.progressBatch': 'Code {seen} von {total} gescannt – {accounts}. Zeigen Sie den nächsten Code.',
  'scan.progress': '{accounts}.',
  'scan.added': { one: '{count} Konto hinzugefügt', other: '{count} Konten hinzugefügt' },
  'scan.found': { one: '{count} Konto gefunden', other: '{count} Konten gefunden' },
  'scan.skippedVault': {
    one: '{count} war bereits in Ihrem Tresor.',
    other: '{count} waren bereits in Ihrem Tresor.',
  },
  'scan.skippedScanned': { one: '{count} wurde bereits gescannt.', other: '{count} wurden bereits gescannt.' },
  'camera.noCamera': 'Dieser Browser gibt der Erweiterung keine Kamera.',
  'camera.preview': 'Kameravorschau',
  'camera.failedHint':
    'Sie können ein Konto trotzdem hinzufügen, indem Sie ein Foto des QR-Codes hochladen oder den Einrichtungsschlüssel eintippen.',
  'camera.hint':
    'Halten Sie den QR-Code in den Rahmen. Sie kommen von Google Authenticator? Öffnen Sie dort auf dem Handy den Export und richten Sie die Kamera darauf – zeigt es mehrere Codes, zeigen Sie sie nacheinander.',
  'camera.privacy':
    'Das Bild wird auf diesem Gerät gelesen und verworfen. Nichts wird aufgezeichnet, nichts wird hochgeladen.',
  'camera.blocked':
    'Chrome hat den Zugriff auf die Kamera blockiert. Erlauben Sie ihn für diese Seite oder nutzen Sie einen anderen Weg, ein Konto hinzuzufügen.',
  'camera.none': 'Auf diesem Computer wurde keine Kamera gefunden.',
  'camera.busy': 'Die Kamera wird von einem anderen Programm verwendet.',

  // --- Bilder und QR-Bilder -----------------------------------------------------
  'image.unreadable': 'Diese Datei ließ sich nicht als Bild lesen.',
  'image.wrongType': 'Verwenden Sie ein PNG-, JPEG-, WebP-, GIF- oder BMP-Bild.',
  'image.tooBig': 'Dieses Bild ist sehr groß. Versuchen Sie eines unter 8 MB.',
  'image.cannotPrepare': 'Das Bild konnte nicht vorbereitet werden.',
  'image.wontCompress':
    'Dieses Bild ließ sich nicht klein genug komprimieren. Ein einfaches Logo eignet sich besser als ein Foto.',
  'image.wrongScreenshotType': 'Verwenden Sie einen Screenshot als PNG, JPEG, WebP, GIF oder BMP.',
  'brand.account': 'Konto',
  'brand.unknown': 'Unbekannter Dienst',

  // --- Dienstfeld ---------------------------------------------------------------
  'service.label': 'Dienst',
  'service.matches': 'Passende Dienste',

  // --- Ein Konto in eine andere App übertragen ----------------------------------
  'share.intro':
    'Scannen Sie ihn mit Google Authenticator, Microsoft Authenticator, 1Password, Authy – mit jeder Authenticator-App – und sie erzeugt dieselben Codes wie diese.',
  'share.warning':
    'Wer diesen Code sieht oder fotografiert, kann Ihre Codes für {account} erzeugen, solange das Konto besteht. Zeigen Sie ihn nur der App, in die Sie wechseln.',
  'share.show': 'QR-Code anzeigen',
  'share.qrLabel': 'Einrichtungs-QR-Code für {account}',
  'share.hidesIn': 'Mit der anderen App scannen. Wird in {seconds} s ausgeblendet.',
  'share.linkCopied': 'Link kopiert',
  'share.copyLink': 'Einrichtungslink kopieren',
  'share.saveImage': 'Als Bild speichern',
  'share.linkWarning':
    'Der Link enthält ebenfalls das Geheimnis. Fügen Sie ihn in die andere App ein und kopieren Sie danach etwas anderes darüber.',
  'share.hideNow': 'Jetzt ausblenden',
  'shareCodes.modeLabel': 'Teilen oder übertragen',
  'shareCodes.modeCodes': 'Codes senden',
  'shareCodes.modeMove': 'In eine andere App übertragen',
  'shareCodes.noSecret': 'Dieses Konto hat keinen Einrichtungsschlüssel, erzeugt also keine Codes, und es gibt nichts zu teilen oder zu übertragen. Löschen Sie es und fügen Sie das Konto über seinen QR-Code neu hinzu.',
  'shareCodes.intro': 'Erstellen Sie einen Link, der die Codes dieses Kontos zeigt, bis er abläuft — nie den Schlüssel, der sie erzeugt.',
  'shareCodes.lengthLabel': 'Gültig für',
  'shareCodes.min5': '5 Minuten',
  'shareCodes.min15': '15 Minuten',
  'shareCodes.hour': '1 Stunde',
  'shareCodes.cannotRecall': 'Ein Link lässt sich nicht zurücknehmen. Wer ihn hat, kann die Codes bis zum Ablauf nutzen. Senden Sie ihn nur an die Person, die ihn braucht.',
  'shareCodes.copy': 'Link kopieren',
  'shareCodes.copied': 'Link kopiert. Er gilt bis {time}.',
  'shareCodes.counter': 'Zählerbasierte Codes lassen sich so nicht senden: Jeder ist verbraucht, sobald er erzeugt wird. Übertragen Sie stattdessen das Konto.',

  // --- Code abrufen, ohne zu speichern ------------------------------------------
  'quick.label': 'Einrichtungsschlüssel oder otpauth://-Link',
  'quick.copyHint': 'Zum Kopieren klicken',
  'quick.current': 'Aktueller Code',
  'quick.next': 'Nächster: <code>{code}</code>',
  'quick.notSaved': 'Nirgends gespeichert. Schließen Sie dies, und der Schlüssel ist weg.',
  'quick.save': 'Stattdessen als Konto speichern',
  'quick.settings': '{digits} Stellen · alle {period} s · {algorithm}',
  'quick.change': 'ändern',
  'quick.digits': 'Stellen',
  'quick.every': 'Alle',
  'quick.seconds': '{seconds} s',
  'quick.hash': 'Hash',

  // --- Einstellungen: Rahmen ----------------------------------------------------
  'nav.accounts': 'Konten',
  'nav.backup': 'Sicherung',
  'nav.security': 'Sicherheit',
  'nav.about': 'Über',
  'options.count': { one: '{count} Konto', other: '{count} Konten' },
  'options.sourceOnGithub': 'Open Source auf GitHub',
  // --- Ein neuer Wiederherstellungsschlüssel ------------------------------------
  'sheet.once':
    'Dieser Schlüssel wird nur dieses eine Mal angezeigt. Er wird nirgends gespeichert – verlieren Sie ihn, stellen Sie einen neuen aus.',
  'sheet.download': 'Blatt herunterladen',
  'sheet.copy': 'Kopieren',
  'sheet.saved': 'Ich habe ihn an einem Ort gespeichert, den ich auch dann noch habe, wenn dieser Computer weg ist.',

  // --- Gruppen ------------------------------------------------------------------
  'groups.title': 'Gruppen',
  'groups.description':
    'Überschriften in der Liste, damit ein großer Tresor auf einen Blick lesbar bleibt. Konten ordnen Sie im Bearbeiten-Fenster des jeweiligen Kontos einer Gruppe zu.',
  'groups.new': 'Neue Gruppe',
  'groups.newPlaceholder': 'Arbeit',
  'groups.add': 'Hinzufügen',
  'groups.none':
    'Noch keine Gruppen. Alles steht in einer Liste – genau richtig, bis sie so lang wird, dass sie Unterteilung braucht.',
  'groups.moveUp': '{name} nach oben',
  'groups.moveDown': '{name} nach unten',
  'common.save': 'Speichern',
  'groups.count': { one: '{count} Konto', other: '{count} Konten' },
  'groups.removeNote': 'Die Konten bleiben, ohne Gruppe.',
  'common.remove': 'Entfernen',
  'groups.rename': 'Umbenennen',
  'groups.removeNamed': '{name} entfernen',
  'groups.ungrouped': {
    one: '{count} Konto gehört zu keiner Gruppe und erscheint am Ende der Liste unter „Ohne Gruppe“.',
    other: '{count} Konten gehören zu keiner Gruppe und erscheinen am Ende der Liste unter „Ohne Gruppe“.',
  },

  // --- Über ---------------------------------------------------------------------
  'about.fact.sync.title': 'Ihre Geheimnisse werden verschlüsselt, bevor irgendetwas dieses Gerät verlässt',
  'about.fact.sync.body':
    'Synchronisierung ist optional. Mit ihr erreicht nur Chiffretext den Server, und er kann ihn nicht entschlüsseln. Codes werden immer lokal berechnet. Es gibt keine Telemetrie.',
  'about.fact.local.title': 'Ihre Geheimnisse verlassen dieses Gerät nie',
  'about.fact.local.body':
    'In dieser Version gibt es keinen Server, kein Konto und keine Telemetrie. Codes werden lokal aus Geheimnissen berechnet, die in einem verschlüsselten Tresor liegen.',
  'about.fact.keys.title': 'Zwei Wege, den Schlüssel zu verwahren, beide AES-256-GCM',
  'about.fact.keys.body':
    'Ihre Konten sind mit einem Datenschlüssel verschlüsselt, der selbst wieder verschlüsselt ist. Mit Master-Passwort stammt der Hüllschlüssel aus PBKDF2 mit 600.000 Runden und existiert nur im Speicher, solange entsperrt ist. Ohne eines ist es ein nicht exportierbarer Schlüssel dieses Browsers – kein Skript kann seine Bytes lesen, hardwaregestützt ist er aber nicht.',
  'about.fact.access.title': 'Kein pauschaler Zugriff auf Websites',
  'about.fact.access.body':
    'Die Erweiterung verlangt keine Host-Berechtigungen. Einen QR-Code auf einer Seite lesen oder einen Code eintragen geschieht über activeTab – eine Berechtigung, die Chrome nur für den Tab erteilt, auf dem Sie die Erweiterung geöffnet haben.',
  'about.fact.standards.title': 'Standards statt Abhängigkeit',
  'about.fact.standards.body':
    'RFC 6238 TOTP und RFC 4226 HOTP, mit otpauth://-Import und -Export. Sie können jederzeit zu einer anderen App wechseln und alles mitnehmen.',
  'about.version': 'Version {version}',
  'about.source': 'Quellcode',
  'about.viewOnGithub': 'Auf GitHub ansehen',
  'about.securityModel': 'Sicherheitsmodell',
  'about.securityModelDescription': 'Was die Erweiterung garantiert, auch gegenüber dem Synchronisierungsserver.',
  'about.readIt': 'Lesen',
  'about.rate': 'Keyrook Authenticator bewerten',
  'about.rateWhere': 'Im {store}. Dauert nur ein paar Sekunden.',
  'about.report': 'Problem melden oder etwas vorschlagen',
  'about.reportDescription':
    'Auf GitHub, wo es jeder lesen kann. Fügen Sie dort nie einen Einrichtungsschlüssel, einen Code oder ein Backup ein.',
  'about.openIssue': 'Issue eröffnen',
  'about.how': 'So funktioniert es',
  'about.logos.title': 'Logos der Dienste',
  'about.logos.description':
    'Die Logos sind in die Erweiterung eingebaut und werden nie geladen. Ein Logo aus dem Netz abzurufen, würde dem Antwortenden verraten, für welche Dienste Sie Zwei-Faktor-Authentifizierung nutzen.',
  'about.logos.body':
    '{count} Dienste haben ein echtes Logo. Grafiken von <simple>Simple Icons</simple> (CC0 1.0), LobeHub Icons, SVG Logos, CoreUI Brands, Arcticons und <fa>Font Awesome Free</fa> (Icons, CC BY 4.0). Alle Produktnamen und Logos gehören ihren Inhabern und dienen nur dazu, den Dienst eines Kontos zu erkennen. Ein Dienst ohne Logo in diesen Sammlungen erhält eine Kachel mit Buchstaben.',
  'about.shortcut.change': 'Ändern unter chrome://extensions/shortcuts.',
  // --- Einstellungen: Konten ----------------------------------------------------
  'accounts.title': 'Konten',
  'accounts.description':
    'Alles, was in diesem Tresor liegt. Codes werden auf diesem Gerät erzeugt, nie von einem Server.',
  'accounts.empty': 'Noch keine Konten. Fügen Sie eines hinzu, um loszulegen.',
  'accounts.digits': '{type} {digits} Stellen',
  'accounts.period': ' · {seconds} s',
  'accounts.counter': ' · Zähler {counter}',
  'accounts.moveNamed': '{name} teilen oder übertragen',
  'accounts.edit': 'Bearbeiten',
  'common.delete': 'Löschen',
  'accounts.deleteNamed': '{name} löschen',
  'accounts.deleted.title': 'Kürzlich gelöscht',
  'accounts.deleted.description':
    'Aufbewahrt, damit andere Geräte von der Löschung erfahren, sobald die Synchronisierung eingeschaltet ist. Stellen Sie versehentlich Entferntes wieder her.',
  'accounts.deleted.on': 'Gelöscht am {date}',
  'accounts.restore': 'Wiederherstellen',
  'common.close': 'Schließen',
  'editor.title': 'Konto bearbeiten',
  'editor.picture': 'Bild',
  'editor.pictureOwn': 'Ihr eigenes Bild, statt des Logos des Dienstes.',
  'editor.pictureNone': 'Wählen Sie eines für Dienste ohne Logo hier oder um zwei Konten zu unterscheiden.',
  'editor.replace': 'Ersetzen',
  'editor.choose': 'Bild wählen …',
  'editor.websites': 'Websites',
  'editor.websitesHint': 'Durch Kommas getrennt. Damit wird dieses Konto auf passenden Websites vorgeschlagen.',
  'editor.note': 'Notiz',
  'editor.group': 'Gruppe',
  'editor.ungrouped': 'Ohne Gruppe',
  'editor.noGroups': 'Legen Sie zuerst unter Konten eine Gruppe an.',
  'editor.setupKey': 'Einrichtungsschlüssel',
  'editor.setupKeyHint': 'Das Geheimnis hinter diesem Konto. Wer es sieht, kann Ihre Codes erzeugen.',
  'editor.hide': 'Verbergen',
  'editor.reveal': 'Anzeigen',
  'editor.revealWarning':
    'Zeigen Sie das nur auf einem Bildschirm, den sonst niemand sieht. Diesen Link in eine andere Authenticator-App zu kopieren, ist der Weg, das Konto auf ein Handy zu übertragen.',
  'editor.save': 'Änderungen speichern',

  // --- Einstellungen: Import ----------------------------------------------------
  'import.incomplete': {
    one: 'Diese Screenshots enthalten {seen} der {total} Codes dieses Exports aus Google Authenticator, die Konten im fehlenden einen sind also nicht dabei. Wählen Sie alle Screenshots des Exports zusammen aus, um alles zu übernehmen.',
    other: 'Diese Screenshots enthalten {seen} der {total} Codes dieses Exports aus Google Authenticator, die Konten in den fehlenden {count} sind also nicht dabei. Wählen Sie alle Screenshots des Exports zusammen aus, um alles zu übernehmen.',
  },
  'import.oneOrScreenshots': 'Wählen Sie eine Backup-Datei oder einen oder mehrere Screenshots von QR-Codes.',
  'import.noQrInThis': 'In diesem Bild wurde kein QR-Code gefunden.',
  'import.noAccountsInImages': 'Diese Bilder enthielten keine Konten.',
  'import.tooLarge': 'Diese Datei ist zu groß für ein Backup.',
  'import.noAccountsInFile': 'Diese Datei enthielt keine Konten.',
  'import.description':
    'Konten aus einer Backup-Datei holen, aus dem Export eines anderen Authenticators – mit der Kamera gescannt oder als Screenshots gewählt – oder durch Einfügen von otpauth://-Links.',
  'import.stopAndReview': 'Anhalten und {count} prüfen',
  'import.noNativeReader':
    'Chrome hat auf diesem Computer keinen eingebauten QR-Leser, daher lässt sich ein großer Code – etwa ein Export aus Google Authenticator – mit der Kamera oft nicht scannen. Klappt es nicht, machen Sie von jedem Code auf dem Handy einen Screenshot und wählen Sie alle über „Dateien wählen“.',
  'import.encrypted': 'Dieses Backup ist verschlüsselt. Geben Sie das Passwort ein, mit dem es erstellt wurde.',
  'import.backupPassword': 'Backup-Passwort',
  'import.open': 'Backup öffnen',
  'import.found': { one: '{count} neues Konto gefunden', other: '{count} neue Konten gefunden' },
  'import.skipping': ', {count} bereits im Tresor übersprungen',
  'import.unreadable': ', und {count} konnten nicht gelesen werden',
  'import.foundEnd': '.',
  'import.showFailed': 'Fehlgeschlagene Zeilen anzeigen',
  'import.import': '{count} importieren',
  'import.scan': 'Mit der Kamera scannen',
  'import.choose': 'Dateien wählen …',
  'import.paste': '… oder otpauth://-Links einfügen, einer pro Zeile',
  'import.read': 'Links lesen',

  // --- Alles in eine andere App übertragen --------------------------------------
  'dest.google.steps':
    'In Google Authenticator: Menü → Konten übertragen → Konten importieren, dann die Codes der Reihe nach scannen.',
  'dest.microsoft.steps':
    'Microsoft Authenticator kann nicht aus einer anderen App importieren, also kommen die Konten einzeln nacheinander. Dort: + → Anderes Konto, scannen, dann hier Weiter.',
  'dest.apple.steps':
    'Passwörter importiert Codes nur einzeln. In der App Passwörter: Codes → +, scannen, dann hier Weiter.',
  'dest.authy.steps':
    'Authy kann nicht aus einer anderen App importieren, also kommen die Konten einzeln nacheinander. In Authy: + → QR-Code scannen, dann hier Weiter.',
  'dest.1password.steps':
    '1Password fügt Codes Login für Login hinzu. Login öffnen oder anlegen → Bearbeiten → Einmalpasswort hinzufügen → scannen, dann hier Weiter. Am Computer kann es den Code direkt von diesem Bildschirm lesen.',
  'dest.bitwarden.steps':
    'Passwortmanager: Daten importieren → Dateiformat „Bitwarden (json)“ → Datei wählen. App Bitwarden Authenticator: aus Google Authenticator importieren und die Übertragungscodes scannen.',
  'dest.proton.steps':
    'In Proton Authenticator aus Google Authenticator importieren und die Übertragungscodes scannen – oder aus Aegis importieren und die Datei wählen.',
  'dest.ente.steps':
    'In Ente Auth Codes aus Google Authenticator importieren und die Übertragungscodes scannen – oder „Klartext“ und die .txt-Datei wählen.',
  'dest.aegis.steps': 'In Aegis: Import & Export → Aus Datei importieren → Aegis, und die Datei wählen.',
  'dest.2fas.steps':
    'In 2FAS aus Google Authenticator importieren und die Übertragungscodes scannen – oder aus Aegis importieren und die Datei wählen.',
  'dest.other.steps':
    'Jeder Authenticator scannt einen Einrichtungscode, einer nach dem anderen klappt also immer. Viele importieren auch die Übertragungscodes von Google Authenticator oder eine Datei mit otpauth://-Links – suchen Sie nach einer Importfunktion.',
  'dest.other.name': 'Eine andere App',

  // --- Einstellungen: Export ----------------------------------------------------
  'export.what': 'Was exportieren',
  'export.all': { one: 'Alle {count} Konto.', other: 'Alle {count} Konten.' },
  'export.someChosen': '{chosen} von {total} ausgewählt.',
  'export.choose': 'Auswählen …',
  'export.chipAll': 'Alle',
  'export.chipNone': 'Keine',
  'export.encrypted.description':
    'Eine Datei, gesperrt mit einem Passwort, das Sie hier wählen. Bewahren Sie eine Kopie sicher auf – geht dieses Gerät kaputt, bekommen Sie mit dieser Datei Ihre Konten zurück.',
  'export.encrypted.hint': 'Mindestens 8 Zeichen. Darf sich von Ihrem Master-Passwort unterscheiden.',
  'export.encrypted.download': 'Verschlüsseltes Backup herunterladen ({count})',
  'export.move.title': 'In eine andere App übertragen',
  'export.move.description':
    'Lesbare Exporte, um zu einem anderen Authenticator zu wechseln oder alles auf Papier aufzubewahren. Anders als ein Backup ist keiner davon verschlüsselt.',
  'export.move.danger':
    'Diese enthalten Ihre 2FA-Geheimnisse im Klartext. Wer die Codes sieht oder die Dateien öffnet, kann Ihre Codes erzeugen, solange die Konten bestehen. Löschen Sie Dateien und vernichten Sie Papier, sobald Sie fertig sind.',
  'export.move.understood': 'Mir ist klar, dass diese nicht verschlüsselt sind.',
  'common.continue': 'Weiter',
  'export.move.which': 'Zu welcher App wechseln Sie?',
  'export.filesAndPaper': 'Dateien und Papier:',
  'export.aegis': 'Aegis .json',
  'export.bitwarden': 'Bitwarden .json',
  'export.text': 'otpauth .txt',
  'export.print': 'Blatt drucken',
  'export.closesIn': {
    one: '{accounts}. Schließt sich in {count} Minute wieder.',
    other: '{accounts}. Schließt sich in {count} Minuten wieder.',
  },
  'export.closesSoon': '{accounts}. Schließt sich bald wieder.',
  'export.accounts': { one: '{count} Konto', other: '{count} Konten' },
  'export.closeNow': 'Jetzt schließen',
  'export.method.transfer': 'Übertragungscodes anzeigen',
  'export.method.oneByOne': 'Einzeln scannen',
  'export.method.aegis': 'Aegis-Datei herunterladen',
  'export.method.bitwarden': 'Bitwarden-Datei herunterladen',
  'export.method.text': 'Textdatei herunterladen',
  'export.allAtOnce': 'Alle auf einmal',
  'export.oneAtATime': 'Eins nach dem anderen',
  'export.transfer.label': 'Übertragungscodes für {app}',
  'export.transfer.title': 'Übertragungscodes für Google Authenticator',
  'export.moveTo': 'Zu {app} übertragen',
  'export.transfer.none': 'Keines der ausgewählten Konten kann zu Google Authenticator.',
  'export.transfer.codeLabel': 'Übertragungscode {index} von {total}',
  'export.previous': 'Zurück',
  'export.next': 'Weiter',
  'export.transfer.code': 'Code {index} von {total}',
  'export.transfer.oneHolds': {
    one: 'Ein Code enthält {count} Konto.',
    other: 'Ein Code enthält alle {count} Konten.',
  },
  'export.transfer.notIncluded': 'Nicht enthalten – übertragen Sie diese stattdessen einzeln:',
  'export.oneByOne.label': 'Einrichtungscodes für {app}, einer nach dem anderen',
  'export.oneByOne.title': 'Ein Konto nach dem anderen',
  'export.oneByOne.progress': 'Angezeigte Konten',
  'export.oneByOne.position': 'Konto {index} von {total}',
  'export.oneByOne.keys': '→ oder Leertaste für das nächste, Esc zum Beenden',
  'export.print.label': 'QR-Codes zum Drucken oder Scannen',
  'export.print.title': 'Keyrook Authenticator – Einrichtungscodes',
  'export.print.body':
    '{accounts}, {date}. Jeder Code richtet das Konto in einer beliebigen Authenticator-App ein. Wer dies besitzt, kann Ihre Codes erzeugen: Bewahren Sie es unter Verschluss auf.',
  'export.print.print': 'Drucken oder als PDF speichern',

  // --- Einstellungen: Sicherheit, oben ------------------------------------------
  'security.locking': 'Sperren',
  'security.lockAfter': 'Nach Inaktivität sperren',
  'security.lockAfter.passphrase':
    'Der Schlüssel zum Entschlüsseln wird aus dem Speicher entfernt. Ihr Master-Passwort wird wieder benötigt.',
  'security.lockAfter.device':
    'Gilt nur mit Master-Passwort – ein Tresor mit Geräteschlüssel hat nichts zu entsperren.',
  'security.autoLock': 'Verzögerung für automatisches Sperren',
  'security.minutes': { one: '{count} Minute', other: '{count} Minuten' },
  'security.hour': '1 Stunde',
  'security.never': 'Nie',
  'security.needsPassword': 'Braucht ein Master-Passwort',
  'security.blur': 'Codes bis zum Darüberfahren unscharf',
  'security.blurDescription': 'Hält Codes beim Bildschirmteilen vom Bildschirm fern.',
  'security.blurToggle': 'Codes unscharf',
  'security.autofill': 'Automatisch ausfüllen',
  'security.autofillRow': 'Anbieten, Codes auf Webseiten einzutragen',
  'security.appearance': 'Darstellung',
  'security.theme': 'Design',
  'security.theme.system': 'Wie System',
  'security.theme.light': 'Hell',
  'security.theme.dark': 'Dunkel',
  'security.sortBy': 'Konten sortieren nach',
  'security.sortOrder': 'Sortierung',
  'security.sort.added': 'Hinzugefügt',
  'security.sort.name': 'Name',
  'security.language': 'Sprache',
  'security.languageBrowser': 'Browsersprache ({language})',
  // --- Einstellungen: wie der Tresor geschützt ist ------------------------------
  'protect.msg.removedSignedIn':
    'Dieses Gerät öffnet jetzt ohne Passwort. Ihr Kontopasswort hat sich nicht geändert.',
  'protect.msg.removed': 'Master-Passwort entfernt. Dieser Tresor entsperrt sich auf diesem Gerät jetzt automatisch.',
  'protect.msg.setSignedIn': 'Dieses Gerät sperrt jetzt mit Ihrem Kontopasswort.',
  'protect.msg.set': 'Master-Passwort festgelegt. Sie werden danach gefragt, sobald der Tresor sperrt.',
  'protect.msg.changedSignedIn':
    'Passwort geändert, für diesen Tresor und Ihr Konto. Ihre anderen Geräte bitten Sie, sich damit neu anzumelden.',
  'protect.msg.changed': 'Master-Passwort geändert.',
  'protect.state.accountPassword': 'Sperrt mit Ihrem Kontopasswort',
  'protect.state.master': 'Master-Passwort',
  'protect.state.device': 'Geräteschlüssel (kein Passwort)',
  'protect.lockWithAccount': 'Mit Ihrem Kontopasswort sperren',
  'protect.addMaster': 'Master-Passwort hinzufügen',
  'protect.changePassword': 'Passwort ändern',
  'protect.note.passphrase':
    'Das ist zugleich das Passwort Ihres Synchronisierungskontos. Eine Änderung hier ändert es auch dort, und Ihre anderen Geräte bitten um eine neue Anmeldung.',
  'protect.note.device':
    'Ihr Synchronisierungskonto hat ein eigenes Passwort, nach dem dieses Gerät nicht fragt. Sie brauchen es auf einem neuen Gerät und um das Konto oder seinen Wiederherstellungsschlüssel zu ändern.',
  'protect.removeWarning':
    'Der Tresor bleibt verschlüsselt, entsperrt sich aber von selbst, sobald dieses Browserprofil offen ist. Jeder, der diesen Computer benutzt, kann dann Ihre Codes sehen.',
  'protect.removeWarningSignedIn':
    ' Ihr Konto behält sein Passwort – auf einem neuen Gerät brauchen Sie es weiterhin.',
  'protect.currentPassword': 'Aktuelles Passwort',
  'protect.currentMaster': 'Aktuelles Master-Passwort',
  'protect.accountPassword': 'Kontopasswort',
  'protect.accountPasswordHint':
    'Das Passwort, mit dem Sie sich bei der Synchronisierung anmelden. Dieses Gerät fragt danach, sobald es sperrt.',
  'protect.newPassword': 'Neues Passwort',
  'protect.hint12': 'Mindestens 12 gemischte Zeichen oder vier bis fünf voneinander unabhängige Wörter.',
  'protect.confirmNew': 'Neues Passwort bestätigen',
  'protect.removePassword': 'Passwort entfernen',
  'protect.lockWithIt': 'Damit sperren',
  'protect.setPassword': 'Passwort festlegen',
  'danger.title': 'Diesen Tresor löschen',
  'danger.description':
    'Entfernt alle Konten und den verschlüsselten Tresor von diesem Gerät. Es gibt kein Rückgängig und nirgends eine Kopie.',
  'danger.open': 'Diesen Tresor löschen …',
  'danger.warning':
    'Stellen Sie zuerst sicher, dass Sie zu jedem Konto noch einen anderen Zugang haben – eine Backup-Datei, Wiederherstellungscodes oder dieselben Konten auf Ihrem Handy.',
  'common.typeToConfirm': 'Zur Bestätigung {word} eingeben',
  'danger.confirm': 'Alles löschen',

  // --- Einstellungen: Wiederherstellungsschlüssel -------------------------------
  'kit.title': 'Wiederherstellungsschlüssel',
  'kit.provider':
    'Ihr Konto hat kein Passwort. Ein Wiederherstellungsschlüssel ist der Weg zurück, falls jeder angemeldete Browser verloren geht: Er lässt einen neuen Browser in Ihr Konto, ohne dass ein anderer zustimmen muss. {provider} kann das nicht für Sie tun.',
  'kit.signedIn':
    'Niemand kann Ihr Passwort zurücksetzen – weder wir noch Google. Ein Wiederherstellungsschlüssel ist der einzige Weg zurück, wenn Sie es vergessen: Er öffnet diesen Tresor, Ihre anderen Geräte und Ihr Konto auf einem neuen.',
  'kit.passphrase':
    'Niemand kann Ihr Master-Passwort zurücksetzen – weder wir noch Google. Genau das hält andere von Ihrem Tresor fern, und deshalb ist ein Wiederherstellungsschlüssel auch der einzige Weg zurück, wenn Sie es vergessen.',
  'kit.device':
    'Dieser Tresor entsperrt mit einem Schlüssel, den Ihr Browser verwahrt. Geht dieser verloren – gelöschte Browserdaten, ein neues Profil, eine Neuinstallation –, kann ihn nur noch ein Wiederherstellungsschlüssel öffnen.',
  'kit.none': 'Noch kein Wiederherstellungsschlüssel',
  'kit.vaultOnly': 'Öffnet diesen Tresor, aber nicht Ihr Konto',
  'kit.issued': 'Ein Wiederherstellungsschlüssel wurde ausgestellt',
  'kit.issueNew': 'Neuen ausstellen',
  'kit.create': 'Wiederherstellungsschlüssel erstellen',
  'kit.beforeSignIn':
    'Dieser Schlüssel wurde vor Ihrer Anmeldung ausgestellt, daher hat Ihr Konto ihn nicht. Er öffnet diesen Tresor hier weiterhin, aber nicht auf einem neuen Gerät. Stellen Sie einen neuen aus, der beides abdeckt.',
  'kit.replaces':
    'Ein neuer Schlüssel macht den vorherigen ungültig, ein altes ausgedrucktes Blatt können Sie also wegwerfen, sobald Sie es ersetzt haben.',
  'kit.replacesSignedIn':
    'Ein neuer Schlüssel macht den vorherigen ungültig, hier und auf Ihren anderen Geräten, ein altes ausgedrucktes Blatt können Sie also wegwerfen, sobald Sie es ersetzt haben.',
  'kit.withoutProvider':
    'Ohne ihn sind alle Konten in diesem Tresor endgültig verloren, wenn jeder bei Ihrem Konto angemeldete Browser verloren geht.',
  'kit.withoutPassword':
    'Ohne ihn sind alle Konten in diesem Tresor endgültig verloren, wenn Sie Ihr Passwort vergessen.',
  'kit.withoutDevice':
    'Ohne ihn sind alle Konten in diesem Tresor endgültig verloren, wenn der Schlüssel dieses Browsers verloren geht.',
  'kit.noSupport': 'Keine Supportanfrage kann das rückgängig machen.',
  'kit.removeProvider':
    'Ohne ihn kann nur noch ein bereits angemeldeter Browser einen neuen in Ihr Konto lassen.',
  'kit.removePassword': 'Ohne ihn bleibt Ihr Passwort der einzige Zugang.',
  'kit.removePasswordSignedIn':
    'Ohne ihn bleibt Ihr Passwort der einzige Zugang – auf diesem Gerät, Ihren anderen Geräten und zu Ihrem Konto.',
  'kit.reauth':
    'Ein Wiederherstellungsschlüssel kann einen Browser in Ihr Konto lassen, deshalb bittet {provider} Sie zuerst, sich noch einmal anzumelden.',
  'kit.passwordHint':
    'Ein Wiederherstellungsschlüssel kann Ihr Konto zurücksetzen, deshalb braucht seine Änderung Ihr Passwort.',
  'kit.removeConfirm': 'Wiederherstellungsschlüssel entfernen',
  'kit.createConfirm': 'Schlüssel erstellen',

  // --- Einstellungen: Konto und Synchronisierung --------------------------------
  'account.title': 'Konto',
  'facts.stored': 'Gespeicherte Konten',
  'facts.noLimit': 'Unbegrenzt',
  'facts.encryption': 'Verschlüsselung',
  'facts.autofill': 'Ausfüllen und QR-Scan',
  'facts.included': 'Enthalten',
  'facts.backup': 'Verschlüsselte Backup-Datei',
  'facts.sync': 'Synchronisierung zwischen Geräten',
  'facts.needsAccount': 'Braucht ein Konto',
  'facts.notYet': 'Noch nicht verfügbar',
  'facts.withoutAccount': 'Ohne Konto, auf diesem Gerät',
  'facts.title': 'Was ein kostenloser lokaler Tresor bietet',
  'facts.description':
    'Kein Konto, keine E-Mail, kein Server – und keine Grenzen bei dem, was für die Sicherheit zählt.',
  'account.localOnly': 'Nur lokal – nicht angemeldet',
  'account.noServer':
    'Diese Version wurde ohne Synchronisierungsserver gebaut, daher verlässt nichts, was Sie hier hinzufügen, Ihren Rechner.',
  'account.signedInWith': 'Angemeldet mit {provider} · ',
  'account.lastSynced': 'Zuletzt synchronisiert {time}',
  'account.notSynced': 'Noch nicht synchronisiert',
  'account.every5': ' · synchronisiert alle 5 Minuten',
  'account.syncNow': 'Jetzt synchronisieren',
  'account.signOut': 'Abmelden',
  'account.noKitProvider':
    'Ihr Konto hat keinen Wiederherstellungsschlüssel. Geht jeder angemeldete Browser verloren, kann nichts Ihre Konten zurückholen – weder wir noch {provider}.',
  'account.noKit':
    'Ihr Konto hat keinen Wiederherstellungsschlüssel. Vergessen Sie Ihr Passwort und verlieren dieses Gerät, kann nichts Ihre Konten zurückholen – weder wir noch sonst jemand.',
  'account.createUnderSecurity': 'Unter Sicherheit erstellen',
  'summary.sentReceived': '{sent} gesendet, {received} empfangen',
  'summary.conflicts': ', bei {count} die Version dieses Geräts behalten',
  'summary.overLimit': ', {count} passten nicht – ein Konto fasst bis zu 10.000 – und blieben auf diesem Gerät',
  'summary.end': '.',
  'summary.deleted': {
    one: ' {count} Konto wurde auf einem anderen Gerät entfernt – Sie können es unter Konten wiederherstellen.',
    other: ' {count} Konten wurden auf einem anderen Gerät entfernt – Sie können sie unter Konten wiederherstellen.',
  },
  'summary.rejected': {
    one: ' {count} Eintrag ließ sich nicht entschlüsseln und wurde ignoriert. Passiert das öfter, stimmt mit der gespeicherten Kopie etwas nicht.',
    other: ' {count} Einträge ließen sich nicht entschlüsseln und wurden ignoriert. Passiert das öfter, stimmt mit der gespeicherten Kopie etwas nicht.',
  },
  'account.signOutNote':
    'Die Abmeldung entfernt Ihre Codes aus diesem Browser. Sie bleiben in Ihrem Keyrook-Konto – melden Sie sich wieder an, um sie zurückzuholen.',
  'accountPage.title': 'Ihr Keyrook-Konto',
  'accountPage.body': 'Passwort, Wiederherstellungsschlüssel, Neubeginn und Löschen finden Sie auf der Kontoseite – für alle Keyrook-Apps zugleich.',
  'accountPage.bodyNoRoot': 'Passwort und Löschen finden Sie auf der Kontoseite. Der Wiederherstellungsschlüssel wird hier unter „Sicherheit“ erstellt, bis eine andere Keyrook-App das Konto nutzt.',
  'accountPage.bodyProvider': 'Wiederherstellungsschlüssel, Neubeginn und Löschen finden Sie auf der Kontoseite – für alle Keyrook-Apps zugleich.',
  'accountPage.bodyNoRootProvider': 'Das Löschen finden Sie auf der Kontoseite. Der Wiederherstellungsschlüssel wird hier unter „Sicherheit“ erstellt, bis eine andere Keyrook-App das Konto nutzt.',
  'accountPage.open': 'Kontoseite öffnen',
  'accountPage.recoveryKey': 'Der Wiederherstellungsschlüssel eines angemeldeten Tresors ist der des Keyrook-Kontos. Er wird auf der Kontoseite erstellt und geändert.',
  'accountPage.sheetProtects': 'Der Wiederherstellungsschlüssel des Kontos schützt Keyrook Authenticator',
  'accountPage.sheetUnknown': 'Noch nicht bekannt, ob er Keyrook Authenticator schützt',
  'accountPage.noSheet': 'Noch deutet nichts darauf hin, dass der Wiederherstellungsschlüssel dieses Kontos Keyrook Authenticator schützt. Wird das Passwort ohne ihn vergessen, können Ihre Codes verloren gehen. Erstellen oder prüfen Sie ihn auf der Kontoseite.',
  'kept.title': 'Aufbewahrt aus der Zeit vor dem Neubeginn',
  'kept.body': 'Als dieses Konto neu begann, wurde aufbewahrt, was Keyrook Authenticator darin hatte – bis zum {date}. Holen Sie es mit dem damaligen Passwort oder dem damaligen Wiederherstellungsschlüssel zurück.',
  'kept.password': 'Damaliges Passwort',
  'kept.recoveryKey': 'Damaliger Wiederherstellungsschlüssel',
  'kept.usePassword': 'Stattdessen das damalige Passwort verwenden',
  'kept.useRecoveryKey': 'Stattdessen den damaligen Wiederherstellungsschlüssel verwenden',
  'kept.bring': 'Zurückholen',
  'kept.done': 'Es ist wieder in diesem Tresor und auf dem Weg zu Ihren anderen Browsern.',
  'error.keys.awaitingConfirmation': 'Eine andere Keyrook-App hat die Schlüssel dieses Kontos ersetzt, und der von Keyrook Authenticator ist noch nicht nachgezogen. Prüfen Sie sie auf der Kontoseite und melden Sie sich dann erneut an.',
  'password.changedBoth':
    'Passwort geändert, für Ihr Konto und diesen Tresor. Ihre anderen Geräte bitten Sie, sich damit neu anzumelden.',
  'password.changedAccount':
    'Kontopasswort geändert. Ihre anderen Geräte bitten Sie, sich damit neu anzumelden.',
  'password.title': 'Passwort',
  'password.row': 'Kontopasswort',
  'password.rowDescription':
    'Damit melden Sie sich auf einem neuen Gerät an. Niemand kann es für Sie zurücksetzen – bewahren Sie Ihren Wiederherstellungsschlüssel gut auf.',
  'password.change': 'Passwort ändern …',
  'password.formTitle': 'Kontopasswort ändern',
  'devices.title': 'Angemeldete Geräte',
  'devices.description':
    'Melden Sie ein Gerät ab, das Sie nicht mehr nutzen oder nicht mehr haben. Es behält, was es bereits synchronisiert hat, hinter demselben Passwort, bekommt aber nichts Neues mehr.',
  'devices.this': 'Dieses Gerät',
  'devices.when': 'Angemeldet am {created} · zuletzt aktiv {seen}',
  'delete.row': 'Ihr Konto löschen',
  'delete.rowDescription':
    'Entfernt jede verschlüsselte Kopie auf dem Server. Dieses Gerät behält seinen Tresor genau so, wie er ist; andere Geräte synchronisieren nicht mehr.',
  'delete.open': 'Konto löschen …',
  'delete.warning':
    'Es gibt kein Rückgängig. Wenn danach nur noch dieses Gerät Ihre Konten hat, behalten Sie es – oder exportieren Sie vorher ein Backup.',
  'delete.reauth': '{provider} bittet Sie, sich noch einmal anzumelden, bevor etwas gelöscht wird.',
  'delete.confirm': 'Konto löschen',

  // --- Anmelden: die erste Karte -----------------------------------------------
  'intro.benefit1': 'Dieselben Codes in jedem Browser, in dem Sie angemeldet sind.',
  'intro.benefit2': 'Ein verlorener oder kaputter Laptop ist kein verlorener Tresor.',
  'intro.benefit3': 'Kostenlos und optional – ohne Konto funktioniert auf diesem Gerät weiterhin alles.',
  'intro.title': 'Tresor synchronisieren',
  'intro.subtitle':
    'Auf diesem Gerät verschlüsselt, bevor es das Gerät verlässt. Der Server speichert, was er nicht lesen kann – und wir auch nicht.',
  'intro.signedOutProvider':
    'Dieses Gerät wurde von {email} abgemeldet – es wurde auf einem anderen entfernt. Fahren Sie mit {provider} fort, um sich erneut anzumelden.',
  'intro.orEmail': 'oder mit E-Mail',
  'intro.create': 'Konto erstellen',
  'intro.signIn': 'Anmelden',
  'intro.source': 'Open Source – sehen Sie, wie Ihre Codes verschlüsselt werden',

  // --- Anmelden: E-Mail-Formulare -----------------------------------------------
  'form.email': 'E-Mail',
  'form.emailPlaceholder': 'sie@beispiel.de',
  'create.checkEmail': 'Prüfen Sie Ihre E-Mails',
  'create.codeSent': 'Wir haben einen sechsstelligen Code an <b>{email}</b> gesendet. Er gilt einmal, 15 Minuten lang.',
  'create.code': 'Code',
  'create.spam':
    'Nicht im Posteingang? Schauen Sie im <b>Spam</b>-Ordner nach einer Nachricht von <b>Keyrook</b> und markieren Sie sie als <b>Kein Spam</b>.',
  'create.submit': 'Konto erstellen',
  'create.existing':
    'Hat diese Adresse bereits ein Konto, steht das stattdessen in der E-Mail – melden Sie sich dann dort an.',
  'create.stillNothing': 'Immer noch nichts?',
  'create.resendIn': 'Neuen Code in {seconds} s senden',
  'create.resend': 'Neuen Code senden',
  'create.wrongAddress': '. Falsche Adresse?',
  'create.changeIt': 'Ändern',
  'create.title': 'Konto erstellen',
  'create.choosing': 'Dieses Passwort brauchen Sie auf einem neuen Gerät. Dieses hier öffnet weiterhin ohne.',
  'create.sharing': 'Ihr Master-Passwort wird auch Ihr Kontopasswort – es bleibt bei einem.',
  'create.password': 'Passwort',
  'create.master': 'Master-Passwort',
  'create.next':
    'Als Nächstes schicken wir Ihnen einen Code zur Bestätigung der Adresse, dann speichern Sie einen Wiederherstellungsschlüssel – der einzige Weg zurück, wenn Sie das Passwort vergessen.',
  'create.agree': 'Mit der Erstellung eines Kontos stimmen Sie der <link>Datenschutzerklärung</link> zu.',
  'create.haveAccount': 'Sie haben bereits ein Konto?',
  'signin.subtitle': 'Codes, die schon auf diesem Gerät sind, kommen zu Ihrem Konto hinzu.',
  'signin.signedOut':
    'Dieses Gerät wurde von {email} abgemeldet – das Passwort wurde geändert oder das Gerät auf einem anderen entfernt. Melden Sie sich erneut an, um weiter zu synchronisieren.',
  'signin.forgot': 'Passwort vergessen?',
  'signin.locksWithAccount': 'Dieses Gerät sperrt künftig mit Ihrem Kontopasswort.',
  'signin.keepsOpening': 'Dieses Gerät öffnet weiterhin ohne Passwort.',
  'signin.newHere': 'Neu hier?',
  'recoverAccount.title': 'Konto wiederherstellen',
  'recoverAccount.subtitle':
    'Verwenden Sie den Wiederherstellungsschlüssel, den Sie beim Erstellen gespeichert haben, und wählen Sie dann ein neues Passwort.',
  'recoverAccount.keyHint': '32 Zeichen von Ihrem ausgedruckten Blatt. Leerzeichen und Bindestriche spielen keine Rolle.',
  'recoverAccount.submit': 'Wiederherstellen und anmelden',
  'recoverAccount.elsewhere': 'Nutzt auch eine andere Keyrook-App dieses Konto, wird das Passwort auf der Kontoseite zurückgesetzt.',
  'recoverAccount.note':
    'Jedes Gerät des Kontos wird abgemeldet und nach dem neuen Passwort gefragt. Ihr Wiederherstellungsschlüssel bleibt gültig.',

  // --- Anmelden: danach ---------------------------------------------------------
  'ready.empty': 'Ihr Konto ist bereit.',
  'ready.all': {
    one: 'Ihr Konto ist bereit, und das Konto auf diesem Gerät ist darin gesichert.',
    other: 'Ihr Konto ist bereit, und alle {count} Konten auf diesem Gerät sind darin gesichert.',
  },
  'ready.some':
    'Ihr Konto ist bereit. {done} von {total} Konten sind bisher gesichert; der Rest folgt bei der nächsten Synchronisierung.',
  'fresh.title': 'Wiederherstellungsschlüssel speichern',
  'fresh.provider':
    'Geht jeder bei Ihrem Konto angemeldete Browser verloren, ist dieser Schlüssel der einzige Weg zurück – {provider} kann Ihren Tresor nicht wiederherstellen, und wir auch nicht.',
  'fresh.password':
    'Vergessen Sie Ihr Passwort, ist dieser Schlüssel der einzige Weg zurück – niemand kann es für Sie zurücksetzen, weder wir noch Google.',
  'welcome.fromAccount': '{count} aus Ihrem Konto',
  'welcome.fromDevice': '{count} von diesem Gerät hinzugefügt',
  'welcome.inSync': 'Bereits synchron.',
  'welcome.nothing': 'Noch nichts hier.',
  'welcome.failed': 'Angemeldet – die erste Synchronisierung wurde nicht abgeschlossen',
  'welcome.back': 'Sie sind wieder drin',
  'welcome.signedIn': 'Sie sind angemeldet',
  'welcome.nothingLost':
    'Nichts geht verloren: Ihre Codes kommen mit der nächsten Synchronisierung. Versuchen Sie es jetzt erneut, oder es geschieht innerhalb von fünf Minuten von selbst.',
  'welcome.onDevice': { one: 'Konto auf diesem Gerät', other: 'Konten auf diesem Gerät' },
  'welcome.uploading': {
    one: ' · {count} wird noch hochgeladen und folgt bei der nächsten Synchronisierung',
    other: ' · {count} werden noch hochgeladen und folgen bei der nächsten Synchronisierung',
  },
  'welcome.othersSignedOut': 'Alle anderen Geräte wurden abgemeldet und fragen nach dem neuen Passwort.',
  'welcome.tryAgain': 'Erneut versuchen',
  'welcome.seeAccounts': 'Ihre Konten ansehen',
  'welcome.toolbar': 'Sie sind auch nur einen Klick entfernt: das Keyrook-Authenticator-Symbol in Ihrer Symbolleiste.',

  // --- Anmelden mit Google oder GitHub ------------------------------------------
  'provider.continue': 'Weiter mit {provider}',
  'provider.finishInWindow': 'Schließen Sie die Anmeldung im geöffneten {provider}-Fenster ab.',
  'provider.confirmed': '{provider} hat <b>{email}</b> bestätigt. Noch kein Konto verwendet diese Adresse.',
  'provider.point1':
    'Kein Passwort. Auf einem neuen Browser fahren Sie mit {provider} fort, und ein bereits angemeldeter Browser lässt ihn hinein, nachdem Sie geprüft haben, dass beide denselben Code zeigen.',
  'provider.point2':
    '{provider} bestätigt, dass Sie es sind. Ihre Codes sieht {provider} nie: Sie werden hier verschlüsselt, mit einem Schlüssel, der auf Ihren Browsern bleibt.',
  'provider.point3':
    'Als Nächstes speichern Sie einen Wiederherstellungsschlüssel – der Weg zurück, falls jeder angemeldete Browser verloren geht. {provider} kann Ihren Tresor nicht wiederherstellen.',
  'provider.notRight': 'Nicht das richtige Konto?',
  'provider.startAgain': 'Neu beginnen',
  'pairing.codeLabel': 'Code {code}',
  'join.title': 'Diesen Browser hineinlassen',
  'join.subtitle':
    '<b>{email}</b> hat bereits ein Konto. Geben Sie diesen Browser von einem frei, der dort angemeldet ist.',
  'join.masterPassword': 'Master-Passwort dieses Tresors',
  'join.masterHint': 'Es sperrt diesen Tresor hier weiterhin; das Konto selbst hat kein Passwort.',
  'join.ask': 'Beitritt anfragen',
  'join.step1':
    'Öffnen Sie Keyrook Authenticator in einem bereits angemeldeten Browser. Die Anfrage erscheint dort – im Popup und in den Einstellungen unter Synchronisierung.',
  'join.step2': 'Prüfen Sie, dass dort derselbe Code steht wie auf dieser Seite, und geben Sie ihn dann frei.',
  'join.askAgain': 'Erneut anfragen',
  'join.compare': 'Der andere Browser zeigt ebenfalls einen Code. Geben Sie dort nur frei, wenn es genau dieser ist.',
  'join.waiting': 'Warten auf einen anderen Browser …',
  'join.noOther': 'Kein anderer Browser mehr?',
  'join.useKey': 'Wiederherstellungsschlüssel verwenden',
  'join.wrongAccount': 'Mit dem falschen {provider}-Konto angemeldet?',
  'joinKey.subtitle':
    'Der Schlüssel, den Sie beim Erstellen des Kontos gespeichert haben. Er lässt diesen Browser ohne einen anderen hinein.',
  'joinKey.submit': 'Dem Konto beitreten',
  'approve.approved': 'Freigegeben. Der andere Browser öffnet Ihren Tresor gleich.',
  'approve.mismatch':
    'Abgelehnt. Wenn Sie sich gerade nicht selbst angemeldet haben, kann sich jemand anderes bei Ihrem {provider}-Konto anmelden – ändern Sie dessen Passwort und prüfen Sie die Sicherheitseinstellungen.',
  'approve.declined': 'Abgelehnt. Es wurde nichts gesendet.',
  'approve.title': 'Browser, die beitreten möchten',
  'approve.description':
    'Jede Anfrage stammt von jemandem, der sich gerade mit Ihrem {provider}-Konto angemeldet hat. Geben Sie nur einen Browser frei, bei dem Sie sich gerade selbst anmelden.',
  'approve.askedAt': 'Angefragt um {time}',
  'approve.review': 'Prüfen',
  'approve.deny': 'Ablehnen',
  'approve.question':
    'Zeigt der anfragende Browser genau diesen Code? Wenn nicht, versucht jemand anderes hineinzukommen.',
  'approve.matches': 'Stimmt überein – hineinlassen',
  'approve.doesNotMatch': 'Stimmt nicht überein',

  // --- Fehler, Fortsetzung ------------------------------------------------------
  'error.vaultNewer':
    'Dieser Tresor wurde mit einer neueren Version von Keyrook Authenticator erstellt. Bitte aktualisieren Sie, bevor Sie ihn öffnen.',
  'error.uriUnsupported': 'Dieser Link verwendet eine Einstellung, die diese App nicht lesen kann ({value}).',
  'editor.websitesPlaceholder': 'github.com, gist.github.com',
  'error.noWorker': 'Die Erweiterung hat nicht geantwortet. Schließen Sie dies und öffnen Sie es erneut.',
  'nav.sync': 'Synchronisierung',
  'nav.general': 'Allgemein',
  'nav.needsAttention': 'Erfordert Ihre Aufmerksamkeit',
  'sync.description':
    'Dieselben Codes in jedem Browser, in dem Sie sich anmelden – verschlüsselt, bevor sie dieses Gerät verlassen.',
  'backup.description':
    'Eine verschlüsselte Kopie aufbewahren, Konten importieren oder sie in eine andere App übertragen.',
  'backup.choice.backup.title': 'Sichern',
  'backup.choice.backup.body': 'Eine verschlüsselte Datei, geschützt mit einem Passwort Ihrer Wahl.',
  'backup.choice.import.title': 'Importieren',
  'backup.choice.import.body': 'Aus einer Sicherung, dem Export einer anderen App oder otpauth://-Links.',
  'backup.choice.move.body':
    'Übertragungscodes, eine Seite zum Drucken oder eine lesbare Datei. Nicht verschlüsselt.',
  'security.description':
    'Wie sich dieser Tresor öffnet – und wie Sie wieder hineinkommen, wenn dieser Browser verloren geht.',
  'security.deviceKeyHint':
    'Nichts einzugeben. Schützt nicht vor Schadsoftware, die unter Ihrem Konto auf diesem Computer läuft.',
  'security.passwordHint': 'Wird abgefragt, sobald der Tresor gesperrt ist.',
  'general.description': 'Wie die Erweiterung aussieht und sich verhält – und woher sie kommt.',
  'general.inBrowser': 'Im Browser',
  'general.autofillHint':
    'Wenn Sie das Pop-up auf einer Anmeldeseite öffnen, wird der passende Code angeboten. Nur dieser Tab wird gelesen.',
  'vault.signInToSync': 'Zum Synchronisieren anmelden',
  'vault.empty.signIn':
    'Nutzen Sie Keyrook Authenticator schon in einem anderen Browser? <link>Melden Sie sich an</link>, um Ihre Codes hierher zu holen.',
  'setup.haveAccount':
    'Sie nutzen Keyrook Authenticator bereits? <link>Melden Sie sich an</link>, um Ihre Codes hierher zu holen.',
  'popup.signInOpensTab': 'Öffnet sich in einem neuen Tab und endet in den Einstellungen.',
  'error.backupWrongPassword': 'Mit diesem Passwort lässt sich die Datei nicht öffnen.',
  'error.foreign.steam': 'Steam-Guard-Codes können noch nicht importiert werden.',
  'error.foreign.locked':
    'Dieser Export ist mit einem Passwort gesperrt, das Keyrook Authenticator nicht öffnen kann. Exportieren Sie erneut ohne Passwort.',
  'import.lockedFrom':
    '{app} hat diesen Export mit einem Passwort gesperrt. Geben Sie das dort festgelegte Passwort ein.',
  'import.fromApps':
    'Exporte aus Aegis, 2FAS, Bitwarden, Proton, Ente Auth, andOTP, FreeOTP+, der Authenticator-Erweiterung und Google Authenticator funktionieren ebenfalls – auch eine CSV aus Apple Passwörter, 1Password oder einem anderen Passwortmanager.',
  'shortcut.open': 'Keyrook Authenticator öffnen',
  'shortcut.fill': 'Code für diese Seite ausfüllen',
  'shortcut.fillHint': 'Füllt nur aus, wenn genau ein Konto zur Website gehört; sonst öffnet sich die Liste.',
  'shortcut.notSet': 'Nicht festgelegt',
  'vault.shortcutHint': '{keys} füllt ihn aus, ohne dies zu öffnen.',
  'import.csvWarning':
    'Diese Datei enthält Ihre Passwörter im Klartext. Gelesen wurden nur die Zwei-Faktor-Schlüssel, sonst wird nichts behalten – löschen Sie die Datei, wenn Sie fertig sind.',
  'import.noKeysInCsv': 'Diese Datei enthält keine Zwei-Faktor-Schlüssel, nur Passwörter.',
};
