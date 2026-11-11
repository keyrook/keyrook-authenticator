// Español. Tuteo, como Chrome y la mayoría de las apps en español.
import type { Dictionary } from './en.js';

export const es: Dictionary = {
  // --- Errores ------------------------------------------------------------------
  'error.vaultLocked': 'La bóveda está bloqueada.',
  'error.vaultExists': 'Ya hay una bóveda en este dispositivo.',
  'error.noVault': 'Todavía no hay ninguna bóveda en este dispositivo.',
  'error.vaultCorrupt': 'La bóveda guardada está dañada o la escribió otra aplicación.',
  'error.wrongMasterPassword': 'Contraseña maestra incorrecta.',
  'error.enterCurrentMasterPassword': 'Introduce tu contraseña maestra actual.',
  'error.currentPasswordWrong': 'La contraseña actual es incorrecta.',
  'error.masterPasswordShort': 'La contraseña maestra debe tener al menos 8 caracteres.',
  'error.notPassphraseVault': 'Esta bóveda no está protegida con una contraseña maestra.',
  'error.recoveryKeyMalformed': 'Eso no parece una clave de recuperación.',
  'error.recoveryKeyNoMatch': 'Esa clave de recuperación no coincide.',
  'error.recoverOnAccountPage': 'Tu clave de recuperación es correcta, pero la contraseña de esta cuenta ahora se restablece en la página de la cuenta, para todas las apps de Keyrook a la vez.',
  'error.kitOnAccountPage': 'La clave de recuperación de esta cuenta ahora se crea en la página de la cuenta, para todas las apps de Keyrook a la vez.',
  'error.restoreEmpty': 'No queda nada de esta cuenta que recuperar: se eliminó en otro dispositivo antes de que este la tuviera.',
  'error.noAccountSheet': 'Esta cuenta aún no tiene clave de recuperación. Crea una en la página de la cuenta.',
  'error.recoveryKeyWrong': 'Esa clave de recuperación no corresponde a esta cuenta.',
  'error.noRecoveryKit': 'Esta bóveda no tiene clave de recuperación.',
  'error.accountData.withheld':
    'Firefox no ha permitido que Keyrook Authenticator envíe nada a una cuenta de Keyrook, así que no se ha enviado nada. Permítelo cuando Firefox te lo pregunte, o en about:addons.',
  'error.syncUnavailable': 'La sincronización no está disponible en esta versión.',
  'error.notSignedIn': 'No has iniciado sesión.',
  'error.alreadySignedIn': 'Ya has iniciado sesión.',
  'error.signedOutElsewhere':
    'Se cerró la sesión de sincronización de este dispositivo: se cambió la contraseña o se quitó el dispositivo desde otro. Vuelve a iniciar sesión.',
  'error.removedFromAccount':
    'Otro dispositivo quitó este de tu cuenta de Keyrook, así que se eliminaron de aquí los códigos de la cuenta. Vuelve a iniciar sesión para recuperarlos.',
  'error.signOutUnsynced':
    'Algunos cambios de este navegador aún no han llegado a tu cuenta, y cerrar sesión ahora los perdería. Conéctate a internet y vuelve a intentarlo.',
  'error.enterAccountPassword': 'Introduce la contraseña de tu cuenta.',
  'error.accountPasswordWrong': 'Esa no es la contraseña de tu cuenta.',
  'error.accountPasswordWeak':
    'Esa contraseña es demasiado débil para proteger una copia de tu bóveda que sale de este dispositivo. Usa al menos 12 caracteres mezclando mayúsculas, minúsculas, números y símbolos, o cuatro o cinco palabras sin relación entre sí.',
  'error.lockOnlyWithAccountPassword':
    'Esa no es la contraseña de tu cuenta. Mientras tengas la sesión iniciada, es la única contraseña con la que puede bloquearse esta bóveda.',
  'error.signupWrongMasterPassword':
    'Esa no es la contraseña maestra de esta bóveda. También pasa a ser la contraseña de tu cuenta.',
  'error.masterPasswordTooWeakForAccount':
    'Tu contraseña maestra es demasiado débil para proteger una copia de tu bóveda que sale de este dispositivo. Cámbiala primero en Seguridad: al menos 12 caracteres variados, o cuatro o cinco palabras sin relación entre sí.',
  'error.passwordsDiverged':
    'La contraseña de tu cuenta es distinta de la de esta bóveda. Cierra la sesión de sincronización y vuelve a iniciarla para igualarlas, y luego inténtalo de nuevo.',
  'error.kitRace':
    'Otro de tus dispositivos acaba de cambiar la clave de recuperación. Aquí no se ha cambiado nada; inténtalo de nuevo.',
  'error.providerHasNoPassword': 'Esta cuenta inicia sesión con Google o GitHub y no tiene contraseña.',
  'error.noActiveTab': 'No hay ninguna pestaña activa.',
  'error.autofillNotHere': 'El autocompletado solo funciona en páginas web normales.',
  'error.autofillBlocked':
    'Chrome no dejó que la extensión leyera esta página. Abre la ventana de la extensión desde la página que quieres rellenar.',
  'error.autofillBlocked.firefox':
    'Firefox no dejó que la extensión leyera esta página. Abre la ventana de la extensión desde la página que quieres rellenar.',
  'error.signinCancelled': 'Se canceló el inicio de sesión.',
  'error.signinStateMismatch': 'Ese inicio de sesión no volvió como salió. Inténtalo de nuevo.',
  'error.signinUnfinished': 'El inicio de sesión no terminó. Inténtalo de nuevo.',
  'error.signupPendingExpired': 'Ese inicio de sesión ha caducado. Empieza de nuevo.',
  'error.signInFirst': 'Inicia sesión primero.',
  'error.joinNeedsMasterPassword': 'Introduce la contraseña maestra de esta bóveda para terminar de unirte.',
  'error.notThisVaultsPassword': 'Esa no es la contraseña maestra de esta bóveda.',
  'error.nothingWaiting': 'No hay nada esperando aprobación.',
  'error.pairingExpired': 'La solicitud terminó: se rechazó o pasaron diez minutos. Vuelve a pedirlo.',
  'error.pairingWrongKey':
    'La clave que llegó no es la de esta cuenta. No se ha cambiado nada. Inténtalo de nuevo desde el otro dispositivo.',
  'error.pairingForged': 'Esa aprobación no vino del dispositivo cuyo código comprobaste.',
  'error.pairingForgedAsk':
    'Esa aprobación no vino del dispositivo cuyo código se comprobó. No se ha cambiado nada. Vuelve a pedirlo.',
  'error.pairingEnded': 'Esa solicitud ha terminado.',
  'error.approveAgain': 'Vuelve a empezar la aprobación de esa solicitud.',
  'error.backupPasswordShort': 'La contraseña de la copia de seguridad debe tener al menos 8 caracteres.',
  'error.backupNotOurs': 'Este archivo no es una copia de seguridad de Keyrook Authenticator.',
  'error.backupNewer': 'Esta copia de seguridad la hizo una versión más reciente de la app.',
  'error.backupUnknownCipher': 'Esta copia de seguridad usa un método de cifrado que esta versión no conoce.',
  'error.backupTooCostly': 'Abrir esta copia de seguridad exige un trabajo desproporcionado. Se ignora.',
  'error.backupMalformed': 'Esta copia de seguridad está mal formada.',
  'error.uriNotOtpauth': 'No es un enlace otpauth://.',
  'error.uriMalformed': 'Ese enlace otpauth:// está mal formado.',
  'error.uriNoSecret': 'Ese enlace no contiene ningún secreto.',
  'error.uriBadSecret': 'El secreto de ese enlace no es base32 válido.',
  'error.uriNoCounter': 'Un enlace HOTP debe incluir un contador.',
  'error.secretEmpty': 'La clave de configuración está vacía.',
  'error.migrationNotOurs': 'No es una exportación de Google Authenticator.',
  'error.migrationMalformed': 'Esta exportación de Google Authenticator está dañada o incompleta.',
  'error.offline': 'No se pudo conectar con el servidor de sincronización. Comprueba tu conexión e inténtalo de nuevo.',
  'error.passkey.wrongOrigin': 'Una llave de acceso solo responde a la página y las apps de Keyrook.',
  'error.passkey.notOffered': 'Aquí no se ofrece iniciar sesión con llave de acceso.',
  'error.passkey.unchecked': 'No se pudo comprobar esa llave de acceso. Inténtalo de nuevo.',
  'error.passkey.unknown': 'Ninguna cuenta de Keyrook conoce esa llave de acceso. Puede que se haya eliminado.',
  'error.passkey.ended': 'La solicitud de esa llave de acceso ha caducado. Inténtalo de nuevo.',
  'error.passkey.noUnlock': 'Esa llave de acceso no abre la clave de esta cuenta. Inicia sesión con la contraseña.',
  'error.passkey.noUnlockProvider':
    'Esa llave de acceso no abre la clave de esta cuenta. Continúa con Google o GitHub.',
  'error.passkey.masterPassword':
    'Una bóveda que se bloquea con contraseña maestra no puede iniciar sesión con una llave de acceso. Inicia sesión con la contraseña de la cuenta, o con Google o GitHub.',
  'error.passkey.permission':
    'Keyrook Authenticator necesita el permiso de Chrome para usar las llaves de acceso de account.keyrook.com. Vuelve a elegir la llave de acceso y permítelo.',
  'error.passkey.cancelled': 'No se usó ninguna llave de acceso. Inténtalo de nuevo o inicia sesión de otra forma.',
  'error.passkey.failed': 'Chrome no pudo pedir una llave de acceso. Inténtalo de nuevo o inicia sesión de otra forma.',
  'error.secondStep.missing': 'Introduce también el código de tu app de autenticación.',
  'error.secondStep.wrongCode': 'Ese código no es correcto. Introduce el que muestra ahora tu app de autenticación.',
  'error.secondStep.expired': 'Ese inicio de sesión ha caducado. Vuelve a iniciar sesión.',
  'error.secondStep.used': 'Ese código se acaba de usar para iniciar sesión. Espera a que tu app muestre el siguiente.',
  'error.provider.refusedBy': '{provider} rechazó el inicio de sesión.',
  'error.provider.unreachable': 'No se pudo conectar con {provider}. Inténtalo de nuevo en un momento.',
  'error.provider.refused': 'Se rechazó el inicio de sesión. Inténtalo de nuevo.',
  'error.provider.githubRefused': 'GitHub rechazó el inicio de sesión.',
  'error.provider.noReauth': 'Google no te pidió que volvieras a iniciar sesión.',
  'error.provider.unverifiedEmail': 'Google no ha verificado esa dirección de correo.',
  'error.provider.githubNoEmail': 'Tu cuenta de GitHub no tiene un correo principal verificado.',
  'error.server.badRequest': 'El servidor de sincronización no pudo leer esa solicitud.',
  'error.server.session': 'Esa sesión ya no es válida.',
  'error.server.accountGone': 'Esa cuenta ya no existe.',
  'error.server.signupExpired': 'Ese registro ha caducado. Vuelve a iniciar sesión.',
  'error.server.signinExpired': 'Ese inicio de sesión ha caducado. Inténtalo de nuevo.',
  'error.server.tooManyCodes': 'Demasiados códigos incorrectos. Pide uno nuevo.',
  'error.server.tooManyPairings':
    'Hay demasiados dispositivos esperando para unirse a esta cuenta. Inténtalo de nuevo en unos minutos.',
  'error.server.wrongKey': 'Este dispositivo no tiene la clave de la cuenta.',
  'error.server.providerAccount': 'Esta cuenta inicia sesión con Google o GitHub, no con contraseña.',
  'error.server.mailFailed': 'No se pudo enviar el correo. Inténtalo de nuevo en un minuto.',
  'error.server.pairingTaken': 'Esa solicitud ha terminado o la está aprobando otro dispositivo.',
  'error.server.passwordWrong': 'Esa contraseña no es correcta.',
  'error.server.badCredentials': 'Correo o contraseña incorrectos.',
  'error.server.badCode':
    'Ese código no es correcto o ha caducado. Revisa el correo o pide uno nuevo.',
  'error.server.reauthMismatch':
    'Para confirmarlo, vuelve a iniciar sesión con la cuenta que usas para Keyrook.',
  'error.server.kitRace': 'Otro dispositivo acaba de cambiar la clave de recuperación.',
  'error.server.unavailable': 'El servidor de sincronización no pudo hacerlo ahora. Inténtalo de nuevo en un momento.',
  'error.server.lockedOut': {
    one: 'Demasiados intentos fallidos. Inténtalo de nuevo dentro de {count} segundo.',
    other: 'Demasiados intentos fallidos. Inténtalo de nuevo dentro de {count} segundos.',
  },
  'error.server.rateLimited': {
    one: 'Demasiados intentos. Inténtalo de nuevo dentro de {count} segundo.',
    other: 'Demasiados intentos. Inténtalo de nuevo dentro de {count} segundos.',
  },
  'error.server.emailTaken': '{email} ya tiene una cuenta de Keyrook.',
  'error.server.recordTooLarge': 'Una de tus cuentas es demasiado grande para sincronizarse ({id}).',
  'error.server.codeTooSoon': 'Se acaba de enviar un código. Espera un poco antes de pedir otro.',
  'error.server.keyRace': 'Otro dispositivo acaba de configurar la clave. Inténtalo de nuevo.',
  'error.server.archiveNeedsOldKeys': 'Solo la contraseña o la clave de recuperación anteriores pueden eliminar lo conservado antes de que caduque.',
  'error.server.signupNeedsKeys': 'No se pudo crear esta cuenta. Actualiza Keyrook Authenticator e inténtalo de nuevo.',
  'error.server.accountIdTaken': 'Ese identificador de cuenta ya está en uso. Regístrate de nuevo.',
  'error.server.archiveWrongKey': 'Eso no abre lo conservado.',
  'error.server.flowExpired': 'Ha caducado. Pide un código nuevo y empieza otra vez.',
  'error.server.archiveGone': 'Eso ya no se conserva.',
  'error.server.notProductKey': 'Esa clave no pertenece a Keyrook Authenticator.',
  'error.server.foreignRecord': 'Ese registro pertenece a otro producto de Keyrook.',
  'error.server.rootChanged': 'Las claves de la cuenta cambiaron en otro dispositivo. Inténtalo de nuevo.',
  'error.server.rootExists': 'Esta cuenta ya tiene una clave raíz.',
  'error.server.noRoot': 'Esta cuenta aún no tiene una clave raíz.',
  'error.server.startOverLimit': 'Esta cuenta se ha reiniciado demasiadas veces últimamente. Inténtalo de nuevo después del {date}.',
  'error.server.wrongRootKey': 'Este dispositivo no tiene la clave raíz de la cuenta.',
  'error.server.sessionReplayed': 'Se cerró la sesión de este dispositivo porque su sesión se usó en otro lugar. Inicia sesión de nuevo.',
  'error.server.noProductKey': 'Keyrook Authenticator aún no tiene una clave en esta cuenta.',
  'error.server.productKeyChanged': 'La clave de Keyrook Authenticator en esta cuenta cambió. Inténtalo de nuevo.',
  'error.server.productKeyReplaced': 'La clave de Keyrook Authenticator se reemplazó en otro dispositivo. Inicia sesión de nuevo.',
  'error.server.updateRequired': 'Actualiza Keyrook Authenticator para seguir usando esta cuenta.',
  'error.server.olderBuildsRetired': 'Las versiones anteriores de Keyrook Authenticator ya no pueden usar esta cuenta.',
  'error.server.emailTakenOtherProvider': '{email} ya tiene una cuenta de Keyrook que inicia sesión con otro proveedor.',
  'error.server.emailTakenPassword': '{email} ya tiene una cuenta de Keyrook con contraseña. Inicia sesión con tu correo y tu contraseña.',
  'error.server.signInWithPassword': 'Esa cuenta inicia sesión con contraseña. Inicia sesión aquí con tu correo y tu contraseña.',
  'error.server.pageCodeWrong': 'Ese código no es el que muestra la página de la cuenta. Revísalo o vuelve a empezar allí.',
  'error.server.pageRequestEnded': 'Esa solicitud caducó o terminó. Vuelve a empezar en la página de la cuenta.',
  'error.server.noKeyrookAccount': 'Esta cuenta de Google o GitHub no tiene una cuenta de Keyrook. Crea una en Keyrook Authenticator o Passhold.',
  'error.account.productKeyMismatch': 'La clave de {product} no se abre con la clave raíz de esta cuenta. No se cambió nada.',
  'error.account.confirmWithPassword': 'Esta cuenta tiene contraseña. Confirma con ella.',
  'error.account.chooseNewPassword': 'Elige una contraseña nueva para esta cuenta.',
  'error.account.archiveNotOpened': 'Nada de lo conservado para Keyrook Authenticator se abre con eso.',
  'error.account.keyNotConfirmed': 'La clave de la cuenta no es la que confirmaste. Vuelve a mirarla.',
  'error.account.serverMismatch': 'La respuesta del servidor de sincronización no coincide con esta cuenta. No se abrió nada con ella.',
  'error.account.archiveNoPassword': 'Esta cuenta no tenía contraseña en ese momento.',
  'error.account.noPasswordForKeys': 'Esta cuenta no tiene una contraseña con la que abrir sus claves.',
  'error.account.noRecoveryKey': 'Esta cuenta aún no tiene clave de recuperación.',

  // --- Desbloqueo ---------------------------------------------------------------
  'unlock.prompt': 'Introduce tu contraseña maestra para desbloquear.',
  'unlock.placeholder': 'Contraseña maestra',
  'unlock.submit': 'Desbloquear',
  'unlock.forgot': '¿La has olvidado? <link>Usa tu clave de recuperación</link>',
  'platformUnlock.unlock': 'Desbloquear con huella, cara o PIN',
  'platformUnlock.title': 'Huella, cara o PIN',
  'platformUnlock.body': 'Abre la bóveda con la comprobación propia de este ordenador —Touch ID, Windows Hello o su PIN— en lugar de escribir la contraseña maestra. La contraseña la sigue abriendo, y los cambios la siguen pidiendo.',
  'platformUnlock.on': 'La bóveda también se abre con la comprobación propia de este ordenador. Quitar la contraseña maestra lo desactiva.',
  'passkeyUnlock.turnOn': 'Activar',
  'passkeyUnlock.turnOff': 'Desactivar',
  'platformUnlock.confirm': 'Después, el ordenador te pedirá tu huella, tu cara o tu PIN.',
  'error.passkeyUnlock.cancelled': 'La comprobación se canceló o tardó demasiado. Inténtalo de nuevo, o usa la contraseña maestra.',
  'error.platformUnlock.noPrf': 'El lugar donde se guardó esta llave de acceso no puede guardar una clave, así que no puede abrir la bóveda. Vuelve a activarlo y elige otro lugar cuando te pregunte dónde guardarla, o sigue usando la contraseña maestra.',
  'error.passkeyUnlock.failed': 'Eso no abrió la bóveda. Usa la contraseña maestra y vuelve a activarlo en Seguridad.',
  'securityKey.unlock': 'Desbloquear con llave de seguridad',
  'securityKey.title': 'Llave de seguridad',
  'securityKey.body': 'Abre la bóveda con una llave de seguridad USB y su PIN en lugar de escribir la contraseña maestra. Quien tenga la llave y sepa su PIN podrá abrir la bóveda en este ordenador. Si pierdes la llave, la contraseña maestra la sigue abriendo.',
  'securityKey.on': 'La bóveda también se abre con tu llave de seguridad y su PIN en este ordenador. Quien tenga la llave y sepa su PIN puede abrirla aquí, así que si pierdes la llave, desactiva esto. Quitar la contraseña maestra lo desactiva.',
  'securityKey.confirm': 'Después, conecta tu llave de seguridad, escribe su PIN y tócala. Algunas llaves lo piden dos veces.',
  'error.securityKey.noPrf': 'Esta llave de seguridad no puede guardar una clave, así que no puede abrir la bóveda. Las llaves hechas solo para el inicio de sesión en dos pasos no pueden. Prueba con otra llave o sigue usando la contraseña maestra.',

  // --- Bóveda que no se puede abrir ---------------------------------------------
  'unrecoverable.title': 'Esta bóveda ya no se puede abrir',
  'unrecoverable.why':
    'Su clave de cifrado estaba en este perfil del navegador y ha desaparecido; normalmente porque se borraron los datos de navegación, se reinstaló la extensión o se trata de otro perfil. Sin esa clave, nadie puede descifrar las cuentas guardadas, ni siquiera nosotros.',
  'unrecoverable.hasKit':
    'Creaste una clave de recuperación para esta bóveda. Esa clave protege los mismos datos, con independencia de la que falta: lo abrirá todo.',
  'unrecoverable.useKit': 'Usar mi clave de recuperación',
  'unrecoverable.noKit':
    'Empieza de nuevo y restaura desde un archivo de copia de seguridad si tienes uno. Si no, tendrás que volver a configurar la verificación en dos pasos en cada sitio, con los códigos de recuperación que te dieron.',
  'unrecoverable.confirmErase': 'Sí, borrar y empezar de nuevo',
  'common.cancel': 'Cancelar',
  'unrecoverable.startOver': 'Empezar de nuevo',

  // --- Seguridad de la contraseña -----------------------------------------------
  'strength.0': 'muy débil',
  'strength.1': 'débil',
  'strength.2': 'aceptable',
  'strength.3': 'fuerte',
  'strength.4': 'muy fuerte',
  'strength.line': 'Seguridad: {label}',
  'strength.lineWithWarning': 'Seguridad: {label} — {warning}',
  'strength.tooShort': 'Usa al menos 10 caracteres: la longitud es lo que más cuenta.',
  'strength.digitsOnly': 'Solo números es fácil de adivinar.',
  'strength.repeated': 'Evita los caracteres repetidos.',

  // --- Primer uso ---------------------------------------------------------------
  'setup.prompt': 'Elige cómo se protegen tus secretos 2FA.',
  'setup.device.title': 'Empezar ya',
  'setup.device.badge': 'Recomendado',
  'setup.device.description':
    'Tus secretos se cifran con una clave que este navegador guarda por ti. Nada que recordar, nada que escribir.',
  'setup.device.footnote':
    'Protege frente a todo lo que pueda ejecutar scripts o leer los datos de tu extensión. No frente a malware que se ejecute con tu usuario en este equipo.',
  'setup.password.title': 'Añadir una contraseña maestra',
  'setup.password.description':
    'Una contraseña desbloquea la bóveda, y esta vuelve a bloquearse cuando dejas de usarla.',
  'setup.password.footnote':
    'La opción más segura: una vez bloqueada, nada en este equipo puede abrir la bóveda sin la contraseña.',
  'setup.footer': 'En ambos casos, AES-256-GCM. Puedes cambiarlo cuando quieras; la sincronización es opcional, en Ajustes.',
  'setup.footer.noSync': 'En ambos casos, AES-256-GCM. Puedes cambiarlo cuando quieras, en Ajustes.',
  'setup.source': 'Código abierto: lee el código',
  'common.back': 'Atrás',
  'setup.passwordStep.title': 'Establecer una contraseña maestra',
  'setup.passwordStep.warning':
    'Nadie puede restablecer esta contraseña. Si la olvidas, solo una clave de recuperación abre la bóveda: crea una en Ajustes → Seguridad y apunta la contraseña en un lugar seguro.',
  'setup.passwordStep.label': 'Contraseña maestra',
  'setup.passwordStep.placeholder': 'Al menos 8 caracteres',
  'setup.passwordStep.confirm': 'Confirmar contraseña',
  'common.passwordsDiffer': 'Las contraseñas no coinciden.',
  'setup.passwordStep.submit': 'Crear mi bóveda',
  'setup.passwordStep.footer': 'AES-256-GCM · clave derivada con PBKDF2 (600.000 iteraciones)',

  // --- Clave de recuperación, abrir una bóveda ----------------------------------
  'recover.title': 'Usa tu clave de recuperación',
  'recover.intro':
    'La clave de 32 caracteres de la hoja que guardaste al configurar esta bóveda. Usarla sustituye cómo se bloquea la bóveda, así que elige eso también abajo.',
  'recover.keyLabel': 'Clave de recuperación',
  'recover.hintEmpty': 'Solo letras y números; los espacios dan igual.',
  'recover.hintRight': 'Tiene el formato correcto.',
  'recover.hintCount': '{count} de 32 caracteres.',
  'recover.lockQuestion': '¿Cómo debe bloquearse esta bóveda a partir de ahora?',
  'recover.lockPassword': 'Establecer una nueva contraseña maestra',
  'recover.lockDevice': 'Sin contraseña: que este dispositivo guarde la clave',
  'recover.newPassword': 'Nueva contraseña maestra',
  'recover.atLeast8': 'Al menos 8 caracteres.',
  'recover.submit': 'Desbloquear y volver a bloquear esta bóveda',

  // --- Campo de contraseña ------------------------------------------------------
  'meter.0': 'Demasiado débil',
  'meter.1': 'Débil',
  'meter.2': 'Aceptable',
  'meter.3': 'Fuerte',
  'meter.4': 'Muy fuerte',
  'password.show': 'Mostrar contraseña',
  'password.hide': 'Ocultar contraseña',

  // --- Ventana: la lista --------------------------------------------------------
  'vault.search': 'Buscar cuentas',
  'vault.add': 'Añadir cuenta',
  'vault.settings': 'Ajustes',
  'vault.lock': 'Bloquear ahora',
  'vault.count': { one: '{count} cuenta', other: '{count} cuentas' },
  'vault.syncedWith': 'Sincronizado con {email}',
  'vault.syncedAs': 'sincronizado como {email}',
  'vault.changeOrder': 'Cambiar el orden',
  'vault.byName': 'Por nombre',
  'vault.orderAdded': 'Orden de llegada',
  'vault.joinRequests': {
    one: 'Un dispositivo pide unirse a tu cuenta.',
    other: '{count} dispositivos piden unirse a tu cuenta.',
  },
  'vault.joinRequestsHint': 'Aprueba solo uno en el que estés iniciando sesión tú mismo, ahora mismo.',
  'vault.reviewInSettings': 'Revisar en Ajustes',
  'vault.noMatch': 'Ninguna cuenta coincide con «{query}».',
  'vault.forHost': 'Para {host}',
  'vault.fieldDetected': 'campo de código detectado',
  'common.encryptedHere': 'Cifrado en este dispositivo',
  'vault.fillWarning':
    '<b>{account}</b> es para <b>{domain}</b>, pero esta página es <b>{host}</b>. Si no te lo esperabas, puede que la página se esté haciendo pasar por el sitio.',
  'vault.dontFill': 'No rellenar',
  'vault.fillAnyway': 'Rellenar igualmente',
  'vault.empty.title': 'Todavía no hay cuentas',
  'vault.empty.body':
    'Abre la página de configuración de la verificación en dos pasos de cualquier sitio y escanea su código QR directamente desde la pestaña.',
  'vault.empty.add': 'Añadir tu primera cuenta',

  // --- Ventana: una cuenta ------------------------------------------------------
  'common.untitled': 'Sin título',
  'row.copyHint': 'Haz clic para copiar',
  'row.share': 'Compartir o mover',
  'row.shareHint': 'Enviar sus códigos durante un rato, o moverla a otra app',
  'row.favouriteAdd': 'Añadir a favoritos',
  'row.favouriteRemove': 'Quitar de favoritos',
  'row.fillHint': 'Rellenar este código en la página',
  'row.fill': 'Rellenar',
  'row.copied': 'Copiado',
  'row.copy': 'Copiar código',
  'row.next': 'Generar el siguiente código',
  'row.counter': 'Contador: {counter}',

  // --- Ventana: pedir una valoración --------------------------------------------
  'rate.region': 'Valorar Keyrook Authenticator',
  'rate.body': '<b>¿Te resulta útil Keyrook Authenticator?</b> Una valoración en {store} es cómo otras personas lo encuentran.',
  'rate.store.chrome': 'Chrome Web Store',
  'rate.store.edge': 'los complementos de Edge',
  'rate.store.firefox': 'los complementos de Firefox',
  'rate.notNow': 'Ahora no',
  'rate.rate': 'Valorar',

  // --- Elementos comunes --------------------------------------------------------
  'common.openSource': 'Código abierto',

  // --- Añadir una cuenta --------------------------------------------------------
  'add.title.manual': 'Introducir una clave de configuración',
  'add.title.camera': 'Escanear con la cámara',
  'add.title.quick': 'Obtener un código sin guardarlo',
  'add.title.choose': 'Añadir una cuenta',
  'add.page.title': 'Escanear el código QR de esta página',
  'add.page.description': 'Hace una captura de la pestaña visible y lee el código de ella.',
  'add.camera.title': 'Escanear con la cámara',
  'add.camera.description': 'Para un código en tu móvil, incluida una exportación de Google Authenticator.',
  'add.camera.elsewhere':
    'Abre Ajustes una vez para que Chrome pueda pedir permiso para la cámara. Después funciona aquí mismo.',
  'add.camera.elsewhere.firefox':
    'Abre Ajustes una vez para que Firefox pueda pedir permiso para la cámara. Después funciona aquí mismo.',
  'add.upload.title': 'Subir una imagen QR',
  'add.upload.description': 'Una captura o una foto que guardaste antes.',
  'add.manual.title': 'Introducir una clave de configuración a mano',
  'add.manual.description': 'Para sitios que muestran un código en lugar de un QR.',
  'add.quick.title': 'Solo obtener un código',
  'add.quick.description': 'Pega una clave y ve su código al momento. No se guarda nada.',
  'add.fromGoogle':
    '¿Vienes de Google Authenticator? Exporta allí tus cuentas y luego escanea el código que muestra con la cámara o sube una captura. Si muestra varios, hazlos uno a uno.',
  'common.done': 'Listo',
  'add.noNativeReader':
    'Chrome no tiene lector de QR integrado en este equipo, así que un código grande, como una exportación de Google Authenticator, a menudo no se escanea con la cámara. Si el tuyo no lo hace, haz una captura en el móvil y usa «Subir una imagen QR».',
  'add.noNativeReader.firefox':
    'Firefox no tiene lector de QR integrado en este equipo, así que un código grande, como una exportación de Google Authenticator, a menudo no se escanea con la cámara. Si el tuyo no lo hace, haz una captura en el móvil y usa «Subir una imagen QR».',
  'add.openScannerInSettings': 'Abrir el escáner en Ajustes',
  'add.noneFound': 'No se encontraron cuentas.',
  'add.noQrOnPage':
    'No se encontró ningún código QR en la parte visible de la página. Desplázate hasta él e inténtalo de nuevo.',
  'add.noQrInImage': 'No se encontró ningún código QR en esa imagen.',
  'add.cannotReadUri': 'No se pudo leer esa URI.',
  'add.enterKey': 'Introduce la clave de configuración del sitio.',
  'add.offeredOn': 'Los códigos de {domain} se ofrecerán en ese sitio.',
  'add.startTyping': 'Empieza a escribir: los servicios conocidos completan sus propios datos.',
  'add.account': 'Cuenta',
  'add.accountPlaceholder': 'tu@ejemplo.com',
  'add.setupKey': 'Clave de configuración',
  'add.linkDetected': 'Se detectó un enlace otpauth://: los campos de servicio y cuenta se rellenarán a partir de él.',
  'add.spacesFine': 'Los espacios y las minúsculas no son problema.',
  'add.submit': 'Añadir cuenta',
  'add.summary': { one: 'Se escaneó {count} código.', other: 'Se escanearon los {count} códigos.' },
  'add.summaryAdded': { one: '{count} cuenta añadida.', other: '{count} cuentas añadidas.' },
  'add.summarySkipped': {
    one: '{count} ya estaba en tu bóveda y se dejó como estaba.',
    other: '{count} ya estaban en tu bóveda y se dejaron como estaban.',
  },
  'error.badKey':
    'Una clave de configuración solo usa las letras A–Z y los números 2–7. Comprueba que se copió completa, sin nada de más.',
  'error.quickIsMigration':
    'Eso es un enlace de transferencia de Google Authenticator, para varias cuentas a la vez. Impórtalo en su lugar.',
  'error.keyTooShort': 'Es demasiado corto para ser una clave de configuración.',
  'error.fileTooLarge': 'Ese archivo es demasiado grande para leerlo.',
  'error.notSetupQr': 'Ese código QR no es un código de configuración 2FA.',
  'error.alreadyInVault': 'Esa cuenta ya está en tu bóveda.',
  'error.gaSkipPeriod': 'Google Authenticator solo guarda códigos de 30 segundos; este usa {period}.',
  'error.gaSkipDigits': 'Google Authenticator solo guarda códigos de 6 u 8 dígitos; este tiene {digits}.',
  'error.gaSkipSteam': 'Google Authenticator no puede generar códigos de Steam Guard.',

  // --- Escanear con la cámara ---------------------------------------------------
  'scan.progressBatch': 'Código {seen} de {total} escaneado: {accounts}. Muestra el siguiente código.',
  'scan.progress': '{accounts}.',
  'scan.added': { one: '{count} cuenta añadida', other: '{count} cuentas añadidas' },
  'scan.found': { one: '{count} cuenta encontrada', other: '{count} cuentas encontradas' },
  'scan.skippedVault': {
    one: '{count} ya estaba en tu bóveda.',
    other: '{count} ya estaban en tu bóveda.',
  },
  'scan.skippedScanned': { one: '{count} ya estaba escaneada.', other: '{count} ya estaban escaneadas.' },
  'camera.noCamera': 'Este navegador no da acceso a una cámara a la extensión.',
  'camera.preview': 'Vista previa de la cámara',
  'camera.failedHint':
    'Puedes añadir una cuenta igualmente subiendo una foto del código QR o escribiendo la clave de configuración.',
  'camera.hint':
    'Coloca el código QR dentro del marco. ¿Vienes de Google Authenticator? Abre su pantalla de exportación en el móvil y apunta la cámara hacia ella; si muestra varios códigos, enséñalos uno tras otro.',
  'camera.privacy':
    'La imagen se lee en este dispositivo y se descarta. No se graba nada y no se sube nada.',
  'camera.blocked':
    'Chrome bloqueó el acceso a la cámara. Permítelo para esta página o usa otra forma de añadir una cuenta.',
  'camera.blocked.firefox':
    'Firefox bloqueó el acceso a la cámara. Permítelo para esta página o usa otra forma de añadir una cuenta.',
  'camera.none': 'No se encontró ninguna cámara en este equipo.',
  'camera.busy': 'Otro programa está usando la cámara.',

  // --- Imágenes y códigos QR ----------------------------------------------------
  'image.unreadable': 'Ese archivo no se pudo leer como imagen.',
  'image.wrongType': 'Usa una imagen PNG, JPEG, WebP, GIF o BMP.',
  'image.tooBig': 'Esa imagen es muy grande. Prueba con una de menos de 8 MB.',
  'image.cannotPrepare': 'No se pudo preparar la imagen.',
  'image.wontCompress':
    'Esa imagen no se pudo comprimir lo suficiente. Un logotipo sencillo funciona mejor que una fotografía.',
  'image.wrongScreenshotType': 'Usa una captura PNG, JPEG, WebP, GIF o BMP.',
  'brand.account': 'Cuenta',
  'brand.unknown': 'Servicio desconocido',

  // --- Campo de servicio --------------------------------------------------------
  'service.label': 'Servicio',
  'service.matches': 'Servicios coincidentes',

  // --- Pasar una cuenta a otra app ----------------------------------------------
  'share.intro':
    'Escanéalo con Google Authenticator, Microsoft Authenticator, 1Password, Authy (cualquier app de autenticación) y generará los mismos códigos que esta.',
  'share.warning':
    'Cualquiera que vea o fotografíe este código puede generar tus códigos de {account} mientras exista la cuenta. Muéstralo solo a la app a la que te cambias.',
  'share.show': 'Mostrar código QR',
  'share.qrLabel': 'Código QR de configuración de {account}',
  'share.hidesIn': 'Escanéalo con la otra app. Se oculta en {seconds} s.',
  'share.linkCopied': 'Enlace copiado',
  'share.copyLink': 'Copiar enlace de configuración',
  'share.saveImage': 'Guardar como imagen',
  'share.linkWarning':
    'El enlace también contiene el secreto. Pégalo en la otra app y luego copia otra cosa encima.',
  'share.hideNow': 'Ocultar ahora',
  'shareCodes.modeLabel': 'Compartir o mover',
  'shareCodes.modeCodes': 'Enviar códigos',
  'shareCodes.modeMove': 'Mover a otra app',
  'shareCodes.noSecret': 'Esta cuenta no tiene clave de configuración, así que no genera códigos y no hay nada que compartir ni mover. Elimínala y vuelve a añadir la cuenta desde su código QR.',
  'shareCodes.intro': 'Crea un enlace que muestre los códigos de esta cuenta hasta que caduque, nunca la clave que los genera.',
  'shareCodes.lengthLabel': 'Válido durante',
  'shareCodes.min5': '5 minutos',
  'shareCodes.min15': '15 minutos',
  'shareCodes.hour': '1 hora',
  'shareCodes.cannotRecall': 'Un enlace no se puede retirar. Quien lo tenga puede usar los códigos hasta que caduque, así que envíalo solo a quien lo necesite.',
  'shareCodes.copy': 'Copiar enlace',
  'shareCodes.copied': 'Enlace copiado. Funciona hasta las {time}.',
  'shareCodes.counter': 'Los códigos por contador no se pueden enviar así: cada uno se gasta al generarse. Mueve la cuenta en su lugar.',

  // --- Obtener un código sin guardarlo ------------------------------------------
  'quick.label': 'Clave de configuración o enlace otpauth://',
  'quick.copyHint': 'Haz clic para copiar',
  'quick.current': 'Código actual',
  'quick.next': 'Siguiente: <code>{code}</code>',
  'quick.notSaved': 'No se guarda en ningún sitio. Cierra esto y la clave desaparece.',
  'quick.save': 'Guardarla como cuenta',
  'quick.settings': '{digits} dígitos · cada {period} s · {algorithm}',
  'quick.change': 'cambiar',
  'quick.digits': 'Dígitos',
  'quick.every': 'Cada',
  'quick.seconds': '{seconds} s',
  'quick.hash': 'Hash',

  // --- Ajustes: marco -----------------------------------------------------------
  'nav.accounts': 'Cuentas',
  'nav.backup': 'Copia de seguridad',
  'nav.security': 'Seguridad',
  'nav.about': 'Acerca de',
  'options.count': { one: '{count} cuenta', other: '{count} cuentas' },
  'options.sourceOnGithub': 'Código abierto en GitHub',
  // --- Una nueva clave de recuperación ------------------------------------------
  'sheet.once':
    'Es la única vez que se muestra esta clave. No se guarda en ningún sitio: si la pierdes, crea una nueva.',
  'sheet.print': 'Imprimir',
  'sheet.apart': 'Guárdala lejos de tu correo y nunca te la envíes por correo: con esta clave y tu dirección de correo, alguien puede poner una contraseña nueva y abrir tus códigos.',
  'sheet.apartProvider': 'Guárdala lejos de la cuenta de Google o GitHub con la que inicias sesión, y nunca la dejes en el correo ni en el almacenamiento de esa cuenta: con esta clave y esa cuenta, alguien puede abrir tus códigos.',
  'sheet.kept': 'Ya la he guardado',
  'sheet.checkHeading': 'Comprueba que la guardaste',
  'sheet.checkLead': 'Escribe dos grupos de la clave a partir de lo que guardaste. Los grupos son los bloques de cuatro entre los guiones, contados desde la izquierda.',
  'sheet.group': 'Grupo {position}',
  'sheet.check': 'Comprobar',
  'sheet.mismatch': 'Eso no es lo que dice tu clave. Vuelve a mirar lo que guardaste, o muestra la clave otra vez y guárdala ahora.',
  'sheet.showAgain': 'Mostrar la clave otra vez',
  'sheet.download': 'Descargar la hoja',
  'sheet.copy': 'Copiar',

  // --- Grupos -------------------------------------------------------------------
  'groups.title': 'Grupos',
  'groups.description':
    'Encabezados en la lista, para que una bóveda grande se lea de un vistazo. Las cuentas se meten en uno desde la pantalla Editar de cada cuenta.',
  'groups.new': 'Nuevo grupo',
  'groups.newPlaceholder': 'Trabajo',
  'groups.add': 'Añadir',
  'groups.none':
    'Todavía no hay grupos. Todo aparece en una sola lista, que es lo adecuado hasta que tenga tantas cuentas que convenga dividirla.',
  'groups.moveUp': 'Subir {name}',
  'groups.moveDown': 'Bajar {name}',
  'common.save': 'Guardar',
  'groups.count': { one: '{count} cuenta', other: '{count} cuentas' },
  'groups.removeNote': 'Las cuentas se quedan, sin grupo.',
  'common.remove': 'Quitar',
  'groups.rename': 'Renombrar',
  'groups.removeNamed': 'Quitar {name}',
  'groups.ungrouped': {
    one: '{count} cuenta no está en ningún grupo y aparece en «Sin grupo» al final de la lista.',
    other: '{count} cuentas no están en ningún grupo y aparecen en «Sin grupo» al final de la lista.',
  },

  // --- Acerca de ----------------------------------------------------------------
  'about.fact.sync.title': 'Tus secretos se cifran antes de que nada salga de este dispositivo',
  'about.fact.sync.body':
    'La sincronización es opcional. Con ella, al servidor solo llega texto cifrado, y no tiene forma de descifrarlo. Los códigos siempre se calculan en local. No hay telemetría.',
  'about.fact.local.title': 'Tus secretos nunca salen de este dispositivo',
  'about.fact.local.body':
    'En esta versión no hay servidor, ni cuenta, ni telemetría. Los códigos se calculan en local a partir de secretos guardados en una bóveda cifrada.',
  'about.fact.keys.title': 'Dos formas de guardar la clave, ambas AES-256-GCM',
  'about.fact.keys.body':
    'Tus cuentas se cifran con una clave de datos que a su vez está envuelta. Con contraseña maestra, la clave de envoltura sale de PBKDF2 con 600.000 iteraciones y solo existe en memoria mientras está desbloqueada. Sin ella, es una clave no exportable que guarda este navegador: ningún script puede leer sus bytes, aunque no está respaldada por hardware.',
  'about.fact.access.title': 'Sin acceso general a los sitios',
  'about.fact.access.body':
    'La extensión no pide permisos de host. Leer un código QR de una página, o rellenar un código en ella, usa activeTab: un permiso que Chrome concede solo para la pestaña desde la que abriste la extensión.',
  'about.fact.access.body.firefox':
    'La extensión no pide permisos de host. Leer un código QR de una página, o rellenar un código en ella, usa activeTab: un permiso que Firefox concede solo para la pestaña desde la que abriste la extensión.',
  'about.fact.standards.title': 'Estándares, no ataduras',
  'about.fact.standards.body':
    'TOTP RFC 6238 y HOTP RFC 4226, con importación y exportación otpauth://. Puedes irte a otra app cuando quieras y llevártelo todo.',
  'about.version': 'Versión {version}',
  'about.source': 'Código fuente',
  'about.viewOnGithub': 'Ver en GitHub',
  'about.securityModel': 'Modelo de seguridad',
  'about.securityModelDescription': 'Lo que garantiza la extensión, también frente al servidor de sincronización.',
  'about.readIt': 'Leerlo',
  'about.rate': 'Valorar Keyrook Authenticator',
  'about.rateWhere': 'En {store}. Lleva unos segundos.',
  'about.report': 'Informar de un problema o sugerir algo',
  'about.reportDescription':
    'En GitHub, donde cualquiera puede leerlo. Nunca pegues ahí una clave de configuración, un código ni una copia de seguridad.',
  'about.openIssue': 'Abrir una incidencia',
  'about.how': 'Cómo funciona',
  'about.logos.title': 'Logotipos de los servicios',
  'about.logos.description':
    'Los logotipos van incluidos en la extensión y nunca se descargan. Pedir un logotipo a la red le diría a quien responda en qué servicios usas la verificación en dos pasos.',
  'about.logos.body':
    '{count} servicios tienen un logotipo real. Ilustraciones de <simple>Simple Icons</simple> (CC0 1.0), LobeHub Icons, SVG Logos, CoreUI Brands, Arcticons y <fa>Font Awesome Free</fa> (iconos, CC BY 4.0). Todos los nombres de productos y logotipos pertenecen a sus propietarios y se usan solo para identificar el servicio de una cuenta. Un servicio sin logotipo en esas colecciones recibe un mosaico con su inicial.',
  'about.shortcut.change': 'Cámbialo en chrome://extensions/shortcuts.',
  'about.shortcut.change.firefox': 'Cámbialo en about:addons.',
  // --- Ajustes: cuentas ---------------------------------------------------------
  'accounts.title': 'Cuentas',
  'accounts.description':
    'Todo lo que guarda esta bóveda. Los códigos se generan en este dispositivo, nunca en un servidor.',
  'accounts.empty': 'Todavía no hay cuentas. Añade una para empezar.',
  'accounts.digits': '{type} {digits} dígitos',
  'accounts.period': ' · {seconds} s',
  'accounts.counter': ' · contador {counter}',
  'accounts.steam': 'Steam Guard',
  'accounts.moveNamed': 'Compartir o mover {name}',
  'accounts.edit': 'Editar',
  'common.delete': 'Eliminar',
  'accounts.deleteNamed': 'Eliminar {name}',
  'accounts.deleted.title': 'Eliminadas recientemente',
  'accounts.deleted.description':
    'Se conservan para que los demás dispositivos se enteren de la eliminación cuando actives la sincronización. Restaura lo que hayas quitado por error.',
  'accounts.deleted.on': 'Eliminada el {date}',
  'accounts.restore': 'Restaurar',
  'common.close': 'Cerrar',
  'editor.title': 'Editar cuenta',
  'editor.picture': 'Imagen',
  'editor.pictureOwn': 'Tu propia imagen, en lugar del logotipo del servicio.',
  'editor.pictureNone': 'Elige una para servicios sin logotipo aquí o para distinguir dos cuentas.',
  'editor.replace': 'Reemplazar',
  'editor.choose': 'Elegir imagen…',
  'editor.websites': 'Sitios web',
  'editor.websitesHint': 'Separados por comas. Sirve para sugerir esta cuenta en los sitios correspondientes.',
  'editor.note': 'Nota',
  'editor.group': 'Grupo',
  'editor.ungrouped': 'Sin grupo',
  'editor.noGroups': 'Crea primero un grupo en Cuentas.',
  'editor.setupKey': 'Clave de configuración',
  'editor.setupKeyHint': 'El secreto de esta cuenta. Cualquiera que lo vea puede generar tus códigos.',
  'editor.hide': 'Ocultar',
  'editor.reveal': 'Mostrar',
  'editor.revealWarning':
    'Muéstralo solo en una pantalla que no vea nadie más. Copiar este enlace en otra app de autenticación es la forma de pasar la cuenta a un móvil.',
  'editor.save': 'Guardar cambios',

  // --- Ajustes: importar --------------------------------------------------------
  'import.incomplete': {
    one: 'Estas capturas contienen {seen} de los {total} códigos de esta exportación de Google Authenticator, así que no están las cuentas del que falta. Elige todas las capturas de la exportación a la vez para traerlo todo.',
    other: 'Estas capturas contienen {seen} de los {total} códigos de esta exportación de Google Authenticator, así que no están las cuentas de los otros {count}. Elige todas las capturas de la exportación a la vez para traerlo todo.',
  },
  'import.oneOrScreenshots': 'Elige un archivo de copia de seguridad, o una o varias capturas de códigos QR.',
  'import.noQrInThis': 'No se encontró ningún código QR en esta imagen.',
  'import.noAccountsInImages': 'Esas imágenes no contenían ninguna cuenta.',
  'import.tooLarge': 'Ese archivo es demasiado grande para ser una copia de seguridad.',
  'import.noAccountsInFile': 'Ese archivo no contenía ninguna cuenta.',
  'import.description':
    'Trae cuentas desde un archivo de copia de seguridad, desde la exportación de otra app de autenticación (escaneada con la cámara o elegida como capturas) o pegando enlaces otpauth://.',
  'import.stopAndReview': 'Detener y revisar {count}',
  'import.noNativeReader':
    'Chrome no tiene lector de QR integrado en este equipo, así que un código grande, como una exportación de Google Authenticator, a menudo no se escanea con la cámara. Si el tuyo no lo hace, haz una captura de cada código en el móvil y elígelas todas con «Elegir archivos».',
  'import.noNativeReader.firefox':
    'Firefox no tiene lector de QR integrado en este equipo, así que un código grande, como una exportación de Google Authenticator, a menudo no se escanea con la cámara. Si el tuyo no lo hace, haz una captura de cada código en el móvil y elígelas todas con «Elegir archivos».',
  'import.encrypted': 'Esta copia de seguridad está cifrada. Introduce la contraseña con la que se creó.',
  'import.backupPassword': 'Contraseña de la copia de seguridad',
  'import.open': 'Abrir copia de seguridad',
  'import.found': { one: 'Se encontró {count} cuenta nueva', other: 'Se encontraron {count} cuentas nuevas' },
  'import.skipping': ', se omiten {count} que ya están en tu bóveda',
  'import.unreadable': ' y {count} no se pudieron leer',
  'import.foundEnd': '.',
  'import.showFailed': 'Mostrar las líneas que fallaron',
  'import.import': 'Importar {count}',
  'import.scan': 'Escanear con la cámara',
  'import.choose': 'Elegir archivos…',
  'import.paste': '…o pega enlaces otpauth://, uno por línea',
  'import.read': 'Leer enlaces',

  // --- Pasarlo todo a otra app --------------------------------------------------
  'dest.google.steps':
    'En Google Authenticator: menú → Transferir cuentas → Importar cuentas, y escanea los códigos en orden.',
  'dest.microsoft.steps':
    'Microsoft Authenticator no puede importar de otra app, así que las cuentas van una tras otra. En ella: + → Otra cuenta, escanea y luego Siguiente aquí.',
  'dest.apple.steps':
    'Contraseñas solo importa códigos de uno en uno. En la app Contraseñas: Códigos → +, escanea y luego Siguiente aquí.',
  'dest.authy.steps':
    'Authy no puede importar de otra app, así que las cuentas van una tras otra. En Authy: + → Escanear código QR, y luego Siguiente aquí.',
  'dest.1password.steps':
    '1Password añade los códigos inicio de sesión a inicio de sesión. Abre o crea el inicio de sesión → Editar → añade una contraseña de un solo uso → escanea, y luego Siguiente aquí. En un ordenador puede leer el código directamente de esta pantalla.',
  'dest.bitwarden.steps':
    'Gestor de contraseñas: Importar datos → formato de archivo «Bitwarden (json)» → elige el archivo. App Bitwarden Authenticator: importa desde Google Authenticator y escanea los códigos de transferencia.',
  'dest.proton.steps':
    'En Proton Authenticator, importa desde Google Authenticator y escanea los códigos de transferencia, o importa desde Aegis y elige el archivo.',
  'dest.ente.steps':
    'En Ente Auth, importa códigos desde Google Authenticator y escanea los códigos de transferencia, o elige «Texto sin formato» y el archivo .txt.',
  'dest.aegis.steps': 'En Aegis: Importar y exportar → Importar desde archivo → Aegis, y elige el archivo.',
  'dest.2fas.steps':
    'En 2FAS, importa desde Google Authenticator y escanea los códigos de transferencia, o importa desde Aegis y elige el archivo.',
  'dest.other.steps':
    'Toda app de autenticación escanea un código de configuración, así que uno tras otro siempre funciona. Muchas también importan los códigos de transferencia de Google Authenticator o un archivo de enlaces otpauth://: busca una opción de importar.',
  'dest.other.name': 'Otra app',

  // --- Ajustes: exportar --------------------------------------------------------
  'export.what': 'Qué exportar',
  'export.all': { one: 'La {count} cuenta.', other: 'Las {count} cuentas.' },
  'export.someChosen': '{chosen} de {total} elegidas.',
  'export.choose': 'Elegir…',
  'export.chipAll': 'Todas',
  'export.chipNone': 'Ninguna',
  'export.encrypted.description':
    'Un archivo protegido con una contraseña que eliges aquí. Guarda una copia en un lugar seguro: si este dispositivo se estropea, este archivo es cómo recuperas tus cuentas.',
  'export.encrypted.hint': 'Al menos 8 caracteres. Puede ser distinta de tu contraseña maestra.',
  'export.encrypted.download': 'Descargar copia de seguridad cifrada ({count})',
  'export.move.title': 'Pasar a otra app',
  'export.move.description':
    'Exportaciones legibles, para cambiar a otra app de autenticación o guardar en papel. A diferencia de una copia de seguridad, ninguna está cifrada.',
  'export.move.danger':
    'Contienen tus secretos 2FA en claro. Cualquiera que vea los códigos o abra los archivos puede generar tus códigos mientras existan las cuentas. Borra los archivos y destruye el papel cuando termines.',
  'export.move.understood': 'Entiendo que no están cifradas.',
  'common.continue': 'Continuar',
  'export.move.which': '¿A qué app te cambias?',
  'export.filesAndPaper': 'Archivos y papel:',
  'export.aegis': 'Aegis .json',
  'export.bitwarden': 'Bitwarden .json',
  'export.text': 'otpauth .txt',
  'export.print': 'Imprimir hoja',
  'export.closesIn': {
    one: '{accounts}. Se vuelve a cerrar en {count} minuto.',
    other: '{accounts}. Se vuelve a cerrar en {count} minutos.',
  },
  'export.closesSoon': '{accounts}. Se vuelve a cerrar pronto.',
  'export.accounts': { one: '{count} cuenta', other: '{count} cuentas' },
  'export.closeNow': 'Cerrar ahora',
  'export.method.transfer': 'Mostrar códigos de transferencia',
  'export.method.oneByOne': 'Escanear una a una',
  'export.method.aegis': 'Descargar archivo de Aegis',
  'export.method.bitwarden': 'Descargar archivo de Bitwarden',
  'export.method.text': 'Descargar archivo de texto',
  'export.allAtOnce': 'Todas a la vez',
  'export.oneAtATime': 'Una a una',
  'export.transfer.label': 'Códigos de transferencia para {app}',
  'export.transfer.title': 'Códigos de transferencia de Google Authenticator',
  'export.moveTo': 'Pasar a {app}',
  'export.transfer.none': 'Ninguna de las cuentas elegidas puede ir a Google Authenticator.',
  'export.transfer.codeLabel': 'Código de transferencia {index} de {total}',
  'export.previous': 'Anterior',
  'export.next': 'Siguiente',
  'export.transfer.code': 'Código {index} de {total}',
  'export.transfer.oneHolds': {
    one: 'Un solo código contiene la {count} cuenta.',
    other: 'Un solo código contiene las {count} cuentas.',
  },
  'export.transfer.notIncluded': 'No incluidas: pásalas una a una en su lugar:',
  'export.oneByOne.label': 'Códigos de configuración para {app}, uno a uno',
  'export.oneByOne.title': 'Una cuenta cada vez',
  'export.oneByOne.progress': 'Cuentas mostradas',
  'export.oneByOne.position': 'Cuenta {index} de {total}',
  'export.oneByOne.keys': '→ o Espacio para la siguiente, Esc para parar',
  'export.steamRefused': '{app} no puede generar códigos de Steam Guard, así que no aceptará esta cuenta.',
  'export.print.label': 'Códigos QR para imprimir o escanear',
  'export.print.title': 'Keyrook Authenticator: códigos de configuración',
  'export.print.body':
    '{accounts}, {date}. Cada código configura la cuenta en cualquier app de autenticación. Quien tenga esto puede generar tus códigos: guárdalo bajo llave.',
  'export.print.print': 'Imprimir o guardar como PDF',

  // --- Ajustes: seguridad, arriba -----------------------------------------------
  'security.locking': 'Bloqueo',
  'security.lockAfter': 'Bloquear tras inactividad',
  'security.lockAfter.passphrase':
    'La clave de descifrado se borra de la memoria. Volverás a necesitar tu contraseña maestra.',
  'security.lockAfter.device':
    'Solo se aplica con contraseña maestra: una bóveda con clave de dispositivo no tiene nada que desbloquear.',
  'security.autoLock': 'Tiempo de bloqueo automático',
  'security.minutes': { one: '{count} minuto', other: '{count} minutos' },
  'security.hour': '1 hora',
  'security.never': 'Nunca',
  'security.needsPassword': 'Necesita contraseña maestra',
  'security.blur': 'Difuminar los códigos hasta pasar el ratón',
  'security.blurDescription': 'Mantiene los códigos fuera de la pantalla al compartirla.',
  'security.blurToggle': 'Difuminar códigos',
  'security.autofill': 'Autocompletar',
  'security.autofillRow': 'Ofrecer rellenar códigos en páginas web',
  'security.appearance': 'Apariencia',
  'security.theme': 'Tema',
  'security.theme.system': 'Igual que el sistema',
  'security.theme.light': 'Claro',
  'security.theme.dark': 'Oscuro',
  'security.sortBy': 'Ordenar cuentas por',
  'security.sortOrder': 'Orden',
  'security.sort.added': 'Orden de llegada',
  'security.sort.name': 'Nombre',
  'security.language': 'Idioma',
  'security.languageBrowser': 'Idioma del navegador ({language})',
  // --- Ajustes: cómo se protege la bóveda ---------------------------------------
  'protect.msg.removedSignedIn':
    'Este dispositivo ahora se abre sin contraseña. La contraseña de tu cuenta no ha cambiado.',
  'protect.msg.removed': 'Contraseña maestra eliminada. Esta bóveda ahora se desbloquea sola en este dispositivo.',
  'protect.msg.setSignedIn': 'Este dispositivo ahora se bloquea con la contraseña de tu cuenta.',
  'protect.msg.set': 'Contraseña maestra establecida. Se te pedirá cuando la bóveda se bloquee.',
  'protect.msg.changedSignedIn':
    'Contraseña cambiada, para esta bóveda y tu cuenta. Tus otros dispositivos te pedirán que vuelvas a iniciar sesión con ella.',
  'protect.msg.changed': 'Contraseña maestra cambiada.',
  'protect.state.accountPassword': 'Se bloquea con la contraseña de tu cuenta',
  'protect.state.master': 'Contraseña maestra',
  'protect.state.device': 'Clave del dispositivo (sin contraseña)',
  'protect.lockWithAccount': 'Bloquear con la contraseña de tu cuenta',
  'protect.addMaster': 'Añadir una contraseña maestra',
  'protect.changePassword': 'Cambiar contraseña',
  'protect.note.passphrase':
    'También es la contraseña de tu cuenta de sincronización. Cambiarla aquí la cambia allí, y tus otros dispositivos te pedirán que vuelvas a iniciar sesión.',
  'protect.note.device':
    'Tu cuenta de sincronización tiene su propia contraseña, que este dispositivo no pide. La necesitas en un dispositivo nuevo y para cambiar la cuenta o su clave de recuperación.',
  'protect.removeWarning':
    'La bóveda sigue cifrada, pero se desbloqueará sola siempre que este perfil del navegador esté abierto. Cualquiera que use este equipo podrá ver tus códigos.',
  'protect.removeWarningSignedIn':
    ' Tu cuenta conserva su contraseña: la seguirás necesitando en un dispositivo nuevo.',
  'protect.currentPassword': 'Contraseña actual',
  'protect.currentMaster': 'Contraseña maestra actual',
  'protect.accountPassword': 'Contraseña de la cuenta',
  'protect.accountPasswordHint':
    'La contraseña con la que inicias sesión en la sincronización. Este dispositivo la pedirá cuando se bloquee.',
  'protect.newPassword': 'Nueva contraseña',
  'protect.hint12': 'Al menos 12 caracteres variados, o cuatro o cinco palabras sin relación entre sí.',
  'protect.confirmNew': 'Confirmar nueva contraseña',
  'protect.removePassword': 'Quitar contraseña',
  'protect.lockWithIt': 'Bloquear con ella',
  'protect.setPassword': 'Establecer contraseña',
  'danger.title': 'Eliminar esta bóveda',
  'danger.description':
    'Quita todas las cuentas y la bóveda cifrada de este dispositivo. No se puede deshacer y no hay copia en ningún otro sitio.',
  'danger.open': 'Eliminar esta bóveda…',
  'danger.warning':
    'Asegúrate primero de que tienes otra forma de entrar en cada cuenta: un archivo de copia de seguridad, códigos de recuperación o las mismas cuentas en tu móvil.',
  'common.typeToConfirm': 'Escribe {word} para confirmar',
  'danger.confirm': 'Eliminarlo todo',

  // --- Ajustes: clave de recuperación -------------------------------------------
  'kit.title': 'Clave de recuperación',
  'kit.provider':
    'Tu cuenta no tiene contraseña. Una clave de recuperación es la forma de volver si se pierden todos los dispositivos con la sesión iniciada: deja entrar a un dispositivo nuevo en tu cuenta sin que otro tenga que aprobarlo. {provider} no puede hacerlo por ti.',
  'kit.signedIn':
    'Nadie puede restablecer tu contraseña por ti, ni siquiera nosotros. Una clave de recuperación es la única forma de volver si la olvidas: abre esta bóveda, tus otros dispositivos y tu cuenta en uno nuevo.',
  'kit.passphrase':
    'Nadie puede restablecer tu contraseña maestra, ni siquiera nosotros. Eso es lo que impide que otros abran tu bóveda, y también por qué una clave de recuperación es la única forma de volver si la olvidas.',
  'kit.device':
    'Esta bóveda se desbloquea con una clave que guarda tu navegador. Si esa clave desaparece (datos de navegación borrados, un perfil nuevo, una reinstalación), solo una clave de recuperación podrá abrirla.',
  'kit.none': 'Todavía no hay clave de recuperación',
  'kit.vaultOnly': 'Abre esta bóveda, pero no tu cuenta',
  'kit.issued': 'Se ha creado una clave de recuperación',
  'kit.issueNew': 'Crear una nueva',
  'kit.create': 'Crear una clave de recuperación',
  'kit.beforeSignIn':
    'Esta clave se creó antes de que iniciaras sesión, así que tu cuenta no la tiene. Sigue abriendo esta bóveda aquí, pero no en un dispositivo nuevo. Crea una nueva que cubra ambas cosas.',
  'kit.replaces':
    'Crear una clave nueva hace que la anterior deje de funcionar, así que puedes tirar una hoja impresa antigua en cuanto la hayas sustituido.',
  'kit.replacesSignedIn':
    'Crear una clave nueva hace que la anterior deje de funcionar, aquí y en tus otros dispositivos, así que puedes tirar una hoja impresa antigua en cuanto la hayas sustituido.',
  'kit.withoutProvider':
    'Sin ella, perder todos los dispositivos con la sesión iniciada en tu cuenta significa perder para siempre todas las cuentas de esta bóveda.',
  'kit.withoutPassword':
    'Sin ella, olvidar tu contraseña significa perder para siempre todas las cuentas de esta bóveda.',
  'kit.withoutDevice':
    'Sin ella, perder la clave que guarda este navegador significa perder para siempre todas las cuentas de esta bóveda.',
  'kit.noSupport': 'Ninguna solicitud de soporte puede deshacerlo.',
  'kit.removeProvider':
    'Si la quitas, solo un dispositivo que ya tenga la sesión iniciada podrá dejar entrar a uno nuevo en tu cuenta.',
  'kit.removePassword': 'Si la quitas, tu contraseña será la única forma de entrar.',
  'kit.removePasswordSignedIn':
    'Si la quitas, tu contraseña será la única forma de entrar: en este dispositivo, en tus otros dispositivos y en tu cuenta.',
  'kit.reauth':
    'Una clave de recuperación puede dejar entrar a un dispositivo en tu cuenta, así que {provider} te pide que inicies sesión una vez más antes.',
  'kit.passwordHint': 'Una clave de recuperación puede restablecer tu cuenta, así que cambiarla requiere tu contraseña.',
  'kit.removeConfirm': 'Quitar la clave de recuperación',
  'kit.createConfirm': 'Crear la clave',

  // --- Ajustes: cuenta y sincronización -----------------------------------------
  'account.title': 'Cuenta',
  'facts.stored': 'Cuentas guardadas',
  'facts.noLimit': 'Sin límite',
  'facts.encryption': 'Cifrado',
  'facts.autofill': 'Autocompletar y escanear QR',
  'facts.included': 'Incluido',
  'facts.backup': 'Copia de seguridad cifrada',
  'facts.sync': 'Sincronización entre dispositivos',
  'facts.needsAccount': 'Requiere una cuenta',
  'facts.notYet': 'Aún no disponible',
  'facts.withoutAccount': 'Sin cuenta, en este dispositivo',
  'facts.title': 'Lo que te da una bóveda local gratuita',
  'facts.description':
    'Sin cuenta, sin correo, sin servidor, y sin límites en lo que importa para la seguridad.',
  'account.localOnly': 'Solo local: sin sesión iniciada',
  'account.noServer':
    'Esta versión se compiló sin servidor de sincronización, así que nada de lo que añadas aquí sale de tu equipo.',
  'account.signedInWith': 'Sesión iniciada con {provider} · ',
  'account.lastSynced': 'Última sincronización a las {time}',
  'account.notSynced': 'Todavía sin sincronizar',
  'account.every5': ' · se sincroniza cada 5 minutos',
  'account.syncNow': 'Sincronizar ahora',
  'account.signOut': 'Cerrar sesión',
  'account.noKitProvider':
    'Tu cuenta no tiene clave de recuperación. Si se pierden todos los dispositivos con la sesión iniciada, nada podrá recuperar tus cuentas, ni nosotros ni {provider}.',
  'account.noKit':
    'Tu cuenta no tiene clave de recuperación. Si olvidas tu contraseña y pierdes este dispositivo, nada podrá recuperar tus cuentas, ni nosotros ni nadie.',
  'account.createUnderSecurity': 'Créala en Seguridad',
  'summary.sentReceived': '{sent} enviadas, {received} recibidas',
  'summary.conflicts': ', se conservó la versión de este dispositivo en {count}',
  'summary.overLimit': ', {count} no cabían (una cuenta admite hasta 10.000) y se quedaron en este dispositivo',
  'summary.end': '.',
  'summary.deleted': {
    one: ' {count} cuenta se eliminó en otro dispositivo: puedes restaurarla en Cuentas.',
    other: ' {count} cuentas se eliminaron en otro dispositivo: puedes restaurarlas en Cuentas.',
  },
  'summary.rejected': {
    one: ' {count} registro no se pudo descifrar y se ignoró. Si sigue pasando, algo va mal con la copia guardada.',
    other: ' {count} registros no se pudieron descifrar y se ignoraron. Si sigue pasando, algo va mal con la copia guardada.',
  },
  'account.signOutNote':
    'Cerrar sesión quita tus códigos de este navegador. Se quedan en tu cuenta de Keyrook: vuelve a iniciar sesión para recuperarlos.',
  'accountPage.title': 'Tu cuenta de Keyrook',
  'accountPage.body': 'Su dirección, su contraseña, su clave de recuperación, empezar de cero y eliminarla están en la página de la cuenta, para todas las apps de Keyrook a la vez.',
  'accountPage.bodyNoRoot': 'Su dirección, su contraseña y eliminarla están en la página de la cuenta. Su clave de recuperación se crea aquí, en Seguridad, hasta que otra app de Keyrook use la cuenta.',
  'accountPage.bodyProvider': 'Su dirección, su clave de recuperación, empezar de cero y eliminarla están en la página de la cuenta, para todas las apps de Keyrook a la vez.',
  'accountPage.bodyNoRootProvider': 'Su dirección y eliminarla están en la página de la cuenta. Su clave de recuperación se crea aquí, en Seguridad, hasta que otra app de Keyrook use la cuenta.',
  'accountPage.address': 'Dirección de correo',
  'accountPage.changeAddress': 'Cambiar dirección',
  'accountPage.activity': 'Actividad reciente',
  'accountPage.activityBody': 'Los inicios de sesión y cambios en tu cuenta de los últimos 90 días, con el dispositivo, la app y el país, en la página de la cuenta.',
  'accountPage.data': 'Datos de la cuenta',
  'accountPage.dataBody': 'Descarga desde la página de la cuenta lo que el servidor de Keyrook guarda sobre tu cuenta. Tus códigos no están incluidos: el servidor solo los guarda cifrados. Expórtalos en Copia de seguridad.',
  'sheetCheck.lead': 'Escribe una vez la clave de recuperación que guardaste, para que esta app sepa que puede recuperar tus códigos. Se comprueba en este dispositivo y no se envía a ningún sitio.',
  'sheetCheck.submit': 'Comprobarla',
  'sheetCheck.lost': '¿La perdiste o nunca tuviste una? Crea una nueva en la página de la cuenta.',
  'accountPage.noSheetYet': 'Nada indica todavía que tu clave de recuperación proteja Keyrook Authenticator. Sin ella, una contraseña olvidada puede costarte tus códigos. Escríbela una vez en Seguridad, o crea una nueva en la página de la cuenta.',
  'account.checkUnderSecurity': 'Comprobarla en Seguridad',
  'accountPage.open': 'Abrir la página de la cuenta',
  'accountPage.recoveryKey': 'La clave de recuperación de una bóveda con sesión iniciada es la de la cuenta de Keyrook. Se crea y se cambia en la página de la cuenta.',
  'accountPage.sheetProtects': 'La clave de recuperación de la cuenta protege Keyrook Authenticator',
  'accountPage.sheetUnknown': 'Aún no se sabe si protege Keyrook Authenticator',
  'secondStep.title': 'Un paso más',
  'secondStep.lead': 'Tu cuenta de Keyrook pide un segundo paso. Introduce el código de 6 dígitos que muestra para ella tu app de autenticación.',
  'secondStep.field': 'Código o clave de recuperación',
  'secondStep.hint': '¿Perdiste esa app? Introduce en su lugar la clave de recuperación de tu cuenta.',
  'secondStep.passkey': 'Usar una llave de acceso',
  'secondStep.where': 'El inicio de sesión en dos pasos se activa y desactiva en account.keyrook.com.',
  'secondStep.ownerLead': 'Tu cuenta también pide un segundo paso para esto: el código de tu app de autenticación o tu clave de recuperación.',
  'secondStep.nextCode': 'Cada código sirve una sola vez. Si acabas de iniciar sesión con uno, espera a que tu app muestre el siguiente.',
  'secondStepTip.title': 'Inicio de sesión en dos pasos',
  'secondStepTip.suggest': 'Pide también un código cada vez que esta cuenta inicie sesión en otro dispositivo. Actívalo en account.keyrook.com y guarda el código aquí: en esa página, abre Keyrook Authenticator y elige «{scan}».',
  'secondStepTip.kept': 'El código de inicio de sesión de esta misma cuenta se guarda aquí, en cada dispositivo con la sesión iniciada.',
  'secondStepTip.warning': 'Si pierdes todos los dispositivos que lo guardan, inicia sesión con tu clave de recuperación en lugar del código. Guarda la clave de recuperación en otro lugar.',
  'secondStepTip.open': 'Activarlo',
  'signin.providerHasPassword': '{provider} confirmó que eres tú, y {email} también tiene contraseña. Introdúcela para abrir aquí tus códigos.',
  'provider.addOnPage': 'Para iniciar sesión también con Google o GitHub, inicia sesión en la página de la cuenta con tu contraseña y añádelo allí.',
  'startOver.title': 'Tu cuenta de Keyrook se reiniciará el {date}',
  'startOver.lead': 'Alguien en «{device}» lo pidió el {date}, con el código que te enviamos por correo: una contraseña nueva y claves nuevas, y tus apps empezarían vacías.',
  'startOver.ifYou': 'Si fuiste tú, no tienes que hacer nada. Si no, cancélalo ahora y después cambia la contraseña de tu correo: quien lo pidió puede leer tu correo.',
  'startOver.cancel': 'No fui yo — cancelar',
  'kept.title': 'Guardado de antes de que la cuenta empezara de cero',
  'kept.body': 'Cuando esta cuenta empezó de cero, lo que Keyrook Authenticator tenía en ella se guardó hasta el {date}. Recupéralo con la contraseña que tenía entonces la cuenta, o con su clave de recuperación de entonces.',
  'kept.password': 'Contraseña de entonces',
  'kept.recoveryKey': 'Clave de recuperación de entonces',
  'kept.usePassword': 'Usar la contraseña de entonces',
  'kept.useRecoveryKey': 'Usar la clave de recuperación de entonces',
  'kept.bring': 'Recuperarlo',
  'kept.done': 'Ya está de vuelta en esta bóveda y en camino a tus otros dispositivos.',
  'error.keys.awaitingConfirmation': 'Otra app de Keyrook reemplazó las claves de esta cuenta, y la de Keyrook Authenticator aún no se ha actualizado. Abre la página de la cuenta para comprobarlas y vuelve a iniciar sesión.',
  'password.changedBoth':
    'Contraseña cambiada, para tu cuenta y esta bóveda. Tus otros dispositivos te pedirán que vuelvas a iniciar sesión con ella.',
  'password.changedAccount':
    'Contraseña de la cuenta cambiada. Tus otros dispositivos te pedirán que vuelvas a iniciar sesión con ella.',
  'password.title': 'Contraseña',
  'password.row': 'Contraseña de la cuenta',
  'password.rowDescription':
    'Con ella inicias sesión en un dispositivo nuevo. Nadie puede restablecerla por ti: guarda bien tu clave de recuperación.',
  'password.change': 'Cambiar contraseña…',
  'password.formTitle': 'Cambiar la contraseña de tu cuenta',
  'devices.title': 'Dispositivos con sesión iniciada',
  'devices.onAccountPage':
    'Consulta todos los dispositivos con sesión iniciada en tu cuenta, y cierra la sesión de uno o quítalo, en la página de la cuenta.',
  'removed.kept': 'Los códigos añadidos o cambiados aquí que no habían llegado a la cuenta siguen aquí.',
  'delete.row': 'Eliminar tu cuenta',
  'delete.rowDescription':
    'Quita todas las copias cifradas que guarda el servidor. Este dispositivo conserva su bóveda tal cual; los demás dispositivos dejan de sincronizarse.',
  'delete.open': 'Eliminar cuenta…',
  'delete.warning':
    'No se puede deshacer. Si después de esto tus cuentas solo quedan en este dispositivo, consérvalo, o exporta antes una copia de seguridad.',
  'delete.reauth': '{provider} te pide que inicies sesión una vez más antes de eliminar nada.',
  'delete.confirm': 'Eliminar la cuenta',

  // --- Iniciar sesión: la primera tarjeta ---------------------------------------
  'intro.benefit1': 'Los mismos códigos en cada dispositivo en el que inicies sesión.',
  'intro.benefit2': 'Un portátil perdido o roto no es una bóveda perdida.',
  'intro.benefit3': 'Gratis y opcional: todo sigue funcionando en este dispositivo sin ella.',
  'intro.title': 'Sincroniza tu bóveda',
  'intro.subtitle':
    'Se cifra en este dispositivo antes de salir. El servidor guarda lo que no puede leer, y nosotros tampoco.',
  'intro.signedOutProvider':
    'Se cerró la sesión de {email} en este dispositivo: se quitó desde otro. Continúa con {provider} para volver a iniciar sesión.',
  'intro.orEmail': 'o con correo',
  'intro.create': 'Crear una cuenta',
  'intro.signIn': 'Iniciar sesión',
  'intro.source': 'Código abierto: mira cómo se cifran tus códigos',

  // --- Iniciar sesión: formularios con correo -----------------------------------
  'form.email': 'Correo',
  'form.emailPlaceholder': 'tu@ejemplo.com',
  'create.checkEmail': 'Revisa tu correo',
  'create.codeSent': 'Hemos enviado un código de seis dígitos a <b>{email}</b>. Sirve una vez, durante 15 minutos.',
  'create.code': 'Código',
  'create.spam':
    '¿No está en tu bandeja de entrada? Busca en <b>Spam</b> un mensaje de <b>Keyrook</b> y márcalo como <b>No es spam</b>.',
  'create.submit': 'Crear cuenta',
  'create.existing':
    'Si esta dirección ya tiene una cuenta, el correo te lo dirá: entonces inicia sesión en ella.',
  'create.stillNothing': '¿Sigue sin llegar?',
  'create.resendIn': 'Enviar un código nuevo en {seconds} s',
  'create.resend': 'Enviar un código nuevo',
  'create.wrongAddress': '. ¿Dirección equivocada?',
  'create.changeIt': 'Cambiarla',
  'create.title': 'Crea tu cuenta',
  'create.choosing': 'Necesitarás esta contraseña en un dispositivo nuevo. Este seguirá abriéndose sin ella.',
  'create.sharing': 'Tu contraseña maestra pasa a ser también la de tu cuenta: sigue siendo solo una.',
  'create.password': 'Contraseña',
  'create.master': 'Contraseña maestra',
  'create.next':
    'Después te enviamos un código para confirmar la dirección, y guardas una clave de recuperación: la única forma de volver si olvidas la contraseña.',
  'create.agree': 'Crear una cuenta implica aceptar la <link>política de privacidad</link>.',
  'create.haveAccount': '¿Ya tienes una cuenta?',
  'signin.subtitle': 'Los códigos que ya hay en este dispositivo se añaden a tu cuenta.',
  'signin.signedOut':
    'Se cerró la sesión de {email} en este dispositivo: se cambió la contraseña o se quitó el dispositivo desde otro. Vuelve a iniciar sesión para seguir sincronizando.',
  'signin.forgot': '¿Has olvidado la contraseña?',
  'signin.locksWithAccount': 'A partir de ahora, este dispositivo se bloqueará con la contraseña de tu cuenta.',
  'signin.keepsOpening': 'Este dispositivo seguirá abriéndose sin contraseña.',
  'signin.newHere': '¿Eres nuevo?',
  'recoverAccount.title': 'Recupera tu cuenta',
  'recoverAccount.subtitle':
    'Usa la clave de recuperación que guardaste al crearla y elige una contraseña nueva.',
  'recoverAccount.keyHint': '32 caracteres de tu hoja impresa. Los espacios y guiones dan igual.',
  'recoverAccount.submit': 'Recuperar e iniciar sesión',
  'recoverAccount.elsewhere': 'Si otra app de Keyrook también usa esta cuenta, su contraseña se restablece en la página de la cuenta.',
  'recoverAccount.note':
    'Se cierra la sesión en todos los dispositivos de la cuenta y se les pide la contraseña nueva. Tu clave de recuperación sigue funcionando.',

  // --- Iniciar sesión: después --------------------------------------------------
  'ready.empty': 'Tu cuenta está lista.',
  'ready.all': {
    one: 'Tu cuenta está lista, y la cuenta de este dispositivo tiene copia en ella.',
    other: 'Tu cuenta está lista, y las {count} cuentas de este dispositivo tienen copia en ella.',
  },
  'ready.some':
    'Tu cuenta está lista. {done} de {total} cuentas tienen copia por ahora; el resto llegará en la próxima sincronización.',
  'fresh.title': 'Guarda tu clave de recuperación',
  'fresh.provider':
    'Si se pierden todos los dispositivos con la sesión iniciada en tu cuenta, esta clave es la única forma de volver: {provider} no puede restaurar tu bóveda, y nosotros tampoco.',
  'fresh.password':
    'Si olvidas tu contraseña, esta clave es la única forma de volver: nadie puede restablecerla por ti, ni siquiera nosotros.',
  'welcome.fromAccount': '{count} de tu cuenta',
  'welcome.fromDevice': '{count} añadidas desde este dispositivo',
  'welcome.inSync': 'Ya está sincronizado.',
  'welcome.nothing': 'Todavía no hay nada.',
  'welcome.failed': 'Sesión iniciada: la primera sincronización no terminó',
  'welcome.back': 'Has vuelto a entrar',
  'welcome.signedIn': 'Has iniciado sesión',
  'welcome.nothingLost':
    'No se ha perdido nada: tus códigos llegarán con la próxima sincronización. Inténtalo de nuevo ahora, o se hará sola en menos de cinco minutos.',
  'welcome.onDevice': { one: 'cuenta en este dispositivo', other: 'cuentas en este dispositivo' },
  'welcome.uploading': {
    one: ' · {count} aún se está subiendo y llegará en la próxima sincronización',
    other: ' · {count} aún se están subiendo y llegarán en la próxima sincronización',
  },
  'welcome.othersSignedOut': 'Se cerró la sesión en todos los demás dispositivos, que pedirán la contraseña nueva.',
  'welcome.tryAgain': 'Intentarlo de nuevo',
  'welcome.seeAccounts': 'Ver tus cuentas',
  'welcome.toolbar': 'También están a un clic: el icono de Keyrook Authenticator en tu barra de herramientas.',

  // --- Iniciar sesión con Google o GitHub ---------------------------------------
  'provider.continue': 'Continuar con {provider}',
  'provider.finishInWindow': 'Termina en la ventana de {provider} que se ha abierto.',
  'provider.confirmed': '{provider} ha confirmado <b>{email}</b>. Ninguna cuenta la usa todavía.',
  'provider.point1':
    'Sin contraseña. En un dispositivo nuevo continúas con {provider}, y un dispositivo con la sesión ya iniciada lo deja entrar después de que compruebes que ambos muestran el mismo código.',
  'provider.point2':
    '{provider} demuestra que eres tú. Nunca ve tus códigos: se cifran aquí, con una clave que se queda en tus dispositivos.',
  'provider.point3':
    'Después guardas una clave de recuperación: la forma de volver si se pierden todos los dispositivos con la sesión iniciada en la cuenta. {provider} no puede restaurar tu bóveda.',
  'provider.notRight': '¿No es la cuenta correcta?',
  'provider.startAgain': 'Empezar de nuevo',
  'passkey.continue': 'Continuar con una llave de acceso',
  'passkey.where':
    'Una que añadiste en <link>la página de la cuenta</link>, en «Llaves de acceso». La primera vez, Chrome te pide que dejes que Keyrook Authenticator la use.',
  'pairing.codeLabel': 'Código {code}',
  'join.title': 'Deja entrar a este navegador',
  'join.subtitle':
    '<b>{email}</b> ya tiene una cuenta. Aprueba este navegador desde un dispositivo que tenga la sesión iniciada en ella.',
  'join.masterPassword': 'Contraseña maestra de esta bóveda',
  'join.masterHint': 'Sigue bloqueando esta bóveda aquí; la cuenta en sí no tiene contraseña.',
  'join.ask': 'Pedir unirse',
  'join.step1':
    'En un dispositivo con la sesión ya iniciada, abre Keyrook Authenticator. La solicitud aparece allí: encima de los códigos y en Ajustes, en Sincronización.',
  'join.step2': 'Comprueba que muestra el mismo código que esta página y apruébala.',
  'join.askAgain': 'Volver a pedirlo',
  'join.compare': 'El otro dispositivo también muestra un código. Aprueba allí solo si es exactamente este.',
  'join.waiting': 'Esperando a otro dispositivo…',
  'join.noOther': '¿No te queda otro dispositivo?',
  'join.useKey': 'Usa tu clave de recuperación',
  'join.wrongAccount': '¿Has iniciado sesión en {provider} con la cuenta equivocada?',
  'joinKey.subtitle':
    'La clave que guardaste al crear la cuenta. Deja entrar a este navegador sin necesidad de otro dispositivo.',
  'joinKey.submit': 'Unirse a la cuenta',
  'approve.approved': 'Aprobado. El otro dispositivo abrirá tu bóveda en un momento.',
  'approve.mismatch':
    'Rechazado. Si no estabas iniciando sesión tú mismo justo ahora, otra persona puede entrar en tu cuenta de {provider}: cambia su contraseña y revisa su configuración de seguridad.',
  'approve.declined': 'Rechazado. No se ha enviado nada.',
  'approve.title': 'Dispositivos que piden unirse',
  'approve.description':
    'Cada solicitud viene de alguien que acaba de iniciar sesión con tu cuenta de {provider}. Aprueba solo un dispositivo en el que estés iniciando sesión tú mismo, ahora mismo.',
  'approve.descriptionAny':
    'Cada solicitud viene de alguien que acaba de iniciar sesión con tu cuenta de Google o GitHub. Aprueba solo un dispositivo en el que estés iniciando sesión tú mismo, ahora mismo.',
  'approve.mismatchAny':
    'Rechazado. Si no estabas iniciando sesión tú mismo justo ahora, otra persona puede entrar en tu cuenta de Google o GitHub: cambia su contraseña y revisa su configuración de seguridad.',
  'approve.askedAt': 'Pedido a las {time}',
  'approve.review': 'Revisar',
  'approve.deny': 'Rechazar',
  'approve.question':
    '¿El dispositivo que lo pide muestra exactamente este código? Si no, otra persona está intentando entrar.',
  'approve.matches': 'Coincide: dejarlo entrar',
  'approve.doesNotMatch': 'No coincide',

  // --- Errores, continuación ----------------------------------------------------
  'error.vaultNewer':
    'Esta bóveda se creó con una versión más reciente de Keyrook Authenticator. Actualiza antes de abrirla.',
  'error.uriUnsupported': 'Ese enlace usa un ajuste que esta app no sabe leer ({value}).',
  'editor.websitesPlaceholder': 'github.com, gist.github.com',
  'error.noWorker': 'La extensión no respondió. Cierra esto y vuelve a abrirlo.',
  'nav.sync': 'Sincronización',
  'nav.general': 'General',
  'nav.needsAttention': 'Requiere atención',
  'sync.description':
    'Los mismos códigos en cada dispositivo en el que inicies sesión, cifrados aquí antes de salir.',
  'backup.description': 'Guarda una copia cifrada, importa cuentas o llévalas a otra app.',
  'backup.choice.backup.title': 'Hacer copia',
  'backup.choice.backup.body': 'Un archivo cifrado, protegido con la contraseña que elijas.',
  'backup.choice.import.title': 'Importar',
  'backup.choice.import.body': 'Desde una copia, la exportación de otra app o enlaces otpauth://.',
  'backup.choice.move.body':
    'Códigos de transferencia, una página para imprimir o un archivo legible. Sin cifrar.',
  'backup.accountData': 'Solo Keyrook Authenticator puede exportar tus códigos: el servidor los guarda cifrados. Lo que el servidor guarda sobre tu cuenta, sin códigos ni claves, se descarga desde la página de la cuenta.',
  'security.description': 'Cómo se abre esta bóveda y cómo volver a entrar si pierdes este navegador.',
  'security.deviceKeyHint':
    'Nada que escribir. No detiene al malware que se ejecute con tu usuario en este ordenador.',
  'security.passwordHint': 'Se pide cada vez que la bóveda se ha bloqueado.',
  'general.description': 'Cómo se ve y se comporta la extensión, y de dónde viene.',
  'general.inBrowser': 'En el navegador',
  'general.autofillHint':
    'Al abrir la ventana en una página de inicio de sesión, ofrece el código correcto. Solo se lee esa pestaña.',
  'vault.signInToSync': 'Inicia sesión para sincronizar',
  'vault.empty.signIn':
    '¿Usas Keyrook Authenticator en otro dispositivo? <link>Inicia sesión</link> para traer tus códigos aquí.',
  'setup.haveAccount': '¿Ya usas Keyrook Authenticator? <link>Inicia sesión</link> para traer tus códigos aquí.',
  'popup.signInOpensTab': 'Se abre en una pestaña nueva y termina en Ajustes.',
  'error.backupWrongPassword': 'Esa contraseña no abre este archivo.',
  'error.foreign.steamFolder': 'Elige a la vez todos los archivos de la carpeta maFiles de Steam Desktop Authenticator: manifest.json y los archivos .maFile que hay a su lado.',
  'error.foreign.locked':
    'Esta exportación está bloqueada con una contraseña que Keyrook Authenticator no puede abrir. Vuelve a exportar sin contraseña.',
  'import.lockedFrom': '{app} bloqueó esta exportación con una contraseña. Escribe la que pusiste allí.',
  'import.fromApps':
    'También sirven las exportaciones de Aegis, 2FAS, Bitwarden, Proton, Ente Auth, andOTP, FreeOTP+, Steam Desktop Authenticator, la extensión Authenticator y Google Authenticator, y un CSV de Contraseñas de Apple, 1Password u otro gestor.',
  'shortcut.open': 'Abrir Keyrook Authenticator',
  'shortcut.fill': 'Rellenar el código de esta página',
  'shortcut.fillHint':
    'Solo rellena si exactamente una cuenta pertenece al sitio; en otro caso abre la lista.',
  'shortcut.notSet': 'Sin asignar',
  'vault.shortcutHint': '{keys} lo rellena sin abrir esto.',
  'import.csvWarning':
    'Este archivo contiene tus contraseñas sin cifrar. Solo se leyeron las claves de doble factor y no se guarda nada más: borra el archivo cuando termines.',
  'import.noKeysInCsv': 'Ese archivo no tiene claves de doble factor, solo contraseñas.',
  'crash.title': 'Algo salió mal',
  'crash.body':
    'Esta pantalla tuvo un problema y se detuvo. Tus cuentas guardadas no se ven afectadas. Volver a cargarla suele arreglarlo.',
  'crash.reload': 'Volver a cargar',
  'setup.device.description.phone':
    'Tus secretos se cifran con una clave que este teléfono guarda por ti. Nada que recordar, nada que escribir.',
  'setup.device.footnote.phone':
    'Protege frente a una copia de los archivos de la app. No frente a alguien que pueda desbloquear este teléfono.',
  'setup.password.footnote.phone':
    'La opción más segura: una vez bloqueada, nada en este teléfono puede abrir la bóveda sin la contraseña.',
  'unrecoverable.why.phone':
    'Su clave de cifrado la guardaba este teléfono y ha desaparecido; normalmente porque se borraron los datos de la app, se reinstaló la app o la bóveda viene de la copia de seguridad de otro teléfono. Sin esa clave, nadie puede descifrar las cuentas guardadas, ni siquiera nosotros.',
  'vault.empty.body.phone':
    'Cuando un sitio muestre un código QR para configurar la verificación en dos pasos, escanéalo con la cámara de este teléfono.',
  'add.camera.description.phone':
    'Para un código en otra pantalla, incluida una exportación de Google Authenticator.',
  'add.fromGoogle.phone':
    '¿Vienes de Google Authenticator en otro teléfono? Exporta allí tus cuentas y luego escanea el código que muestra con la cámara de este teléfono. Si muestra varios, hazlos uno a uno.',
  'camera.noCamera.phone': 'Este teléfono no da acceso a una cámara a la app.',
  'camera.blocked.phone':
    'La app no tiene permiso para usar la cámara. Permítelo en los ajustes del teléfono o usa otra forma de añadir una cuenta.',
  'camera.none.phone': 'No se encontró ninguna cámara en este teléfono.',
  'security.languageBrowser.phone': 'Idioma del teléfono ({language})',
  'protect.removeWarning.phone':
    'La bóveda sigue cifrada, pero se desbloqueará sola cada vez que se abra la app. Cualquiera que pueda desbloquear este teléfono podrá ver tus códigos.',
  'kit.device.phone':
    'Esta bóveda se desbloquea con una clave que guarda tu teléfono. Si esa clave desaparece (datos de la app borrados, una reinstalación, un teléfono nuevo), solo una clave de recuperación podrá abrirla.',
  'kit.withoutDevice.phone':
    'Sin ella, perder la clave que guarda este teléfono significa perder para siempre todas las cuentas de esta bóveda.',
  'security.description.phone': 'Cómo se abre esta bóveda y cómo volver a entrar si pierdes este teléfono.',
  'security.deviceKeyHint.phone':
    'Nada que escribir. Cualquiera que pueda desbloquear este teléfono puede abrirla.',
  'general.description.phone': 'Cómo se ve y se comporta la app, y de dónde viene.',
  'about.securityModelDescription.phone': 'Lo que garantiza la app, y lo que no.',
  'about.logos.description.phone':
    'Los logotipos van incluidos en la app y nunca se descargan. Pedir un logotipo a la red le diría a quien responda en qué servicios usas la verificación en dos pasos.',
  'about.fact.access.title.phone': 'Solo la cámara, y solo para escanear',
  'about.fact.access.body.phone':
    'La app no pide ningún permiso salvo la cámara, y solo cuando eliges escanear un código. Lo que ve la cámara nunca sale del teléfono.',
  'about.fact.keys.body.phone':
    'Tus cuentas se cifran con una clave de datos que a su vez está envuelta. Con contraseña maestra, la clave de envoltura sale de PBKDF2 con 600.000 iteraciones y solo existe en memoria mientras está desbloqueada. Sin ella, es una clave sellada por el almacén de claves del propio teléfono, así que una copia de los archivos de la app no puede abrir la bóveda.',
  'rate.store.play': 'Google Play',
  'error.signOutUnsynced.phone':
    'Algunos cambios de este teléfono aún no han llegado a tu cuenta, y cerrar sesión ahora los perdería. Conéctate a internet y vuelve a intentarlo.',
  'account.signOutNote.phone':
    'Cerrar sesión quita tus códigos de este teléfono. Se quedan en tu cuenta de Keyrook: vuelve a iniciar sesión para recuperarlos.',
  'secondStepTip.suggest.phone':
    'Pide también un código cada vez que esta cuenta inicie sesión en otro dispositivo. Actívalo en account.keyrook.com y guarda el código aquí: añade una cuenta en esta app y escanea el código QR que muestra esa página.',
  'intro.benefit2.phone': 'Un teléfono perdido o roto no es una bóveda perdida.',
  'provider.finishInWindow.phone': 'Termina en la página de {provider} que se ha abierto en tu navegador.',
  'join.title.phone': 'Deja entrar a este teléfono',
  'join.subtitle.phone':
    '<b>{email}</b> ya tiene una cuenta. Aprueba este teléfono desde un dispositivo que tenga la sesión iniciada en ella.',
  'joinKey.subtitle.phone':
    'La clave que guardaste al crear la cuenta. Deja entrar a este teléfono sin necesidad de otro dispositivo.',
  'facts.autofill.phone': 'Escanear QR',
};
