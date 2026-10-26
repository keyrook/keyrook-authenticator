// Português (Brasil). Trata o usuário por "você"; atende também quem usa português de Portugal.
import type { Dictionary } from './en.js';

export const ptBR: Dictionary = {
  // --- Erros --------------------------------------------------------------------
  'error.vaultLocked': 'O cofre está bloqueado.',
  'error.vaultExists': 'Já existe um cofre neste dispositivo.',
  'error.noVault': 'Ainda não há um cofre neste dispositivo.',
  'error.vaultCorrupt': 'O cofre salvo está corrompido ou foi gravado por outro app.',
  'error.wrongMasterPassword': 'Senha mestra incorreta.',
  'error.enterCurrentMasterPassword': 'Digite sua senha mestra atual.',
  'error.currentPasswordWrong': 'A senha atual está incorreta.',
  'error.masterPasswordShort': 'A senha mestra precisa ter pelo menos 8 caracteres.',
  'error.notPassphraseVault': 'Este cofre não é protegido por uma senha mestra.',
  'error.recoveryKeyMalformed': 'Isso não parece uma chave de recuperação.',
  'error.recoveryKeyNoMatch': 'Essa chave de recuperação não confere.',
  'error.recoverOnAccountPage': 'Sua chave de recuperação está certa, mas a senha desta conta agora é redefinida na página da conta, para todos os apps Keyrook de uma vez.',
  'error.kitOnAccountPage': 'A chave de recuperação desta conta agora é criada na página da conta, para todos os apps Keyrook de uma vez.',
  'error.restoreEmpty': 'Não sobrou nada desta conta para recuperar: ela foi excluída em outro dispositivo antes que este chegasse a tê-la.',
  'error.noAccountSheet': 'Esta conta ainda não tem chave de recuperação. Crie uma na página da conta.',
  'error.recoveryKeyWrong': 'Essa chave de recuperação não é desta conta.',
  'error.noRecoveryKit': 'Este cofre não tem chave de recuperação.',
  'error.syncUnavailable': 'A sincronização não está disponível nesta versão.',
  'error.notSignedIn': 'Você não está conectado.',
  'error.alreadySignedIn': 'Você já está conectado.',
  'error.signedOutElsewhere':
    'Este dispositivo foi desconectado da sincronização — a senha foi alterada ou o dispositivo foi removido em outro. Entre de novo.',
  'error.removedFromAccount':
    'Outro dispositivo removeu este da sua conta no Keyrook, então os códigos da conta foram tirados daqui. Entre de novo para trazê-los de volta.',
  'error.signOutUnsynced':
    'Algumas alterações deste navegador ainda não chegaram à sua conta, e sair agora faria você perdê-las. Conecte-se à internet e tente de novo.',
  'error.enterAccountPassword': 'Digite a senha da sua conta.',
  'error.accountPasswordWrong': 'Essa não é a senha da sua conta.',
  'error.accountPasswordWeak':
    'Essa senha é fraca demais para proteger uma cópia do seu cofre que sai deste dispositivo. Use pelo menos 12 caracteres misturando maiúsculas, minúsculas, números e símbolos — ou quatro ou cinco palavras sem relação entre si.',
  'error.lockOnlyWithAccountPassword':
    'Essa não é a senha da sua conta. Enquanto você estiver conectado, é a única senha com que este cofre pode ser bloqueado.',
  'error.signupWrongMasterPassword': 'Essa não é a senha mestra deste cofre. Ela também vira a senha da sua conta.',
  'error.masterPasswordTooWeakForAccount':
    'Sua senha mestra é fraca demais para proteger uma cópia do seu cofre que sai deste dispositivo. Troque-a primeiro em Segurança — pelo menos 12 caracteres variados, ou quatro ou cinco palavras sem relação.',
  'error.passwordsDiverged':
    'A senha da sua conta é diferente da senha deste cofre. Saia da sincronização e entre de novo para igualá-las, depois tente outra vez.',
  'error.kitRace': 'Outro dispositivo seu acabou de mudar a chave de recuperação. Nada foi alterado aqui — tente de novo.',
  'error.providerHasNoPassword': 'Esta conta entra com Google ou GitHub e não tem senha.',
  'error.noActiveTab': 'Nenhuma aba ativa.',
  'error.autofillNotHere': 'O preenchimento automático só funciona em páginas da web comuns.',
  'error.autofillBlocked':
    'O Chrome não deixou a extensão ler esta página. Abra a janela da extensão na página que você quer preencher.',
  'error.signinCancelled': 'O login foi cancelado.',
  'error.signinStateMismatch': 'Esse login não voltou do jeito que saiu. Tente de novo.',
  'error.signinUnfinished': 'O login não terminou. Tente de novo.',
  'error.signupPendingExpired': 'Esse login expirou. Comece de novo.',
  'error.signInFirst': 'Entre primeiro.',
  'error.joinNeedsMasterPassword': 'Digite a senha mestra deste cofre para terminar de entrar na conta.',
  'error.notThisVaultsPassword': 'Essa não é a senha mestra deste cofre.',
  'error.nothingWaiting': 'Não há nada esperando aprovação.',
  'error.pairingExpired': 'O pedido terminou — foi recusado ou passaram dez minutos. Peça de novo.',
  'error.pairingWrongKey':
    'A chave recebida não é desta conta. Nada foi alterado. Tente de novo a partir do outro dispositivo.',
  'error.pairingForged': 'Essa aprovação não veio do dispositivo cujo código você conferiu.',
  'error.pairingForgedAsk':
    'Essa aprovação não veio do dispositivo cujo código foi conferido. Nada foi alterado. Peça de novo.',
  'error.pairingEnded': 'Esse pedido terminou.',
  'error.approveAgain': 'Comece a aprovar esse pedido de novo.',
  'error.backupPasswordShort': 'A senha do backup precisa ter pelo menos 8 caracteres.',
  'error.backupNotOurs': 'Este arquivo não é um backup do Keyrook Authenticator.',
  'error.backupNewer': 'Este backup foi feito por uma versão mais nova do app.',
  'error.backupUnknownCipher': 'Este backup usa um método de criptografia que esta versão não conhece.',
  'error.backupTooCostly': 'Este backup exige um esforço absurdo para ser aberto. Ele foi ignorado.',
  'error.backupMalformed': 'Este backup está malformado.',
  'error.uriNotOtpauth': 'Não é um link otpauth://.',
  'error.uriMalformed': 'Esse link otpauth:// está malformado.',
  'error.uriNoSecret': 'Esse link não tem segredo.',
  'error.uriBadSecret': 'O segredo nesse link não é base32 válido.',
  'error.uriNoCounter': 'Um link HOTP precisa incluir um contador.',
  'error.secretEmpty': 'A chave de configuração está vazia.',
  'error.migrationNotOurs': 'Não é uma exportação do Google Authenticator.',
  'error.migrationMalformed': 'Esta exportação do Google Authenticator está danificada ou incompleta.',
  'error.offline': 'Não foi possível acessar o servidor de sincronização. Confira sua conexão e tente de novo.',
  'error.passkey.wrongOrigin': 'Uma chave de acesso só funciona na página e nos apps do próprio Keyrook.',
  'error.passkey.notOffered': 'Entrar com chave de acesso não está disponível aqui.',
  'error.passkey.unchecked': 'Não foi possível verificar essa chave de acesso. Tente de novo.',
  'error.passkey.unknown': 'Nenhuma conta no Keyrook conhece essa chave de acesso. Talvez ela tenha sido removida.',
  'error.passkey.ended': 'A solicitação dessa chave de acesso expirou. Tente de novo.',
  'error.passkey.noUnlock': 'Essa chave de acesso não abre a chave desta conta. Entre com a senha.',
  'error.passkey.noUnlockProvider':
    'Essa chave de acesso não abre a chave desta conta. Continue com o Google ou o GitHub.',
  'error.passkey.masterPassword':
    'Um cofre que trava com senha mestra não consegue entrar com chave de acesso. Entre com a senha da conta, ou com o Google ou o GitHub.',
  'error.passkey.permission':
    'O Keyrook Authenticator precisa da permissão do Chrome para usar as chaves de acesso de account.keyrook.com. Escolha a chave de acesso de novo e permita.',
  'error.passkey.cancelled': 'Nenhuma chave de acesso foi usada. Tente de novo ou entre de outro jeito.',
  'error.passkey.failed': 'O Chrome não conseguiu pedir uma chave de acesso. Tente de novo ou entre de outro jeito.',
  'error.secondStep.missing': 'Digite também o código do seu app autenticador.',
  'error.secondStep.wrongCode': 'Esse código não está certo. Digite o que o seu app autenticador mostra agora.',
  'error.secondStep.expired': 'Esse login expirou. Entre de novo.',
  'error.secondStep.used': 'Esse código acabou de ser usado para entrar. Espere o seu app mostrar o próximo.',
  'error.provider.refusedBy': 'O {provider} recusou o login.',
  'error.provider.unreachable': 'Não foi possível acessar o {provider}. Tente de novo daqui a pouco.',
  'error.provider.refused': 'O login foi recusado. Tente de novo.',
  'error.provider.githubRefused': 'O GitHub recusou o login.',
  'error.provider.noReauth': 'O Google não pediu que você entrasse de novo.',
  'error.provider.unverifiedEmail': 'O Google não verificou esse endereço de e-mail.',
  'error.provider.githubNoEmail': 'Sua conta do GitHub não tem um e-mail principal verificado.',
  'error.server.badRequest': 'O servidor de sincronização não conseguiu ler esse pedido.',
  'error.server.session': 'Essa sessão não é mais válida.',
  'error.server.accountGone': 'Essa conta não existe mais.',
  'error.server.signupExpired': 'Esse cadastro expirou. Entre de novo.',
  'error.server.signinExpired': 'Esse login expirou. Tente de novo.',
  'error.server.tooManyCodes': 'Muitos códigos errados. Peça um novo.',
  'error.server.tooManyPairings': 'Há dispositivos demais esperando para entrar nesta conta. Tente de novo em alguns minutos.',
  'error.server.wrongKey': 'Este dispositivo não tem a chave da conta.',
  'error.server.providerAccount': 'Esta conta entra com Google ou GitHub, não com senha.',
  'error.server.mailFailed': 'Não foi possível enviar o e-mail. Tente de novo em um minuto.',
  'error.server.pairingTaken': 'Esse pedido terminou, ou outro dispositivo está aprovando.',
  'error.server.passwordWrong': 'Essa senha não está correta.',
  'error.server.badCredentials': 'E-mail ou senha incorretos.',
  'error.server.badCode': 'Esse código está errado ou expirou. Confira o e-mail ou peça um novo.',
  'error.server.reauthMismatch': 'Entre de novo com a conta que você usa no Keyrook para confirmar.',
  'error.server.kitRace': 'Outro dispositivo acabou de mudar a chave de recuperação.',
  'error.server.unavailable': 'O servidor de sincronização não conseguiu fazer isso agora. Tente de novo daqui a pouco.',
  'error.server.lockedOut': {
    one: 'Tentativas falhas demais. Tente de novo em {count} segundo.',
    other: 'Tentativas falhas demais. Tente de novo em {count} segundos.',
  },
  'error.server.rateLimited': {
    one: 'Tentativas demais. Tente de novo em {count} segundo.',
    other: 'Tentativas demais. Tente de novo em {count} segundos.',
  },
  'error.server.emailTaken': '{email} já tem uma conta no Keyrook.',
  'error.server.recordTooLarge': 'Uma das suas contas é grande demais para sincronizar ({id}).',
  'error.server.codeTooSoon': 'Um código acabou de ser enviado. Aguarde um pouco antes de pedir outro.',
  'error.server.keyRace': 'Outro dispositivo acabou de configurar a chave. Tente de novo.',
  'error.server.archiveNeedsOldKeys': 'Só a senha antiga ou a chave de recuperação antiga podem excluir o que foi guardado antes que expire.',
  'error.server.signupNeedsKeys': 'Não foi possível criar esta conta. Atualize o Keyrook Authenticator e tente de novo.',
  'error.server.accountIdTaken': 'Esse ID de conta já está em uso. Cadastre-se de novo.',
  'error.server.archiveWrongKey': 'Isso não abre o que foi guardado.',
  'error.server.flowExpired': 'Isso expirou. Peça um novo código e comece de novo.',
  'error.server.archiveGone': 'Isso não está mais guardado.',
  'error.server.notProductKey': 'Essa chave não pertence ao Keyrook Authenticator.',
  'error.server.foreignRecord': 'Esse registro pertence a outro produto Keyrook.',
  'error.server.rootChanged': 'As chaves da conta mudaram em outro dispositivo. Tente de novo.',
  'error.server.rootExists': 'Esta conta já tem uma chave raiz.',
  'error.server.noRoot': 'Esta conta ainda não tem uma chave raiz.',
  'error.server.startOverLimit': 'Esta conta recomeçou do zero muitas vezes recentemente. Tente de novo depois de {date}.',
  'error.server.wrongRootKey': 'Este dispositivo não tem a chave raiz da conta.',
  'error.server.sessionReplayed': 'Este dispositivo foi desconectado porque a sessão dele foi usada em outro lugar. Entre de novo.',
  'error.server.noProductKey': 'O Keyrook Authenticator ainda não tem uma chave nesta conta.',
  'error.server.productKeyChanged': 'A chave do Keyrook Authenticator nesta conta mudou. Tente de novo.',
  'error.server.productKeyReplaced': 'A chave do Keyrook Authenticator foi substituída em outro dispositivo. Entre de novo.',
  'error.server.updateRequired': 'Atualize o Keyrook Authenticator para continuar usando esta conta.',
  'error.server.olderBuildsRetired': 'Versões anteriores do Keyrook Authenticator não podem mais usar esta conta.',
  'error.server.emailTakenOtherProvider': '{email} já tem uma conta Keyrook que entra com outro provedor.',
  'error.server.emailTakenPassword': '{email} já tem uma conta Keyrook com senha. Entre com seu e-mail e sua senha.',
  'error.server.signInWithPassword': 'Essa conta entra com senha. Entre aqui com seu e-mail e sua senha.',
  'error.server.pageCodeWrong': 'Esse código não é o que a página da conta está mostrando. Confira, ou comece de novo lá.',
  'error.server.pageRequestEnded': 'Essa solicitação expirou ou terminou. Comece de novo na página da conta.',
  'error.server.noKeyrookAccount': 'Esta conta do Google ou do GitHub não tem conta Keyrook. Crie uma no Keyrook Authenticator ou no Passhold.',
  'error.account.productKeyMismatch': 'A chave de {product} não abre com a chave raiz desta conta. Nada foi alterado.',
  'error.account.confirmWithPassword': 'Esta conta tem senha. Confirme com ela.',
  'error.account.chooseNewPassword': 'Escolha uma nova senha para esta conta.',
  'error.account.archiveNotOpened': 'Nada do que foi guardado para o Keyrook Authenticator abre com isso.',
  'error.account.keyNotConfirmed': 'A chave da conta não é a que você confirmou. Confira de novo.',
  'error.account.serverMismatch': 'A resposta do servidor de sincronização não corresponde a esta conta. Nada foi aberto com ela.',
  'error.account.archiveNoPassword': 'Esta conta não tinha senha naquela época.',
  'error.account.noPasswordForKeys': 'Esta conta não tem uma senha para abrir as chaves dela.',
  'error.account.noRecoveryKey': 'Esta conta ainda não tem chave de recuperação.',

  // --- Desbloqueio --------------------------------------------------------------
  'unlock.prompt': 'Digite sua senha mestra para desbloquear.',
  'unlock.placeholder': 'Senha mestra',
  'unlock.submit': 'Desbloquear',
  'unlock.forgot': 'Esqueceu? <link>Use sua chave de recuperação</link>',
  'platformUnlock.unlock': 'Desbloquear com digital, rosto ou PIN',
  'platformUnlock.title': 'Digital, rosto ou PIN',
  'platformUnlock.body': 'Abra o cofre com a verificação do próprio computador — Touch ID, Windows Hello ou o PIN dele — em vez de digitar a senha mestra. A senha continua abrindo o cofre, e as alterações continuam pedindo a senha.',
  'platformUnlock.on': 'O cofre também abre com a verificação do próprio computador. Remover a senha mestra desativa isso.',
  'passkeyUnlock.turnOn': 'Ativar',
  'passkeyUnlock.turnOff': 'Desativar',
  'platformUnlock.confirm': 'Depois o computador vai pedir sua digital, seu rosto ou seu PIN.',
  'error.passkeyUnlock.cancelled': 'A verificação foi cancelada ou demorou demais. Tente de novo ou use a senha mestra.',
  'error.platformUnlock.noPrf': 'O lugar onde esta chave de acesso foi salva não consegue guardar uma chave, então não pode abrir o cofre. Ative de novo e escolha outro lugar quando for perguntado onde salvá-la — ou continue usando a senha mestra.',
  'error.passkeyUnlock.failed': 'Isso não abriu o cofre. Use a senha mestra e ative isso de novo em Segurança.',
  'securityKey.unlock': 'Desbloquear com chave de segurança',
  'securityKey.title': 'Chave de segurança',
  'securityKey.body': 'Abra o cofre com uma chave de segurança USB e o PIN dela em vez de digitar a senha mestra. Quem estiver com a chave e souber o PIN dela poderá abrir o cofre neste computador. Se a chave for perdida, a senha mestra continua abrindo o cofre.',
  'securityKey.on': 'O cofre também abre com sua chave de segurança e o PIN dela neste computador. Quem estiver com a chave e souber o PIN dela pode abri-lo aqui, então, se perder a chave, desative isso. Remover a senha mestra desativa isso.',
  'securityKey.confirm': 'Depois, conecte sua chave de segurança, digite o PIN dela e toque nela. Algumas chaves pedem duas vezes.',
  'error.securityKey.noPrf': 'Esta chave de segurança não consegue guardar uma chave, então não pode abrir o cofre. Chaves feitas só para o login em duas etapas não conseguem. Tente outra chave ou continue usando a senha mestra.',

  // --- Cofre que não abre mais --------------------------------------------------
  'unrecoverable.title': 'Este cofre não pode mais ser aberto',
  'unrecoverable.why':
    'A chave de criptografia dele ficava neste perfil do navegador e sumiu — normalmente porque os dados de navegação foram apagados, a extensão foi reinstalada ou este é outro perfil. Sem essa chave ninguém consegue descriptografar as contas salvas, nem nós.',
  'unrecoverable.hasKit':
    'Você emitiu uma chave de recuperação para este cofre. Ela protege os mesmos dados, de forma independente da chave perdida — vai abrir tudo.',
  'unrecoverable.useKit': 'Usar minha chave de recuperação',
  'unrecoverable.noKit':
    'Comece de novo e restaure a partir de um arquivo de backup, se tiver um. Caso contrário, você vai precisar configurar de novo a verificação em duas etapas em cada site, com os códigos de recuperação que eles te deram.',
  'unrecoverable.confirmErase': 'Sim, apagar e começar de novo',
  'common.cancel': 'Cancelar',
  'unrecoverable.startOver': 'Começar de novo',

  // --- Força da senha -----------------------------------------------------------
  'strength.0': 'muito fraca',
  'strength.1': 'fraca',
  'strength.2': 'razoável',
  'strength.3': 'forte',
  'strength.4': 'muito forte',
  'strength.line': 'Força: {label}',
  'strength.lineWithWarning': 'Força: {label} — {warning}',
  'strength.tooShort': 'Use pelo menos 10 caracteres — o tamanho é o que mais importa.',
  'strength.digitsOnly': 'Só números é fácil de adivinhar.',
  'strength.repeated': 'Evite caracteres repetidos.',

  // --- Primeiro uso -------------------------------------------------------------
  'setup.prompt': 'Escolha como seus segredos de 2FA serão protegidos.',
  'setup.device.title': 'Começar já',
  'setup.device.badge': 'Recomendado',
  'setup.device.description':
    'Seus segredos são criptografados com uma chave que este navegador guarda para você. Nada para lembrar, nada para digitar.',
  'setup.device.footnote':
    'Protege contra qualquer coisa que rode scripts ou leia os dados da extensão. Não contra malware rodando como você nesta máquina.',
  'setup.password.title': 'Adicionar uma senha mestra',
  'setup.password.description':
    'Uma senha desbloqueia o cofre, e ele se bloqueia de novo quando você para de usar.',
  'setup.password.footnote':
    'A opção mais forte: depois de bloqueado, nada neste computador abre o cofre sem a senha.',
  'setup.footer': 'De qualquer forma é AES-256-GCM. Troque quando quiser; a sincronização é opcional, nas Configurações.',
  'setup.footer.noSync': 'De qualquer forma é AES-256-GCM. Troque quando quiser, nas Configurações.',
  'setup.source': 'Código aberto — leia o código',
  'common.back': 'Voltar',
  'setup.passwordStep.title': 'Defina uma senha mestra',
  'setup.passwordStep.warning':
    'Ninguém consegue redefinir esta senha. Se você esquecer, só uma chave de recuperação abre o cofre — crie uma em Configurações → Segurança e anote a senha num lugar seguro.',
  'setup.passwordStep.label': 'Senha mestra',
  'setup.passwordStep.placeholder': 'Pelo menos 8 caracteres',
  'setup.passwordStep.confirm': 'Confirme a senha',
  'common.passwordsDiffer': 'As senhas não conferem.',
  'setup.passwordStep.submit': 'Criar meu cofre',
  'setup.passwordStep.footer': 'AES-256-GCM · chave derivada com PBKDF2 (600.000 rodadas)',

  // --- Chave de recuperação, abrindo um cofre -----------------------------------
  'recover.title': 'Use sua chave de recuperação',
  'recover.intro':
    'A chave de 32 caracteres da folha que você guardou ao criar este cofre. Usá-la troca a forma como o cofre é bloqueado, então escolha isso abaixo também.',
  'recover.keyLabel': 'Chave de recuperação',
  'recover.hintEmpty': 'Só letras e números — os espaços não importam.',
  'recover.hintRight': 'O formato está certo.',
  'recover.hintCount': '{count} de 32 caracteres.',
  'recover.lockQuestion': 'Como este cofre deve ser bloqueado daqui para frente?',
  'recover.lockPassword': 'Definir uma nova senha mestra',
  'recover.lockDevice': 'Sem senha — deixar este dispositivo guardar a chave',
  'recover.newPassword': 'Nova senha mestra',
  'recover.atLeast8': 'Pelo menos 8 caracteres.',
  'recover.submit': 'Desbloquear e bloquear de novo este cofre',

  // --- Campo de senha -----------------------------------------------------------
  'meter.0': 'Fraca demais',
  'meter.1': 'Fraca',
  'meter.2': 'Razoável',
  'meter.3': 'Forte',
  'meter.4': 'Muito forte',
  'password.show': 'Mostrar senha',
  'password.hide': 'Ocultar senha',

  // --- Janela da extensão: a lista ----------------------------------------------
  'vault.search': 'Buscar contas',
  'vault.add': 'Adicionar conta',
  'vault.settings': 'Configurações',
  'vault.lock': 'Bloquear agora',
  'vault.count': { one: '{count} conta', other: '{count} contas' },
  'vault.syncedWith': 'Sincronizado com {email}',
  'vault.syncedAs': 'sincronizado como {email}',
  'vault.changeOrder': 'Mudar a ordem',
  'vault.byName': 'Por nome',
  'vault.orderAdded': 'Ordem de inclusão',
  'vault.joinRequests': {
    one: 'Um dispositivo está pedindo para entrar na sua conta.',
    other: '{count} dispositivos estão pedindo para entrar na sua conta.',
  },
  'vault.joinRequestsHint': 'Aprove só um em que você mesmo está entrando, agora.',
  'vault.reviewInSettings': 'Revisar nas Configurações',
  'vault.noMatch': 'Nenhuma conta corresponde a “{query}”.',
  'vault.forHost': 'Para {host}',
  'vault.fieldDetected': 'campo de código detectado',
  'common.encryptedHere': 'Criptografado neste dispositivo',
  'vault.fillWarning':
    '<b>{account}</b> é para <b>{domain}</b>, mas esta página é <b>{host}</b>. Se você não esperava isso, a página pode estar se passando pelo site.',
  'vault.dontFill': 'Não preencher',
  'vault.fillAnyway': 'Preencher mesmo assim',
  'vault.empty.title': 'Nenhuma conta ainda',
  'vault.empty.body':
    'Abra a página de configuração da verificação em duas etapas de qualquer site e escaneie o QR code direto da aba.',
  'vault.empty.add': 'Adicionar sua primeira conta',

  // --- Janela da extensão: uma conta --------------------------------------------
  'common.untitled': 'Sem título',
  'row.copyHint': 'Clique para copiar',
  'row.share': 'Compartilhar ou mover',
  'row.shareHint': 'Enviar os códigos por um tempo, ou mover para outro app',
  'row.favouriteAdd': 'Adicionar aos favoritos',
  'row.favouriteRemove': 'Remover dos favoritos',
  'row.fillHint': 'Preencher este código na página',
  'row.fill': 'Preencher',
  'row.copied': 'Copiado',
  'row.copy': 'Copiar código',
  'row.next': 'Gerar o próximo código',
  'row.counter': 'Contador: {counter}',

  // --- Janela da extensão: pedindo avaliação ------------------------------------
  'rate.region': 'Avaliar o Keyrook Authenticator',
  'rate.body': '<b>O Keyrook Authenticator está sendo útil?</b> Uma avaliação na {store} é como outras pessoas o encontram.',
  'rate.store.chrome': 'Chrome Web Store',
  'rate.store.edge': 'Edge Add-ons',
  'rate.notNow': 'Agora não',
  'rate.rate': 'Avaliar',

  // --- Partes comuns ------------------------------------------------------------
  'common.openSource': 'Código aberto',

  // --- Adicionando uma conta ----------------------------------------------------
  'add.title.manual': 'Digite uma chave de configuração',
  'add.title.camera': 'Escanear com a câmera',
  'add.title.quick': 'Obter um código, sem salvar',
  'add.title.choose': 'Adicionar uma conta',
  'add.page.title': 'Escanear o QR code desta página',
  'add.page.description': 'Tira uma captura da parte visível da aba e lê o código nela.',
  'add.camera.title': 'Escanear com a câmera',
  'add.camera.description': 'Para um código no seu celular — inclusive uma exportação do Google Authenticator.',
  'add.camera.elsewhere':
    'Abre as Configurações uma vez para o Chrome pedir acesso à câmera. Depois disso funciona aqui mesmo.',
  'add.upload.title': 'Enviar uma imagem de QR',
  'add.upload.description': 'Uma captura de tela ou foto que você salvou antes.',
  'add.manual.title': 'Digitar uma chave de configuração',
  'add.manual.description': 'Para sites que mostram um código em vez de QR.',
  'add.quick.title': 'Só obter um código',
  'add.quick.description': 'Cole uma chave e veja o código na hora. Nada é salvo.',
  'add.fromGoogle':
    'Vindo do Google Authenticator? Exporte suas contas lá e escaneie o código que ele mostrar com a câmera, ou envie uma captura de tela dele. Se aparecerem vários, faça um por um.',
  'common.done': 'Concluído',
  'add.noNativeReader':
    'O Chrome deste computador não tem leitor de QR embutido, então um código grande — como uma exportação do Google Authenticator — muitas vezes não é lido pela câmera. Se o seu não for, tire uma captura no celular e use Enviar uma imagem de QR.',
  'add.openScannerInSettings': 'Abrir o leitor nas Configurações',
  'add.noneFound': 'Nenhuma conta encontrada.',
  'add.noQrOnPage': 'Nenhum QR code na parte visível da página. Role até ele e tente de novo.',
  'add.noQrInImage': 'Nenhum QR code nessa imagem.',
  'add.cannotReadUri': 'Não foi possível ler essa URI.',
  'add.enterKey': 'Digite a chave de configuração que o site mostrou.',
  'add.offeredOn': 'Os códigos de {domain} serão oferecidos nesse site.',
  'add.startTyping': 'Comece a digitar — serviços conhecidos preenchem os próprios detalhes.',
  'add.account': 'Conta',
  'add.accountPlaceholder': 'voce@exemplo.com',
  'add.setupKey': 'Chave de configuração',
  'add.linkDetected': 'Link otpauth:// detectado — os campos de serviço e conta serão preenchidos a partir dele.',
  'add.spacesFine': 'Espaços e letras minúsculas não tem problema.',
  'add.submit': 'Adicionar conta',
  'add.summary': { one: '{count} código escaneado.', other: 'Todos os {count} códigos escaneados.' },
  'add.summaryAdded': { one: '{count} conta adicionada.', other: '{count} contas adicionadas.' },
  'add.summarySkipped': {
    one: '{count} já estava no seu cofre e ficou como estava.',
    other: '{count} já estavam no seu cofre e ficaram como estavam.',
  },
  'error.badKey':
    'Uma chave de configuração usa só as letras A–Z e os números 2–7. Confira se ela foi copiada inteira, sem nada a mais.',
  'error.quickIsMigration':
    'Esse é um link de transferência do Google Authenticator, para várias contas de uma vez. Importe-o em vez disso.',
  'error.keyTooShort': 'Curto demais para ser uma chave de configuração.',
  'error.fileTooLarge': 'Esse arquivo é grande demais para ler.',
  'error.notSetupQr': 'Esse QR code não é um código de configuração de 2FA.',
  'error.alreadyInVault': 'Essa conta já está no seu cofre.',
  'error.gaSkipPeriod': 'O Google Authenticator só guarda códigos de 30 segundos; este usa {period}.',
  'error.gaSkipDigits': 'O Google Authenticator só guarda códigos de 6 ou 8 dígitos; este tem {digits}.',
  'error.gaSkipSteam': 'O Google Authenticator não gera códigos do Steam Guard.',

  // --- Leitura pela câmera ------------------------------------------------------
  'scan.progressBatch': 'Código {seen} de {total} escaneado — {accounts}. Mostre o próximo código.',
  'scan.progress': '{accounts}.',
  'scan.added': { one: '{count} conta adicionada', other: '{count} contas adicionadas' },
  'scan.found': { one: '{count} conta encontrada', other: '{count} contas encontradas' },
  'scan.skippedVault': {
    one: '{count} já estava no seu cofre.',
    other: '{count} já estavam no seu cofre.',
  },
  'scan.skippedScanned': { one: '{count} já tinha sido escaneada.', other: '{count} já tinham sido escaneadas.' },
  'camera.noCamera': 'Este navegador não dá uma câmera à extensão.',
  'camera.preview': 'Prévia da câmera',
  'camera.failedHint':
    'Você ainda pode adicionar uma conta enviando uma foto do QR code ou digitando a chave de configuração.',
  'camera.hint':
    'Mantenha o QR code dentro do quadro. Vindo do Google Authenticator? Abra a tela de exportação no celular e aponte a câmera para ela — se aparecerem vários códigos, mostre um depois do outro.',
  'camera.privacy':
    'A imagem é lida neste dispositivo e descartada. Nada é gravado e nada é enviado.',
  'camera.blocked':
    'O Chrome bloqueou o acesso à câmera. Permita para esta página ou use outra forma de adicionar uma conta.',
  'camera.none': 'Nenhuma câmera encontrada neste computador.',
  'camera.busy': 'A câmera está sendo usada por outro programa.',

  // --- Imagens e QR -------------------------------------------------------------
  'image.unreadable': 'Não foi possível ler esse arquivo como imagem.',
  'image.wrongType': 'Use uma imagem PNG, JPEG, WebP, GIF ou BMP.',
  'image.tooBig': 'Essa imagem é muito grande. Tente uma com menos de 8 MB.',
  'image.cannotPrepare': 'Não foi possível preparar a imagem.',
  'image.wontCompress':
    'Essa imagem não ficou pequena o bastante. Um logotipo simples funciona melhor que uma foto.',
  'image.wrongScreenshotType': 'Use uma captura de tela PNG, JPEG, WebP, GIF ou BMP.',
  'brand.account': 'Conta',
  'brand.unknown': 'Serviço desconhecido',

  // --- Campo de serviço ---------------------------------------------------------
  'service.label': 'Serviço',
  'service.matches': 'Serviços correspondentes',

  // --- Movendo uma conta para outro app -----------------------------------------
  'share.intro':
    'Escaneie com o Google Authenticator, Microsoft Authenticator, 1Password, Authy — qualquer app autenticador — e ele vai gerar os mesmos códigos que este.',
  'share.warning':
    'Quem vir ou fotografar este código consegue gerar seus códigos de {account} enquanto a conta existir. Mostre-o só ao app para o qual você está mudando.',
  'share.show': 'Mostrar QR code',
  'share.qrLabel': 'QR code de configuração de {account}',
  'share.hidesIn': 'Escaneie com o outro app. Some sozinho em {seconds} s.',
  'share.linkCopied': 'Link copiado',
  'share.copyLink': 'Copiar link de configuração',
  'share.saveImage': 'Salvar como imagem',
  'share.linkWarning':
    'O link também contém o segredo. Cole no outro app e depois copie outra coisa por cima.',
  'share.hideNow': 'Ocultar agora',
  'shareCodes.modeLabel': 'Compartilhar ou mover',
  'shareCodes.modeCodes': 'Enviar códigos',
  'shareCodes.modeMove': 'Mover para outro app',
  'shareCodes.noSecret': 'Esta conta não tem chave de configuração, então não gera códigos e não há nada para compartilhar ou mover. Exclua-a e adicione a conta de novo pelo código QR dela.',
  'shareCodes.intro': 'Crie um link que mostra os códigos desta conta até expirar, nunca a chave que os gera.',
  'shareCodes.lengthLabel': 'Vale por',
  'shareCodes.min5': '5 minutos',
  'shareCodes.min15': '15 minutos',
  'shareCodes.hour': '1 hora',
  'shareCodes.cannotRecall': 'Um link não pode ser desfeito. Quem tiver o link pode usar os códigos até ele expirar, então envie só para quem precisa.',
  'shareCodes.copy': 'Copiar link',
  'shareCodes.copied': 'Link copiado. Vale até {time}.',
  'shareCodes.counter': 'Códigos por contador não podem ser enviados assim: cada um se esgota ao ser gerado. Mova a conta em vez disso.',

  // --- Obtendo um código sem salvar ---------------------------------------------
  'quick.label': 'Chave de configuração ou link otpauth://',
  'quick.copyHint': 'Clique para copiar',
  'quick.current': 'Código atual',
  'quick.next': 'Próximo: <code>{code}</code>',
  'quick.notSaved': 'Não fica salvo em lugar nenhum. Feche e a chave some.',
  'quick.save': 'Salvar como conta',
  'quick.settings': '{digits} dígitos · a cada {period} s · {algorithm}',
  'quick.change': 'alterar',
  'quick.digits': 'Dígitos',
  'quick.every': 'A cada',
  'quick.seconds': '{seconds} s',
  'quick.hash': 'Hash',

  // --- Configurações: moldura ---------------------------------------------------
  'nav.accounts': 'Contas',
  'nav.backup': 'Backup',
  'nav.security': 'Segurança',
  'nav.about': 'Sobre',
  'options.count': { one: '{count} conta', other: '{count} contas' },
  'options.sourceOnGithub': 'Código aberto no GitHub',
  // --- Uma nova chave de recuperação --------------------------------------------
  'sheet.once':
    'Esta é a única vez que esta chave aparece. Ela não fica salva em lugar nenhum — se perder, emita uma nova.',
  'sheet.print': 'Imprimir',
  'sheet.apart': 'Guarde-a longe do seu e-mail e nunca a envie para si mesmo por e-mail: com esta chave e seu endereço de e-mail, alguém pode definir uma nova senha e abrir seus códigos.',
  'sheet.apartProvider': 'Guarde-a longe da conta Google ou GitHub com que você entra, e nunca a deixe no e-mail ou no drive dessa conta: com esta chave e essa conta, alguém pode abrir seus códigos.',
  'sheet.kept': 'Já guardei',
  'sheet.checkHeading': 'Confira que você guardou',
  'sheet.checkLead': 'Digite dois grupos da chave a partir do que você guardou. Grupos são os blocos de quatro entre os traços, contados da esquerda.',
  'sheet.group': 'Grupo {position}',
  'sheet.check': 'Conferir',
  'sheet.mismatch': 'Não é isso que sua chave diz. Olhe de novo o que você guardou, ou mostre a chave outra vez e guarde-a agora.',
  'sheet.showAgain': 'Mostrar a chave outra vez',
  'sheet.download': 'Baixar a folha',
  'sheet.copy': 'Copiar',

  // --- Grupos -------------------------------------------------------------------
  'groups.title': 'Grupos',
  'groups.description':
    'Títulos na lista, para um cofre longo ser lido num relance. As contas entram num grupo pela tela Editar de cada uma.',
  'groups.new': 'Novo grupo',
  'groups.newPlaceholder': 'Trabalho',
  'groups.add': 'Adicionar',
  'groups.none':
    'Nenhum grupo ainda. Tudo aparece numa lista só, o que está certo até ela ficar grande o bastante para precisar ser dividida.',
  'groups.moveUp': 'Mover {name} para cima',
  'groups.moveDown': 'Mover {name} para baixo',
  'common.save': 'Salvar',
  'groups.count': { one: '{count} conta', other: '{count} contas' },
  'groups.removeNote': 'As contas ficam, sem grupo.',
  'common.remove': 'Remover',
  'groups.rename': 'Renomear',
  'groups.removeNamed': 'Remover {name}',
  'groups.ungrouped': {
    one: '{count} conta não está em nenhum grupo e aparece em “Sem grupo”, no fim da lista.',
    other: '{count} contas não estão em nenhum grupo e aparecem em “Sem grupo”, no fim da lista.',
  },

  // --- Sobre --------------------------------------------------------------------
  'about.fact.sync.title': 'Seus segredos são criptografados antes de qualquer coisa sair deste dispositivo',
  'about.fact.sync.body':
    'A sincronização é opcional. Com ela, só texto cifrado chega ao servidor, e ele não tem como decifrá-lo. Os códigos são sempre calculados localmente. Não há telemetria.',
  'about.fact.local.title': 'Seus segredos nunca saem deste dispositivo',
  'about.fact.local.body':
    'Esta versão não tem servidor, conta nem telemetria. Os códigos são calculados localmente a partir de segredos guardados num cofre criptografado.',
  'about.fact.keys.title': 'Duas formas de guardar a chave, ambas AES-256-GCM',
  'about.fact.keys.body':
    'Suas contas são criptografadas com uma chave de dados que, por sua vez, é protegida por outra. Com senha mestra, essa chave de proteção vem do PBKDF2 com 600.000 rodadas e só existe na memória enquanto o cofre está aberto. Sem senha, é uma chave não exportável guardada pelo navegador — nenhum script consegue ler seus bytes, embora ela não fique em hardware.',
  'about.fact.access.title': 'Sem acesso amplo aos sites',
  'about.fact.access.body':
    'A extensão não pede permissões de host. Ler um QR code de uma página, ou preencher um código nela, usa o activeTab — uma permissão que o Chrome dá só para a aba em que você abriu a extensão.',
  'about.fact.standards.title': 'Padrões, sem aprisionamento',
  'about.fact.standards.body':
    'TOTP da RFC 6238 e HOTP da RFC 4226, com importação e exportação otpauth://. Você pode mudar para outro app quando quiser e levar tudo junto.',
  'about.version': 'Versão {version}',
  'about.source': 'Código-fonte',
  'about.viewOnGithub': 'Ver no GitHub',
  'about.securityModel': 'Modelo de segurança',
  'about.securityModelDescription': 'O que a extensão garante, inclusive contra o servidor de sincronização.',
  'about.readIt': 'Ler',
  'about.rate': 'Avaliar o Keyrook Authenticator',
  'about.rateWhere': 'Na {store}. Leva poucos segundos.',
  'about.report': 'Relatar um problema ou sugerir algo',
  'about.reportDescription':
    'No GitHub, onde qualquer pessoa pode ler. Nunca cole lá uma chave de configuração, um código ou um backup.',
  'about.openIssue': 'Abrir um issue',
  'about.how': 'Como funciona',
  'about.logos.title': 'Logotipos dos serviços',
  'about.logos.description':
    'As marcas vêm embutidas na extensão e nunca são baixadas. Pedir um logotipo pela rede diria a quem respondesse em quais serviços você usa verificação em duas etapas.',
  'about.logos.body':
    '{count} serviços têm uma marca real. Arte do <simple>Simple Icons</simple> (CC0 1.0), LobeHub Icons, SVG Logos, CoreUI Brands, Arcticons e <fa>Font Awesome Free</fa> (ícones, CC BY 4.0). Todos os nomes de produtos e logotipos pertencem aos seus donos e são usados só para identificar o serviço de cada conta. Um serviço sem marca nesses conjuntos recebe um bloco com a inicial.',
  'about.shortcut.change': 'Altere em chrome://extensions/shortcuts.',
  // --- Configurações: contas ----------------------------------------------------
  'accounts.title': 'Contas',
  'accounts.description':
    'Tudo o que está guardado neste cofre. Os códigos são gerados neste dispositivo, nunca por um servidor.',
  'accounts.empty': 'Nenhuma conta ainda. Adicione uma para começar.',
  'accounts.digits': '{type} {digits} dígitos',
  'accounts.period': ' · {seconds} s',
  'accounts.counter': ' · contador {counter}',
  'accounts.steam': 'Steam Guard',
  'accounts.moveNamed': 'Compartilhar ou mover {name}',
  'accounts.edit': 'Editar',
  'common.delete': 'Excluir',
  'accounts.deleteNamed': 'Excluir {name}',
  'accounts.deleted.title': 'Excluídas recentemente',
  'accounts.deleted.description':
    'Mantidas para que os outros dispositivos saibam da remoção quando a sincronização estiver ligada. Restaure o que você removeu por engano.',
  'accounts.deleted.on': 'Excluída em {date}',
  'accounts.restore': 'Restaurar',
  'common.close': 'Fechar',
  'editor.title': 'Editar conta',
  'editor.picture': 'Imagem',
  'editor.pictureOwn': 'Sua própria imagem, usada no lugar da marca do serviço.',
  'editor.pictureNone': 'Escolha uma para serviços sem logotipo aqui, ou para diferenciar duas contas.',
  'editor.replace': 'Substituir',
  'editor.choose': 'Escolher imagem…',
  'editor.websites': 'Sites',
  'editor.websitesHint': 'Separados por vírgula. Usados para sugerir esta conta nos sites correspondentes.',
  'editor.note': 'Nota',
  'editor.group': 'Grupo',
  'editor.ungrouped': 'Sem grupo',
  'editor.noGroups': 'Crie primeiro um grupo em Contas.',
  'editor.setupKey': 'Chave de configuração',
  'editor.setupKeyHint': 'O segredo por trás desta conta. Quem o vir consegue gerar seus códigos.',
  'editor.hide': 'Ocultar',
  'editor.reveal': 'Mostrar',
  'editor.revealWarning':
    'Mostre isto só numa tela que ninguém mais esteja vendo. Copiar este link para outro app autenticador é como você leva a conta para um celular.',
  'editor.save': 'Salvar alterações',

  // --- Configurações: importação ------------------------------------------------
  'import.incomplete': {
    one: 'Estas capturas têm {seen} dos {total} códigos desta exportação do Google Authenticator, então as contas do outro não estão aqui. Escolha todas as capturas da exportação juntas para trazer tudo.',
    other: 'Estas capturas têm {seen} dos {total} códigos desta exportação do Google Authenticator, então as contas dos outros {count} não estão aqui. Escolha todas as capturas da exportação juntas para trazer tudo.',
  },
  'import.oneOrScreenshots': 'Escolha um arquivo de backup, ou uma ou mais capturas de QR codes.',
  'import.noQrInThis': 'Nenhum QR code nesta imagem.',
  'import.noAccountsInImages': 'Essas imagens não tinham nenhuma conta.',
  'import.tooLarge': 'Esse arquivo é grande demais para ser um backup.',
  'import.noAccountsInFile': 'Esse arquivo não tinha nenhuma conta.',
  'import.description':
    'Traga contas de um arquivo de backup, da exportação de outro autenticador — escaneada com a câmera ou escolhida como capturas de tela — ou colando links otpauth://.',
  'import.stopAndReview': 'Parar e revisar {count}',
  'import.noNativeReader':
    'O Chrome deste computador não tem leitor de QR embutido, então um código grande — como uma exportação do Google Authenticator — muitas vezes não é lido pela câmera. Se o seu não for, tire uma captura de cada código no celular e escolha todas em Escolher arquivos.',
  'import.encrypted': 'Este backup é criptografado. Digite a senha com que ele foi criado.',
  'import.backupPassword': 'Senha do backup',
  'import.open': 'Abrir backup',
  'import.found': { one: '{count} conta nova encontrada', other: '{count} contas novas encontradas' },
  'import.skipping': ', ignorando {count} que já estão no seu cofre',
  'import.unreadable': ', e {count} não puderam ser lidas',
  'import.foundEnd': '.',
  'import.showFailed': 'Mostrar as linhas que falharam',
  'import.import': 'Importar {count}',
  'import.scan': 'Escanear com a câmera',
  'import.choose': 'Escolher arquivos…',
  'import.paste': '…ou cole links otpauth://, um por linha',
  'import.read': 'Ler links',

  // --- Levando tudo para outro app ----------------------------------------------
  'dest.google.steps':
    'No Google Authenticator: menu → Transferir contas → Importar contas, e escaneie os códigos na ordem.',
  'dest.microsoft.steps':
    'O Microsoft Authenticator não importa de outro app, então as contas vão uma depois da outra. Nele: + → Outra conta, escaneie e toque em Próximo aqui.',
  'dest.apple.steps':
    'O app Senhas importa códigos só um de cada vez. No app Senhas: Códigos → +, escaneie e depois Próximo aqui.',
  'dest.authy.steps':
    'O Authy não importa de outro app, então as contas vão uma depois da outra. No Authy: + → Escanear QR code, e depois Próximo aqui.',
  'dest.1password.steps':
    'O 1Password adiciona códigos um login por vez. Abra ou crie o login → Editar → adicione uma senha de uso único → escaneie, e depois Próximo aqui. No computador ele consegue ler o código direto desta tela.',
  'dest.bitwarden.steps':
    'Gerenciador de senhas: Importar dados → formato “Bitwarden (json)” → escolha o arquivo. App Bitwarden Authenticator: importe do Google Authenticator e escaneie os códigos de transferência.',
  'dest.proton.steps':
    'No Proton Authenticator, importe do Google Authenticator e escaneie os códigos de transferência — ou importe do Aegis e escolha o arquivo.',
  'dest.ente.steps':
    'No Ente Auth, importe códigos do Google Authenticator e escaneie os códigos de transferência — ou escolha “Texto simples” e o arquivo .txt.',
  'dest.aegis.steps': 'No Aegis: Importar e exportar → Importar de arquivo → Aegis, e escolha o arquivo.',
  'dest.2fas.steps':
    'No 2FAS, importe do Google Authenticator e escaneie os códigos de transferência — ou importe do Aegis e escolha o arquivo.',
  'dest.other.steps':
    'Todo autenticador escaneia um código de configuração, então uma conta depois da outra sempre funciona. Muitos também importam os códigos de transferência do Google Authenticator ou um arquivo de links otpauth:// — procure uma opção de importação.',
  'dest.other.name': 'Outro app',

  // --- Configurações: exportação ------------------------------------------------
  'export.what': 'O que exportar',
  'export.all': { one: '{count} conta.', other: 'Todas as {count} contas.' },
  'export.someChosen': '{chosen} de {total} escolhidas.',
  'export.choose': 'Escolher…',
  'export.chipAll': 'Todas',
  'export.chipNone': 'Nenhuma',
  'export.encrypted.description':
    'Um arquivo protegido por uma senha que você escolhe aqui. Guarde uma cópia em lugar seguro — se este dispositivo morrer, é com este arquivo que você recupera suas contas.',
  'export.encrypted.hint': 'Pelo menos 8 caracteres. Pode ser diferente da senha mestra.',
  'export.encrypted.download': 'Baixar backup criptografado ({count})',
  'export.move.title': 'Mover para outro app',
  'export.move.description':
    'Exportações legíveis, para mudar para outro autenticador ou guardar no papel. Diferente de um backup, nenhuma delas é criptografada.',
  'export.move.danger':
    'Estes itens trazem seus segredos de 2FA às claras. Quem vir os códigos ou abrir os arquivos consegue gerar seus códigos enquanto as contas existirem. Apague os arquivos e destrua o papel quando terminar.',
  'export.move.understood': 'Entendo que estes itens não são criptografados.',
  'common.continue': 'Continuar',
  'export.move.which': 'Para qual app você está mudando?',
  'export.filesAndPaper': 'Arquivos e papel:',
  'export.aegis': 'Aegis .json',
  'export.bitwarden': 'Bitwarden .json',
  'export.text': 'otpauth .txt',
  'export.print': 'Folha para imprimir',
  'export.closesIn': {
    one: '{accounts}. Fecha de novo em {count} min.',
    other: '{accounts}. Fecha de novo em {count} min.',
  },
  'export.closesSoon': '{accounts}. Fecha de novo em breve.',
  'export.accounts': { one: '{count} conta', other: '{count} contas' },
  'export.closeNow': 'Fechar agora',
  'export.method.transfer': 'Mostrar códigos de transferência',
  'export.method.oneByOne': 'Escanear uma por uma',
  'export.method.aegis': 'Baixar arquivo do Aegis',
  'export.method.bitwarden': 'Baixar arquivo do Bitwarden',
  'export.method.text': 'Baixar arquivo de texto',
  'export.allAtOnce': 'Todas de uma vez',
  'export.oneAtATime': 'Uma de cada vez',
  'export.transfer.label': 'Códigos de transferência para o {app}',
  'export.transfer.title': 'Códigos de transferência do Google Authenticator',
  'export.moveTo': 'Mover para o {app}',
  'export.transfer.none': 'Nenhuma das contas escolhidas pode ir para o Google Authenticator.',
  'export.transfer.codeLabel': 'Código de transferência {index} de {total}',
  'export.previous': 'Anterior',
  'export.next': 'Próximo',
  'export.transfer.code': 'Código {index} de {total}',
  'export.transfer.oneHolds': {
    one: 'Um código traz {count} conta.',
    other: 'Um código traz todas as {count} contas.',
  },
  'export.transfer.notIncluded': 'Não incluídas — mova estas uma por uma:',
  'export.oneByOne.label': 'Códigos de configuração para o {app}, um de cada vez',
  'export.oneByOne.title': 'Uma conta de cada vez',
  'export.oneByOne.progress': 'Contas mostradas',
  'export.oneByOne.position': 'Conta {index} de {total}',
  'export.oneByOne.keys': '→ ou Espaço para a próxima, Esc para parar',
  'export.steamRefused': 'O {app} não gera códigos do Steam Guard, então não vai aceitar esta conta.',
  'export.print.label': 'QR codes para imprimir ou escanear',
  'export.print.title': 'Keyrook Authenticator — códigos de configuração',
  'export.print.body':
    '{accounts}, {date}. Cada código configura a conta em qualquer app autenticador. Quem tiver isto consegue gerar seus códigos: guarde trancado.',
  'export.print.print': 'Imprimir ou salvar como PDF',

  // --- Configurações: segurança -------------------------------------------------
  'security.locking': 'Bloqueio',
  'security.lockAfter': 'Bloquear após inatividade',
  'security.lockAfter.passphrase':
    'A chave de descriptografia é apagada da memória. Sua senha mestra volta a ser pedida.',
  'security.lockAfter.device':
    'Só vale com senha mestra — um cofre com chave do dispositivo não tem nada para desbloquear.',
  'security.autoLock': 'Tempo para bloquear',
  'security.minutes': { one: '{count} minuto', other: '{count} minutos' },
  'security.hour': '1 hora',
  'security.never': 'Nunca',
  'security.needsPassword': 'Precisa de senha mestra',
  'security.blur': 'Desfocar códigos até passar o mouse',
  'security.blurDescription': 'Mantém os códigos fora da tela ao compartilhar a tela.',
  'security.blurToggle': 'Desfocar códigos',
  'security.autofill': 'Preenchimento automático',
  'security.autofillRow': 'Oferecer preencher códigos nas páginas',
  'security.appearance': 'Aparência',
  'security.theme': 'Tema',
  'security.theme.system': 'Igual ao sistema',
  'security.theme.light': 'Claro',
  'security.theme.dark': 'Escuro',
  'security.sortBy': 'Ordenar contas por',
  'security.sortOrder': 'Ordem',
  'security.sort.added': 'Ordem de inclusão',
  'security.sort.name': 'Nome',
  'security.language': 'Idioma',
  'security.languageBrowser': 'Padrão do navegador ({language})',
  // --- Configurações: como o cofre é protegido ----------------------------------
  'protect.msg.removedSignedIn':
    'Este dispositivo agora abre sem senha. A senha da sua conta não mudou.',
  'protect.msg.removed': 'Senha mestra removida. Este cofre agora se desbloqueia sozinho neste dispositivo.',
  'protect.msg.setSignedIn': 'Este dispositivo agora é bloqueado com a senha da sua conta.',
  'protect.msg.set': 'Senha mestra definida. Ela será pedida depois que o cofre bloquear.',
  'protect.msg.changedSignedIn':
    'Senha alterada, para este cofre e para sua conta. Seus outros dispositivos vão pedir que você entre de novo com ela.',
  'protect.msg.changed': 'Senha mestra alterada.',
  'protect.state.accountPassword': 'Bloqueia com a senha da sua conta',
  'protect.state.master': 'Senha mestra',
  'protect.state.device': 'Chave do dispositivo (sem senha)',
  'protect.lockWithAccount': 'Bloquear com a senha da conta',
  'protect.addMaster': 'Adicionar uma senha mestra',
  'protect.changePassword': 'Alterar senha',
  'protect.note.passphrase':
    'Esta também é a senha da sua conta de sincronização. Alterar aqui altera lá, e seus outros dispositivos vão pedir que você entre de novo.',
  'protect.note.device':
    'Sua conta de sincronização tem a própria senha, que este dispositivo não pede. Você precisa dela num dispositivo novo e para alterar a conta ou a chave de recuperação.',
  'protect.removeWarning':
    'O cofre continua criptografado, mas vai se desbloquear sozinho sempre que este perfil do navegador estiver aberto. Qualquer pessoa usando este computador poderá ver seus códigos.',
  'protect.removeWarningSignedIn':
    ' Sua conta continua com a senha — você ainda vai precisar dela num dispositivo novo.',
  'protect.currentPassword': 'Senha atual',
  'protect.currentMaster': 'Senha mestra atual',
  'protect.accountPassword': 'Senha da conta',
  'protect.accountPasswordHint':
    'A senha que você usa para entrar na sincronização. Este dispositivo vai pedi-la depois de bloquear.',
  'protect.newPassword': 'Nova senha',
  'protect.hint12': 'Pelo menos 12 caracteres variados, ou quatro ou cinco palavras sem relação.',
  'protect.confirmNew': 'Confirme a nova senha',
  'protect.removePassword': 'Remover senha',
  'protect.lockWithIt': 'Bloquear com ela',
  'protect.setPassword': 'Definir senha',
  'danger.title': 'Excluir este cofre',
  'danger.description':
    'Remove todas as contas e o cofre criptografado deste dispositivo. Não dá para desfazer, e não há cópia em nenhum outro lugar.',
  'danger.open': 'Excluir este cofre…',
  'danger.warning':
    'Antes, confira se você ainda tem outra forma de entrar em cada conta — um arquivo de backup, códigos de recuperação ou as mesmas contas no seu celular.',
  'common.typeToConfirm': 'Digite {word} para confirmar',
  'danger.confirm': 'Excluir tudo',

  // --- Configurações: chave de recuperação --------------------------------------
  'kit.title': 'Chave de recuperação',
  'kit.provider':
    'Sua conta não tem senha. A chave de recuperação é o caminho de volta se todos os dispositivos conectados a ela se perderem: ela deixa um dispositivo novo entrar na conta sem outro para aprovar. O {provider} não pode fazer isso por você.',
  'kit.signedIn':
    'Ninguém consegue redefinir sua senha por você — nem mesmo nós. A chave de recuperação é o único caminho de volta se você esquecer: ela abre este cofre, seus outros dispositivos e sua conta num dispositivo novo.',
  'kit.passphrase':
    'Ninguém consegue redefinir sua senha mestra — nem mesmo nós. É isso que impede outra pessoa de abrir seu cofre, e é também por isso que a chave de recuperação é o único caminho de volta se você esquecer.',
  'kit.device':
    'Este cofre se desbloqueia com uma chave que o navegador guarda. Se essa chave se perder — dados de navegação apagados, um perfil novo, uma reinstalação — só a chave de recuperação ainda consegue abri-lo.',
  'kit.none': 'Nenhuma chave de recuperação ainda',
  'kit.vaultOnly': 'Abre este cofre, mas não sua conta',
  'kit.issued': 'Uma chave de recuperação foi emitida',
  'kit.issueNew': 'Emitir uma nova',
  'kit.create': 'Criar uma chave de recuperação',
  'kit.beforeSignIn':
    'Esta chave foi emitida antes de você entrar, então sua conta não a tem. Ela ainda abre este cofre aqui, mas não num dispositivo novo. Emita uma nova para cobrir os dois.',
  'kit.replaces':
    'Emitir uma chave nova faz a anterior parar de funcionar, então uma folha impressa antiga pode ser jogada fora depois da troca.',
  'kit.replacesSignedIn':
    'Emitir uma chave nova faz a anterior parar de funcionar, aqui e nos seus outros dispositivos, então uma folha impressa antiga pode ser jogada fora depois da troca.',
  'kit.withoutProvider':
    'Sem ela, perder todos os dispositivos conectados à sua conta significa perder para sempre todas as contas deste cofre.',
  'kit.withoutPassword':
    'Sem ela, esquecer sua senha significa perder para sempre todas as contas deste cofre.',
  'kit.withoutDevice':
    'Sem ela, perder a chave que este navegador guarda significa perder para sempre todas as contas deste cofre.',
  'kit.noSupport': 'Nenhum pedido ao suporte consegue desfazer isso.',
  'kit.removeProvider':
    'Removê-la deixa um dispositivo já conectado como a única forma de deixar um novo entrar na sua conta.',
  'kit.removePassword': 'Removê-la deixa sua senha como a única forma de entrar.',
  'kit.removePasswordSignedIn':
    'Removê-la deixa sua senha como a única forma de entrar — neste dispositivo, nos outros e na sua conta.',
  'kit.reauth':
    'Uma chave de recuperação pode deixar um dispositivo entrar na sua conta, então o {provider} pede que você entre mais uma vez antes.',
  'kit.passwordHint': 'Uma chave de recuperação pode redefinir sua conta, então alterá-la exige sua senha.',
  'kit.removeConfirm': 'Remover a chave de recuperação',
  'kit.createConfirm': 'Criar a chave',

  // --- Configurações: conta e sincronização -------------------------------------
  'account.title': 'Conta',
  'facts.stored': 'Contas guardadas',
  'facts.noLimit': 'Sem limite',
  'facts.encryption': 'Criptografia',
  'facts.autofill': 'Preenchimento e leitura de QR',
  'facts.included': 'Incluído',
  'facts.backup': 'Arquivo de backup criptografado',
  'facts.sync': 'Sincronização entre dispositivos',
  'facts.needsAccount': 'Requer uma conta',
  'facts.notYet': 'Ainda não disponível',
  'facts.withoutAccount': 'Sem conta, neste dispositivo',
  'facts.title': 'O que um cofre local gratuito oferece',
  'facts.description':
    'Sem conta, sem e-mail, sem servidor — e sem limites no que importa para a segurança.',
  'account.localOnly': 'Só local — não conectado',
  'account.noServer':
    'Esta versão foi feita sem servidor de sincronização, então nada que você adiciona aqui sai da sua máquina.',
  'account.signedInWith': 'Conectado com {provider} · ',
  'account.lastSynced': 'Última sincronização às {time}',
  'account.notSynced': 'Ainda não sincronizado',
  'account.every5': ' · sincroniza a cada 5 minutos',
  'account.syncNow': 'Sincronizar agora',
  'account.signOut': 'Sair',
  'account.noKitProvider':
    'Sua conta não tem chave de recuperação. Se todos os dispositivos conectados a ela se perderem, nada recupera suas contas — nem nós, nem o {provider}.',
  'account.noKit':
    'Sua conta não tem chave de recuperação. Se você esquecer a senha e perder este dispositivo, nada recupera suas contas — nem nós, nem ninguém.',
  'account.createUnderSecurity': 'Crie uma em Segurança',
  'summary.sentReceived': '{sent} enviadas, {received} recebidas',
  'summary.conflicts': ', mantida a versão deste dispositivo em {count}',
  'summary.overLimit': ', {count} não couberam — uma conta guarda até 10.000 — e ficaram neste dispositivo',
  'summary.end': '.',
  'summary.deleted': {
    one: ' {count} conta foi removida em outro dispositivo — você pode restaurá-la em Contas.',
    other: ' {count} contas foram removidas em outro dispositivo — você pode restaurá-las em Contas.',
  },
  'summary.rejected': {
    one: ' {count} registro não pôde ser descriptografado e foi ignorado. Se isso continuar, há algo errado com a cópia guardada.',
    other: ' {count} registros não puderam ser descriptografados e foram ignorados. Se isso continuar, há algo errado com a cópia guardada.',
  },
  'account.signOutNote':
    'Sair remove seus códigos deste navegador. Eles continuam na sua conta no Keyrook — entre de novo para trazê-los de volta.',
  'accountPage.title': 'Sua conta Keyrook',
  'accountPage.body': 'A senha, a chave de recuperação, recomeçar do zero e excluir ficam na página da conta, para todos os apps Keyrook de uma vez.',
  'accountPage.bodyNoRoot': 'A senha e excluir ficam na página da conta. A chave de recuperação é criada aqui, em Segurança, até outro app Keyrook usar a conta.',
  'accountPage.bodyProvider': 'A chave de recuperação, recomeçar do zero e excluir ficam na página da conta, para todos os apps Keyrook de uma vez.',
  'accountPage.bodyNoRootProvider': 'Excluir fica na página da conta. A chave de recuperação é criada aqui, em Segurança, até outro app Keyrook usar a conta.',
  'sheetCheck.lead': 'Digite uma vez a chave de recuperação que você guardou, para este app saber que ela recupera seus códigos. Ela é verificada neste dispositivo e não é enviada a lugar nenhum.',
  'sheetCheck.submit': 'Verificar',
  'sheetCheck.lost': 'Perdeu, ou nunca teve uma? Crie uma nova na página da conta.',
  'accountPage.noSheetYet': 'Nada mostra ainda que sua chave de recuperação protege o Keyrook Authenticator. Sem ela, uma senha esquecida pode custar seus códigos. Digite-a uma vez em Segurança, ou crie uma nova na página da conta.',
  'account.checkUnderSecurity': 'Verificar em Segurança',
  'accountPage.open': 'Abrir a página da conta',
  'accountPage.recoveryKey': 'A chave de recuperação de um cofre conectado é a da conta Keyrook. Ela é criada e trocada na página da conta.',
  'accountPage.sheetProtects': 'A chave de recuperação da conta protege o Keyrook Authenticator',
  'accountPage.sheetUnknown': 'Ainda não se sabe se protege o Keyrook Authenticator',
  'secondStep.title': 'Mais uma etapa',
  'secondStep.lead': 'Sua conta no Keyrook pede uma segunda etapa. Digite o código de 6 dígitos que o seu app autenticador mostra para ela.',
  'secondStep.field': 'Código ou chave de recuperação',
  'secondStep.hint': 'Perdeu esse app? Digite a chave de recuperação da sua conta.',
  'secondStep.passkey': 'Usar uma chave de acesso',
  'secondStep.where': 'O login em duas etapas é ativado e desativado em account.keyrook.com.',
  'secondStep.ownerLead': 'Sua conta também pede uma segunda etapa para isto: o código do app autenticador ou a sua chave de recuperação.',
  'secondStep.nextCode': 'Cada código vale uma vez só. Se você acabou de entrar com um, espere o seu app mostrar o próximo.',
  'secondStepTip.title': 'Login em duas etapas',
  'secondStepTip.suggest': 'Peça também um código sempre que esta conta entrar em outro dispositivo. Ative em account.keyrook.com e guarde o código aqui: naquela página, abra o Keyrook Authenticator e escolha “{scan}”.',
  'secondStepTip.kept': 'O código de login desta própria conta fica guardado aqui, em cada dispositivo conectado a ela.',
  'secondStepTip.warning': 'Se você perder todos os dispositivos que o guardam, entre com sua chave de recuperação no lugar do código. Guarde a chave de recuperação em outro lugar.',
  'secondStepTip.open': 'Ativar',
  'signin.providerHasPassword': '{provider} confirmou que é você, e {email} também tem uma senha. Digite-a para abrir seus códigos aqui.',
  'provider.addOnPage': 'Para entrar também com o Google ou o GitHub, entre na página da conta com a sua senha e adicione-o lá.',
  'startOver.title': 'Sua conta no Keyrook vai recomeçar do zero em {date}',
  'startOver.lead': 'Alguém em “{device}” pediu isso em {date}, com o código que enviamos para o seu e-mail: uma senha nova e chaves novas, e seus apps começariam vazios.',
  'startOver.ifYou': 'Se foi você, não precisa fazer nada. Se não foi, cancele agora e depois troque a senha do seu e-mail: quem pediu consegue ler seus e-mails.',
  'startOver.cancel': 'Não fui eu — cancelar',
  'kept.title': 'Guardado de antes de a conta recomeçar',
  'kept.body': 'Quando esta conta recomeçou do zero, o que o Keyrook Authenticator tinha nela foi guardado até {date}. Traga de volta com a senha que a conta tinha na época, ou com a chave de recuperação da época.',
  'kept.password': 'Senha da época',
  'kept.recoveryKey': 'Chave de recuperação da época',
  'kept.usePassword': 'Usar a senha da época',
  'kept.useRecoveryKey': 'Usar a chave de recuperação da época',
  'kept.bring': 'Trazer de volta',
  'kept.done': 'Voltou para este cofre e está a caminho dos seus outros dispositivos.',
  'error.keys.awaitingConfirmation': 'Outro app Keyrook substituiu as chaves desta conta, e a do Keyrook Authenticator ainda não acompanhou. Abra a página da conta para conferir e entre de novo.',
  'password.changedBoth':
    'Senha alterada, para sua conta e este cofre. Seus outros dispositivos vão pedir que você entre de novo com ela.',
  'password.changedAccount':
    'Senha da conta alterada. Seus outros dispositivos vão pedir que você entre de novo com ela.',
  'password.title': 'Senha',
  'password.row': 'Senha da conta',
  'password.rowDescription':
    'É com ela que você entra num dispositivo novo. Ninguém consegue redefini-la para você — guarde bem sua chave de recuperação.',
  'password.change': 'Alterar senha…',
  'password.formTitle': 'Alterar a senha da conta',
  'devices.title': 'Dispositivos conectados',
  'devices.description':
    'Desconecte um dispositivo que você não usa ou não tem mais. Se ele usa um Keyrook Authenticator atualizado, na próxima conexão ele mesmo tira os códigos desta conta e guarda só o que nunca enviou. Até lá, ou se nunca mais se conectar, ele mantém o que tinha, protegido pela mesma senha.',
  'devices.descriptionProvider':
    'Desconecte um dispositivo que você não usa ou não tem mais. Se ele usa um Keyrook Authenticator atualizado, na próxima conexão ele mesmo tira os códigos desta conta e guarda só o que nunca enviou. Até lá, ou se nunca mais se conectar, ele mantém o que tinha, bloqueado do jeito que o cofre está bloqueado nele.',
  'devices.this': 'Este dispositivo',
  'devices.when': 'Conectado em {created} · ativo pela última vez em {seen}',
  'removed.kept': 'Os códigos adicionados ou alterados aqui que não tinham chegado à conta continuam aqui.',
  'delete.row': 'Excluir sua conta',
  'delete.rowDescription':
    'Remove todas as cópias criptografadas que o servidor guarda. Este dispositivo mantém o cofre como está; os outros param de sincronizar.',
  'delete.open': 'Excluir conta…',
  'delete.warning':
    'Não dá para desfazer. Se depois disso este dispositivo for o único lugar onde suas contas ainda existem, guarde-o — ou exporte um backup antes.',
  'delete.reauth': 'O {provider} pede que você entre mais uma vez antes de qualquer exclusão.',
  'delete.confirm': 'Excluir a conta',

  // --- Entrando: o primeiro cartão ----------------------------------------------
  'intro.benefit1': 'Os mesmos códigos em todo dispositivo em que você entrar.',
  'intro.benefit2': 'Um notebook perdido ou quebrado não é um cofre perdido.',
  'intro.benefit3': 'Grátis e opcional — tudo continua funcionando neste dispositivo sem isso.',
  'intro.title': 'Sincronize seu cofre',
  'intro.subtitle':
    'Criptografado neste dispositivo antes de sair. O servidor guarda o que não consegue ler — e nós também não.',
  'intro.signedOutProvider':
    'Este dispositivo foi desconectado de {email} — ele foi removido em outro. Continue com o {provider} para entrar de novo.',
  'intro.orEmail': 'ou use e-mail',
  'intro.create': 'Criar uma conta',
  'intro.signIn': 'Entrar',
  'intro.source': 'Código aberto — veja como seus códigos são criptografados',

  // --- Entrando: formulários de e-mail ------------------------------------------
  'form.email': 'E-mail',
  'form.emailPlaceholder': 'voce@exemplo.com',
  'create.checkEmail': 'Confira seu e-mail',
  'create.codeSent': 'Enviamos um código de seis dígitos para <b>{email}</b>. Ele vale uma vez, por 15 minutos.',
  'create.code': 'Código',
  'create.spam':
    'Não está na caixa de entrada? Procure em <b>Spam</b> uma mensagem do <b>Keyrook</b> e marque como <b>Não é spam</b>.',
  'create.submit': 'Criar conta',
  'create.existing':
    'Se este endereço já tiver uma conta, o e-mail avisa — aí é só entrar.',
  'create.stillNothing': 'Ainda nada?',
  'create.resendIn': 'Enviar um novo código em {seconds} s',
  'create.resend': 'Enviar um novo código',
  'create.wrongAddress': '. Endereço errado?',
  'create.changeIt': 'Alterar',
  'create.title': 'Crie sua conta',
  'create.choosing': 'Você vai precisar desta senha num dispositivo novo. Este continua abrindo sem ela.',
  'create.sharing': 'Sua senha mestra também vira a senha da conta — continua sendo uma só.',
  'create.password': 'Senha',
  'create.master': 'Senha mestra',
  'create.next':
    'Em seguida enviamos um código por e-mail para confirmar o endereço, e você guarda uma chave de recuperação — o único caminho de volta se esquecer a senha.',
  'create.agree': 'Criar uma conta significa concordar com a <link>política de privacidade</link>.',
  'create.haveAccount': 'Já tem uma conta?',
  'signin.subtitle': 'Os códigos que já estão neste dispositivo são adicionados à sua conta.',
  'signin.signedOut':
    'Este dispositivo foi desconectado de {email} — a senha foi alterada ou o dispositivo foi removido em outro. Entre de novo para continuar sincronizando.',
  'signin.forgot': 'Esqueceu a senha?',
  'signin.locksWithAccount': 'A partir daí, este dispositivo será bloqueado com a senha da sua conta.',
  'signin.keepsOpening': 'Este dispositivo continua abrindo sem senha.',
  'signin.newHere': 'Primeira vez aqui?',
  'recoverAccount.title': 'Recupere sua conta',
  'recoverAccount.subtitle':
    'Use a chave de recuperação que você guardou ao criá-la e depois escolha uma nova senha.',
  'recoverAccount.keyHint': '32 caracteres da sua folha impressa. Espaços e hifens não importam.',
  'recoverAccount.submit': 'Recuperar e entrar',
  'recoverAccount.elsewhere': 'Se outro app Keyrook também usa esta conta, a senha dela é redefinida na página da conta.',
  'recoverAccount.note':
    'Todos os dispositivos da conta são desconectados e vão pedir a nova senha. Sua chave de recuperação continua valendo.',

  // --- Entrando: depois ---------------------------------------------------------
  'ready.empty': 'Sua conta está pronta.',
  'ready.all': {
    one: 'Sua conta está pronta, e a conta deste dispositivo já está guardada nela.',
    other: 'Sua conta está pronta, e todas as {count} contas deste dispositivo já estão guardadas nela.',
  },
  'ready.some':
    'Sua conta está pronta. {done} de {total} contas já foram guardadas; o resto vai na próxima sincronização.',
  'fresh.title': 'Guarde sua chave de recuperação',
  'fresh.provider':
    'Se todos os dispositivos conectados à sua conta se perderem, esta chave é o único caminho de volta — o {provider} não consegue restaurar seu cofre, e nós também não.',
  'fresh.password':
    'Se você esquecer a senha, esta chave é o único caminho de volta — ninguém consegue redefini-la para você, nem mesmo nós.',
  'welcome.fromAccount': '{count} da sua conta',
  'welcome.fromDevice': '{count} adicionadas deste dispositivo',
  'welcome.inSync': 'Já está sincronizado.',
  'welcome.nothing': 'Nada aqui ainda.',
  'welcome.failed': 'Conectado — a primeira sincronização não terminou',
  'welcome.back': 'Você voltou',
  'welcome.signedIn': 'Você está conectado',
  'welcome.nothingLost':
    'Nada se perdeu: seus códigos chegam na próxima sincronização. Tente de novo agora, ou ela acontece sozinha em até cinco minutos.',
  'welcome.onDevice': { one: 'conta neste dispositivo', other: 'contas neste dispositivo' },
  'welcome.uploading': {
    one: ' · {count} ainda está sendo enviada e vai na próxima sincronização',
    other: ' · {count} ainda estão sendo enviadas e vão na próxima sincronização',
  },
  'welcome.othersSignedOut': 'Todos os outros dispositivos foram desconectados e vão pedir a nova senha.',
  'welcome.tryAgain': 'Tentar de novo',
  'welcome.seeAccounts': 'Ver suas contas',
  'welcome.toolbar': 'Elas também ficam a um clique: o ícone do Keyrook Authenticator na barra de ferramentas.',

  // --- Entrando com Google ou GitHub --------------------------------------------
  'provider.continue': 'Continuar com {provider}',
  'provider.finishInWindow': 'Termine na janela do {provider} que se abriu.',
  'provider.confirmed': 'O {provider} confirmou <b>{email}</b>. Nenhuma conta usa esse endereço ainda.',
  'provider.point1':
    'Sem senha. Num dispositivo novo você continua com o {provider}, e um dispositivo já conectado o deixa entrar depois que você confere que os dois mostram o mesmo código.',
  'provider.point2':
    'O {provider} prova que é você. Ele nunca vê seus códigos: eles são criptografados aqui, com uma chave que fica nos seus dispositivos.',
  'provider.point3':
    'Em seguida você guarda uma chave de recuperação — o caminho de volta se todos os dispositivos conectados à conta se perderem. O {provider} não consegue restaurar seu cofre.',
  'provider.notRight': 'Não é a conta certa?',
  'provider.startAgain': 'Começar de novo',
  'passkey.continue': 'Continuar com uma chave de acesso',
  'passkey.where':
    'Uma que você adicionou na <link>página da conta</link>, em “Chaves de acesso”. Na primeira vez, o Chrome pergunta se o Keyrook Authenticator pode usá-la.',
  'pairing.codeLabel': 'Código {code}',
  'join.title': 'Deixe este navegador entrar',
  'join.subtitle':
    '<b>{email}</b> já tem uma conta. Aprove este navegador a partir de um dispositivo que já esteja conectado a ela.',
  'join.masterPassword': 'Senha mestra deste cofre',
  'join.masterHint': 'Ela continua bloqueando este cofre aqui; a conta em si não tem senha.',
  'join.ask': 'Pedir para entrar',
  'join.step1':
    'Num dispositivo já conectado, abra o Keyrook Authenticator. O pedido aparece lá — acima dos códigos e nas Configurações, em Sincronização.',
  'join.step2': 'Confira se ele mostra o mesmo código desta página e aprove.',
  'join.askAgain': 'Pedir de novo',
  'join.compare': 'O outro dispositivo também mostra um código. Aprove lá só se for exatamente este.',
  'join.waiting': 'Esperando outro dispositivo…',
  'join.noOther': 'Não sobrou nenhum outro dispositivo?',
  'join.useKey': 'Use sua chave de recuperação',
  'join.wrongAccount': 'Entrou no {provider} com a conta errada?',
  'joinKey.subtitle':
    'A chave que você guardou quando a conta foi criada. Ela deixa este navegador entrar sem precisar de outro dispositivo.',
  'joinKey.submit': 'Entrar na conta',
  'approve.approved': 'Aprovado. O outro dispositivo abre seu cofre em instantes.',
  'approve.mismatch':
    'Recusado. Se não era você entrando agora, outra pessoa consegue entrar na sua conta do {provider} — troque a senha dela e revise as configurações de segurança.',
  'approve.declined': 'Recusado. Nada foi enviado.',
  'approve.title': 'Dispositivos pedindo para entrar',
  'approve.description':
    'Cada pedido vem de alguém que acabou de entrar com sua conta do {provider}. Aprove só um dispositivo em que você mesmo está entrando, agora.',
  'approve.descriptionAny':
    'Cada pedido vem de alguém que acabou de entrar com sua conta do Google ou do GitHub. Aprove só um dispositivo em que você mesmo está entrando, agora.',
  'approve.mismatchAny':
    'Recusado. Se não era você entrando agora, outra pessoa consegue entrar na sua conta do Google ou do GitHub — troque a senha dela e revise as configurações de segurança.',
  'approve.askedAt': 'Pedido às {time}',
  'approve.review': 'Revisar',
  'approve.deny': 'Negar',
  'approve.question':
    'O dispositivo que está pedindo mostra exatamente este código? Se não mostrar, outra pessoa está tentando entrar.',
  'approve.matches': 'Confere — deixar entrar',
  'approve.doesNotMatch': 'Não confere',

  // --- Erros, continuação -------------------------------------------------------
  'error.vaultNewer':
    'Este cofre foi criado por uma versão mais nova do Keyrook Authenticator. Atualize antes de abri-lo.',
  'error.uriUnsupported': 'Esse link usa uma configuração que este app não consegue ler ({value}).',

  // --- Configurações: contas, continuação ---------------------------------------
  'editor.websitesPlaceholder': 'github.com, gist.github.com',

  // --- Erros, por último --------------------------------------------------------
  'error.noWorker': 'A extensão não respondeu. Feche e abra de novo.',

  // --- Configurações, por tarefa ------------------------------------------------
  'nav.sync': 'Sincronização',
  'nav.general': 'Geral',
  'nav.needsAttention': 'Precisa de atenção',
  'sync.description': 'Os mesmos códigos em todo dispositivo em que você entrar, criptografados aqui antes de sair.',
  'backup.description': 'Guarde uma cópia criptografada, traga contas ou leve-as para outro app.',
  'backup.choice.backup.title': 'Fazer backup',
  'backup.choice.backup.body': 'Um arquivo criptografado, protegido por uma senha que você escolhe.',
  'backup.choice.import.title': 'Importar',
  'backup.choice.import.body': 'De um backup, da exportação de outro app ou de links otpauth://.',
  'backup.choice.move.body': 'Códigos de transferência, uma folha para imprimir ou um arquivo legível. Sem criptografia.',
  'security.description': 'Como este cofre abre, e o caminho de volta se você perder este navegador.',
  'security.deviceKeyHint': 'Nada para digitar. Não impede malware rodando como você neste computador.',
  'security.passwordHint': 'Pedida sempre que o cofre for bloqueado.',
  'general.description': 'Como a extensão se parece e se comporta, e de onde ela vem.',
  'general.inBrowser': 'No navegador',
  'general.autofillHint':
    'Abrir a janela da extensão numa página de login oferece o código certo. Só essa aba é lida.',
  'vault.signInToSync': 'Entrar para sincronizar',
  'vault.empty.signIn':
    'Já usa o Keyrook Authenticator em outro dispositivo? <link>Entre</link> para trazer seus códigos para cá.',
  'setup.haveAccount': 'Já usa o Keyrook Authenticator? <link>Entre</link> para trazer seus códigos para cá.',
  'popup.signInOpensTab': 'Abre numa nova aba e termina nas Configurações.',
  'error.backupWrongPassword': 'Essa senha não abre este arquivo.',
  'error.foreign.steamFolder': 'Escolha juntos todos os arquivos da pasta maFiles do Steam Desktop Authenticator: o manifest.json e os arquivos .maFile ao lado dele.',
  'error.foreign.locked':
    'Esta exportação está protegida por uma senha que o Keyrook Authenticator não consegue abrir. Exporte de novo sem senha.',
  'import.lockedFrom': 'O {app} protegeu esta exportação com uma senha. Digite a que você definiu lá.',
  'import.fromApps':
    'Exportações do Aegis, 2FAS, Bitwarden, Proton, Ente Auth, andOTP, FreeOTP+, Steam Desktop Authenticator, da extensão Authenticator e do Google Authenticator também funcionam — e um CSV das Senhas da Apple, do 1Password ou de outro gerenciador.',
  'shortcut.open': 'Abrir o Keyrook Authenticator',
  'shortcut.fill': 'Preencher o código desta página',
  'shortcut.fillHint': 'Só preenche quando exatamente uma conta pertence ao site; fora isso, abre a lista.',
  'shortcut.notSet': 'Não definido',
  'vault.shortcutHint': '{keys} preenche sem abrir isto.',
  'import.csvWarning':
    'Este arquivo traz suas senhas às claras. Só as chaves de dois fatores foram lidas e nada mais é guardado — apague o arquivo quando terminar.',
  'import.noKeysInCsv': 'Esse arquivo não tem chaves de dois fatores — só senhas.',
  'crash.title': 'Algo deu errado',
  'crash.body':
    'Esta tela encontrou um problema e parou. Suas contas guardadas não foram afetadas. Recarregar costuma resolver.',
  'crash.reload': 'Recarregar',
  'setup.device.description.phone':
    'Seus segredos são criptografados com uma chave que este celular guarda para você. Nada para lembrar, nada para digitar.',
  'setup.device.footnote.phone':
    'Protege contra uma cópia dos arquivos do app. Não contra alguém que consiga desbloquear este celular.',
  'setup.password.footnote.phone':
    'A opção mais forte: depois de bloqueado, nada neste celular abre o cofre sem a senha.',
  'unrecoverable.why.phone':
    'A chave de criptografia dele era guardada por este celular e sumiu — normalmente porque os dados do app foram apagados, o app foi reinstalado ou o cofre veio do backup de outro celular. Sem essa chave ninguém consegue descriptografar as contas salvas, nem nós.',
  'vault.empty.body.phone':
    'Quando um site mostrar um QR code para configurar a verificação em duas etapas, escaneie com a câmera deste celular.',
  'add.camera.description.phone':
    'Para um código em outra tela — inclusive uma exportação do Google Authenticator.',
  'add.fromGoogle.phone':
    'Vindo do Google Authenticator em outro celular? Exporte suas contas lá e escaneie o código que ele mostrar com a câmera deste celular. Se aparecerem vários, faça um por um.',
  'camera.noCamera.phone': 'Este celular não dá uma câmera ao app.',
  'camera.blocked.phone':
    'O app não tem permissão para usar a câmera. Permita nas configurações do celular ou use outra forma de adicionar uma conta.',
  'camera.none.phone': 'Nenhuma câmera encontrada neste celular.',
  'security.languageBrowser.phone': 'Padrão do celular ({language})',
  'protect.removeWarning.phone':
    'O cofre continua criptografado, mas vai se desbloquear sozinho sempre que o app abrir. Qualquer pessoa que consiga desbloquear este celular poderá ver seus códigos.',
  'kit.device.phone':
    'Este cofre se desbloqueia com uma chave que o celular guarda. Se essa chave se perder — dados do app apagados, uma reinstalação, um celular novo — só a chave de recuperação ainda consegue abri-lo.',
  'kit.withoutDevice.phone':
    'Sem ela, perder a chave que este celular guarda significa perder para sempre todas as contas deste cofre.',
  'security.description.phone': 'Como este cofre abre, e o caminho de volta se você perder este celular.',
  'security.deviceKeyHint.phone':
    'Nada para digitar. Qualquer pessoa que consiga desbloquear este celular pode abri-lo.',
  'general.description.phone': 'Como o app se parece e se comporta, e de onde ele vem.',
  'about.securityModelDescription.phone': 'O que o app garante, e o que não garante.',
  'about.logos.description.phone':
    'As marcas vêm embutidas no app e nunca são baixadas. Pedir um logotipo pela rede diria a quem respondesse em quais serviços você usa verificação em duas etapas.',
  'about.fact.access.title.phone': 'Só a câmera, e só para escanear',
  'about.fact.access.body.phone':
    'O app não pede nenhuma permissão além da câmera, e só quando você escolhe escanear um código. O que a câmera vê nunca sai do celular.',
  'about.fact.keys.body.phone':
    'Suas contas são criptografadas com uma chave de dados que, por sua vez, é protegida por outra. Com senha mestra, essa chave de proteção vem do PBKDF2 com 600.000 rodadas e só existe na memória enquanto o cofre está aberto. Sem senha, é uma chave lacrada pelo próprio armazenamento de chaves do celular, então uma cópia dos arquivos do app não abre o cofre.',
  'rate.store.play': 'Google Play',
  'add.noNativeReader.phone':
    'Um código grande — como uma exportação do Google Authenticator — muitas vezes não é lido pela câmera aqui. Se o seu não for, tire uma foto dele com o app de câmera do celular e use Enviar uma imagem de QR.',
  'import.noNativeReader.phone':
    'Um código grande — como uma exportação do Google Authenticator — muitas vezes não é lido pela câmera aqui. Se o seu não for, tire uma foto de cada código com o app de câmera do celular e escolha todas em Escolher arquivos.',
  'error.signOutUnsynced.phone':
    'Algumas alterações deste celular ainda não chegaram à sua conta, e sair agora faria você perdê-las. Conecte-se à internet e tente de novo.',
  'account.signOutNote.phone':
    'Sair remove seus códigos deste celular. Eles continuam na sua conta no Keyrook — entre de novo para trazê-los de volta.',
  'secondStepTip.suggest.phone':
    'Peça também um código sempre que esta conta entrar em outro dispositivo. Ative em account.keyrook.com e guarde o código aqui: adicione uma conta neste app e leia o QR code que aquela página mostra.',
  'intro.benefit2.phone': 'Um celular perdido ou quebrado não é um cofre perdido.',
  'provider.finishInWindow.phone': 'Termine na página do {provider} que se abriu no seu navegador.',
  'join.title.phone': 'Deixe este celular entrar',
  'join.subtitle.phone':
    '<b>{email}</b> já tem uma conta. Aprove este celular a partir de um dispositivo que já esteja conectado a ela.',
  'joinKey.subtitle.phone':
    'A chave que você guardou quando a conta foi criada. Ela deixa este celular entrar sem precisar de outro dispositivo.',
  'facts.autofill.phone': 'Leitura de QR',
};
