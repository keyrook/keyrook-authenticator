// Italiano. Del «tu», come la maggior parte delle app.
import type { Dictionary } from './en.js';

export const it: Dictionary = {
  // --- Errori -------------------------------------------------------------------
  'error.vaultLocked': 'La cassaforte è bloccata.',
  'error.vaultExists': 'Su questo dispositivo c’è già una cassaforte.',
  'error.noVault': 'Su questo dispositivo non c’è ancora una cassaforte.',
  'error.vaultCorrupt': 'La cassaforte salvata è danneggiata o è stata scritta da un’altra app.',
  'error.wrongMasterPassword': 'Password principale errata.',
  'error.enterCurrentMasterPassword': 'Inserisci la password principale attuale.',
  'error.currentPasswordWrong': 'La password attuale non è corretta.',
  'error.masterPasswordShort': 'La password principale deve avere almeno 8 caratteri.',
  'error.notPassphraseVault': 'Questa cassaforte non è protetta da una password principale.',
  'error.recoveryKeyMalformed': 'Non sembra una chiave di recupero.',
  'error.recoveryKeyNoMatch': 'Questa chiave di recupero non corrisponde.',
  'error.recoverOnAccountPage': 'La chiave di recupero è giusta, ma la password di questo account ora si reimposta nella pagina dell’account, per tutte le app Keyrook insieme.',
  'error.kitOnAccountPage': 'La chiave di recupero di questo account ora si crea nella pagina dell’account, per tutte le app Keyrook insieme.',
  'error.restoreEmpty': 'Di questo account non resta nulla da recuperare: è stato eliminato su un altro dispositivo prima che questo lo avesse mai.',
  'error.recoveryKeyWrong': 'Questa chiave di recupero non corrisponde a questo account.',
  'error.noRecoveryKit': 'Questa cassaforte non ha una chiave di recupero.',
  'error.syncUnavailable': 'La sincronizzazione non è disponibile in questa versione.',
  'error.notSignedIn': 'Accesso non effettuato.',
  'error.alreadySignedIn': 'Accesso già effettuato.',
  'error.signedOutElsewhere':
    'Questo dispositivo è stato disconnesso dalla sincronizzazione: la password è stata cambiata o il dispositivo è stato rimosso da un altro. Accedi di nuovo.',
  'error.signOutUnsynced':
    'Alcune modifiche fatte in questo browser non sono ancora arrivate al tuo account e uscire ora le farebbe perdere. Connettiti a Internet e riprova.',
  'error.enterAccountPassword': 'Inserisci la password del tuo account.',
  'error.accountPasswordWrong': 'Non è la password del tuo account.',
  'error.accountPasswordWeak':
    'Questa password è troppo debole per proteggere una copia della tua cassaforte che lascia questo dispositivo. Usa almeno 12 caratteri tra maiuscole, minuscole, numeri e simboli, oppure quattro o cinque parole senza legami tra loro.',
  'error.lockOnlyWithAccountPassword':
    'Non è la password del tuo account. Finché hai effettuato l’accesso, è l’unica password con cui questa cassaforte può bloccarsi.',
  'error.signupWrongMasterPassword':
    'Non è la password principale di questa cassaforte. Diventa anche la password del tuo account.',
  'error.masterPasswordTooWeakForAccount':
    'La tua password principale è troppo debole per proteggere una copia della cassaforte che lascia questo dispositivo. Cambiala prima in Sicurezza: almeno 12 caratteri misti, oppure quattro o cinque parole senza legami tra loro.',
  'error.passwordsDiverged':
    'La password del tuo account è diversa da quella di questa cassaforte. Esci dalla sincronizzazione e accedi di nuovo per allinearle, poi riprova.',
  'error.kitRace':
    'Un altro tuo dispositivo ha appena cambiato la chiave di recupero. Qui non è cambiato nulla: riprova.',
  'error.providerHasNoPassword': 'Questo account accede con Google o GitHub e non ha password.',
  'error.noActiveTab': 'Nessuna scheda attiva.',
  'error.autofillNotHere': 'La compilazione automatica funziona solo sulle normali pagine web.',
  'error.autofillBlocked':
    'Chrome non ha permesso all’estensione di leggere questa pagina. Apri il popup dalla pagina che vuoi compilare.',
  'error.signinCancelled': 'L’accesso è stato annullato.',
  'error.signinStateMismatch': 'Questo accesso non è tornato come era partito. Riprova.',
  'error.signinUnfinished': 'L’accesso non è stato completato. Riprova.',
  'error.signupPendingExpired': 'Questo accesso è scaduto. Ricomincia.',
  'error.signInFirst': 'Prima accedi.',
  'error.joinNeedsMasterPassword': 'Inserisci la password principale di questa cassaforte per completare l’ingresso.',
  'error.notThisVaultsPassword': 'Non è la password principale di questa cassaforte.',
  'error.nothingWaiting': 'Non c’è nulla in attesa di approvazione.',
  'error.pairingExpired': 'La richiesta è terminata: è stata rifiutata o sono passati dieci minuti. Chiedi di nuovo.',
  'error.pairingWrongKey':
    'La chiave arrivata non appartiene a questo account. Non è cambiato nulla. Riprova dall’altro browser.',
  'error.pairingForged': 'Questa approvazione non viene dal browser di cui hai verificato il codice.',
  'error.pairingForgedAsk':
    'Questa approvazione non viene dal browser di cui è stato verificato il codice. Non è cambiato nulla. Chiedi di nuovo.',
  'error.pairingEnded': 'Questa richiesta è terminata.',
  'error.approveAgain': 'Ricomincia l’approvazione di questa richiesta.',
  'error.backupPasswordShort': 'La password del backup deve avere almeno 8 caratteri.',
  'error.backupNotOurs': 'Questo file non è un backup di Keyrook Authenticator.',
  'error.backupNewer': 'Questo backup è stato creato da una versione più recente dell’app.',
  'error.backupUnknownCipher': 'Questo backup usa un metodo di cifratura che questa versione non conosce.',
  'error.backupTooCostly': 'Aprire questo backup richiederebbe un lavoro sproporzionato. Viene ignorato.',
  'error.backupMalformed': 'Questo backup non è valido.',
  'error.uriNotOtpauth': 'Non è un link otpauth://.',
  'error.uriMalformed': 'Questo link otpauth:// non è valido.',
  'error.uriNoSecret': 'Questo link non contiene un segreto.',
  'error.uriBadSecret': 'Il segreto in questo link non è un base32 valido.',
  'error.uriNoCounter': 'Un link HOTP deve includere un contatore.',
  'error.secretEmpty': 'La chiave di configurazione è vuota.',
  'error.migrationNotOurs': 'Non è un’esportazione di Google Authenticator.',
  'error.migrationMalformed': 'Questa esportazione di Google Authenticator è danneggiata o incompleta.',
  'error.offline': 'Impossibile raggiungere il server di sincronizzazione. Controlla la connessione e riprova.',
  'error.provider.refusedBy': '{provider} ha rifiutato l’accesso.',
  'error.provider.unreachable': '{provider} non è raggiungibile. Riprova tra un momento.',
  'error.provider.refused': 'L’accesso è stato rifiutato. Riprova.',
  'error.provider.githubRefused': 'GitHub ha rifiutato l’accesso.',
  'error.provider.noReauth': 'Google non ti ha chiesto di accedere di nuovo.',
  'error.provider.unverifiedEmail': 'Google non ha verificato questo indirizzo email.',
  'error.provider.githubNoEmail': 'Il tuo account GitHub non ha un indirizzo email principale verificato.',
  'error.server.badRequest': 'Il server di sincronizzazione non è riuscito a leggere la richiesta.',
  'error.server.session': 'Questa sessione non è più valida.',
  'error.server.accountGone': 'Questo account non esiste più.',
  'error.server.signupExpired': 'Questa registrazione è scaduta. Accedi di nuovo.',
  'error.server.signinExpired': 'Questo accesso è scaduto. Riprova.',
  'error.server.tooManyCodes': 'Troppi codici errati. Chiedine uno nuovo.',
  'error.server.tooManyPairings':
    'Troppi browser sono in attesa di entrare in questo account. Riprova tra qualche minuto.',
  'error.server.wrongKey': 'Questo dispositivo non ha la chiave dell’account.',
  'error.server.providerAccount': 'Questo account accede con Google o GitHub, non con una password.',
  'error.server.mailFailed': 'Impossibile inviare l’email. Riprova tra un minuto.',
  'error.server.pairingTaken': 'Questa richiesta è terminata, oppure un altro browser la sta approvando.',
  'error.server.passwordWrong': 'Questa password non è corretta.',
  'error.server.badCredentials': 'Email o password errate.',
  'error.server.badCode':
    'Questo codice non è corretto o è scaduto. Controlla l’email o chiedine uno nuovo.',
  'error.server.reauthMismatch':
    'Per confermare, accedi di nuovo con l’account che usi per Keyrook.',
  'error.server.kitRace': 'Un altro dispositivo ha appena cambiato la chiave di recupero.',
  'error.server.unavailable': 'Il server di sincronizzazione non ha potuto farlo adesso. Riprova tra un momento.',
  'error.server.lockedOut': {
    one: 'Troppi tentativi falliti. Riprova tra {count} secondo.',
    other: 'Troppi tentativi falliti. Riprova tra {count} secondi.',
  },
  'error.server.rateLimited': {
    one: 'Troppi tentativi. Riprova tra {count} secondo.',
    other: 'Troppi tentativi. Riprova tra {count} secondi.',
  },
  'error.server.emailTaken': '{email} ha già un account Keyrook.',
  'error.server.recordTooLarge': 'Uno dei tuoi account è troppo grande per essere sincronizzato ({id}).',
  'error.server.codeTooSoon': 'Un codice è appena stato inviato. Aspetta un po’ prima di chiederne un altro.',
  'error.server.keyRace': 'Un altro dispositivo ha appena configurato la chiave. Riprova.',
  'error.server.archiveNeedsOldKeys': 'Solo la vecchia password o la vecchia chiave di recupero possono eliminare ciò che è stato conservato prima della scadenza.',
  'error.server.signupNeedsKeys': 'Non è stato possibile creare questo account. Aggiorna Keyrook Authenticator e riprova.',
  'error.server.accountIdTaken': 'Quell’ID account è già in uso. Registrati di nuovo.',
  'error.server.archiveWrongKey': 'Questo non apre ciò che è stato conservato.',
  'error.server.flowExpired': 'È scaduto. Chiedi un nuovo codice e ricomincia.',
  'error.server.archiveGone': 'Non è più conservato.',
  'error.server.notProductKey': 'Quella chiave non appartiene a Keyrook Authenticator.',
  'error.server.foreignRecord': 'Quel record appartiene a un altro prodotto Keyrook.',
  'error.server.rootChanged': 'Le chiavi dell’account sono cambiate su un altro dispositivo. Riprova.',
  'error.server.rootExists': 'Questo account ha già una chiave radice.',
  'error.server.noRoot': 'Questo account non ha ancora una chiave radice.',
  'error.server.startOverLimit': 'Questo account è ripartito da zero troppe volte di recente. Riprova dopo il {date}.',
  'error.server.wrongRootKey': 'Questo dispositivo non ha la chiave radice dell’account.',
  'error.server.sessionReplayed': 'Questo dispositivo è stato disconnesso perché la sua sessione è stata usata altrove. Accedi di nuovo.',
  'error.server.noProductKey': 'Keyrook Authenticator non ha ancora una chiave su questo account.',
  'error.server.productKeyChanged': 'La chiave di Keyrook Authenticator su questo account è cambiata. Riprova.',
  'error.server.productKeyReplaced': 'La chiave di Keyrook Authenticator è stata sostituita su un altro dispositivo. Accedi di nuovo.',
  'error.server.updateRequired': 'Aggiorna Keyrook Authenticator per continuare a usare questo account.',
  'error.server.olderBuildsRetired': 'Le versioni precedenti di Keyrook Authenticator non possono più usare questo account.',
  'error.server.emailTakenOtherProvider': '{email} ha già un account Keyrook che accede con un altro provider.',
  'error.server.emailTakenPassword': '{email} ha già un account Keyrook con password. Accedi invece con email e password.',
  'error.server.signInWithPassword': 'Quell’account accede con una password. Accedi qui con email e password.',
  'error.server.pageCodeWrong': 'Quel codice non è quello mostrato dalla pagina dell’account. Controllalo, o ricomincia da lì.',
  'error.server.pageRequestEnded': 'Quella richiesta è scaduta o terminata. Ricomincia dalla pagina dell’account.',
  'error.server.noKeyrookAccount': 'Questo account Google o GitHub non ha un account Keyrook. Creane uno in Keyrook Authenticator o Passhold.',
  'error.account.productKeyMismatch': 'La chiave di {product} non si apre con la chiave radice di questo account. Non è stato cambiato nulla.',
  'error.account.confirmWithPassword': 'Questo account ha una password. Conferma con quella.',
  'error.account.chooseNewPassword': 'Scegli una nuova password per questo account.',
  'error.account.archiveNotOpened': 'Niente di ciò che è stato conservato per Keyrook Authenticator si apre con questo.',
  'error.account.keyNotConfirmed': 'La chiave dell’account non è quella che hai confermato. Controlla di nuovo.',
  'error.account.serverMismatch': 'La risposta del server di sincronizzazione non corrisponde a questo account. Non è stato aperto nulla.',
  'error.account.archiveNoPassword': 'Allora questo account non aveva una password.',
  'error.account.noPasswordForKeys': 'Questo account non ha una password con cui aprire le sue chiavi.',
  'error.account.noRecoveryKey': 'Questo account non ha ancora una chiave di recupero.',

  // --- Sblocco ------------------------------------------------------------------
  'unlock.prompt': 'Inserisci la password principale per sbloccare.',
  'unlock.placeholder': 'Password principale',
  'unlock.submit': 'Sblocca',
  'unlock.forgot': 'L’hai dimenticata? <link>Usa la chiave di recupero</link>',

  // --- Cassaforte che non si apre più ------------------------------------------
  'unrecoverable.title': 'Questa cassaforte non si può più aprire',
  'unrecoverable.why':
    'La sua chiave di cifratura si trovava in questo profilo del browser ed è sparita, di solito perché i dati di navigazione sono stati cancellati, l’estensione è stata reinstallata o si tratta di un altro profilo. Senza quella chiave nessuno può decifrare gli account salvati, nemmeno noi.',
  'unrecoverable.hasKit':
    'Hai creato una chiave di recupero per questa cassaforte. Protegge gli stessi dati, indipendentemente da quella mancante: aprirà tutto.',
  'unrecoverable.useKit': 'Usa la mia chiave di recupero',
  'unrecoverable.noKit':
    'Ricomincia e ripristina da un file di backup, se ne hai uno. Altrimenti dovrai configurare di nuovo l’autenticazione a due fattori su ogni sito, con i codici di recupero che ti hanno fornito.',
  'unrecoverable.confirmErase': 'Sì, cancella e ricomincia',
  'common.cancel': 'Annulla',
  'unrecoverable.startOver': 'Ricomincia',

  // --- Robustezza della password ------------------------------------------------
  'strength.0': 'molto debole',
  'strength.1': 'debole',
  'strength.2': 'discreta',
  'strength.3': 'forte',
  'strength.4': 'molto forte',
  'strength.line': 'Robustezza: {label}',
  'strength.lineWithWarning': 'Robustezza: {label} — {warning}',
  'strength.tooShort': 'Usa almeno 10 caratteri: la lunghezza conta più di tutto.',
  'strength.digitsOnly': 'Solo cifre è facile da indovinare.',
  'strength.repeated': 'Evita i caratteri ripetuti.',

  // --- Primo avvio --------------------------------------------------------------
  'setup.prompt': 'Scegli come proteggere i tuoi segreti 2FA.',
  'setup.device.title': 'Inizia subito',
  'setup.device.badge': 'Consigliato',
  'setup.device.description':
    'I tuoi segreti sono cifrati con una chiave che questo browser custodisce per te. Niente da ricordare, niente da digitare.',
  'setup.device.footnote':
    'Protegge da tutto ciò che può eseguire script o leggere i dati della tua estensione. Non da malware eseguito con il tuo utente su questo computer.',
  'setup.password.title': 'Aggiungi una password principale',
  'setup.password.description':
    'Una password sblocca la cassaforte, che poi si blocca di nuovo quando smetti di usarla.',
  'setup.password.footnote':
    'L’opzione più sicura: una volta bloccata, nulla su questo computer può aprire la cassaforte senza la password.',
  'setup.footer': 'In entrambi i casi è AES-256-GCM. Puoi cambiare in qualsiasi momento; la sincronizzazione è facoltativa, nelle Impostazioni.',
  'setup.source': 'Open source: leggi il codice',
  'common.back': 'Indietro',
  'setup.passwordStep.title': 'Imposta una password principale',
  'setup.passwordStep.warning':
    'Nessuno può reimpostare questa password. Se la dimentichi, solo una chiave di recupero apre la cassaforte: creane una in Impostazioni → Sicurezza e annota la password in un posto sicuro.',
  'setup.passwordStep.label': 'Password principale',
  'setup.passwordStep.placeholder': 'Almeno 8 caratteri',
  'setup.passwordStep.confirm': 'Conferma password',
  'common.passwordsDiffer': 'Le password non coincidono.',
  'setup.passwordStep.submit': 'Crea la mia cassaforte',
  'setup.passwordStep.footer': 'AES-256-GCM · chiave derivata con PBKDF2 (600.000 iterazioni)',

  // --- Chiave di recupero, aprire una cassaforte --------------------------------
  'recover.title': 'Usa la chiave di recupero',
  'recover.intro':
    'La chiave di 32 caratteri del foglio che hai salvato quando hai configurato questa cassaforte. Usarla sostituisce il modo in cui la cassaforte si blocca: sceglilo anche qui sotto.',
  'recover.keyLabel': 'Chiave di recupero',
  'recover.hintEmpty': 'Solo lettere e cifre: gli spazi non contano.',
  'recover.hintRight': 'Il formato è giusto.',
  'recover.hintCount': '{count} caratteri su 32.',
  'recover.lockQuestion': 'Come deve bloccarsi questa cassaforte d’ora in poi?',
  'recover.lockPassword': 'Imposta una nuova password principale',
  'recover.lockDevice': 'Nessuna password: la chiave la tiene questo dispositivo',
  'recover.newPassword': 'Nuova password principale',
  'recover.atLeast8': 'Almeno 8 caratteri.',
  'recover.submit': 'Sblocca e blocca di nuovo questa cassaforte',

  // --- Campo password -----------------------------------------------------------
  'meter.0': 'Troppo debole',
  'meter.1': 'Debole',
  'meter.2': 'Discreta',
  'meter.3': 'Forte',
  'meter.4': 'Molto forte',
  'password.show': 'Mostra password',
  'password.hide': 'Nascondi password',

  // --- Popup: l’elenco ----------------------------------------------------------
  'vault.search': 'Cerca account',
  'vault.add': 'Aggiungi account',
  'vault.settings': 'Impostazioni',
  'vault.lock': 'Blocca ora',
  'vault.count': { one: '{count} account', other: '{count} account' },
  'vault.syncedWith': 'Sincronizzato con {email}',
  'vault.syncedAs': 'sincronizzato come {email}',
  'vault.changeOrder': 'Cambia l’ordine',
  'vault.byName': 'Per nome',
  'vault.orderAdded': 'Ordine di aggiunta',
  'vault.joinRequests': {
    one: 'Un browser chiede di entrare nel tuo account.',
    other: '{count} browser chiedono di entrare nel tuo account.',
  },
  'vault.joinRequestsHint': 'Approva solo un browser su cui stai accedendo tu, proprio adesso.',
  'vault.reviewInSettings': 'Controlla nelle Impostazioni',
  'vault.noMatch': 'Nessun account corrisponde a «{query}».',
  'vault.forHost': 'Per {host}',
  'vault.fieldDetected': 'campo codice rilevato',
  'common.encryptedHere': 'Cifrato su questo dispositivo',
  'vault.fillWarning':
    '<b>{account}</b> è per <b>{domain}</b>, ma questa pagina è <b>{host}</b>. Se non te lo aspettavi, la pagina potrebbe fingersi il sito.',
  'vault.dontFill': 'Non compilare',
  'vault.fillAnyway': 'Compila comunque',
  'vault.empty.title': 'Ancora nessun account',
  'vault.empty.body':
    'Apri la pagina di configurazione dell’autenticazione a due fattori di un sito, poi scansiona il suo codice QR direttamente dalla scheda.',
  'vault.empty.add': 'Aggiungi il primo account',

  // --- Popup: un account --------------------------------------------------------
  'common.untitled': 'Senza nome',
  'row.copyHint': 'Clicca per copiare',
  'row.share': 'Condividi o sposta',
  'row.shareHint': 'Invia i suoi codici per un po’, o spostalo in un’altra app',
  'row.favouriteAdd': 'Aggiungi ai preferiti',
  'row.favouriteRemove': 'Rimuovi dai preferiti',
  'row.fillHint': 'Inserisci questo codice nella pagina',
  'row.fill': 'Compila',
  'row.copied': 'Copiato',
  'row.copy': 'Copia codice',
  'row.next': 'Genera il codice successivo',
  'row.counter': 'Contatore: {counter}',

  // --- Popup: richiesta di valutazione ------------------------------------------
  'rate.region': 'Valuta Keyrook Authenticator',
  'rate.body': '<b>Keyrook Authenticator ti è utile?</b> Una valutazione su {store} è il modo in cui altri lo trovano.',
  'rate.store.chrome': 'Chrome Web Store',
  'rate.store.edge': 'Componenti aggiuntivi di Edge',
  'rate.notNow': 'Non ora',
  'rate.rate': 'Valuta',

  // --- Elementi comuni ----------------------------------------------------------
  'common.openSource': 'Open source',

  // --- Aggiungere un account ----------------------------------------------------
  'add.title.manual': 'Inserisci una chiave di configurazione',
  'add.title.camera': 'Scansiona con la fotocamera',
  'add.title.quick': 'Ottieni un codice senza salvarlo',
  'add.title.choose': 'Aggiungi un account',
  'add.page.title': 'Scansiona il codice QR di questa pagina',
  'add.page.description': 'Fa uno screenshot della scheda visibile e ne legge il codice.',
  'add.camera.title': 'Scansiona con la fotocamera',
  'add.camera.description': 'Per un codice sul telefono, compresa un’esportazione di Google Authenticator.',
  'add.camera.elsewhere':
    'Apre una volta le Impostazioni, così Chrome può chiedere di usare la fotocamera. Dopo funziona direttamente qui.',
  'add.upload.title': 'Carica un’immagine QR',
  'add.upload.description': 'Uno screenshot o una foto salvati in precedenza.',
  'add.manual.title': 'Inserisci a mano una chiave di configurazione',
  'add.manual.description': 'Per i siti che mostrano un codice invece di un QR.',
  'add.quick.title': 'Ottieni solo un codice',
  'add.quick.description': 'Incolla una chiave e vedi subito il suo codice. Non viene salvato nulla.',
  'add.fromGoogle':
    'Arrivi da Google Authenticator? Esporta lì i tuoi account, poi scansiona il codice mostrato con la fotocamera o caricane uno screenshot. Se ne mostra più di uno, falli uno alla volta.',
  'common.done': 'Fatto',
  'add.noNativeReader':
    'Su questo computer Chrome non ha un lettore QR integrato, quindi un codice grande, come un’esportazione di Google Authenticator, spesso non si scansiona con la fotocamera. Se il tuo non funziona, fai uno screenshot sul telefono e usa «Carica un’immagine QR».',
  'add.openScannerInSettings': 'Apri lo scanner nelle Impostazioni',
  'add.noneFound': 'Nessun account trovato.',
  'add.noQrOnPage':
    'Nessun codice QR nella parte visibile della pagina. Scorri finché non è visibile e riprova.',
  'add.noQrInImage': 'Nessun codice QR in questa immagine.',
  'add.cannotReadUri': 'Impossibile leggere questo URI.',
  'add.enterKey': 'Inserisci la chiave di configurazione fornita dal sito.',
  'add.offeredOn': 'I codici per {domain} verranno proposti su quel sito.',
  'add.startTyping': 'Inizia a scrivere: i servizi noti completano da soli i loro dati.',
  'add.account': 'Account',
  'add.accountPlaceholder': 'tu@esempio.it',
  'add.setupKey': 'Chiave di configurazione',
  'add.linkDetected': 'Rilevato un link otpauth://: servizio e account verranno compilati da questo.',
  'add.spacesFine': 'Spazi e minuscole vanno bene.',
  'add.submit': 'Aggiungi account',
  'add.summary': { one: 'Scansionato {count} codice.', other: 'Scansionati tutti i {count} codici.' },
  'add.summaryAdded': { one: '{count} account aggiunto.', other: '{count} account aggiunti.' },
  'add.summarySkipped': {
    one: '{count} era già nella tua cassaforte ed è rimasto com’era.',
    other: '{count} erano già nella tua cassaforte e sono rimasti com’erano.',
  },
  'error.badKey':
    'Una chiave di configurazione usa solo le lettere A–Z e le cifre 2–7. Controlla che sia stata copiata per intero, senza nulla in più.',
  'error.quickIsMigration':
    'È un link di trasferimento di Google Authenticator, per più account insieme. Importalo invece.',
  'error.keyTooShort': 'È troppo corto per essere una chiave di configurazione.',
  'error.fileTooLarge': 'Questo file è troppo grande per essere letto.',
  'error.notSetupQr': 'Questo codice QR non è un codice di configurazione 2FA.',
  'error.alreadyInVault': 'Questo account è già nella tua cassaforte.',
  'error.gaSkipPeriod': 'Google Authenticator conserva solo codici da 30 secondi; questo usa {period}.',
  'error.gaSkipDigits': 'Google Authenticator conserva solo codici a 6 o 8 cifre; questo ne ha {digits}.',

  // --- Scansione con la fotocamera ----------------------------------------------
  'scan.progressBatch': 'Codice {seen} di {total} scansionato: {accounts}. Mostra il codice successivo.',
  'scan.progress': '{accounts}.',
  'scan.added': { one: '{count} account aggiunto', other: '{count} account aggiunti' },
  'scan.found': { one: '{count} account trovato', other: '{count} account trovati' },
  'scan.skippedVault': {
    one: '{count} era già nella tua cassaforte.',
    other: '{count} erano già nella tua cassaforte.',
  },
  'scan.skippedScanned': { one: '{count} era già stato scansionato.', other: '{count} erano già stati scansionati.' },
  'camera.noCamera': 'Questo browser non fornisce una fotocamera all’estensione.',
  'camera.preview': 'Anteprima della fotocamera',
  'camera.failedHint':
    'Puoi comunque aggiungere un account caricando una foto del codice QR o digitando la chiave di configurazione.',
  'camera.hint':
    'Tieni il codice QR dentro la cornice. Arrivi da Google Authenticator? Apri la schermata di esportazione sul telefono e punta la fotocamera: se mostra più codici, mostrali uno dopo l’altro.',
  'camera.privacy':
    'L’immagine viene letta su questo dispositivo e poi scartata. Niente viene registrato e niente viene caricato.',
  'camera.blocked':
    'Chrome ha bloccato l’accesso alla fotocamera. Consentilo per questa pagina oppure usa un altro modo per aggiungere un account.',
  'camera.none': 'Nessuna fotocamera trovata su questo computer.',
  'camera.busy': 'La fotocamera è usata da un altro programma.',

  // --- Immagini e codici QR -----------------------------------------------------
  'image.unreadable': 'Impossibile leggere questo file come immagine.',
  'image.wrongType': 'Usa un’immagine PNG, JPEG, WebP, GIF o BMP.',
  'image.tooBig': 'Questa immagine è molto grande. Prova con una sotto gli 8 MB.',
  'image.cannotPrepare': 'Impossibile preparare l’immagine.',
  'image.wontCompress':
    'Questa immagine non si comprime abbastanza. Un logo semplice funziona meglio di una fotografia.',
  'image.wrongScreenshotType': 'Usa uno screenshot PNG, JPEG, WebP, GIF o BMP.',
  'brand.account': 'Account',
  'brand.unknown': 'Servizio sconosciuto',

  // --- Campo del servizio -------------------------------------------------------
  'service.label': 'Servizio',
  'service.matches': 'Servizi corrispondenti',

  // --- Trasferire un account a un’altra app -------------------------------------
  'share.intro':
    'Scansionalo con Google Authenticator, Microsoft Authenticator, 1Password, Authy (qualsiasi app di autenticazione) e genererà gli stessi codici di questa.',
  'share.warning':
    'Chiunque veda o fotografi questo codice può generare i tuoi codici per {account}, finché l’account esiste. Mostralo solo all’app verso cui stai passando.',
  'share.show': 'Mostra codice QR',
  'share.qrLabel': 'Codice QR di configurazione per {account}',
  'share.hidesIn': 'Scansionalo con l’altra app. Si nasconde tra {seconds} s.',
  'share.linkCopied': 'Link copiato',
  'share.copyLink': 'Copia link di configurazione',
  'share.saveImage': 'Salva come immagine',
  'share.linkWarning':
    'Anche il link contiene il segreto. Incollalo nell’altra app, poi copia qualcos’altro al suo posto.',
  'share.hideNow': 'Nascondi ora',
  'shareCodes.modeLabel': 'Condividi o sposta',
  'shareCodes.modeCodes': 'Invia codici',
  'shareCodes.modeMove': 'Sposta in un’altra app',
  'shareCodes.noSecret': 'Questo account non ha una chiave di configurazione, quindi non genera codici e non c’è nulla da condividere o spostare. Eliminalo e aggiungi di nuovo l’account dal suo codice QR.',
  'shareCodes.intro': 'Crea un link che mostra i codici di questo account fino alla scadenza, mai la chiave che li genera.',
  'shareCodes.lengthLabel': 'Valido per',
  'shareCodes.min5': '5 minuti',
  'shareCodes.min15': '15 minuti',
  'shareCodes.hour': '1 ora',
  'shareCodes.cannotRecall': 'Un link non si può ritirare. Chi lo ha può usare i codici fino alla scadenza, quindi invialo solo a chi ne ha bisogno.',
  'shareCodes.copy': 'Copia link',
  'shareCodes.copied': 'Link copiato. Funziona fino alle {time}.',
  'shareCodes.counter': 'I codici a contatore non si possono inviare così: ognuno si consuma appena generato. Sposta invece l’account.',

  // --- Ottenere un codice senza salvarlo ----------------------------------------
  'quick.label': 'Chiave di configurazione o link otpauth://',
  'quick.copyHint': 'Clicca per copiare',
  'quick.current': 'Codice attuale',
  'quick.next': 'Prossimo: <code>{code}</code>',
  'quick.notSaved': 'Non viene salvato da nessuna parte. Chiudi e la chiave sparisce.',
  'quick.save': 'Salvalo invece come account',
  'quick.settings': '{digits} cifre · ogni {period} s · {algorithm}',
  'quick.change': 'cambia',
  'quick.digits': 'Cifre',
  'quick.every': 'Ogni',
  'quick.seconds': '{seconds} s',
  'quick.hash': 'Hash',

  // --- Impostazioni: cornice ----------------------------------------------------
  'nav.accounts': 'Account',
  'nav.backup': 'Backup',
  'nav.security': 'Sicurezza',
  'nav.about': 'Informazioni',
  'options.count': { one: '{count} account', other: '{count} account' },
  'options.sourceOnGithub': 'Open source su GitHub',
  // --- Una nuova chiave di recupero ---------------------------------------------
  'sheet.once':
    'È l’unica volta in cui questa chiave viene mostrata. Non è salvata da nessuna parte: se la perdi, creane una nuova.',
  'sheet.download': 'Scarica il foglio',
  'sheet.copy': 'Copia',
  'sheet.saved': 'L’ho salvata in un posto che avrò ancora anche se questo computer non ci sarà più.',

  // --- Gruppi -------------------------------------------------------------------
  'groups.title': 'Gruppi',
  'groups.description':
    'Intestazioni nell’elenco, perché una cassaforte grande si legga a colpo d’occhio. Un account si inserisce in un gruppo dalla sua schermata Modifica.',
  'groups.new': 'Nuovo gruppo',
  'groups.newPlaceholder': 'Lavoro',
  'groups.add': 'Aggiungi',
  'groups.none':
    'Ancora nessun gruppo. Tutto appare in un unico elenco, che va benissimo finché non diventa così lungo da doverlo dividere.',
  'groups.moveUp': 'Sposta {name} su',
  'groups.moveDown': 'Sposta {name} giù',
  'common.save': 'Salva',
  'groups.count': { one: '{count} account', other: '{count} account' },
  'groups.removeNote': 'Gli account restano, senza gruppo.',
  'common.remove': 'Rimuovi',
  'groups.rename': 'Rinomina',
  'groups.removeNamed': 'Rimuovi {name}',
  'groups.ungrouped': {
    one: '{count} account non è in nessun gruppo e compare sotto «Senza gruppo» in fondo all’elenco.',
    other: '{count} account non sono in nessun gruppo e compaiono sotto «Senza gruppo» in fondo all’elenco.',
  },

  // --- Informazioni -------------------------------------------------------------
  'about.fact.sync.title': 'I tuoi segreti sono cifrati prima che qualsiasi cosa lasci questo dispositivo',
  'about.fact.sync.body':
    'La sincronizzazione è facoltativa. Con essa al server arriva solo testo cifrato, che non ha modo di decifrare. I codici sono sempre calcolati in locale. Non c’è telemetria.',
  'about.fact.local.title': 'I tuoi segreti non lasciano mai questo dispositivo',
  'about.fact.local.body':
    'In questa versione non ci sono server, account né telemetria. I codici sono calcolati in locale a partire da segreti conservati in una cassaforte cifrata.',
  'about.fact.keys.title': 'Due modi per custodire la chiave, entrambi AES-256-GCM',
  'about.fact.keys.body':
    'I tuoi account sono cifrati con una chiave dei dati a sua volta protetta. Con una password principale, la chiave di protezione deriva da PBKDF2 con 600.000 iterazioni ed esiste solo in memoria finché la cassaforte è sbloccata. Senza, è una chiave non esportabile custodita da questo browser: nessuno script può leggerne i byte, anche se non è protetta dall’hardware.',
  'about.fact.access.title': 'Nessun accesso generalizzato ai siti',
  'about.fact.access.body':
    'L’estensione non chiede permessi sugli host. Leggere un codice QR da una pagina, o inserirvi un codice, avviene tramite activeTab: un permesso che Chrome concede solo per la scheda da cui hai aperto l’estensione.',
  'about.fact.standards.title': 'Standard, non vincoli',
  'about.fact.standards.body':
    'TOTP RFC 6238 e HOTP RFC 4226, con importazione ed esportazione otpauth://. Puoi passare a un’altra app in qualsiasi momento portando tutto con te.',
  'about.version': 'Versione {version}',
  'about.source': 'Codice sorgente',
  'about.viewOnGithub': 'Vedi su GitHub',
  'about.securityModel': 'Modello di sicurezza',
  'about.securityModelDescription': 'Cosa garantisce l’estensione, anche nei confronti del server di sincronizzazione.',
  'about.readIt': 'Leggilo',
  'about.rate': 'Valuta Keyrook Authenticator',
  'about.rateWhere': 'Su {store}. Bastano pochi secondi.',
  'about.report': 'Segnala un problema o suggerisci qualcosa',
  'about.reportDescription':
    'Su GitHub, dove chiunque può leggerlo. Non incollare mai lì una chiave di configurazione, un codice o un backup.',
  'about.openIssue': 'Apri una segnalazione',
  'about.how': 'Come funziona',
  'about.logos.title': 'Loghi dei servizi',
  'about.logos.description':
    'I loghi sono inclusi nell’estensione, mai scaricati. Chiedere un logo alla rete direbbe a chi risponde su quali servizi usi l’autenticazione a due fattori.',
  'about.logos.body':
    '{count} servizi hanno un logo vero. Grafiche da <simple>Simple Icons</simple> (CC0 1.0), LobeHub Icons, SVG Logos, CoreUI Brands, Arcticons e <fa>Font Awesome Free</fa> (icone, CC BY 4.0). Tutti i nomi e i loghi dei prodotti appartengono ai rispettivi proprietari e servono solo a identificare il servizio di un account. Un servizio senza logo in queste raccolte riceve una tessera con l’iniziale.',
  'about.shortcut.change': 'Modificala in chrome://extensions/shortcuts.',
  // --- Impostazioni: account ----------------------------------------------------
  'accounts.title': 'Account',
  'accounts.description':
    'Tutto ciò che è conservato in questa cassaforte. I codici sono generati su questo dispositivo, mai da un server.',
  'accounts.empty': 'Ancora nessun account. Aggiungine uno per iniziare.',
  'accounts.digits': '{type} {digits} cifre',
  'accounts.period': ' · {seconds} s',
  'accounts.counter': ' · contatore {counter}',
  'accounts.moveNamed': 'Condividi o sposta {name}',
  'accounts.edit': 'Modifica',
  'common.delete': 'Elimina',
  'accounts.deleteNamed': 'Elimina {name}',
  'accounts.deleted.title': 'Eliminati di recente',
  'accounts.deleted.description':
    'Conservati perché gli altri dispositivi vengano a sapere della rimozione una volta attivata la sincronizzazione. Ripristina ciò che hai rimosso per errore.',
  'accounts.deleted.on': 'Eliminato il {date}',
  'accounts.restore': 'Ripristina',
  'common.close': 'Chiudi',
  'editor.title': 'Modifica account',
  'editor.picture': 'Immagine',
  'editor.pictureOwn': 'La tua immagine, usata al posto del logo del servizio.',
  'editor.pictureNone': 'Scegline una per i servizi senza logo qui, o per distinguere due account.',
  'editor.replace': 'Sostituisci',
  'editor.choose': 'Scegli immagine…',
  'editor.websites': 'Siti web',
  'editor.websitesHint': 'Separati da virgole. Servono a proporre questo account sui siti corrispondenti.',
  'editor.note': 'Nota',
  'editor.group': 'Gruppo',
  'editor.ungrouped': 'Senza gruppo',
  'editor.noGroups': 'Crea prima un gruppo in Account.',
  'editor.setupKey': 'Chiave di configurazione',
  'editor.setupKeyHint': 'Il segreto dietro questo account. Chiunque lo veda può generare i tuoi codici.',
  'editor.hide': 'Nascondi',
  'editor.reveal': 'Mostra',
  'editor.revealWarning':
    'Mostralo solo su uno schermo che nessun altro può vedere. Copiare questo link in un’altra app di autenticazione è il modo per trasferire l’account su un telefono.',
  'editor.save': 'Salva modifiche',

  // --- Impostazioni: importazione -----------------------------------------------
  'import.incomplete': {
    one: 'Questi screenshot contengono {seen} dei {total} codici di questa esportazione di Google Authenticator, quindi gli account di quello mancante non ci sono. Scegli insieme tutti gli screenshot dell’esportazione per portare tutto.',
    other: 'Questi screenshot contengono {seen} dei {total} codici di questa esportazione di Google Authenticator, quindi gli account degli altri {count} non ci sono. Scegli insieme tutti gli screenshot dell’esportazione per portare tutto.',
  },
  'import.oneOrScreenshots': 'Scegli un file di backup, oppure uno o più screenshot di codici QR.',
  'import.noQrInThis': 'Nessun codice QR in questa immagine.',
  'import.noAccountsInImages': 'Queste immagini non contenevano account.',
  'import.tooLarge': 'Questo file è troppo grande per essere un backup.',
  'import.noAccountsInFile': 'Questo file non conteneva account.',
  'import.description':
    'Porta dentro account da un file di backup, dall’esportazione di un’altra app di autenticazione (scansionata con la fotocamera o scelta come screenshot) o incollando link otpauth://.',
  'import.stopAndReview': 'Fermati e controlla {count}',
  'import.noNativeReader':
    'Su questo computer Chrome non ha un lettore QR integrato, quindi un codice grande, come un’esportazione di Google Authenticator, spesso non si scansiona con la fotocamera. Se il tuo non funziona, fai uno screenshot di ogni codice sul telefono e sceglili tutti con «Scegli file».',
  'import.encrypted': 'Questo backup è cifrato. Inserisci la password con cui è stato creato.',
  'import.backupPassword': 'Password del backup',
  'import.open': 'Apri backup',
  'import.found': { one: 'Trovato {count} nuovo account', other: 'Trovati {count} nuovi account' },
  'import.skipping': ', saltati {count} già presenti nella cassaforte',
  'import.unreadable': ' e {count} illeggibili',
  'import.foundEnd': '.',
  'import.showFailed': 'Mostra le righe non riuscite',
  'import.import': 'Importa {count}',
  'import.scan': 'Scansiona con la fotocamera',
  'import.choose': 'Scegli file…',
  'import.paste': '…oppure incolla link otpauth://, uno per riga',
  'import.read': 'Leggi i link',

  // --- Trasferire tutto a un’altra app ------------------------------------------
  'dest.google.steps':
    'In Google Authenticator: menu → Trasferisci account → Importa account, poi scansiona i codici in ordine.',
  'dest.microsoft.steps':
    'Microsoft Authenticator non può importare da un’altra app, quindi gli account passano uno alla volta. Nell’app: + → Altro account, scansiona, poi Avanti qui.',
  'dest.apple.steps':
    'Password importa i codici solo uno alla volta. Nell’app Password: Codici → +, scansiona, poi Avanti qui.',
  'dest.authy.steps':
    'Authy non può importare da un’altra app, quindi gli account passano uno alla volta. In Authy: + → Scansiona codice QR, poi Avanti qui.',
  'dest.1password.steps':
    '1Password aggiunge i codici un login alla volta. Apri o crea il login → Modifica → aggiungi una password monouso → scansiona, poi Avanti qui. Su computer può leggere il codice direttamente da questo schermo.',
  'dest.bitwarden.steps':
    'Gestore di password: Importa dati → formato «Bitwarden (json)» → scegli il file. App Bitwarden Authenticator: importa da Google Authenticator e scansiona i codici di trasferimento.',
  'dest.proton.steps':
    'In Proton Authenticator importa da Google Authenticator e scansiona i codici di trasferimento, oppure importa da Aegis e scegli il file.',
  'dest.ente.steps':
    'In Ente Auth importa i codici da Google Authenticator e scansiona i codici di trasferimento, oppure scegli «Testo semplice» e il file .txt.',
  'dest.aegis.steps': 'In Aegis: Importa ed esporta → Importa da file → Aegis, e scegli il file.',
  'dest.2fas.steps':
    'In 2FAS importa da Google Authenticator e scansiona i codici di trasferimento, oppure importa da Aegis e scegli il file.',
  'dest.other.steps':
    'Ogni app di autenticazione scansiona un codice di configurazione, quindi uno dopo l’altro funziona sempre. Molte importano anche i codici di trasferimento di Google Authenticator, o un file di link otpauth://: cerca un’opzione di importazione.',
  'dest.other.name': 'Un’altra app',

  // --- Impostazioni: esportazione -----------------------------------------------
  'export.what': 'Cosa esportare',
  'export.all': { one: 'L’unico account.', other: 'Tutti i {count} account.' },
  'export.someChosen': '{chosen} di {total} scelti.',
  'export.choose': 'Scegli…',
  'export.chipAll': 'Tutti',
  'export.chipNone': 'Nessuno',
  'export.encrypted.description':
    'Un file protetto da una password che scegli qui. Conservane una copia in un posto sicuro: se questo dispositivo si guasta, è con questo file che recuperi i tuoi account.',
  'export.encrypted.hint': 'Almeno 8 caratteri. Può essere diversa dalla password principale.',
  'export.encrypted.download': 'Scarica backup cifrato ({count})',
  'export.move.title': 'Trasferisci a un’altra app',
  'export.move.description':
    'Esportazioni leggibili, per passare a un’altra app di autenticazione o conservare su carta. A differenza di un backup, nessuna è cifrata.',
  'export.move.danger':
    'Contengono i tuoi segreti 2FA in chiaro. Chiunque veda i codici o apra i file può generare i tuoi codici finché gli account esistono. Elimina i file, e distruggi la carta, quando hai finito.',
  'export.move.understood': 'Ho capito che non sono cifrate.',
  'common.continue': 'Continua',
  'export.move.which': 'A quale app stai passando?',
  'export.filesAndPaper': 'File e carta:',
  'export.aegis': 'Aegis .json',
  'export.bitwarden': 'Bitwarden .json',
  'export.text': 'otpauth .txt',
  'export.print': 'Stampa foglio',
  'export.closesIn': {
    one: '{accounts}. Si richiude tra {count} minuto.',
    other: '{accounts}. Si richiude tra {count} minuti.',
  },
  'export.closesSoon': '{accounts}. Si richiude a breve.',
  'export.accounts': { one: '{count} account', other: '{count} account' },
  'export.closeNow': 'Chiudi ora',
  'export.method.transfer': 'Mostra codici di trasferimento',
  'export.method.oneByOne': 'Scansiona uno alla volta',
  'export.method.aegis': 'Scarica file Aegis',
  'export.method.bitwarden': 'Scarica file Bitwarden',
  'export.method.text': 'Scarica file di testo',
  'export.allAtOnce': 'Tutti insieme',
  'export.oneAtATime': 'Uno alla volta',
  'export.transfer.label': 'Codici di trasferimento per {app}',
  'export.transfer.title': 'Codici di trasferimento di Google Authenticator',
  'export.moveTo': 'Trasferisci a {app}',
  'export.transfer.none': 'Nessuno degli account scelti può andare in Google Authenticator.',
  'export.transfer.codeLabel': 'Codice di trasferimento {index} di {total}',
  'export.previous': 'Indietro',
  'export.next': 'Avanti',
  'export.transfer.code': 'Codice {index} di {total}',
  'export.transfer.oneHolds': {
    one: 'Un solo codice contiene {count} account.',
    other: 'Un solo codice contiene tutti i {count} account.',
  },
  'export.transfer.notIncluded': 'Non inclusi: trasferiscili invece uno alla volta:',
  'export.oneByOne.label': 'Codici di configurazione per {app}, uno alla volta',
  'export.oneByOne.title': 'Un account alla volta',
  'export.oneByOne.progress': 'Account mostrati',
  'export.oneByOne.position': 'Account {index} di {total}',
  'export.oneByOne.keys': '→ o Spazio per il successivo, Esc per fermarti',
  'export.print.label': 'Codici QR da stampare o scansionare',
  'export.print.title': 'Keyrook Authenticator — codici di configurazione',
  'export.print.body':
    '{accounts}, {date}. Ogni codice configura l’account in qualsiasi app di autenticazione. Chi possiede questo foglio può generare i tuoi codici: tienilo sotto chiave.',
  'export.print.print': 'Stampa o salva come PDF',

  // --- Impostazioni: sicurezza, in alto -----------------------------------------
  'security.locking': 'Blocco',
  'security.lockAfter': 'Blocca dopo inattività',
  'security.lockAfter.passphrase':
    'La chiave di decifratura viene rimossa dalla memoria. Servirà di nuovo la password principale.',
  'security.lockAfter.device':
    'Vale solo con una password principale: una cassaforte con chiave del dispositivo non ha nulla da sbloccare.',
  'security.autoLock': 'Ritardo del blocco automatico',
  'security.minutes': { one: '{count} minuto', other: '{count} minuti' },
  'security.hour': '1 ora',
  'security.never': 'Mai',
  'security.needsPassword': 'Serve una password principale',
  'security.blur': 'Sfoca i codici fino al passaggio del mouse',
  'security.blurDescription': 'Tiene i codici fuori dallo schermo quando lo condividi.',
  'security.blurToggle': 'Sfoca codici',
  'security.autofill': 'Compilazione automatica',
  'security.autofillRow': 'Proponi di inserire i codici nelle pagine web',
  'security.appearance': 'Aspetto',
  'security.theme': 'Tema',
  'security.theme.system': 'Come il sistema',
  'security.theme.light': 'Chiaro',
  'security.theme.dark': 'Scuro',
  'security.sortBy': 'Ordina gli account per',
  'security.sortOrder': 'Ordinamento',
  'security.sort.added': 'Ordine di aggiunta',
  'security.sort.name': 'Nome',
  'security.language': 'Lingua',
  'security.languageBrowser': 'Lingua del browser ({language})',
  // --- Impostazioni: come è protetta la cassaforte ------------------------------
  'protect.msg.removedSignedIn':
    'Questo dispositivo ora si apre senza password. La password del tuo account non è cambiata.',
  'protect.msg.removed': 'Password principale rimossa. Questa cassaforte ora si sblocca da sola su questo dispositivo.',
  'protect.msg.setSignedIn': 'Questo dispositivo ora si blocca con la password del tuo account.',
  'protect.msg.set': 'Password principale impostata. Ti verrà chiesta quando la cassaforte si blocca.',
  'protect.msg.changedSignedIn':
    'Password cambiata, per questa cassaforte e il tuo account. Gli altri dispositivi ti chiederanno di accedere di nuovo con la nuova.',
  'protect.msg.changed': 'Password principale cambiata.',
  'protect.state.accountPassword': 'Si blocca con la password dell’account',
  'protect.state.master': 'Password principale',
  'protect.state.device': 'Chiave del dispositivo (senza password)',
  'protect.lockWithAccount': 'Blocca con la password dell’account',
  'protect.addMaster': 'Aggiungi una password principale',
  'protect.changePassword': 'Cambia password',
  'protect.note.passphrase':
    'È anche la password del tuo account di sincronizzazione. Cambiarla qui la cambia anche lì, e gli altri dispositivi ti chiederanno di accedere di nuovo.',
  'protect.note.device':
    'Il tuo account di sincronizzazione ha una propria password, che questo dispositivo non chiede. Ti serve su un nuovo dispositivo e per modificare l’account o la sua chiave di recupero.',
  'protect.removeWarning':
    'La cassaforte resta cifrata, ma si sbloccherà da sola ogni volta che questo profilo del browser è aperto. Chiunque usi questo computer potrà vedere i tuoi codici.',
  'protect.removeWarningSignedIn':
    ' Il tuo account conserva la sua password: ti servirà ancora su un nuovo dispositivo.',
  'protect.currentPassword': 'Password attuale',
  'protect.currentMaster': 'Password principale attuale',
  'protect.accountPassword': 'Password dell’account',
  'protect.accountPasswordHint':
    'La password con cui accedi alla sincronizzazione. Questo dispositivo la chiederà quando si blocca.',
  'protect.newPassword': 'Nuova password',
  'protect.hint12': 'Almeno 12 caratteri misti, oppure quattro o cinque parole senza legami tra loro.',
  'protect.confirmNew': 'Conferma nuova password',
  'protect.removePassword': 'Rimuovi password',
  'protect.lockWithIt': 'Blocca con questa',
  'protect.setPassword': 'Imposta password',
  'danger.title': 'Elimina questa cassaforte',
  'danger.description':
    'Rimuove tutti gli account e la cassaforte cifrata da questo dispositivo. Non si può annullare e non esiste una copia altrove.',
  'danger.open': 'Elimina questa cassaforte…',
  'danger.warning':
    'Assicurati prima di avere un altro modo per entrare in ogni account: un file di backup, i codici di recupero o gli stessi account sul telefono.',
  'common.typeToConfirm': 'Scrivi {word} per confermare',
  'danger.confirm': 'Elimina tutto',

  // --- Impostazioni: chiave di recupero -----------------------------------------
  'kit.title': 'Chiave di recupero',
  'kit.provider':
    'Il tuo account non ha password. Una chiave di recupero è la via per rientrare se perdi tutti i browser collegati: fa entrare un nuovo browser nel tuo account senza che un altro debba approvarlo. {provider} non può farlo al posto tuo.',
  'kit.signedIn':
    'Nessuno può reimpostare la tua password, né noi né Google. Una chiave di recupero è l’unica via per rientrare se la dimentichi: apre questa cassaforte, gli altri tuoi dispositivi e il tuo account su uno nuovo.',
  'kit.passphrase':
    'Nessuno può reimpostare la tua password principale, né noi né Google. È ciò che impedisce agli altri di aprire la tua cassaforte, ed è anche il motivo per cui una chiave di recupero è l’unica via per rientrare se la dimentichi.',
  'kit.device':
    'Questa cassaforte si sblocca con una chiave custodita dal browser. Se quella chiave sparisce (dati di navigazione cancellati, un nuovo profilo, una reinstallazione), solo una chiave di recupero potrà ancora aprirla.',
  'kit.none': 'Ancora nessuna chiave di recupero',
  'kit.vaultOnly': 'Apre questa cassaforte, ma non il tuo account',
  'kit.issued': 'È stata creata una chiave di recupero',
  'kit.issueNew': 'Creane una nuova',
  'kit.create': 'Crea una chiave di recupero',
  'kit.beforeSignIn':
    'Questa chiave è stata creata prima dell’accesso, quindi il tuo account non la possiede. Apre ancora questa cassaforte qui, ma non su un nuovo dispositivo. Creane una nuova che copra entrambi.',
  'kit.replaces':
    'Creare una nuova chiave rende inutilizzabile la precedente, quindi un vecchio foglio stampato si può buttare una volta sostituito.',
  'kit.replacesSignedIn':
    'Creare una nuova chiave rende inutilizzabile la precedente, qui e sugli altri tuoi dispositivi, quindi un vecchio foglio stampato si può buttare una volta sostituito.',
  'kit.withoutProvider':
    'Senza di essa, perdere tutti i browser collegati al tuo account significa perdere per sempre tutti gli account di questa cassaforte.',
  'kit.withoutPassword':
    'Senza di essa, dimenticare la password significa perdere per sempre tutti gli account di questa cassaforte.',
  'kit.withoutDevice':
    'Senza di essa, perdere la chiave custodita da questo browser significa perdere per sempre tutti gli account di questa cassaforte.',
  'kit.noSupport': 'Nessuna richiesta di assistenza può rimediare.',
  'kit.removeProvider':
    'Rimuovendola, solo un browser già collegato potrà far entrare un nuovo browser nel tuo account.',
  'kit.removePassword': 'Rimuovendola, la tua password resta l’unico modo per entrare.',
  'kit.removePasswordSignedIn':
    'Rimuovendola, la tua password resta l’unico modo per entrare: su questo dispositivo, sugli altri dispositivi e nel tuo account.',
  'kit.reauth':
    'Una chiave di recupero può far entrare un browser nel tuo account, quindi {provider} ti chiede prima di accedere ancora una volta.',
  'kit.passwordHint': 'Una chiave di recupero può reimpostare il tuo account, quindi cambiarla richiede la password.',
  'kit.removeConfirm': 'Rimuovi la chiave di recupero',
  'kit.createConfirm': 'Crea la chiave',

  // --- Impostazioni: account e sincronizzazione ---------------------------------
  'account.title': 'Account',
  'facts.stored': 'Account conservati',
  'facts.noLimit': 'Nessun limite',
  'facts.encryption': 'Cifratura',
  'facts.autofill': 'Compilazione e scansione QR',
  'facts.included': 'Incluso',
  'facts.backup': 'File di backup cifrato',
  'facts.sync': 'Sincronizzazione tra dispositivi',
  'facts.needsAccount': 'Richiede un account',
  'facts.notYet': 'Non ancora disponibile',
  'facts.withoutAccount': 'Senza account, su questo dispositivo',
  'facts.title': 'Cosa offre una cassaforte locale gratuita',
  'facts.description':
    'Nessun account, nessuna email, nessun server, e nessun limite su ciò che conta per la sicurezza.',
  'account.localOnly': 'Solo locale: accesso non effettuato',
  'account.noServer':
    'Questa versione è stata compilata senza server di sincronizzazione, quindi nulla di ciò che aggiungi qui lascia il tuo computer.',
  'account.signedInWith': 'Accesso con {provider} · ',
  'account.lastSynced': 'Ultima sincronizzazione alle {time}',
  'account.notSynced': 'Non ancora sincronizzato',
  'account.every5': ' · si sincronizza ogni 5 minuti',
  'account.syncNow': 'Sincronizza ora',
  'account.signOut': 'Esci',
  'account.noKitProvider':
    'Il tuo account non ha una chiave di recupero. Se perdi tutti i browser collegati, niente potrà recuperare i tuoi account: né noi, né {provider}.',
  'account.noKit':
    'Il tuo account non ha una chiave di recupero. Se dimentichi la password e perdi questo dispositivo, niente potrà recuperare i tuoi account: né noi, né nessun altro.',
  'account.createUnderSecurity': 'Creala in Sicurezza',
  'summary.sentReceived': '{sent} inviati, {received} ricevuti',
  'summary.conflicts': ', mantenuta la versione di questo dispositivo per {count}',
  'summary.overLimit': ', {count} non ci stavano (un account ne contiene fino a 10.000) e sono rimasti su questo dispositivo',
  'summary.end': '.',
  'summary.deleted': {
    one: ' {count} account è stato rimosso su un altro dispositivo: puoi ripristinarlo in Account.',
    other: ' {count} account sono stati rimossi su un altro dispositivo: puoi ripristinarli in Account.',
  },
  'summary.rejected': {
    one: ' {count} elemento non è stato decifrato ed è stato ignorato. Se continua a succedere, c’è un problema con la copia salvata.',
    other: ' {count} elementi non sono stati decifrati e sono stati ignorati. Se continua a succedere, c’è un problema con la copia salvata.',
  },
  'account.signOutNote':
    'Uscire rimuove i tuoi codici da questo browser. Restano nel tuo account Keyrook: accedi di nuovo per riaverli.',
  'accountPage.title': 'Il tuo account Keyrook',
  'accountPage.body': 'Password, chiave di recupero, ripartire da zero ed eliminazione sono nella pagina dell’account, per tutte le app Keyrook insieme.',
  'accountPage.bodyNoRoot': 'Password ed eliminazione sono nella pagina dell’account. La chiave di recupero si crea qui, in Sicurezza, finché un’altra app Keyrook non usa l’account.',
  'accountPage.bodyProvider': 'Chiave di recupero, ripartire da zero ed eliminazione sono nella pagina dell’account, per tutte le app Keyrook insieme.',
  'accountPage.bodyNoRootProvider': 'L’eliminazione è nella pagina dell’account. La chiave di recupero si crea qui, in Sicurezza, finché un’altra app Keyrook non usa l’account.',
  'accountPage.open': 'Apri la pagina dell’account',
  'accountPage.recoveryKey': 'La chiave di recupero di una cassaforte connessa è quella dell’account Keyrook. Si crea e si cambia nella pagina dell’account.',
  'accountPage.sheetProtects': 'La chiave di recupero dell’account protegge Keyrook Authenticator',
  'accountPage.sheetUnknown': 'Non si sa ancora se protegge Keyrook Authenticator',
  'accountPage.noSheet': 'Niente indica ancora che la chiave di recupero di questo account protegga Keyrook Authenticator. Se dimentichi la password senza di essa, puoi perdere i tuoi codici. Creane una, o controlla la tua, nella pagina dell’account.',
  'kept.title': 'Conservato da prima che l’account ripartisse da zero',
  'kept.body': 'Quando questo account è ripartito da zero, ciò che Keyrook Authenticator vi aveva è stato conservato fino al {date}. Recuperalo con la password che l’account aveva allora, o con la chiave di recupero di allora.',
  'kept.password': 'Password di allora',
  'kept.recoveryKey': 'Chiave di recupero di allora',
  'kept.usePassword': 'Usa invece la password di allora',
  'kept.useRecoveryKey': 'Usa invece la chiave di recupero di allora',
  'kept.bring': 'Recuperalo',
  'kept.done': 'È di nuovo in questa cassaforte e sta arrivando agli altri tuoi browser.',
  'error.keys.awaitingConfirmation': 'Un’altra app Keyrook ha sostituito le chiavi di questo account e quella di Keyrook Authenticator non si è ancora adeguata. Apri la pagina dell’account per controllarle, poi accedi di nuovo.',
  'password.changedBoth':
    'Password cambiata, per il tuo account e questa cassaforte. Gli altri dispositivi ti chiederanno di accedere di nuovo con la nuova.',
  'password.changedAccount':
    'Password dell’account cambiata. Gli altri dispositivi ti chiederanno di accedere di nuovo con la nuova.',
  'password.title': 'Password',
  'password.row': 'Password dell’account',
  'password.rowDescription':
    'Con questa accedi su un nuovo dispositivo. Nessuno può reimpostarla per te: conserva bene la chiave di recupero.',
  'password.change': 'Cambia password…',
  'password.formTitle': 'Cambia la password dell’account',
  'devices.title': 'Dispositivi collegati',
  'devices.description':
    'Disconnetti un dispositivo che non usi più o che non hai più. Conserva ciò che aveva già sincronizzato, dietro la stessa password, ma non riceve più nulla.',
  'devices.this': 'Questo dispositivo',
  'devices.when': 'Collegato il {created} · ultima attività {seen}',
  'delete.row': 'Elimina il tuo account',
  'delete.rowDescription':
    'Rimuove ogni copia cifrata conservata dal server. Questo dispositivo mantiene la sua cassaforte com’è; gli altri dispositivi smettono di sincronizzarsi.',
  'delete.open': 'Elimina account…',
  'delete.warning':
    'Non si può annullare. Se dopo questo i tuoi account esisteranno solo su questo dispositivo, tienilo, oppure esporta prima un backup.',
  'delete.reauth': '{provider} ti chiede di accedere ancora una volta prima di eliminare qualcosa.',
  'delete.confirm': 'Elimina l’account',

  // --- Accesso: la prima scheda -------------------------------------------------
  'intro.benefit1': 'Gli stessi codici in ogni browser in cui accedi.',
  'intro.benefit2': 'Un portatile perso o rotto non è una cassaforte persa.',
  'intro.benefit3': 'Gratis e facoltativo: senza, su questo dispositivo continua a funzionare tutto.',
  'intro.title': 'Sincronizza la tua cassaforte',
  'intro.subtitle':
    'Cifrata su questo dispositivo prima di partire. Il server conserva ciò che non può leggere, e nemmeno noi possiamo.',
  'intro.signedOutProvider':
    'Questo dispositivo è stato disconnesso da {email}: è stato rimosso da un altro. Continua con {provider} per accedere di nuovo.',
  'intro.orEmail': 'oppure con email',
  'intro.create': 'Crea un account',
  'intro.signIn': 'Accedi',
  'intro.source': 'Open source: guarda come vengono cifrati i tuoi codici',

  // --- Accesso: moduli con email ------------------------------------------------
  'form.email': 'Email',
  'form.emailPlaceholder': 'tu@esempio.it',
  'create.checkEmail': 'Controlla la tua email',
  'create.codeSent': 'Abbiamo inviato un codice di sei cifre a <b>{email}</b>. Vale una volta, per 15 minuti.',
  'create.code': 'Codice',
  'create.spam':
    'Non è nella posta in arrivo? Cerca nello <b>Spam</b> un messaggio di <b>Keyrook</b> e segnalalo come <b>Non spam</b>.',
  'create.submit': 'Crea account',
  'create.existing':
    'Se questo indirizzo ha già un account, l’email lo dice: in quel caso accedi a quello.',
  'create.stillNothing': 'Ancora niente?',
  'create.resendIn': 'Invia un nuovo codice tra {seconds} s',
  'create.resend': 'Invia un nuovo codice',
  'create.wrongAddress': '. Indirizzo sbagliato?',
  'create.changeIt': 'Cambialo',
  'create.title': 'Crea il tuo account',
  'create.choosing': 'Questa password ti servirà su un nuovo dispositivo. Questo continua ad aprirsi senza.',
  'create.sharing': 'La password principale diventa anche quella dell’account: resta una sola.',
  'create.password': 'Password',
  'create.master': 'Password principale',
  'create.next':
    'Poi ti mandiamo un codice per confermare l’indirizzo, e salvi una chiave di recupero: l’unica via per rientrare se dimentichi la password.',
  'create.agree': 'Creare un account significa accettare l’<link>informativa sulla privacy</link>.',
  'create.haveAccount': 'Hai già un account?',
  'signin.subtitle': 'I codici già presenti su questo dispositivo vengono aggiunti al tuo account.',
  'signin.signedOut':
    'Questo dispositivo è stato disconnesso da {email}: la password è stata cambiata o il dispositivo è stato rimosso da un altro. Accedi di nuovo per continuare a sincronizzare.',
  'signin.forgot': 'Password dimenticata?',
  'signin.locksWithAccount': 'Da ora questo dispositivo si bloccherà con la password del tuo account.',
  'signin.keepsOpening': 'Questo dispositivo continua ad aprirsi senza password.',
  'signin.newHere': 'Sei nuovo?',
  'recoverAccount.title': 'Recupera il tuo account',
  'recoverAccount.subtitle':
    'Usa la chiave di recupero che hai salvato quando l’hai creato, poi scegli una nuova password.',
  'recoverAccount.keyHint': '32 caratteri dal foglio stampato. Spazi e trattini non contano.',
  'recoverAccount.submit': 'Recupera e accedi',
  'recoverAccount.elsewhere': 'Se anche un’altra app Keyrook usa questo account, la sua password si reimposta nella pagina dell’account.',
  'recoverAccount.note':
    'Ogni dispositivo dell’account viene disconnesso e gli verrà chiesta la nuova password. La tua chiave di recupero continua a funzionare.',

  // --- Accesso: dopo ------------------------------------------------------------
  'ready.empty': 'Il tuo account è pronto.',
  'ready.all': {
    one: 'Il tuo account è pronto, e l’account di questo dispositivo è salvato al suo interno.',
    other: 'Il tuo account è pronto, e tutti i {count} account di questo dispositivo sono salvati al suo interno.',
  },
  'ready.some':
    'Il tuo account è pronto. {done} account su {total} sono salvati finora; il resto arriva con la prossima sincronizzazione.',
  'fresh.title': 'Salva la tua chiave di recupero',
  'fresh.provider':
    'Se perdi tutti i browser collegati al tuo account, questa chiave è l’unica via per rientrare: {provider} non può ripristinare la tua cassaforte, e nemmeno noi.',
  'fresh.password':
    'Se dimentichi la password, questa chiave è l’unica via per rientrare: nessuno può reimpostarla per te, né noi né Google.',
  'welcome.fromAccount': '{count} dal tuo account',
  'welcome.fromDevice': '{count} aggiunti da questo dispositivo',
  'welcome.inSync': 'Già sincronizzato.',
  'welcome.nothing': 'Ancora niente qui.',
  'welcome.failed': 'Accesso effettuato: la prima sincronizzazione non è terminata',
  'welcome.back': 'Sei rientrato',
  'welcome.signedIn': 'Hai effettuato l’accesso',
  'welcome.nothingLost':
    'Non si è perso nulla: i tuoi codici arrivano con la prossima sincronizzazione. Riprova ora, oppure avverrà da sola entro cinque minuti.',
  'welcome.onDevice': { one: 'account su questo dispositivo', other: 'account su questo dispositivo' },
  'welcome.uploading': {
    one: ' · {count} è ancora in caricamento e arriverà con la prossima sincronizzazione',
    other: ' · {count} sono ancora in caricamento e arriveranno con la prossima sincronizzazione',
  },
  'welcome.othersSignedOut': 'Tutti gli altri dispositivi sono stati disconnessi e chiederanno la nuova password.',
  'welcome.tryAgain': 'Riprova',
  'welcome.seeAccounts': 'Vedi i tuoi account',
  'welcome.toolbar': 'Sono anche a un clic di distanza: l’icona di Keyrook Authenticator nella barra degli strumenti.',

  // --- Accesso con Google o GitHub ----------------------------------------------
  'provider.continue': 'Continua con {provider}',
  'provider.finishInWindow': 'Completa nella finestra di {provider} che si è aperta.',
  'provider.confirmed': '{provider} ha confermato <b>{email}</b>. Nessun account lo usa ancora.',
  'provider.point1':
    'Nessuna password. Su un nuovo browser continui con {provider}, e un browser già collegato lo fa entrare dopo che hai verificato che entrambi mostrano lo stesso codice.',
  'provider.point2':
    '{provider} dimostra che sei tu. Non vede mai i tuoi codici: sono cifrati qui, con una chiave che resta sui tuoi browser.',
  'provider.point3':
    'Poi salvi una chiave di recupero: la via per rientrare se perdi tutti i browser collegati all’account. {provider} non può ripristinare la tua cassaforte.',
  'provider.notRight': 'Non è l’account giusto?',
  'provider.startAgain': 'Ricomincia',
  'pairing.codeLabel': 'Codice {code}',
  'join.title': 'Fai entrare questo browser',
  'join.subtitle':
    '<b>{email}</b> ha già un account. Approva questo browser da uno che vi ha già effettuato l’accesso.',
  'join.masterPassword': 'Password principale di questa cassaforte',
  'join.masterHint': 'Continua a bloccare questa cassaforte qui; l’account in sé non ha password.',
  'join.ask': 'Chiedi di entrare',
  'join.step1':
    'Su un browser già collegato, apri Keyrook Authenticator. La richiesta compare lì: nel popup e nelle impostazioni, in Sincronizzazione.',
  'join.step2': 'Verifica che mostri lo stesso codice di questa pagina, poi approvala.',
  'join.askAgain': 'Chiedi di nuovo',
  'join.compare': 'Anche l’altro browser mostra un codice. Approva lì solo se è esattamente questo.',
  'join.waiting': 'In attesa di un altro browser…',
  'join.noOther': 'Non hai più un altro browser?',
  'join.useKey': 'Usa la chiave di recupero',
  'join.wrongAccount': 'Hai effettuato l’accesso a {provider} con l’account sbagliato?',
  'joinKey.subtitle':
    'La chiave che hai salvato quando è stato creato l’account. Fa entrare questo browser senza bisogno di un altro.',
  'joinKey.submit': 'Entra nell’account',
  'approve.approved': 'Approvato. L’altro browser aprirà la tua cassaforte tra un momento.',
  'approve.mismatch':
    'Rifiutato. Se non stavi accedendo tu proprio adesso, qualcun altro può accedere al tuo account {provider}: cambiane la password e controlla le impostazioni di sicurezza.',
  'approve.declined': 'Rifiutato. Non è stato inviato nulla.',
  'approve.title': 'Browser che chiedono di entrare',
  'approve.description':
    'Ogni richiesta viene da qualcuno che ha appena effettuato l’accesso con il tuo account {provider}. Approva solo un browser su cui stai accedendo tu, proprio adesso.',
  'approve.askedAt': 'Richiesta alle {time}',
  'approve.review': 'Controlla',
  'approve.deny': 'Rifiuta',
  'approve.question':
    'Il browser che chiede mostra esattamente questo codice? Se no, qualcun altro sta cercando di entrare.',
  'approve.matches': 'Corrisponde: fallo entrare',
  'approve.doesNotMatch': 'Non corrisponde',

  // --- Errori, seguito ----------------------------------------------------------
  'error.vaultNewer':
    'Questa cassaforte è stata creata da una versione più recente di Keyrook Authenticator. Aggiorna prima di aprirla.',
  'error.uriUnsupported': 'Questo link usa un’impostazione che questa app non sa leggere ({value}).',
  'editor.websitesPlaceholder': 'github.com, gist.github.com',
  'error.noWorker': 'L’estensione non ha risposto. Chiudi e riapri.',
  'nav.sync': 'Sincronizzazione',
  'nav.general': 'Generali',
  'nav.needsAttention': 'Richiede attenzione',
  'sync.description': 'Gli stessi codici in ogni browser in cui accedi, cifrati qui prima di partire.',
  'backup.description': 'Conserva una copia cifrata, importa account o spostali in un’altra app.',
  'backup.choice.backup.title': 'Esegui backup',
  'backup.choice.backup.body': 'Un file cifrato, protetto da una password che scegli tu.',
  'backup.choice.import.title': 'Importa',
  'backup.choice.import.body': 'Da un backup, dall’esportazione di un’altra app o da link otpauth://.',
  'backup.choice.move.body':
    'Codici di trasferimento, una pagina da stampare o un file leggibile. Non cifrato.',
  'security.description': 'Come si apre questa cassaforte e come rientrarci se perdi questo browser.',
  'security.deviceKeyHint':
    'Niente da digitare. Non ferma un malware che gira con il tuo utente su questo computer.',
  'security.passwordHint': 'Richiesta ogni volta che la cassaforte si è bloccata.',
  'general.description': 'Come appare e si comporta l’estensione, e da dove viene.',
  'general.inBrowser': 'Nel browser',
  'general.autofillHint':
    'Aprendo il popup su una pagina di accesso viene proposto il codice giusto. Viene letta solo quella scheda.',
  'vault.signInToSync': 'Accedi per sincronizzare',
  'vault.empty.signIn':
    'Usi Keyrook Authenticator in un altro browser? <link>Accedi</link> per portare qui i tuoi codici.',
  'setup.haveAccount': 'Usi già Keyrook Authenticator? <link>Accedi</link> per portare qui i tuoi codici.',
  'popup.signInOpensTab': 'Si apre in una nuova scheda e termina nelle impostazioni.',
  'error.backupWrongPassword': 'Questa password non apre il file.',
  'error.foreign.steam': 'I codici Steam Guard non si possono ancora importare.',
  'error.foreign.locked':
    'Questa esportazione è bloccata con una password che Keyrook Authenticator non sa aprire. Esporta di nuovo senza password.',
  'import.lockedFrom':
    '{app} ha bloccato questa esportazione con una password. Inserisci quella che hai impostato lì.',
  'import.fromApps':
    'Funzionano anche le esportazioni di Aegis, 2FAS, Bitwarden, Proton, Ente Auth, andOTP, FreeOTP+, dell’estensione Authenticator e di Google Authenticator, e un CSV di Password di Apple, 1Password o un altro gestore.',
  'shortcut.open': 'Apri Keyrook Authenticator',
  'shortcut.fill': 'Compila il codice per questa pagina',
  'shortcut.fillHint': 'Compila solo se un unico account appartiene al sito; altrimenti apre l’elenco.',
  'shortcut.notSet': 'Non impostato',
  'vault.shortcutHint': '{keys} lo compila senza aprire questa finestra.',
  'import.csvWarning':
    'Questo file contiene le tue password in chiaro. Sono state lette solo le chiavi a due fattori e non si conserva nient’altro: elimina il file quando hai finito.',
  'import.noKeysInCsv': 'Questo file non contiene chiavi a due fattori, solo password.',
};
