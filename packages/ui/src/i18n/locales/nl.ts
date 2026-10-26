// Nederlands. Met „je”, zoals de meeste Nederlandse software.
import type { Dictionary } from './en.js';

export const nl: Dictionary = {
  // --- Fouten -------------------------------------------------------------------
  'error.vaultLocked': 'De kluis is vergrendeld.',
  'error.vaultExists': 'Er staat al een kluis op dit apparaat.',
  'error.noVault': 'Er staat nog geen kluis op dit apparaat.',
  'error.vaultCorrupt': 'De opgeslagen kluis is beschadigd of door een andere app geschreven.',
  'error.wrongMasterPassword': 'Verkeerd hoofdwachtwoord.',
  'error.enterCurrentMasterPassword': 'Voer je huidige hoofdwachtwoord in.',
  'error.currentPasswordWrong': 'Het huidige wachtwoord is onjuist.',
  'error.masterPasswordShort': 'Het hoofdwachtwoord moet minstens 8 tekens lang zijn.',
  'error.notPassphraseVault': 'Deze kluis is niet beveiligd met een hoofdwachtwoord.',
  'error.recoveryKeyMalformed': 'Dat lijkt niet op een herstelsleutel.',
  'error.recoveryKeyNoMatch': 'Die herstelsleutel klopt niet.',
  'error.recoverOnAccountPage': 'Je herstelsleutel klopt, maar het wachtwoord van dit account stel je nu opnieuw in op de accountpagina, voor alle Keyrook-apps tegelijk.',
  'error.kitOnAccountPage': 'De herstelsleutel van dit account maak je nu op de accountpagina, voor alle Keyrook-apps tegelijk.',
  'error.restoreEmpty': 'Van dit account is niets meer terug te halen: het is op een ander apparaat verwijderd voordat dit apparaat het ooit had.',
  'error.noAccountSheet': 'Dit account heeft nog geen herstelsleutel. Maak er een op de accountpagina.',
  'error.recoveryKeyWrong': 'Die herstelsleutel hoort niet bij dit account.',
  'error.noRecoveryKit': 'Deze kluis heeft geen herstelsleutel.',
  'error.syncUnavailable': 'Synchronisatie is niet beschikbaar in deze versie.',
  'error.notSignedIn': 'Niet ingelogd.',
  'error.alreadySignedIn': 'Al ingelogd.',
  'error.signedOutElsewhere':
    'Dit apparaat is uitgelogd bij synchronisatie: het wachtwoord is gewijzigd of het apparaat is vanaf een ander verwijderd. Log opnieuw in.',
  'error.removedFromAccount':
    'Een ander apparaat heeft dit apparaat uit je Keyrook-account verwijderd, dus de codes van het account zijn hier weggehaald. Log opnieuw in om ze terug te halen.',
  'error.signOutUnsynced':
    'Sommige wijzigingen in deze browser zijn nog niet in je account aangekomen, en door nu uit te loggen raak je ze kwijt. Maak verbinding met internet en probeer het opnieuw.',
  'error.enterAccountPassword': 'Voer het wachtwoord van je account in.',
  'error.accountPasswordWrong': 'Dat is niet het wachtwoord van je account.',
  'error.accountPasswordWeak':
    'Dat wachtwoord is te zwak om een kopie van je kluis te beschermen die dit apparaat verlaat. Gebruik minstens 12 tekens met hoofd- en kleine letters, cijfers en symbolen, of vier à vijf woorden die niets met elkaar te maken hebben.',
  'error.lockOnlyWithAccountPassword':
    'Dat is niet het wachtwoord van je account. Zolang je bent ingelogd, is dat het enige wachtwoord waarmee deze kluis kan vergrendelen.',
  'error.signupWrongMasterPassword':
    'Dat is niet het hoofdwachtwoord van deze kluis. Het wordt ook het wachtwoord van je account.',
  'error.masterPasswordTooWeakForAccount':
    'Je hoofdwachtwoord is te zwak om een kopie van je kluis te beschermen die dit apparaat verlaat. Wijzig het eerst bij Beveiliging: minstens 12 gemengde tekens, of vier à vijf woorden die niets met elkaar te maken hebben.',
  'error.passwordsDiverged':
    'Het wachtwoord van je account verschilt van dat van deze kluis. Log uit bij synchronisatie en weer in om ze gelijk te trekken, en probeer het daarna opnieuw.',
  'error.kitRace':
    'Een ander apparaat van je heeft zojuist de herstelsleutel gewijzigd. Hier is niets veranderd; probeer het opnieuw.',
  'error.providerHasNoPassword': 'Dit account logt in met Google of GitHub en heeft geen wachtwoord.',
  'error.noActiveTab': 'Geen actief tabblad.',
  'error.autofillNotHere': 'Automatisch invullen werkt alleen op gewone webpagina’s.',
  'error.autofillBlocked':
    'Chrome liet de extensie deze pagina niet lezen. Open de pop-up vanaf de pagina die je wilt invullen.',
  'error.signinCancelled': 'Inloggen is geannuleerd.',
  'error.signinStateMismatch': 'Deze inlogpoging kwam niet terug zoals ze vertrok. Probeer het opnieuw.',
  'error.signinUnfinished': 'Inloggen is niet afgerond. Probeer het opnieuw.',
  'error.signupPendingExpired': 'Deze inlogpoging is verlopen. Begin opnieuw.',
  'error.signInFirst': 'Log eerst in.',
  'error.joinNeedsMasterPassword': 'Voer het hoofdwachtwoord van deze kluis in om de koppeling af te ronden.',
  'error.notThisVaultsPassword': 'Dat is niet het hoofdwachtwoord van deze kluis.',
  'error.nothingWaiting': 'Er wacht niets op goedkeuring.',
  'error.pairingExpired': 'Het verzoek is beëindigd: het is geweigerd of er zijn tien minuten verstreken. Vraag het opnieuw.',
  'error.pairingWrongKey':
    'De ontvangen sleutel hoort niet bij dit account. Er is niets gewijzigd. Probeer het opnieuw vanaf het andere apparaat.',
  'error.pairingForged': 'Die goedkeuring kwam niet van het apparaat waarvan je de code hebt gecontroleerd.',
  'error.pairingForgedAsk':
    'Die goedkeuring kwam niet van het apparaat waarvan de code is gecontroleerd. Er is niets gewijzigd. Vraag het opnieuw.',
  'error.pairingEnded': 'Dat verzoek is beëindigd.',
  'error.approveAgain': 'Begin opnieuw met het goedkeuren van dat verzoek.',
  'error.backupPasswordShort': 'Het back-upwachtwoord moet minstens 8 tekens lang zijn.',
  'error.backupNotOurs': 'Dit bestand is geen back-up van Keyrook Authenticator.',
  'error.backupNewer': 'Deze back-up is gemaakt met een nieuwere versie van de app.',
  'error.backupUnknownCipher': 'Deze back-up gebruikt een versleutelingsmethode die deze versie niet kent.',
  'error.backupTooCostly': 'Deze back-up openen vraagt onredelijk veel rekenwerk. Hij wordt genegeerd.',
  'error.backupMalformed': 'Deze back-up is ongeldig.',
  'error.uriNotOtpauth': 'Geen otpauth://-link.',
  'error.uriMalformed': 'Die otpauth://-link is ongeldig.',
  'error.uriNoSecret': 'Die link bevat geen geheim.',
  'error.uriBadSecret': 'Het geheim in die link is geen geldige base32.',
  'error.uriNoCounter': 'Een HOTP-link moet een teller bevatten.',
  'error.secretEmpty': 'De instelsleutel is leeg.',
  'error.migrationNotOurs': 'Geen export van Google Authenticator.',
  'error.migrationMalformed': 'Deze export van Google Authenticator is beschadigd of onvolledig.',
  'error.offline': 'De synchronisatieserver is niet bereikbaar. Controleer je verbinding en probeer het opnieuw.',
  'error.passkey.wrongOrigin': 'Een toegangssleutel werkt alleen voor Keyrooks eigen pagina en apps.',
  'error.passkey.notOffered': 'Inloggen met een toegangssleutel wordt hier niet aangeboden.',
  'error.passkey.unchecked': 'Die toegangssleutel kon niet worden gecontroleerd. Probeer het opnieuw.',
  'error.passkey.unknown': 'Geen enkel Keyrook-account kent die toegangssleutel. Misschien is hij verwijderd.',
  'error.passkey.ended': 'Het verzoek voor die toegangssleutel is verlopen. Probeer het opnieuw.',
  'error.passkey.noUnlock': 'Die toegangssleutel opent de sleutel van dit account niet. Log in plaats daarvan in met het wachtwoord.',
  'error.passkey.noUnlockProvider':
    'Die toegangssleutel opent de sleutel van dit account niet. Ga in plaats daarvan verder met Google of GitHub.',
  'error.passkey.masterPassword':
    'Een kluis die vergrendelt met een hoofdwachtwoord kan niet inloggen met een toegangssleutel. Log in met het wachtwoord van het account, of met Google of GitHub.',
  'error.passkey.permission':
    'Keyrook Authenticator heeft toestemming van Chrome nodig om de toegangssleutels van account.keyrook.com te gebruiken. Kies de toegangssleutel opnieuw en sta het toe.',
  'error.passkey.cancelled':
    'Er is geen toegangssleutel gebruikt. Probeer het opnieuw, of log op een andere manier in.',
  'error.passkey.failed':
    'Chrome kon niet om een toegangssleutel vragen. Probeer het opnieuw, of log op een andere manier in.',
  'error.secondStep.missing': 'Voer ook de code uit je authenticator-app in.',
  'error.secondStep.wrongCode': 'Die code klopt niet. Voer de code in die je authenticator-app nu laat zien.',
  'error.secondStep.expired': 'Die aanmelding is verlopen. Log opnieuw in.',
  'error.secondStep.used': 'Die code is net gebruikt om in te loggen. Wacht tot je app de volgende laat zien.',
  'error.provider.refusedBy': '{provider} heeft het inloggen geweigerd.',
  'error.provider.unreachable': '{provider} is niet bereikbaar. Probeer het zo opnieuw.',
  'error.provider.refused': 'Het inloggen is geweigerd. Probeer het opnieuw.',
  'error.provider.githubRefused': 'GitHub heeft het inloggen geweigerd.',
  'error.provider.noReauth': 'Google heeft je niet opnieuw laten inloggen.',
  'error.provider.unverifiedEmail': 'Google heeft dat e-mailadres niet geverifieerd.',
  'error.provider.githubNoEmail': 'Je GitHub-account heeft geen geverifieerd primair e-mailadres.',
  'error.server.badRequest': 'De synchronisatieserver kon dat verzoek niet lezen.',
  'error.server.session': 'Die sessie is niet meer geldig.',
  'error.server.accountGone': 'Dat account bestaat niet meer.',
  'error.server.signupExpired': 'Die registratie is verlopen. Log opnieuw in.',
  'error.server.signinExpired': 'Die inlogpoging is verlopen. Probeer het opnieuw.',
  'error.server.tooManyCodes': 'Te veel verkeerde codes. Vraag een nieuwe aan.',
  'error.server.tooManyPairings':
    'Te veel apparaten wachten om aan dit account te koppelen. Probeer het over een paar minuten opnieuw.',
  'error.server.wrongKey': 'Dit apparaat heeft de accountsleutel niet.',
  'error.server.providerAccount': 'Dit account logt in met Google of GitHub, niet met een wachtwoord.',
  'error.server.mailFailed': 'De e-mail kon niet worden verzonden. Probeer het over een minuut opnieuw.',
  'error.server.pairingTaken': 'Dat verzoek is beëindigd, of een ander apparaat keurt het al goed.',
  'error.server.passwordWrong': 'Dat wachtwoord klopt niet.',
  'error.server.badCredentials': 'E-mailadres of wachtwoord is onjuist.',
  'error.server.badCode':
    'Die code klopt niet of is verlopen. Controleer de e-mail of vraag een nieuwe aan.',
  'error.server.reauthMismatch':
    'Log ter bevestiging opnieuw in met het account dat je voor Keyrook gebruikt.',
  'error.server.kitRace': 'Een ander apparaat heeft zojuist de herstelsleutel gewijzigd.',
  'error.server.unavailable': 'De synchronisatieserver kon dat nu niet doen. Probeer het zo opnieuw.',
  'error.server.lockedOut': {
    one: 'Te veel mislukte pogingen. Probeer het over {count} seconde opnieuw.',
    other: 'Te veel mislukte pogingen. Probeer het over {count} seconden opnieuw.',
  },
  'error.server.rateLimited': {
    one: 'Te veel pogingen. Probeer het over {count} seconde opnieuw.',
    other: 'Te veel pogingen. Probeer het over {count} seconden opnieuw.',
  },
  'error.server.emailTaken': '{email} heeft al een Keyrook-account.',
  'error.server.recordTooLarge': 'Een van je accounts is te groot om te synchroniseren ({id}).',
  'error.server.codeTooSoon': 'Er is net een code verstuurd. Wacht even voordat je een nieuwe aanvraagt.',
  'error.server.keyRace': 'Een ander apparaat heeft de sleutel net ingesteld. Probeer het opnieuw.',
  'error.server.archiveNeedsOldKeys': 'Alleen het oude wachtwoord of de oude herstelsleutel kan wat bewaard is verwijderen voordat het verloopt.',
  'error.server.signupNeedsKeys': 'Dit account kon niet worden aangemaakt. Werk Keyrook Authenticator bij en probeer het opnieuw.',
  'error.server.accountIdTaken': 'Die account-ID is al in gebruik. Meld je opnieuw aan.',
  'error.server.archiveWrongKey': 'Daarmee gaat wat bewaard is niet open.',
  'error.server.flowExpired': 'Dat is verlopen. Vraag een nieuwe code aan en begin opnieuw.',
  'error.server.archiveGone': 'Dat wordt niet meer bewaard.',
  'error.server.notProductKey': 'Die sleutel hoort niet bij Keyrook Authenticator.',
  'error.server.foreignRecord': 'Dat record hoort bij een ander Keyrook-product.',
  'error.server.rootChanged': 'De sleutels van het account zijn op een ander apparaat gewijzigd. Probeer het opnieuw.',
  'error.server.rootExists': 'Dit account heeft al een hoofdsleutel.',
  'error.server.noRoot': 'Dit account heeft nog geen hoofdsleutel.',
  'error.server.startOverLimit': 'Dit account is de laatste tijd te vaak opnieuw begonnen. Probeer het na {date} opnieuw.',
  'error.server.wrongRootKey': 'Dit apparaat heeft de hoofdsleutel van het account niet.',
  'error.server.sessionReplayed': 'Dit apparaat is afgemeld omdat de sessie ergens anders is gebruikt. Log opnieuw in.',
  'error.server.noProductKey': 'Keyrook Authenticator heeft nog geen sleutel op dit account.',
  'error.server.productKeyChanged': 'De sleutel van Keyrook Authenticator op dit account is gewijzigd. Probeer het opnieuw.',
  'error.server.productKeyReplaced': 'De sleutel van Keyrook Authenticator is op een ander apparaat vervangen. Log opnieuw in.',
  'error.server.updateRequired': 'Werk Keyrook Authenticator bij om dit account te blijven gebruiken.',
  'error.server.olderBuildsRetired': 'Oudere versies van Keyrook Authenticator kunnen dit account niet meer gebruiken.',
  'error.server.emailTakenOtherProvider': '{email} heeft al een Keyrook-account dat inlogt via een andere aanbieder.',
  'error.server.emailTakenPassword': '{email} heeft al een Keyrook-account met een wachtwoord. Log in met je e-mailadres en wachtwoord.',
  'error.server.signInWithPassword': 'Dat account logt in met een wachtwoord. Log hier in met je e-mailadres en wachtwoord.',
  'error.server.pageCodeWrong': 'Die code wordt niet getoond op de accountpagina. Controleer hem, of begin daar opnieuw.',
  'error.server.pageRequestEnded': 'Dat verzoek is verlopen of beëindigd. Begin opnieuw op de accountpagina.',
  'error.server.noKeyrookAccount': 'Dit Google- of GitHub-account heeft geen Keyrook-account. Maak er een aan in Keyrook Authenticator of Passhold.',
  'error.account.productKeyMismatch': 'De sleutel van {product} gaat niet open met de hoofdsleutel van dit account. Er is niets gewijzigd.',
  'error.account.confirmWithPassword': 'Dit account heeft een wachtwoord. Bevestig daarmee.',
  'error.account.chooseNewPassword': 'Kies een nieuw wachtwoord voor dit account.',
  'error.account.archiveNotOpened': 'Niets wat voor Keyrook Authenticator bewaard is, gaat daarmee open.',
  'error.account.keyNotConfirmed': 'De accountsleutel is niet de sleutel die je hebt bevestigd. Kijk nog eens.',
  'error.account.serverMismatch': 'Het antwoord van de synchronisatieserver past niet bij dit account. Er is niets mee geopend.',
  'error.account.archiveNoPassword': 'Dit account had toen geen wachtwoord.',
  'error.account.noPasswordForKeys': 'Dit account heeft geen wachtwoord om zijn sleutels mee te openen.',
  'error.account.noRecoveryKey': 'Dit account heeft nog geen herstelsleutel.',

  // --- Ontgrendelen -------------------------------------------------------------
  'unlock.prompt': 'Voer je hoofdwachtwoord in om te ontgrendelen.',
  'unlock.placeholder': 'Hoofdwachtwoord',
  'unlock.submit': 'Ontgrendelen',
  'unlock.forgot': 'Vergeten? <link>Gebruik je herstelsleutel</link>',
  'platformUnlock.unlock': 'Ontgrendelen met vingerafdruk, gezicht of pincode',
  'platformUnlock.title': 'Vingerafdruk, gezicht of pincode',
  'platformUnlock.body': 'Open de kluis met de eigen controle van deze computer — Touch ID, Windows Hello of de pincode — in plaats van het hoofdwachtwoord te typen. Het wachtwoord opent hem nog steeds, en wijzigingen vragen er nog steeds om.',
  'platformUnlock.on': 'De kluis opent ook met de eigen controle van deze computer. Als je het hoofdwachtwoord verwijdert, gaat dit uit.',
  'passkeyUnlock.turnOn': 'Aanzetten',
  'passkeyUnlock.turnOff': 'Uitzetten',
  'platformUnlock.confirm': 'Daarna vraagt je computer om je vingerafdruk, gezicht of pincode.',
  'error.passkeyUnlock.cancelled': 'De controle is geannuleerd of duurde te lang. Probeer het opnieuw, of gebruik het hoofdwachtwoord.',
  'error.platformUnlock.noPrf': 'Waar deze toegangssleutel is opgeslagen, kan geen sleutel worden bewaard, dus kan hij de kluis niet openen. Zet dit opnieuw aan en kies een andere plek als je wordt gevraagd waar je hem wilt opslaan — of blijf het hoofdwachtwoord gebruiken.',
  'error.passkeyUnlock.failed': 'Daarmee ging de kluis niet open. Gebruik het hoofdwachtwoord en zet dit daarna opnieuw aan onder Beveiliging.',
  'securityKey.unlock': 'Ontgrendelen met beveiligingssleutel',
  'securityKey.title': 'Beveiligingssleutel',
  'securityKey.body': 'Open de kluis met een USB-beveiligingssleutel en de pincode ervan in plaats van het hoofdwachtwoord te typen. Wie de sleutel heeft en de pincode kent, kan de kluis dan op deze computer openen. Raak je de sleutel kwijt, dan opent het hoofdwachtwoord de kluis nog steeds.',
  'securityKey.on': 'De kluis opent op deze computer ook met je beveiligingssleutel en de pincode ervan. Wie de sleutel heeft en de pincode kent, kan hem hier openen, dus zet dit uit als je de sleutel kwijtraakt. Als je het hoofdwachtwoord verwijdert, gaat dit uit.',
  'securityKey.confirm': 'Steek daarna je beveiligingssleutel erin, typ de pincode en raak de sleutel aan. Sommige sleutels vragen het twee keer.',
  'error.securityKey.noPrf': 'Deze beveiligingssleutel kan geen sleutel bewaren, dus kan de kluis niet openen. Sleutels die alleen voor inloggen in twee stappen zijn gemaakt, kunnen dat niet. Probeer een andere sleutel of blijf het hoofdwachtwoord gebruiken.',

  // --- Kluis die niet meer opent ------------------------------------------------
  'unrecoverable.title': 'Deze kluis kan niet meer worden geopend',
  'unrecoverable.why':
    'De versleutelingssleutel stond in dit browserprofiel en is weg, meestal omdat browsegegevens zijn gewist, de extensie opnieuw is geïnstalleerd of dit een ander profiel is. Zonder die sleutel kan niemand de opgeslagen accounts ontsleutelen, wij ook niet.',
  'unrecoverable.hasKit':
    'Je hebt een herstelsleutel voor deze kluis gemaakt. Die beschermt dezelfde gegevens, los van de ontbrekende sleutel: hij opent alles.',
  'unrecoverable.useKit': 'Mijn herstelsleutel gebruiken',
  'unrecoverable.noKit':
    'Begin opnieuw en herstel vanuit een back-upbestand als je dat hebt. Anders moet je tweestapsverificatie op elke site opnieuw instellen, met de herstelcodes die je daar hebt gekregen.',
  'unrecoverable.confirmErase': 'Ja, wissen en opnieuw beginnen',
  'common.cancel': 'Annuleren',
  'unrecoverable.startOver': 'Opnieuw beginnen',

  // --- Wachtwoordsterkte --------------------------------------------------------
  'strength.0': 'heel zwak',
  'strength.1': 'zwak',
  'strength.2': 'redelijk',
  'strength.3': 'sterk',
  'strength.4': 'heel sterk',
  'strength.line': 'Sterkte: {label}',
  'strength.lineWithWarning': 'Sterkte: {label} — {warning}',
  'strength.tooShort': 'Gebruik minstens 10 tekens: lengte telt het meest.',
  'strength.digitsOnly': 'Alleen cijfers is makkelijk te raden.',
  'strength.repeated': 'Vermijd herhaalde tekens.',

  // --- Eerste start -------------------------------------------------------------
  'setup.prompt': 'Kies hoe je 2FA-geheimen worden beschermd.',
  'setup.device.title': 'Gewoon beginnen',
  'setup.device.badge': 'Aanbevolen',
  'setup.device.description':
    'Je geheimen worden versleuteld met een sleutel die deze browser voor je bewaart. Niets onthouden, niets intypen.',
  'setup.device.footnote':
    'Beschermt tegen alles wat scripts kan uitvoeren of de gegevens van je extensie kan lezen. Niet tegen malware die onder jouw gebruiker op deze computer draait.',
  'setup.password.title': 'Hoofdwachtwoord toevoegen',
  'setup.password.description':
    'Eén wachtwoord ontgrendelt de kluis, die weer vergrendelt als je hem niet meer gebruikt.',
  'setup.password.footnote':
    'De sterkste optie: eenmaal vergrendeld kan niets op deze computer de kluis openen zonder het wachtwoord.',
  'setup.footer': 'Hoe dan ook AES-256-GCM. Altijd te wijzigen; synchronisatie is optioneel, in Instellingen.',
  'setup.footer.noSync': 'Hoe dan ook AES-256-GCM. Altijd te wijzigen, in Instellingen.',
  'setup.source': 'Open source: lees de code',
  'common.back': 'Terug',
  'setup.passwordStep.title': 'Hoofdwachtwoord instellen',
  'setup.passwordStep.warning':
    'Niemand kan dit wachtwoord herstellen. Vergeet je het, dan opent alleen een herstelsleutel de kluis: maak er een via Instellingen → Beveiliging, en schrijf het wachtwoord op een veilige plek op.',
  'setup.passwordStep.label': 'Hoofdwachtwoord',
  'setup.passwordStep.placeholder': 'Minstens 8 tekens',
  'setup.passwordStep.confirm': 'Wachtwoord bevestigen',
  'common.passwordsDiffer': 'De wachtwoorden komen niet overeen.',
  'setup.passwordStep.submit': 'Mijn kluis maken',
  'setup.passwordStep.footer': 'AES-256-GCM · sleutel afgeleid met PBKDF2 (600.000 rondes)',

  // --- Herstelsleutel, een kluis openen -----------------------------------------
  'recover.title': 'Je herstelsleutel gebruiken',
  'recover.intro':
    'De sleutel van 32 tekens van het blad dat je bewaarde toen je deze kluis instelde. Hiermee vervang je hoe de kluis vergrendelt, dus kies dat hieronder ook.',
  'recover.keyLabel': 'Herstelsleutel',
  'recover.hintEmpty': 'Alleen letters en cijfers; spaties maken niet uit.',
  'recover.hintRight': 'Dat is de juiste vorm.',
  'recover.hintCount': '{count} van 32 tekens.',
  'recover.lockQuestion': 'Hoe moet deze kluis voortaan vergrendelen?',
  'recover.lockPassword': 'Nieuw hoofdwachtwoord instellen',
  'recover.lockDevice': 'Geen wachtwoord: dit apparaat bewaart de sleutel',
  'recover.newPassword': 'Nieuw hoofdwachtwoord',
  'recover.atLeast8': 'Minstens 8 tekens.',
  'recover.submit': 'Ontgrendelen en opnieuw vergrendelen',

  // --- Wachtwoordveld -----------------------------------------------------------
  'meter.0': 'Te zwak',
  'meter.1': 'Zwak',
  'meter.2': 'Redelijk',
  'meter.3': 'Sterk',
  'meter.4': 'Heel sterk',
  'password.show': 'Wachtwoord tonen',
  'password.hide': 'Wachtwoord verbergen',

  // --- Pop-up: de lijst ---------------------------------------------------------
  'vault.search': 'Accounts zoeken',
  'vault.add': 'Account toevoegen',
  'vault.settings': 'Instellingen',
  'vault.lock': 'Nu vergrendelen',
  'vault.count': { one: '{count} account', other: '{count} accounts' },
  'vault.syncedWith': 'Gesynchroniseerd met {email}',
  'vault.syncedAs': 'gesynchroniseerd als {email}',
  'vault.changeOrder': 'Volgorde wijzigen',
  'vault.byName': 'Op naam',
  'vault.orderAdded': 'Toevoegvolgorde',
  'vault.joinRequests': {
    one: 'Een apparaat vraagt om aan je account te koppelen.',
    other: '{count} apparaten vragen om aan je account te koppelen.',
  },
  'vault.joinRequestsHint': 'Keur alleen een apparaat goed waarop je nu zelf aan het inloggen bent.',
  'vault.reviewInSettings': 'Bekijken in Instellingen',
  'vault.noMatch': 'Geen accounts komen overeen met „{query}”.',
  'vault.forHost': 'Voor {host}',
  'vault.fieldDetected': 'codeveld gevonden',
  'common.encryptedHere': 'Versleuteld op dit apparaat',
  'vault.fillWarning':
    '<b>{account}</b> is voor <b>{domain}</b>, maar deze pagina is <b>{host}</b>. Had je dat niet verwacht, dan doet de pagina zich misschien voor als de site.',
  'vault.dontFill': 'Niet invullen',
  'vault.fillAnyway': 'Toch invullen',
  'vault.empty.title': 'Nog geen accounts',
  'vault.empty.body':
    'Open op een site de pagina voor het instellen van tweestapsverificatie en scan de QR-code direct vanuit het tabblad.',
  'vault.empty.add': 'Je eerste account toevoegen',

  // --- Pop-up: een account ------------------------------------------------------
  'common.untitled': 'Naamloos',
  'row.copyHint': 'Klik om te kopiëren',
  'row.share': 'Delen of verplaatsen',
  'row.shareHint': 'Stuur de codes een tijdje, of verplaats het naar een andere app',
  'row.favouriteAdd': 'Aan favorieten toevoegen',
  'row.favouriteRemove': 'Uit favorieten verwijderen',
  'row.fillHint': 'Deze code in de pagina invullen',
  'row.fill': 'Invullen',
  'row.copied': 'Gekopieerd',
  'row.copy': 'Code kopiëren',
  'row.next': 'Volgende code maken',
  'row.counter': 'Teller: {counter}',

  // --- Pop-up: vragen om een beoordeling ----------------------------------------
  'rate.region': 'Keyrook Authenticator beoordelen',
  'rate.body': '<b>Vind je Keyrook Authenticator nuttig?</b> Via een beoordeling in {store} vinden anderen het.',
  'rate.store.chrome': 'de Chrome Web Store',
  'rate.store.edge': 'Edge-invoegtoepassingen',
  'rate.notNow': 'Niet nu',
  'rate.rate': 'Beoordelen',

  // --- Gedeelde onderdelen ------------------------------------------------------
  'common.openSource': 'Open source',

  // --- Een account toevoegen ----------------------------------------------------
  'add.title.manual': 'Instelsleutel invoeren',
  'add.title.camera': 'Scannen met je camera',
  'add.title.quick': 'Code opvragen zonder op te slaan',
  'add.title.choose': 'Een account toevoegen',
  'add.page.title': 'QR-code op deze pagina scannen',
  'add.page.description': 'Maakt een schermafbeelding van het zichtbare tabblad en leest de code daaruit.',
  'add.camera.title': 'Scannen met je camera',
  'add.camera.description': 'Voor een code op je telefoon, ook een export van Google Authenticator.',
  'add.camera.elsewhere':
    'Opent één keer Instellingen zodat Chrome om de camera kan vragen. Daarna werkt het hier.',
  'add.upload.title': 'QR-afbeelding uploaden',
  'add.upload.description': 'Een schermafbeelding of foto die je eerder hebt opgeslagen.',
  'add.manual.title': 'Instelsleutel handmatig invoeren',
  'add.manual.description': 'Voor sites die een code tonen in plaats van een QR-code.',
  'add.quick.title': 'Alleen een code opvragen',
  'add.quick.description': 'Plak een sleutel en zie meteen de code. Er wordt niets opgeslagen.',
  'add.fromGoogle':
    'Kom je van Google Authenticator? Exporteer daar je accounts en scan de code die het toont met je camera, of upload er een schermafbeelding van. Toont het er meerdere, doe ze dan één voor één.',
  'common.done': 'Klaar',
  'add.noNativeReader':
    'Chrome heeft op deze computer geen ingebouwde QR-lezer, dus een grote code, zoals een export van Google Authenticator, scant vaak niet met een camera. Lukt het niet, maak dan een schermafbeelding op je telefoon en gebruik „QR-afbeelding uploaden”.',
  'add.openScannerInSettings': 'Scanner openen in Instellingen',
  'add.noneFound': 'Geen accounts gevonden.',
  'add.noQrOnPage':
    'Geen QR-code gevonden in het zichtbare deel van de pagina. Scrol hem in beeld en probeer het opnieuw.',
  'add.noQrInImage': 'Geen QR-code gevonden in die afbeelding.',
  'add.cannotReadUri': 'Die URI kon niet worden gelezen.',
  'add.enterKey': 'Voer de instelsleutel van de site in.',
  'add.offeredOn': 'Codes voor {domain} worden op die site aangeboden.',
  'add.startTyping': 'Begin met typen: bekende diensten vullen hun eigen gegevens in.',
  'add.account': 'Account',
  'add.accountPlaceholder': 'jij@voorbeeld.nl',
  'add.setupKey': 'Instelsleutel',
  'add.linkDetected': 'otpauth://-link gevonden: dienst en account worden daaruit ingevuld.',
  'add.spacesFine': 'Spaties en kleine letters zijn prima.',
  'add.submit': 'Account toevoegen',
  'add.summary': { one: '{count} code gescand.', other: 'Alle {count} codes gescand.' },
  'add.summaryAdded': { one: '{count} account toegevoegd.', other: '{count} accounts toegevoegd.' },
  'add.summarySkipped': {
    one: '{count} stond al in je kluis en is gelaten zoals het was.',
    other: '{count} stonden al in je kluis en zijn gelaten zoals ze waren.',
  },
  'error.badKey':
    'Een instelsleutel bestaat alleen uit de letters A–Z en de cijfers 2–7. Controleer of hij volledig is gekopieerd, zonder iets extra’s.',
  'error.quickIsMigration':
    'Dat is een overdrachtslink van Google Authenticator, voor meerdere accounts tegelijk. Importeer hem in plaats daarvan.',
  'error.keyTooShort': 'Dat is te kort voor een instelsleutel.',
  'error.fileTooLarge': 'Dat bestand is te groot om te lezen.',
  'error.notSetupQr': 'Die QR-code is geen 2FA-instelcode.',
  'error.alreadyInVault': 'Dat account staat al in je kluis.',
  'error.gaSkipPeriod': 'Google Authenticator bewaart alleen codes van 30 seconden; deze gebruikt {period}.',
  'error.gaSkipDigits': 'Google Authenticator bewaart alleen codes van 6 of 8 cijfers; deze heeft er {digits}.',
  'error.gaSkipSteam': 'Google Authenticator kan geen Steam Guard-codes maken.',

  // --- Scannen met de camera ----------------------------------------------------
  'scan.progressBatch': 'Code {seen} van {total} gescand: {accounts}. Toon de volgende code.',
  'scan.progress': '{accounts}.',
  'scan.added': { one: '{count} account toegevoegd', other: '{count} accounts toegevoegd' },
  'scan.found': { one: '{count} account gevonden', other: '{count} accounts gevonden' },
  'scan.skippedVault': {
    one: '{count} stond al in je kluis.',
    other: '{count} stonden al in je kluis.',
  },
  'scan.skippedScanned': { one: '{count} was al gescand.', other: '{count} waren al gescand.' },
  'camera.noCamera': 'Deze browser geeft de extensie geen camera.',
  'camera.preview': 'Cameravoorbeeld',
  'camera.failedHint':
    'Je kunt nog steeds een account toevoegen door een foto van de QR-code te uploaden, of door de instelsleutel in te typen.',
  'camera.hint':
    'Houd de QR-code binnen het kader. Kom je van Google Authenticator? Open het exportscherm op je telefoon en richt de camera erop; toont het meerdere codes, laat ze dan na elkaar zien.',
  'camera.privacy':
    'Het beeld wordt op dit apparaat gelezen en weggegooid. Er wordt niets opgenomen en niets geüpload.',
  'camera.blocked':
    'Chrome heeft de toegang tot de camera geblokkeerd. Sta die toe voor deze pagina, of voeg een account op een andere manier toe.',
  'camera.none': 'Geen camera gevonden op deze computer.',
  'camera.busy': 'De camera wordt door een ander programma gebruikt.',

  // --- Afbeeldingen en QR-afbeeldingen ------------------------------------------
  'image.unreadable': 'Dat bestand kon niet als afbeelding worden gelezen.',
  'image.wrongType': 'Gebruik een PNG-, JPEG-, WebP-, GIF- of BMP-afbeelding.',
  'image.tooBig': 'Die afbeelding is erg groot. Probeer er een onder de 8 MB.',
  'image.cannotPrepare': 'De afbeelding kon niet worden voorbereid.',
  'image.wontCompress':
    'Die afbeelding is niet klein genoeg te comprimeren. Een eenvoudig logo werkt beter dan een foto.',
  'image.wrongScreenshotType': 'Gebruik een schermafbeelding als PNG, JPEG, WebP, GIF of BMP.',
  'brand.account': 'Account',
  'brand.unknown': 'Onbekende dienst',

  // --- Dienstveld ---------------------------------------------------------------
  'service.label': 'Dienst',
  'service.matches': 'Passende diensten',

  // --- Een account naar een andere app verplaatsen ------------------------------
  'share.intro':
    'Scan hem met Google Authenticator, Microsoft Authenticator, 1Password, Authy (elke authenticator-app) en die maakt dezelfde codes als deze.',
  'share.warning':
    'Iedereen die deze code ziet of fotografeert, kan je codes voor {account} maken zolang het account bestaat. Laat hem alleen zien aan de app waar je naartoe gaat.',
  'share.show': 'QR-code tonen',
  'share.qrLabel': 'Instel-QR-code voor {account}',
  'share.hidesIn': 'Scan met de andere app. Verdwijnt over {seconds} s.',
  'share.linkCopied': 'Link gekopieerd',
  'share.copyLink': 'Instellink kopiëren',
  'share.saveImage': 'Opslaan als afbeelding',
  'share.linkWarning':
    'De link bevat ook het geheim. Plak hem in de andere app en kopieer daarna iets anders eroverheen.',
  'share.hideNow': 'Nu verbergen',
  'shareCodes.modeLabel': 'Delen of verplaatsen',
  'shareCodes.modeCodes': 'Codes sturen',
  'shareCodes.modeMove': 'Naar een andere app',
  'shareCodes.noSecret': 'Dit account heeft geen instelsleutel, dus het maakt geen codes en er valt niets te delen of te verplaatsen. Verwijder het en voeg het account opnieuw toe via de QR-code.',
  'shareCodes.intro': 'Maak een link die de codes van dit account toont tot hij verloopt, nooit de sleutel die ze maakt.',
  'shareCodes.lengthLabel': 'Geldig voor',
  'shareCodes.min5': '5 minuten',
  'shareCodes.min15': '15 minuten',
  'shareCodes.hour': '1 uur',
  'shareCodes.cannotRecall': 'Een link kun je niet terugnemen. Wie hem heeft, kan de codes gebruiken tot hij verloopt, dus stuur hem alleen naar wie hem nodig heeft.',
  'shareCodes.copy': 'Link kopiëren',
  'shareCodes.copied': 'Link gekopieerd. Hij werkt tot {time}.',
  'shareCodes.counter': 'Codes met een teller kunnen zo niet worden verstuurd: elke code is op zodra hij is gemaakt. Verplaats het account in plaats daarvan.',

  // --- Code opvragen zonder op te slaan -----------------------------------------
  'quick.label': 'Instelsleutel of otpauth://-link',
  'quick.copyHint': 'Klik om te kopiëren',
  'quick.current': 'Huidige code',
  'quick.next': 'Volgende: <code>{code}</code>',
  'quick.notSaved': 'Nergens opgeslagen. Sluit dit en de sleutel is weg.',
  'quick.save': 'In plaats daarvan als account opslaan',
  'quick.settings': '{digits} cijfers · elke {period} s · {algorithm}',
  'quick.change': 'wijzigen',
  'quick.digits': 'Cijfers',
  'quick.every': 'Elke',
  'quick.seconds': '{seconds} s',
  'quick.hash': 'Hash',

  // --- Instellingen: kader ------------------------------------------------------
  'nav.accounts': 'Accounts',
  'nav.backup': 'Back-up',
  'nav.security': 'Beveiliging',
  'nav.about': 'Over',
  'options.count': { one: '{count} account', other: '{count} accounts' },
  'options.sourceOnGithub': 'Open source op GitHub',
  // --- Een nieuwe herstelsleutel ------------------------------------------------
  'sheet.once':
    'Dit is de enige keer dat deze sleutel wordt getoond. Hij wordt nergens opgeslagen: raak je hem kwijt, maak dan een nieuwe.',
  'sheet.print': 'Afdrukken',
  'sheet.apart': 'Bewaar hem apart van je e-mail en mail hem nooit naar jezelf: met deze sleutel en je e-mailadres kan iemand een nieuw wachtwoord instellen en je codes openen.',
  'sheet.apartProvider': 'Bewaar hem apart van het Google- of GitHub-account waarmee je inlogt, en zet hem nooit in de mail of opslag van dat account: met deze sleutel en dat account kan iemand je codes openen.',
  'sheet.kept': 'Ik heb hem bewaard',
  'sheet.checkHeading': 'Controleer of je hem hebt bewaard',
  'sheet.checkLead': 'Typ twee groepen van de sleutel over uit wat je hebt bewaard. Groepen zijn de blokken van vier tussen de streepjes, van links geteld.',
  'sheet.group': 'Groep {position}',
  'sheet.check': 'Controleren',
  'sheet.mismatch': 'Dat staat niet in je sleutel. Kijk nog eens naar wat je hebt bewaard, of toon de sleutel opnieuw en bewaar hem nu.',
  'sheet.showAgain': 'Sleutel opnieuw tonen',
  'sheet.download': 'Blad downloaden',
  'sheet.copy': 'Kopiëren',

  // --- Groepen ------------------------------------------------------------------
  'groups.title': 'Groepen',
  'groups.description':
    'Kopjes in de lijst, zodat een grote kluis in één oogopslag leesbaar blijft. Je zet een account in een groep vanuit het eigen bewerkscherm van dat account.',
  'groups.new': 'Nieuwe groep',
  'groups.newPlaceholder': 'Werk',
  'groups.add': 'Toevoegen',
  'groups.none':
    'Nog geen groepen. Alles staat in één lijst, en dat is prima totdat die zo lang wordt dat hij opgedeeld moet worden.',
  'groups.moveUp': '{name} omhoog',
  'groups.moveDown': '{name} omlaag',
  'common.save': 'Opslaan',
  'groups.count': { one: '{count} account', other: '{count} accounts' },
  'groups.removeNote': 'De accounts blijven, zonder groep.',
  'common.remove': 'Verwijderen',
  'groups.rename': 'Hernoemen',
  'groups.removeNamed': '{name} verwijderen',
  'groups.ungrouped': {
    one: '{count} account zit in geen enkele groep en staat onder „Zonder groep” onderaan de lijst.',
    other: '{count} accounts zitten in geen enkele groep en staan onder „Zonder groep” onderaan de lijst.',
  },

  // --- Over ---------------------------------------------------------------------
  'about.fact.sync.title': 'Je geheimen worden versleuteld voordat er iets dit apparaat verlaat',
  'about.fact.sync.body':
    'Synchronisatie is optioneel. Daarmee komt alleen versleutelde tekst bij de server, die hem niet kan ontsleutelen. Codes worden altijd lokaal berekend. Er is geen telemetrie.',
  'about.fact.local.title': 'Je geheimen verlaten dit apparaat nooit',
  'about.fact.local.body':
    'In deze versie is er geen server, geen account en geen telemetrie. Codes worden lokaal berekend uit geheimen die in een versleutelde kluis staan.',
  'about.fact.keys.title': 'Twee manieren om de sleutel te bewaren, allebei AES-256-GCM',
  'about.fact.keys.body':
    'Je accounts zijn versleuteld met een gegevenssleutel die zelf weer is ingepakt. Met een hoofdwachtwoord komt de inpaksleutel uit PBKDF2 met 600.000 rondes en bestaat hij alleen in het geheugen zolang de kluis ontgrendeld is. Zonder is het een niet-exporteerbare sleutel van deze browser: geen script kan de bytes lezen, al is hij niet door hardware beschermd.',
  'about.fact.access.title': 'Geen algemene toegang tot websites',
  'about.fact.access.body':
    'De extensie vraagt geen hostrechten. Een QR-code van een pagina lezen of er een code in invullen gaat via activeTab: een recht dat Chrome alleen geeft voor het tabblad waarop je de extensie hebt geopend.',
  'about.fact.standards.title': 'Standaarden, geen lock-in',
  'about.fact.standards.body':
    'RFC 6238 TOTP en RFC 4226 HOTP, met otpauth://-import en -export. Je kunt op elk moment naar een andere app overstappen en alles meenemen.',
  'about.version': 'Versie {version}',
  'about.source': 'Broncode',
  'about.viewOnGithub': 'Bekijken op GitHub',
  'about.securityModel': 'Beveiligingsmodel',
  'about.securityModelDescription': 'Wat de extensie garandeert, ook tegenover de synchronisatieserver.',
  'about.readIt': 'Lezen',
  'about.rate': 'Keyrook Authenticator beoordelen',
  'about.rateWhere': 'In {store}. Het kost een paar seconden.',
  'about.report': 'Een probleem melden of iets voorstellen',
  'about.reportDescription':
    'Op GitHub, waar iedereen het kan lezen. Plak daar nooit een instelsleutel, een code of een back-up.',
  'about.openIssue': 'Issue openen',
  'about.how': 'Hoe het werkt',
  'about.logos.title': 'Logo’s van diensten',
  'about.logos.description':
    'Logo’s zitten in de extensie en worden nooit opgehaald. Een logo via het netwerk opvragen zou wie antwoordt vertellen voor welke diensten je tweestapsverificatie gebruikt.',
  'about.logos.body':
    '{count} diensten hebben een echt logo. Afbeeldingen van <simple>Simple Icons</simple> (CC0 1.0), LobeHub Icons, SVG Logos, CoreUI Brands, Arcticons en <fa>Font Awesome Free</fa> (pictogrammen, CC BY 4.0). Alle productnamen en logo’s zijn van hun eigenaren en dienen alleen om de dienst van een account te herkennen. Een dienst zonder logo in deze sets krijgt een tegel met een letter.',
  'about.shortcut.change': 'Wijzig hem via chrome://extensions/shortcuts.',
  // --- Instellingen: accounts ---------------------------------------------------
  'accounts.title': 'Accounts',
  'accounts.description':
    'Alles wat in deze kluis staat. Codes worden op dit apparaat gemaakt, nooit door een server.',
  'accounts.empty': 'Nog geen accounts. Voeg er een toe om te beginnen.',
  'accounts.digits': '{type} {digits} cijfers',
  'accounts.period': ' · {seconds} s',
  'accounts.counter': ' · teller {counter}',
  'accounts.steam': 'Steam Guard',
  'accounts.moveNamed': '{name} delen of verplaatsen',
  'accounts.edit': 'Bewerken',
  'common.delete': 'Verwijderen',
  'accounts.deleteNamed': '{name} verwijderen',
  'accounts.deleted.title': 'Onlangs verwijderd',
  'accounts.deleted.description':
    'Bewaard zodat andere apparaten van de verwijdering horen zodra synchronisatie aanstaat. Herstel wat je per ongeluk hebt verwijderd.',
  'accounts.deleted.on': 'Verwijderd op {date}',
  'accounts.restore': 'Herstellen',
  'common.close': 'Sluiten',
  'editor.title': 'Account bewerken',
  'editor.picture': 'Afbeelding',
  'editor.pictureOwn': 'Je eigen afbeelding, in plaats van het logo van de dienst.',
  'editor.pictureNone': 'Kies er een voor diensten zonder logo hier, of om twee accounts uit elkaar te houden.',
  'editor.replace': 'Vervangen',
  'editor.choose': 'Afbeelding kiezen…',
  'editor.websites': 'Websites',
  'editor.websitesHint': 'Gescheiden door komma’s. Hiermee wordt dit account op passende sites voorgesteld.',
  'editor.note': 'Notitie',
  'editor.group': 'Groep',
  'editor.ungrouped': 'Zonder groep',
  'editor.noGroups': 'Maak eerst een groep aan onder Accounts.',
  'editor.setupKey': 'Instelsleutel',
  'editor.setupKeyHint': 'Het geheim achter dit account. Wie het ziet, kan je codes maken.',
  'editor.hide': 'Verbergen',
  'editor.reveal': 'Tonen',
  'editor.revealWarning':
    'Toon dit alleen op een scherm dat niemand anders ziet. Deze link in een andere authenticator-app kopiëren is hoe je het account naar een telefoon verplaatst.',
  'editor.save': 'Wijzigingen opslaan',

  // --- Instellingen: importeren -------------------------------------------------
  'import.incomplete': {
    one: 'Deze schermafbeeldingen bevatten {seen} van de {total} codes in deze export van Google Authenticator, dus de accounts in de ontbrekende ene staan er niet bij. Kies alle schermafbeeldingen van de export samen om alles over te halen.',
    other: 'Deze schermafbeeldingen bevatten {seen} van de {total} codes in deze export van Google Authenticator, dus de accounts in de andere {count} staan er niet bij. Kies alle schermafbeeldingen van de export samen om alles over te halen.',
  },
  'import.oneOrScreenshots': 'Kies één back-upbestand, of een of meer schermafbeeldingen van QR-codes.',
  'import.noQrInThis': 'Geen QR-code gevonden in deze afbeelding.',
  'import.noAccountsInImages': 'Die afbeeldingen bevatten geen accounts.',
  'import.tooLarge': 'Dat bestand is te groot voor een back-up.',
  'import.noAccountsInFile': 'Dat bestand bevatte geen accounts.',
  'import.description':
    'Haal accounts binnen uit een back-upbestand, uit de export van een andere authenticator (gescand met je camera of gekozen als schermafbeeldingen) of door otpauth://-links te plakken.',
  'import.stopAndReview': 'Stoppen en {count} bekijken',
  'import.noNativeReader':
    'Chrome heeft op deze computer geen ingebouwde QR-lezer, dus een grote code, zoals een export van Google Authenticator, scant vaak niet met een camera. Lukt het niet, maak dan van elke code een schermafbeelding op je telefoon en kies ze allemaal met „Bestanden kiezen”.',
  'import.encrypted': 'Deze back-up is versleuteld. Voer het wachtwoord in waarmee hij is gemaakt.',
  'import.backupPassword': 'Back-upwachtwoord',
  'import.open': 'Back-up openen',
  'import.found': { one: '{count} nieuw account gevonden', other: '{count} nieuwe accounts gevonden' },
  'import.skipping': ', {count} overgeslagen die al in je kluis staan',
  'import.unreadable': ', en {count} konden niet worden gelezen',
  'import.foundEnd': '.',
  'import.showFailed': 'Mislukte regels tonen',
  'import.import': '{count} importeren',
  'import.scan': 'Scannen met je camera',
  'import.choose': 'Bestanden kiezen…',
  'import.paste': '…of plak otpauth://-links, één per regel',
  'import.read': 'Links lezen',

  // --- Alles naar een andere app verplaatsen ------------------------------------
  'dest.google.steps':
    'In Google Authenticator: menu → Accounts overzetten → Accounts importeren, en scan de codes op volgorde.',
  'dest.microsoft.steps':
    'Microsoft Authenticator kan niet uit een andere app importeren, dus de accounts gaan één voor één. Daarin: + → Ander account, scan, en dan hier Volgende.',
  'dest.apple.steps':
    'Wachtwoorden importeert codes alleen één voor één. In de app Wachtwoorden: Codes → +, scan, en dan hier Volgende.',
  'dest.authy.steps':
    'Authy kan niet uit een andere app importeren, dus de accounts gaan één voor één. In Authy: + → QR-code scannen, en dan hier Volgende.',
  'dest.1password.steps':
    '1Password voegt codes per login toe. Open of maak de login → Bewerken → voeg een eenmalig wachtwoord toe → scan, en dan hier Volgende. Op een computer kan het de code direct van dit scherm lezen.',
  'dest.bitwarden.steps':
    'Wachtwoordbeheerder: Gegevens importeren → bestandsindeling „Bitwarden (json)” → kies het bestand. App Bitwarden Authenticator: importeer uit Google Authenticator en scan de overdrachtscodes.',
  'dest.proton.steps':
    'Importeer in Proton Authenticator uit Google Authenticator en scan de overdrachtscodes, of importeer uit Aegis en kies het bestand.',
  'dest.ente.steps':
    'Importeer in Ente Auth codes uit Google Authenticator en scan de overdrachtscodes, of kies „Platte tekst” en het .txt-bestand.',
  'dest.aegis.steps': 'In Aegis: Importeren en exporteren → Importeren uit bestand → Aegis, en kies het bestand.',
  'dest.2fas.steps':
    'Importeer in 2FAS uit Google Authenticator en scan de overdrachtscodes, of importeer uit Aegis en kies het bestand.',
  'dest.other.steps':
    'Elke authenticator scant een instelcode, dus één voor één werkt altijd. Veel apps importeren ook de overdrachtscodes van Google Authenticator, of een bestand met otpauth://-links: zoek naar een importoptie.',
  'dest.other.name': 'Een andere app',

  // --- Instellingen: exporteren -------------------------------------------------
  'export.what': 'Wat exporteren',
  'export.all': { one: 'Het {count} account.', other: 'Alle {count} accounts.' },
  'export.someChosen': '{chosen} van {total} gekozen.',
  'export.choose': 'Kiezen…',
  'export.chipAll': 'Alle',
  'export.chipNone': 'Geen',
  'export.encrypted.description':
    'Een bestand, vergrendeld met een wachtwoord dat je hier kiest. Bewaar een kopie op een veilige plek: gaat dit apparaat stuk, dan krijg je met dit bestand je accounts terug.',
  'export.encrypted.hint': 'Minstens 8 tekens. Mag verschillen van je hoofdwachtwoord.',
  'export.encrypted.download': 'Versleutelde back-up downloaden ({count})',
  'export.move.title': 'Naar een andere app verplaatsen',
  'export.move.description':
    'Leesbare exports, om naar een andere authenticator over te stappen of op papier te bewaren. Anders dan een back-up is geen ervan versleuteld.',
  'export.move.danger':
    'Deze bevatten je 2FA-geheimen leesbaar. Wie de codes ziet of de bestanden opent, kan je codes maken zolang de accounts bestaan. Verwijder bestanden en vernietig papier zodra je klaar bent.',
  'export.move.understood': 'Ik begrijp dat deze niet versleuteld zijn.',
  'common.continue': 'Doorgaan',
  'export.move.which': 'Naar welke app stap je over?',
  'export.filesAndPaper': 'Bestanden en papier:',
  'export.aegis': 'Aegis .json',
  'export.bitwarden': 'Bitwarden .json',
  'export.text': 'otpauth .txt',
  'export.print': 'Blad afdrukken',
  'export.closesIn': {
    one: '{accounts}. Sluit weer over {count} minuut.',
    other: '{accounts}. Sluit weer over {count} minuten.',
  },
  'export.closesSoon': '{accounts}. Sluit binnenkort weer.',
  'export.accounts': { one: '{count} account', other: '{count} accounts' },
  'export.closeNow': 'Nu sluiten',
  'export.method.transfer': 'Overdrachtscodes tonen',
  'export.method.oneByOne': 'Eén voor één scannen',
  'export.method.aegis': 'Aegis-bestand downloaden',
  'export.method.bitwarden': 'Bitwarden-bestand downloaden',
  'export.method.text': 'Tekstbestand downloaden',
  'export.allAtOnce': 'Alles tegelijk',
  'export.oneAtATime': 'Eén voor één',
  'export.transfer.label': 'Overdrachtscodes voor {app}',
  'export.transfer.title': 'Overdrachtscodes van Google Authenticator',
  'export.moveTo': 'Naar {app} verplaatsen',
  'export.transfer.none': 'Geen van de gekozen accounts kan naar Google Authenticator.',
  'export.transfer.codeLabel': 'Overdrachtscode {index} van {total}',
  'export.previous': 'Vorige',
  'export.next': 'Volgende',
  'export.transfer.code': 'Code {index} van {total}',
  'export.transfer.oneHolds': {
    one: 'Eén code bevat {count} account.',
    other: 'Eén code bevat alle {count} accounts.',
  },
  'export.transfer.notIncluded': 'Niet inbegrepen; verplaats deze in plaats daarvan één voor één:',
  'export.oneByOne.label': 'Instelcodes voor {app}, één voor één',
  'export.oneByOne.title': 'Eén account tegelijk',
  'export.oneByOne.progress': 'Getoonde accounts',
  'export.oneByOne.position': 'Account {index} van {total}',
  'export.oneByOne.keys': '→ of spatie voor de volgende, Esc om te stoppen',
  'export.steamRefused': '{app} kan geen Steam Guard-codes maken en neemt dit account dus niet over.',
  'export.print.label': 'QR-codes om af te drukken of te scannen',
  'export.print.title': 'Keyrook Authenticator — instelcodes',
  'export.print.body':
    '{accounts}, {date}. Elke code stelt het account in in elke authenticator-app. Wie dit heeft, kan je codes maken: bewaar het achter slot en grendel.',
  'export.print.print': 'Afdrukken of opslaan als pdf',

  // --- Instellingen: beveiliging, bovenaan --------------------------------------
  'security.locking': 'Vergrendelen',
  'security.lockAfter': 'Vergrendelen na inactiviteit',
  'security.lockAfter.passphrase':
    'De ontsleutelingssleutel wordt uit het geheugen gewist. Je hoofdwachtwoord is weer nodig.',
  'security.lockAfter.device':
    'Geldt alleen met een hoofdwachtwoord: een kluis met apparaatsleutel heeft niets te ontgrendelen.',
  'security.autoLock': 'Vertraging voor automatisch vergrendelen',
  'security.minutes': { one: '{count} minuut', other: '{count} minuten' },
  'security.hour': '1 uur',
  'security.never': 'Nooit',
  'security.needsPassword': 'Vereist een hoofdwachtwoord',
  'security.blur': 'Codes vervagen tot je eroverheen beweegt',
  'security.blurDescription': 'Houdt codes van het scherm tijdens schermdelen.',
  'security.blurToggle': 'Codes vervagen',
  'security.autofill': 'Automatisch invullen',
  'security.autofillRow': 'Aanbieden om codes op webpagina’s in te vullen',
  'security.appearance': 'Weergave',
  'security.theme': 'Thema',
  'security.theme.system': 'Zoals systeem',
  'security.theme.light': 'Licht',
  'security.theme.dark': 'Donker',
  'security.sortBy': 'Accounts sorteren op',
  'security.sortOrder': 'Sortering',
  'security.sort.added': 'Volgorde van toevoegen',
  'security.sort.name': 'Naam',
  'security.language': 'Taal',
  'security.languageBrowser': 'Browsertaal ({language})',
  // --- Instellingen: hoe de kluis is beveiligd ----------------------------------
  'protect.msg.removedSignedIn':
    'Dit apparaat opent nu zonder wachtwoord. Het wachtwoord van je account is niet gewijzigd.',
  'protect.msg.removed': 'Hoofdwachtwoord verwijderd. Deze kluis ontgrendelt nu automatisch op dit apparaat.',
  'protect.msg.setSignedIn': 'Dit apparaat vergrendelt nu met het wachtwoord van je account.',
  'protect.msg.set': 'Hoofdwachtwoord ingesteld. Je wordt erom gevraagd zodra de kluis vergrendelt.',
  'protect.msg.changedSignedIn':
    'Wachtwoord gewijzigd, voor deze kluis en je account. Je andere apparaten vragen je om er opnieuw mee in te loggen.',
  'protect.msg.changed': 'Hoofdwachtwoord gewijzigd.',
  'protect.state.accountPassword': 'Vergrendelt met het wachtwoord van je account',
  'protect.state.master': 'Hoofdwachtwoord',
  'protect.state.device': 'Apparaatsleutel (geen wachtwoord)',
  'protect.lockWithAccount': 'Vergrendelen met het wachtwoord van je account',
  'protect.addMaster': 'Hoofdwachtwoord toevoegen',
  'protect.changePassword': 'Wachtwoord wijzigen',
  'protect.note.passphrase':
    'Dit is ook het wachtwoord van je synchronisatieaccount. Wijzig je het hier, dan wijzigt het daar ook, en je andere apparaten vragen je opnieuw in te loggen.',
  'protect.note.device':
    'Je synchronisatieaccount heeft een eigen wachtwoord, waar dit apparaat niet om vraagt. Je hebt het nodig op een nieuw apparaat, en om het account of de herstelsleutel te wijzigen.',
  'protect.removeWarning':
    'De kluis blijft versleuteld, maar ontgrendelt vanzelf zodra dit browserprofiel open is. Iedereen die deze computer gebruikt, kan dan je codes zien.',
  'protect.removeWarningSignedIn':
    ' Je account houdt zijn wachtwoord: op een nieuw apparaat heb je het nog steeds nodig.',
  'protect.currentPassword': 'Huidig wachtwoord',
  'protect.currentMaster': 'Huidig hoofdwachtwoord',
  'protect.accountPassword': 'Accountwachtwoord',
  'protect.accountPasswordHint':
    'Het wachtwoord waarmee je inlogt bij synchronisatie. Dit apparaat vraagt erom zodra het vergrendelt.',
  'protect.newPassword': 'Nieuw wachtwoord',
  'protect.hint12': 'Minstens 12 gemengde tekens, of vier à vijf woorden die niets met elkaar te maken hebben.',
  'protect.confirmNew': 'Nieuw wachtwoord bevestigen',
  'protect.removePassword': 'Wachtwoord verwijderen',
  'protect.lockWithIt': 'Daarmee vergrendelen',
  'protect.setPassword': 'Wachtwoord instellen',
  'danger.title': 'Deze kluis verwijderen',
  'danger.description':
    'Verwijdert alle accounts en de versleutelde kluis van dit apparaat. Dit is niet ongedaan te maken, en er is nergens een kopie.',
  'danger.open': 'Deze kluis verwijderen…',
  'danger.warning':
    'Zorg eerst dat je nog een andere toegang tot elk account hebt: een back-upbestand, herstelcodes, of dezelfde accounts op je telefoon.',
  'common.typeToConfirm': 'Typ {word} om te bevestigen',
  'danger.confirm': 'Alles verwijderen',

  // --- Instellingen: herstelsleutel ---------------------------------------------
  'kit.title': 'Herstelsleutel',
  'kit.provider':
    'Je account heeft geen wachtwoord. Een herstelsleutel is de weg terug als alle ingelogde apparaten verloren gaan: hij laat een nieuw apparaat in je account zonder dat een ander het hoeft goed te keuren. {provider} kan dat niet voor je doen.',
  'kit.signedIn':
    'Niemand kan je wachtwoord voor je herstellen, zelfs wij niet. Een herstelsleutel is de enige weg terug als je het vergeet: hij opent deze kluis, je andere apparaten en je account op een nieuw apparaat.',
  'kit.passphrase':
    'Niemand kan je hoofdwachtwoord herstellen, zelfs wij niet. Juist dat houdt anderen uit je kluis, en daarom is een herstelsleutel ook de enige weg terug als je het vergeet.',
  'kit.device':
    'Deze kluis ontgrendelt met een sleutel die je browser bewaart. Raakt die sleutel weg (gewiste browsegegevens, een nieuw profiel, een herinstallatie), dan kan alleen een herstelsleutel hem nog openen.',
  'kit.none': 'Nog geen herstelsleutel',
  'kit.vaultOnly': 'Opent deze kluis, maar niet je account',
  'kit.issued': 'Er is een herstelsleutel gemaakt',
  'kit.issueNew': 'Een nieuwe maken',
  'kit.create': 'Herstelsleutel maken',
  'kit.beforeSignIn':
    'Deze sleutel is gemaakt voordat je inlogde, dus je account heeft hem niet. Hij opent deze kluis hier nog wel, maar niet op een nieuw apparaat. Maak een nieuwe die beide dekt.',
  'kit.replaces':
    'Een nieuwe sleutel maakt de vorige ongeldig, dus een oud afgedrukt blad kun je weggooien zodra je het hebt vervangen.',
  'kit.replacesSignedIn':
    'Een nieuwe sleutel maakt de vorige ongeldig, hier en op je andere apparaten, dus een oud afgedrukt blad kun je weggooien zodra je het hebt vervangen.',
  'kit.withoutProvider':
    'Zonder sleutel betekent het verlies van alle apparaten die bij je account zijn ingelogd, dat alle accounts in deze kluis voorgoed weg zijn.',
  'kit.withoutPassword':
    'Zonder sleutel betekent je wachtwoord vergeten dat alle accounts in deze kluis voorgoed weg zijn.',
  'kit.withoutDevice':
    'Zonder sleutel betekent het verlies van de sleutel van deze browser dat alle accounts in deze kluis voorgoed weg zijn.',
  'kit.noSupport': 'Geen supportverzoek kan dat ongedaan maken.',
  'kit.removeProvider':
    'Zonder sleutel kan alleen een al ingelogd apparaat een nieuw in je account laten.',
  'kit.removePassword': 'Zonder sleutel blijft je wachtwoord de enige toegang.',
  'kit.removePasswordSignedIn':
    'Zonder sleutel blijft je wachtwoord de enige toegang: op dit apparaat, je andere apparaten en je account.',
  'kit.reauth':
    'Een herstelsleutel kan een apparaat in je account laten, dus {provider} vraagt je eerst nog één keer in te loggen.',
  'kit.passwordHint': 'Een herstelsleutel kan je account herstellen, dus voor het wijzigen ervan is je wachtwoord nodig.',
  'kit.removeConfirm': 'Herstelsleutel verwijderen',
  'kit.createConfirm': 'Sleutel maken',

  // --- Instellingen: account en synchronisatie ----------------------------------
  'account.title': 'Account',
  'facts.stored': 'Opgeslagen accounts',
  'facts.noLimit': 'Onbeperkt',
  'facts.encryption': 'Versleuteling',
  'facts.autofill': 'Invullen en QR-scannen',
  'facts.included': 'Inbegrepen',
  'facts.backup': 'Versleuteld back-upbestand',
  'facts.sync': 'Synchronisatie tussen apparaten',
  'facts.needsAccount': 'Vereist een account',
  'facts.notYet': 'Nog niet beschikbaar',
  'facts.withoutAccount': 'Zonder account, op dit apparaat',
  'facts.title': 'Wat een gratis lokale kluis je biedt',
  'facts.description':
    'Geen account, geen e-mail, geen server, en geen limieten op wat er voor beveiliging toe doet.',
  'account.localOnly': 'Alleen lokaal: niet ingelogd',
  'account.noServer':
    'Deze versie is gebouwd zonder synchronisatieserver, dus niets wat je hier toevoegt verlaat je computer.',
  'account.signedInWith': 'Ingelogd met {provider} · ',
  'account.lastSynced': 'Laatst gesynchroniseerd om {time}',
  'account.notSynced': 'Nog niet gesynchroniseerd',
  'account.every5': ' · synchroniseert elke 5 minuten',
  'account.syncNow': 'Nu synchroniseren',
  'account.signOut': 'Uitloggen',
  'account.noKitProvider':
    'Je account heeft geen herstelsleutel. Gaan alle ingelogde apparaten verloren, dan kan niets je accounts terughalen: wij niet en {provider} niet.',
  'account.noKit':
    'Je account heeft geen herstelsleutel. Vergeet je je wachtwoord en raak je dit apparaat kwijt, dan kan niets je accounts terughalen: wij niet en niemand anders.',
  'account.createUnderSecurity': 'Maak er een bij Beveiliging',
  'summary.sentReceived': '{sent} verzonden, {received} ontvangen',
  'summary.conflicts': ', voor {count} de versie van dit apparaat behouden',
  'summary.overLimit': ', {count} pasten niet (een account bevat er tot 10.000) en bleven op dit apparaat',
  'summary.end': '.',
  'summary.deleted': {
    one: ' {count} account is op een ander apparaat verwijderd; je kunt het herstellen onder Accounts.',
    other: ' {count} accounts zijn op een ander apparaat verwijderd; je kunt ze herstellen onder Accounts.',
  },
  'summary.rejected': {
    one: ' {count} record kon niet worden ontsleuteld en is genegeerd. Blijft dit gebeuren, dan klopt er iets niet met de opgeslagen kopie.',
    other: ' {count} records konden niet worden ontsleuteld en zijn genegeerd. Blijft dit gebeuren, dan klopt er iets niet met de opgeslagen kopie.',
  },
  'account.signOutNote':
    'Uitloggen haalt je codes van deze browser. Ze blijven in je Keyrook-account: log opnieuw in om ze terug te halen.',
  'accountPage.title': 'Je Keyrook-account',
  'accountPage.body': 'Het wachtwoord, de herstelsleutel, opnieuw beginnen en verwijderen staan op de accountpagina, voor alle Keyrook-apps tegelijk.',
  'accountPage.bodyNoRoot': 'Het wachtwoord en verwijderen staan op de accountpagina. De herstelsleutel maak je hier, onder Beveiliging, tot een andere Keyrook-app het account gebruikt.',
  'accountPage.bodyProvider': 'De herstelsleutel, opnieuw beginnen en verwijderen staan op de accountpagina, voor alle Keyrook-apps tegelijk.',
  'accountPage.bodyNoRootProvider': 'Verwijderen staat op de accountpagina. De herstelsleutel maak je hier, onder Beveiliging, tot een andere Keyrook-app het account gebruikt.',
  'sheetCheck.lead': 'Typ de herstelsleutel die je hebt bewaard één keer in, zodat deze app weet dat hij je codes kan terughalen. Hij wordt op dit apparaat gecontroleerd en nergens heen gestuurd.',
  'sheetCheck.submit': 'Controleren',
  'sheetCheck.lost': 'Kwijt, of nooit gehad? Maak een nieuwe op de accountpagina.',
  'accountPage.noSheetYet': 'Nog niets wijst erop dat je herstelsleutel Keyrook Authenticator beschermt. Zonder kan een vergeten wachtwoord je je codes kosten. Typ hem één keer in onder Beveiliging, of maak een nieuwe op de accountpagina.',
  'account.checkUnderSecurity': 'Controleren onder Beveiliging',
  'accountPage.open': 'Accountpagina openen',
  'accountPage.recoveryKey': 'De herstelsleutel van een aangemelde kluis is die van het Keyrook-account. Je maakt en wijzigt hem op de accountpagina.',
  'accountPage.sheetProtects': 'De herstelsleutel van het account beschermt Keyrook Authenticator',
  'accountPage.sheetUnknown': 'Nog niet bekend of hij Keyrook Authenticator beschermt',
  'secondStep.title': 'Nog één stap',
  'secondStep.lead': 'Je Keyrook-account vraagt om een tweede stap. Voer de 6-cijferige code in die je authenticator-app ervoor laat zien.',
  'secondStep.field': 'Code of herstelsleutel',
  'secondStep.hint': 'Die app kwijt? Voer in plaats daarvan de herstelsleutel van je account in.',
  'secondStep.passkey': 'Gebruik een toegangssleutel',
  'secondStep.where': 'Inloggen in twee stappen zet je aan en uit op account.keyrook.com.',
  'secondStep.ownerLead': 'Je account vraagt ook hiervoor om een tweede stap: de code uit je authenticator-app, of je herstelsleutel.',
  'secondStep.nextCode': 'Elke code werkt maar één keer. Heb je net met een code ingelogd, wacht dan tot je app de volgende laat zien.',
  'secondStepTip.title': 'Inloggen in twee stappen',
  'secondStepTip.suggest': 'Vraag ook om een code telkens als dit account op een ander apparaat inlogt. Zet het aan op account.keyrook.com en bewaar de code hier: open op die pagina Keyrook Authenticator en kies ‘{scan}’.',
  'secondStepTip.kept': 'De eigen inlogcode van dit account wordt hier bewaard, op elk apparaat dat erop is ingelogd.',
  'secondStepTip.warning': 'Raak je alle apparaten kwijt die hem bewaren, log dan in met je herstelsleutel in plaats van de code. Bewaar de herstelsleutel ergens anders.',
  'secondStepTip.open': 'Aanzetten',
  'signin.providerHasPassword': '{provider} heeft bevestigd dat jij het bent, en {email} heeft ook een wachtwoord. Voer het in om je codes hier te openen.',
  'provider.addOnPage': 'Wil je ook met Google of GitHub inloggen? Log dan op de accountpagina in met je wachtwoord en voeg het daar toe.',
  'startOver.title': 'Je Keyrook-account begint op {date} opnieuw',
  'startOver.lead': 'Iemand op „{device}” heeft dit op {date} aangevraagd, met de code die we je hebben gemaild: een nieuw wachtwoord en nieuwe sleutels, en je apps zouden leeg beginnen.',
  'startOver.ifYou': 'Was jij het, dan hoef je niets te doen. Zo niet, annuleer het dan nu en wijzig daarna het wachtwoord van je e-mail: wie het heeft aangevraagd, kan je e-mail lezen.',
  'startOver.cancel': 'Dat was ik niet — annuleren',
  'kept.title': 'Bewaard van vóór het opnieuw beginnen',
  'kept.body': 'Toen dit account opnieuw begon, is bewaard wat Keyrook Authenticator erin had, tot {date}. Haal het terug met het wachtwoord van toen, of met de herstelsleutel van toen.',
  'kept.password': 'Wachtwoord van toen',
  'kept.recoveryKey': 'Herstelsleutel van toen',
  'kept.usePassword': 'Gebruik het wachtwoord van toen',
  'kept.useRecoveryKey': 'Gebruik de herstelsleutel van toen',
  'kept.bring': 'Terughalen',
  'kept.done': 'Het staat weer in deze kluis en gaat naar je andere apparaten.',
  'error.keys.awaitingConfirmation': 'Een andere Keyrook-app heeft de sleutels van dit account vervangen, en die van Keyrook Authenticator is nog niet mee. Controleer ze op de accountpagina en meld je daarna opnieuw aan.',
  'password.changedBoth':
    'Wachtwoord gewijzigd, voor je account en deze kluis. Je andere apparaten vragen je om er opnieuw mee in te loggen.',
  'password.changedAccount':
    'Accountwachtwoord gewijzigd. Je andere apparaten vragen je om er opnieuw mee in te loggen.',
  'password.title': 'Wachtwoord',
  'password.row': 'Accountwachtwoord',
  'password.rowDescription':
    'Hiermee log je in op een nieuw apparaat. Niemand kan het voor je herstellen: bewaar je herstelsleutel goed.',
  'password.change': 'Wachtwoord wijzigen…',
  'password.formTitle': 'Het wachtwoord van je account wijzigen',
  'devices.title': 'Ingelogde apparaten',
  'devices.description':
    'Log een apparaat uit dat je niet meer gebruikt of niet meer hebt. Draait er een bijgewerkte Keyrook Authenticator op, dan haalt het de codes van dit account bij de volgende verbinding zelf weg en houdt het alleen wat het nooit heeft verstuurd. Tot die tijd, of als het nooit meer verbinding maakt, houdt het wat het had, achter hetzelfde wachtwoord.',
  'devices.descriptionProvider':
    'Log een apparaat uit dat je niet meer gebruikt of niet meer hebt. Draait er een bijgewerkte Keyrook Authenticator op, dan haalt het de codes van dit account bij de volgende verbinding zelf weg en houdt het alleen wat het nooit heeft verstuurd. Tot die tijd, of als het nooit meer verbinding maakt, houdt het wat het had, vergrendeld zoals de kluis op dat apparaat vergrendeld is.',
  'devices.this': 'Dit apparaat',
  'devices.when': 'Ingelogd op {created} · laatst actief {seen}',
  'removed.kept': 'Codes die hier zijn toegevoegd of gewijzigd en het account nog niet hadden bereikt, staan er nog.',
  'delete.row': 'Je account verwijderen',
  'delete.rowDescription':
    'Verwijdert elke versleutelde kopie op de server. Dit apparaat houdt zijn kluis precies zoals hij is; andere apparaten synchroniseren niet meer.',
  'delete.open': 'Account verwijderen…',
  'delete.warning':
    'Dit is niet ongedaan te maken. Staan je accounts daarna alleen nog op dit apparaat, houd het dan, of exporteer eerst een back-up.',
  'delete.reauth': '{provider} vraagt je nog één keer in te loggen voordat er iets wordt verwijderd.',
  'delete.confirm': 'Het account verwijderen',

  // --- Inloggen: de eerste kaart ------------------------------------------------
  'intro.benefit1': 'Dezelfde codes op elk apparaat waarop je inlogt.',
  'intro.benefit2': 'Een verloren of kapotte laptop is geen verloren kluis.',
  'intro.benefit3': 'Gratis en optioneel: zonder werkt alles op dit apparaat gewoon door.',
  'intro.title': 'Je kluis synchroniseren',
  'intro.subtitle':
    'Op dit apparaat versleuteld voordat het vertrekt. De server bewaart wat hij niet kan lezen, en wij ook niet.',
  'intro.signedOutProvider':
    'Dit apparaat is uitgelogd bij {email}: het is vanaf een ander apparaat verwijderd. Ga verder met {provider} om opnieuw in te loggen.',
  'intro.orEmail': 'of met e-mail',
  'intro.create': 'Account maken',
  'intro.signIn': 'Inloggen',
  'intro.source': 'Open source: bekijk hoe je codes worden versleuteld',

  // --- Inloggen: e-mailformulieren ----------------------------------------------
  'form.email': 'E-mailadres',
  'form.emailPlaceholder': 'jij@voorbeeld.nl',
  'create.checkEmail': 'Controleer je e-mail',
  'create.codeSent': 'We hebben een code van zes cijfers naar <b>{email}</b> gestuurd. Hij werkt één keer, 15 minuten lang.',
  'create.code': 'Code',
  'create.spam':
    'Niet in je inbox? Kijk in <b>Spam</b> voor een bericht van <b>Keyrook</b> en markeer het als <b>Geen spam</b>.',
  'create.submit': 'Account maken',
  'create.existing':
    'Heeft dit adres al een account, dan staat dat in de e-mail; log daar dan in.',
  'create.stillNothing': 'Nog steeds niets?',
  'create.resendIn': 'Nieuwe code sturen over {seconds} s',
  'create.resend': 'Nieuwe code sturen',
  'create.wrongAddress': '. Verkeerd adres?',
  'create.changeIt': 'Wijzigen',
  'create.title': 'Je account maken',
  'create.choosing': 'Dit wachtwoord heb je nodig op een nieuw apparaat. Dit apparaat blijft zonder openen.',
  'create.sharing': 'Je hoofdwachtwoord wordt ook het wachtwoord van je account: nog steeds maar één.',
  'create.password': 'Wachtwoord',
  'create.master': 'Hoofdwachtwoord',
  'create.next':
    'Daarna mailen we je een code om het adres te bevestigen, en bewaar je een herstelsleutel: de enige weg terug als je het wachtwoord vergeet.',
  'create.agree': 'Door een account te maken ga je akkoord met het <link>privacybeleid</link>.',
  'create.haveAccount': 'Heb je al een account?',
  'signin.subtitle': 'Codes die al op dit apparaat staan, worden aan je account toegevoegd.',
  'signin.signedOut':
    'Dit apparaat is uitgelogd bij {email}: het wachtwoord is gewijzigd of het apparaat is vanaf een ander verwijderd. Log opnieuw in om te blijven synchroniseren.',
  'signin.forgot': 'Wachtwoord vergeten?',
  'signin.locksWithAccount': 'Dit apparaat vergrendelt voortaan met het wachtwoord van je account.',
  'signin.keepsOpening': 'Dit apparaat blijft zonder wachtwoord openen.',
  'signin.newHere': 'Nieuw hier?',
  'recoverAccount.title': 'Je account herstellen',
  'recoverAccount.subtitle':
    'Gebruik de herstelsleutel die je bewaarde toen je het maakte, en kies daarna een nieuw wachtwoord.',
  'recoverAccount.keyHint': '32 tekens van je afgedrukte blad. Spaties en streepjes maken niet uit.',
  'recoverAccount.submit': 'Herstellen en inloggen',
  'recoverAccount.elsewhere': 'Gebruikt ook een andere Keyrook-app dit account, dan stel je het wachtwoord opnieuw in op de accountpagina.',
  'recoverAccount.note':
    'Elk apparaat van het account wordt uitgelogd en gevraagd om het nieuwe wachtwoord. Je herstelsleutel blijft werken.',

  // --- Inloggen: daarna ---------------------------------------------------------
  'ready.empty': 'Je account is klaar.',
  'ready.all': {
    one: 'Je account is klaar, en het account op dit apparaat staat er als back-up in.',
    other: 'Je account is klaar, en alle {count} accounts op dit apparaat staan er als back-up in.',
  },
  'ready.some':
    'Je account is klaar. {done} van {total} accounts staan er tot nu toe in; de rest volgt bij de volgende synchronisatie.',
  'fresh.title': 'Bewaar je herstelsleutel',
  'fresh.provider':
    'Gaan alle apparaten die bij je account zijn ingelogd verloren, dan is deze sleutel de enige weg terug: {provider} kan je kluis niet herstellen, en wij ook niet.',
  'fresh.password':
    'Vergeet je je wachtwoord, dan is deze sleutel de enige weg terug: niemand kan het voor je herstellen, zelfs wij niet.',
  'welcome.fromAccount': '{count} uit je account',
  'welcome.fromDevice': '{count} toegevoegd vanaf dit apparaat',
  'welcome.inSync': 'Al gesynchroniseerd.',
  'welcome.nothing': 'Hier staat nog niets.',
  'welcome.failed': 'Ingelogd, maar de eerste synchronisatie is niet afgerond',
  'welcome.back': 'Je bent er weer in',
  'welcome.signedIn': 'Je bent ingelogd',
  'welcome.nothingLost':
    'Er is niets verloren: je codes komen met de volgende synchronisatie. Probeer het nu opnieuw, of het gebeurt binnen vijf minuten vanzelf.',
  'welcome.onDevice': { one: 'account op dit apparaat', other: 'accounts op dit apparaat' },
  'welcome.uploading': {
    one: ' · {count} wordt nog geüpload en volgt bij de volgende synchronisatie',
    other: ' · {count} worden nog geüpload en volgen bij de volgende synchronisatie',
  },
  'welcome.othersSignedOut': 'Alle andere apparaten zijn uitgelogd en vragen om het nieuwe wachtwoord.',
  'welcome.tryAgain': 'Opnieuw proberen',
  'welcome.seeAccounts': 'Je accounts bekijken',
  'welcome.toolbar': 'Ze zijn ook maar één klik weg: het pictogram van Keyrook Authenticator in je werkbalk.',

  // --- Inloggen met Google of GitHub --------------------------------------------
  'provider.continue': 'Doorgaan met {provider}',
  'provider.finishInWindow': 'Rond het af in het geopende {provider}-venster.',
  'provider.confirmed': '{provider} heeft <b>{email}</b> bevestigd. Nog geen account gebruikt dit adres.',
  'provider.point1':
    'Geen wachtwoord. Op een nieuw apparaat ga je verder met {provider}, en een al ingelogd apparaat laat het binnen nadat je hebt gecontroleerd dat beide dezelfde code tonen.',
  'provider.point2':
    '{provider} bewijst dat jij het bent. Het ziet je codes nooit: die worden hier versleuteld, met een sleutel die op je apparaten blijft.',
  'provider.point3':
    'Daarna bewaar je een herstelsleutel: de weg terug als alle apparaten die bij het account zijn ingelogd verloren gaan. {provider} kan je kluis niet herstellen.',
  'provider.notRight': 'Niet het juiste account?',
  'provider.startAgain': 'Opnieuw beginnen',
  'passkey.continue': 'Doorgaan met een toegangssleutel',
  'passkey.where':
    'Een die je hebt toegevoegd op de <link>accountpagina</link>, onder Toegangssleutels. De eerste keer vraagt Chrome of Keyrook Authenticator hem mag gebruiken.',
  'pairing.codeLabel': 'Code {code}',
  'join.title': 'Deze browser binnenlaten',
  'join.subtitle':
    '<b>{email}</b> heeft al een account. Keur deze browser goed vanaf een apparaat dat daar al is ingelogd.',
  'join.masterPassword': 'Hoofdwachtwoord van deze kluis',
  'join.masterHint': 'Het blijft deze kluis hier vergrendelen; het account zelf heeft geen wachtwoord.',
  'join.ask': 'Vragen om te koppelen',
  'join.step1':
    'Open Keyrook Authenticator op een apparaat dat al is ingelogd. Het verzoek verschijnt daar: boven de codes en in de instellingen onder Synchronisatie.',
  'join.step2': 'Controleer of daar dezelfde code staat als op deze pagina, en keur het dan goed.',
  'join.askAgain': 'Opnieuw vragen',
  'join.compare': 'Het andere apparaat toont ook een code. Keur daar alleen goed als het precies deze is.',
  'join.waiting': 'Wachten op een ander apparaat…',
  'join.noOther': 'Geen ander apparaat meer?',
  'join.useKey': 'Gebruik je herstelsleutel',
  'join.wrongAccount': 'Met het verkeerde {provider}-account ingelogd?',
  'joinKey.subtitle':
    'De sleutel die je bewaarde toen het account werd gemaakt. Hij laat deze browser binnen zonder een ander apparaat.',
  'joinKey.submit': 'Aan het account koppelen',
  'approve.approved': 'Goedgekeurd. Het andere apparaat opent je kluis zo.',
  'approve.mismatch':
    'Geweigerd. Was je net niet zelf aan het inloggen, dan kan iemand anders inloggen op je {provider}-account: wijzig het wachtwoord daarvan en controleer de beveiligingsinstellingen.',
  'approve.declined': 'Geweigerd. Er is niets verzonden.',
  'approve.title': 'Apparaten die willen koppelen',
  'approve.description':
    'Elk verzoek komt van iemand die net heeft ingelogd met je {provider}-account. Keur alleen een apparaat goed waarop je nu zelf aan het inloggen bent.',
  'approve.descriptionAny':
    'Elk verzoek komt van iemand die net heeft ingelogd met je Google- of GitHub-account. Keur alleen een apparaat goed waarop je nu zelf aan het inloggen bent.',
  'approve.mismatchAny':
    'Geweigerd. Was je net niet zelf aan het inloggen, dan kan iemand anders inloggen op je Google- of GitHub-account: wijzig het wachtwoord daarvan en controleer de beveiligingsinstellingen.',
  'approve.askedAt': 'Gevraagd om {time}',
  'approve.review': 'Bekijken',
  'approve.deny': 'Weigeren',
  'approve.question':
    'Toont het apparaat dat het vraagt precies deze code? Zo niet, dan probeert iemand anders binnen te komen.',
  'approve.matches': 'Komt overeen: binnenlaten',
  'approve.doesNotMatch': 'Komt niet overeen',

  // --- Fouten, vervolg ----------------------------------------------------------
  'error.vaultNewer':
    'Deze kluis is gemaakt met een nieuwere versie van Keyrook Authenticator. Werk de extensie bij voordat je hem opent.',
  'error.uriUnsupported': 'Die link gebruikt een instelling die deze app niet kan lezen ({value}).',
  'editor.websitesPlaceholder': 'github.com, gist.github.com',
  'error.noWorker': 'De extensie reageerde niet. Sluit dit en open het opnieuw.',
  'nav.sync': 'Synchronisatie',
  'nav.general': 'Algemeen',
  'nav.needsAttention': 'Vraagt aandacht',
  'sync.description':
    'Dezelfde codes op elk apparaat waarop je inlogt, hier versleuteld voordat ze vertrekken.',
  'backup.description':
    'Bewaar een versleutelde kopie, haal accounts binnen of verhuis ze naar een andere app.',
  'backup.choice.backup.title': 'Back-up maken',
  'backup.choice.backup.body': 'Een versleuteld bestand, beveiligd met een wachtwoord dat je zelf kiest.',
  'backup.choice.import.title': 'Importeren',
  'backup.choice.import.body': 'Uit een back-up, de export van een andere app of otpauth://-links.',
  'backup.choice.move.body':
    'Overdrachtscodes, een pagina om te printen of een leesbaar bestand. Niet versleuteld.',
  'security.description': 'Hoe deze kluis opent, en hoe je er weer in komt als deze browser verloren gaat.',
  'security.deviceKeyHint': 'Niets te typen. Houdt geen malware tegen die als jou op deze computer draait.',
  'security.passwordHint': 'Gevraagd zodra de kluis vergrendeld is.',
  'general.description': 'Hoe de extensie eruitziet en werkt, en waar ze vandaan komt.',
  'general.inBrowser': 'In de browser',
  'general.autofillHint':
    'Open je de pop-up op een inlogpagina, dan wordt de juiste code aangeboden. Alleen dat tabblad wordt gelezen.',
  'vault.signInToSync': 'Inloggen om te synchroniseren',
  'vault.empty.signIn':
    'Gebruik je Keyrook Authenticator al op een ander apparaat? <link>Log in</link> om je codes hierheen te halen.',
  'setup.haveAccount': 'Gebruik je Keyrook Authenticator al? <link>Log in</link> om je codes hierheen te halen.',
  'popup.signInOpensTab': 'Opent in een nieuw tabblad en eindigt in de instellingen.',
  'error.backupWrongPassword': 'Met dat wachtwoord gaat dit bestand niet open.',
  'error.foreign.steamFolder': 'Kies alle bestanden in de map maFiles van Steam Desktop Authenticator tegelijk: manifest.json en de .maFile-bestanden ernaast.',
  'error.foreign.locked':
    'Deze export is vergrendeld met een wachtwoord dat Keyrook Authenticator niet kan openen. Exporteer opnieuw zonder wachtwoord.',
  'import.lockedFrom':
    '{app} heeft deze export met een wachtwoord vergrendeld. Vul het wachtwoord in dat je daar hebt gekozen.',
  'import.fromApps':
    'Exports uit Aegis, 2FAS, Bitwarden, Proton, Ente Auth, andOTP, FreeOTP+, Steam Desktop Authenticator, de Authenticator-extensie en Google Authenticator werken ook — en een CSV uit Apple Wachtwoorden, 1Password of een andere wachtwoordmanager.',
  'shortcut.open': 'Keyrook Authenticator openen',
  'shortcut.fill': 'Code voor deze pagina invullen',
  'shortcut.fillHint': 'Vult alleen in als precies één account bij de site hoort; anders opent de lijst.',
  'shortcut.notSet': 'Niet ingesteld',
  'vault.shortcutHint': '{keys} vult hem in zonder dit te openen.',
  'import.csvWarning':
    'Dit bestand bevat je wachtwoorden onversleuteld. Alleen de tweestapssleutels zijn gelezen en verder wordt niets bewaard — verwijder het bestand als je klaar bent.',
  'import.noKeysInCsv': 'Dat bestand bevat geen tweestapssleutels, alleen wachtwoorden.',
  'crash.title': 'Er ging iets mis',
  'crash.body':
    'Dit scherm liep tegen een probleem aan en is gestopt. Je opgeslagen accounts zijn niet geraakt. Opnieuw laden lost het meestal op.',
  'crash.reload': 'Opnieuw laden',
  'setup.device.description.phone':
    'Je geheimen worden versleuteld met een sleutel die deze telefoon voor je bewaart. Niets onthouden, niets intypen.',
  'setup.device.footnote.phone':
    'Beschermt tegen een kopie van de bestanden van de app. Niet tegen iemand die deze telefoon kan ontgrendelen.',
  'setup.password.footnote.phone':
    'De sterkste optie: eenmaal vergrendeld kan niets op deze telefoon de kluis openen zonder het wachtwoord.',
  'unrecoverable.why.phone':
    'De versleutelingssleutel werd door deze telefoon bewaard en is weg, meestal omdat de gegevens van de app zijn gewist, de app opnieuw is geïnstalleerd of de kluis uit de back-up van een andere telefoon komt. Zonder die sleutel kan niemand de opgeslagen accounts ontsleutelen, wij ook niet.',
  'vault.empty.body.phone':
    'Toont een site een QR-code om tweestapsverificatie in te stellen, scan hem dan met de camera van deze telefoon.',
  'add.camera.description.phone':
    'Voor een code op een ander scherm, ook een export van Google Authenticator.',
  'add.fromGoogle.phone':
    'Kom je van Google Authenticator op een andere telefoon? Exporteer daar je accounts en scan de code die het toont met de camera van deze telefoon. Toont het er meerdere, doe ze dan één voor één.',
  'camera.noCamera.phone': 'Deze telefoon geeft de app geen camera.',
  'camera.blocked.phone':
    'De app mag de camera niet gebruiken. Sta het toe in de instellingen van de telefoon, of voeg een account op een andere manier toe.',
  'camera.none.phone': 'Geen camera gevonden op deze telefoon.',
  'security.languageBrowser.phone': 'Taal van de telefoon ({language})',
  'protect.removeWarning.phone':
    'De kluis blijft versleuteld, maar ontgrendelt vanzelf zodra de app opent. Iedereen die deze telefoon kan ontgrendelen, kan dan je codes zien.',
  'kit.device.phone':
    'Deze kluis ontgrendelt met een sleutel die je telefoon bewaart. Raakt die sleutel weg (gewiste app-gegevens, een herinstallatie, een nieuwe telefoon), dan kan alleen een herstelsleutel hem nog openen.',
  'kit.withoutDevice.phone':
    'Zonder sleutel betekent het verlies van de sleutel van deze telefoon dat alle accounts in deze kluis voorgoed weg zijn.',
  'security.description.phone':
    'Hoe deze kluis opent, en hoe je er weer in komt als deze telefoon verloren gaat.',
  'security.deviceKeyHint.phone':
    'Niets te typen. Iedereen die deze telefoon kan ontgrendelen, kan hem openen.',
  'general.description.phone': 'Hoe de app eruitziet en werkt, en waar hij vandaan komt.',
  'about.securityModelDescription.phone': 'Wat de app garandeert, en wat niet.',
  'about.logos.description.phone':
    'Logo’s zitten in de app en worden nooit opgehaald. Een logo via het netwerk opvragen zou wie antwoordt vertellen voor welke diensten je tweestapsverificatie gebruikt.',
  'about.fact.access.title.phone': 'Alleen de camera, en alleen om te scannen',
  'about.fact.access.body.phone':
    'De app vraagt geen enkele toestemming behalve de camera, en alleen als je ervoor kiest een code te scannen. Wat de camera ziet, verlaat de telefoon nooit.',
  'about.fact.keys.body.phone':
    'Je accounts zijn versleuteld met een gegevenssleutel die zelf weer is ingepakt. Met een hoofdwachtwoord komt de inpaksleutel uit PBKDF2 met 600.000 rondes en bestaat hij alleen in het geheugen zolang de kluis ontgrendeld is. Zonder is het een sleutel verzegeld door de eigen sleutelopslag van de telefoon, dus een kopie van de bestanden van de app kan de kluis niet openen.',
  'rate.store.play': 'Google Play',
  'add.noNativeReader.phone':
    'Een grote code, zoals een export van Google Authenticator, scant hier vaak niet met de camera. Lukt het niet, maak er dan een foto van met de camera-app van je telefoon en gebruik „QR-afbeelding uploaden”.',
  'import.noNativeReader.phone':
    'Een grote code, zoals een export van Google Authenticator, scant hier vaak niet met de camera. Lukt het niet, maak dan van elke code een foto met de camera-app van je telefoon en kies ze allemaal met „Bestanden kiezen”.',
  'error.signOutUnsynced.phone':
    'Sommige wijzigingen op deze telefoon zijn nog niet in je account aangekomen, en door nu uit te loggen raak je ze kwijt. Maak verbinding met internet en probeer het opnieuw.',
  'account.signOutNote.phone':
    'Uitloggen haalt je codes van deze telefoon. Ze blijven in je Keyrook-account: log opnieuw in om ze terug te halen.',
  'secondStepTip.suggest.phone':
    'Vraag ook om een code telkens als dit account op een ander apparaat inlogt. Zet het aan op account.keyrook.com en bewaar de code hier: voeg in deze app een account toe en scan de QR-code die die pagina toont.',
  'intro.benefit2.phone': 'Een verloren of kapotte telefoon is geen verloren kluis.',
  'provider.finishInWindow.phone': 'Rond het af op de {provider}-pagina die in je browser is geopend.',
  'join.title.phone': 'Deze telefoon binnenlaten',
  'join.subtitle.phone':
    '<b>{email}</b> heeft al een account. Keur deze telefoon goed vanaf een apparaat dat daar al is ingelogd.',
  'joinKey.subtitle.phone':
    'De sleutel die je bewaarde toen het account werd gemaakt. Hij laat deze telefoon binnen zonder een ander apparaat.',
  'facts.autofill.phone': 'QR-scannen',
};
