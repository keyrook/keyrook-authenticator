// Tiếng Việt. Xưng "bạn"; "kho" là nơi cất mã, "khoá khôi phục" là lối vào cuối cùng.
import type { Dictionary } from './en.js';

export const vi: Dictionary = {
  // --- Lỗi ----------------------------------------------------------------------
  'error.vaultLocked': 'Kho đang khoá.',
  'error.vaultExists': 'Thiết bị này đã có một kho.',
  'error.noVault': 'Thiết bị này chưa có kho nào.',
  'error.vaultCorrupt': 'Kho đã lưu bị hỏng, hoặc do một ứng dụng khác ghi ra.',
  'error.wrongMasterPassword': 'Sai mật khẩu chính.',
  'error.enterCurrentMasterPassword': 'Nhập mật khẩu chính hiện tại của bạn.',
  'error.currentPasswordWrong': 'Mật khẩu hiện tại không đúng.',
  'error.masterPasswordShort': 'Mật khẩu chính phải có ít nhất 8 ký tự.',
  'error.notPassphraseVault': 'Kho này không được bảo vệ bằng mật khẩu chính.',
  'error.recoveryKeyMalformed': 'Cái này trông không giống khoá khôi phục.',
  'error.recoveryKeyNoMatch': 'Khoá khôi phục đó không khớp.',
  'error.recoverOnAccountPage': 'Khoá khôi phục đúng, nhưng mật khẩu của tài khoản này giờ được đặt lại ở trang tài khoản, dùng chung cho mọi app Keyrook.',
  'error.kitOnAccountPage': 'Khoá khôi phục của tài khoản này giờ được tạo ở trang tài khoản, dùng chung cho mọi app Keyrook.',
  'error.restoreEmpty': 'Tài khoản này không còn gì để khôi phục: nó đã bị xoá trên thiết bị khác trước khi thiết bị này có nó.',
  'error.noAccountSheet': 'Tài khoản này chưa có khoá khôi phục. Hãy tạo ở trang tài khoản.',
  'error.recoveryKeyWrong': 'Khoá khôi phục đó không khớp với tài khoản này.',
  'error.noRecoveryKit': 'Kho này không có khoá khôi phục.',
  'error.syncUnavailable': 'Bản này không có tính năng đồng bộ.',
  'error.notSignedIn': 'Chưa đăng nhập.',
  'error.alreadySignedIn': 'Đã đăng nhập rồi.',
  'error.signedOutElsewhere':
    'Thiết bị này đã bị đăng xuất khỏi đồng bộ — mật khẩu đã được đổi, hoặc thiết bị đã bị gỡ từ một máy khác. Hãy đăng nhập lại.',
  'error.removedFromAccount':
    'Một thiết bị khác đã gỡ thiết bị này khỏi tài khoản Keyrook của bạn, nên các mã của tài khoản đã được xoá khỏi đây. Đăng nhập lại là có lại.',
  'error.signOutUnsynced':
    'Một số thay đổi trên trình duyệt này chưa lên tới tài khoản của bạn, đăng xuất bây giờ sẽ làm mất chúng. Hãy kết nối mạng rồi thử lại.',
  'error.enterAccountPassword': 'Nhập mật khẩu tài khoản của bạn.',
  'error.accountPasswordWrong': 'Đó không phải mật khẩu tài khoản của bạn.',
  'error.accountPasswordWeak':
    'Mật khẩu này quá yếu để bảo vệ bản sao kho rời khỏi thiết bị này. Hãy dùng ít nhất 12 ký tự có chữ hoa, chữ thường, số và ký hiệu — hoặc bốn, năm từ không liên quan đến nhau.',
  'error.lockOnlyWithAccountPassword':
    'Đó không phải mật khẩu tài khoản của bạn. Khi đã đăng nhập, kho này chỉ có thể khoá bằng mật khẩu đó.',
  'error.signupWrongMasterPassword': 'Đó không phải mật khẩu chính của kho này. Nó cũng sẽ là mật khẩu tài khoản của bạn.',
  'error.masterPasswordTooWeakForAccount':
    'Mật khẩu chính của bạn quá yếu để bảo vệ bản sao kho rời khỏi thiết bị này. Hãy đổi nó trong Bảo mật trước — ít nhất 12 ký tự đủ loại, hoặc bốn, năm từ không liên quan.',
  'error.passwordsDiverged':
    'Mật khẩu tài khoản khác với mật khẩu của kho này. Hãy đăng xuất khỏi đồng bộ rồi đăng nhập lại để hai cái khớp nhau, sau đó thử lại.',
  'error.kitRace': 'Một thiết bị khác của bạn vừa đổi khoá khôi phục. Ở đây chưa có gì thay đổi — hãy thử lại.',
  'error.providerHasNoPassword': 'Tài khoản này đăng nhập bằng Google hoặc GitHub và không có mật khẩu.',
  'error.noActiveTab': 'Không có tab nào đang mở.',
  'error.autofillNotHere': 'Tự điền chỉ hoạt động trên trang web thông thường.',
  'error.autofillBlocked':
    'Chrome không cho tiện ích đọc trang này. Hãy mở cửa sổ tiện ích ngay trên trang bạn muốn điền.',
  'error.signinCancelled': 'Đã huỷ đăng nhập.',
  'error.signinStateMismatch': 'Lượt đăng nhập đó quay về không đúng như lúc đi. Hãy thử lại.',
  'error.signinUnfinished': 'Đăng nhập chưa hoàn tất. Hãy thử lại.',
  'error.signupPendingExpired': 'Lượt đăng nhập đó đã hết hạn. Hãy bắt đầu lại.',
  'error.signInFirst': 'Hãy đăng nhập trước.',
  'error.joinNeedsMasterPassword': 'Nhập mật khẩu chính của kho này để hoàn tất việc tham gia.',
  'error.notThisVaultsPassword': 'Đó không phải mật khẩu chính của kho này.',
  'error.nothingWaiting': 'Không có gì đang chờ duyệt.',
  'error.pairingExpired': 'Yêu cầu đã kết thúc — nó bị từ chối, hoặc đã quá mười phút. Hãy gửi lại.',
  'error.pairingWrongKey':
    'Khoá nhận được không phải của tài khoản này. Chưa có gì thay đổi. Hãy thử lại từ thiết bị kia.',
  'error.pairingForged': 'Lượt duyệt đó không đến từ thiết bị mà bạn đã kiểm tra mã.',
  'error.pairingForgedAsk':
    'Lượt duyệt đó không đến từ thiết bị đã được kiểm tra mã. Chưa có gì thay đổi. Hãy gửi lại yêu cầu.',
  'error.pairingEnded': 'Yêu cầu đó đã kết thúc.',
  'error.approveAgain': 'Hãy bắt đầu duyệt lại yêu cầu đó.',
  'error.backupPasswordShort': 'Mật khẩu bản sao lưu phải có ít nhất 8 ký tự.',
  'error.backupNotOurs': 'Tệp này không phải bản sao lưu của Keyrook Authenticator.',
  'error.backupNewer': 'Bản sao lưu này được tạo bởi phiên bản mới hơn của ứng dụng.',
  'error.backupUnknownCipher': 'Bản sao lưu này dùng kiểu mã hoá mà phiên bản này không biết.',
  'error.backupTooCostly': 'Bản sao lưu này đòi khối lượng xử lý quá vô lý để mở. Đã bỏ qua.',
  'error.backupMalformed': 'Bản sao lưu này bị sai định dạng.',
  'error.uriNotOtpauth': 'Đây không phải liên kết otpauth://.',
  'error.uriMalformed': 'Liên kết otpauth:// đó bị sai định dạng.',
  'error.uriNoSecret': 'Liên kết đó không chứa khoá bí mật.',
  'error.uriBadSecret': 'Khoá bí mật trong liên kết đó không phải base32 hợp lệ.',
  'error.uriNoCounter': 'Liên kết HOTP phải có bộ đếm.',
  'error.secretEmpty': 'Khoá thiết lập đang trống.',
  'error.migrationNotOurs': 'Đây không phải dữ liệu xuất từ Google Authenticator.',
  'error.migrationMalformed': 'Dữ liệu xuất từ Google Authenticator này bị hỏng hoặc thiếu.',
  'error.offline': 'Không kết nối được máy chủ đồng bộ. Hãy kiểm tra mạng rồi thử lại.',
  'error.passkey.wrongOrigin': 'Khoá truy cập chỉ dùng được cho trang và các app của chính Keyrook.',
  'error.passkey.notOffered': 'Ở đây không có đăng nhập bằng khoá truy cập.',
  'error.passkey.unchecked': 'Không kiểm tra được khoá truy cập đó. Hãy thử lại.',
  'error.passkey.unknown': 'Không tài khoản Keyrook nào biết khoá truy cập đó. Có thể nó đã bị gỡ.',
  'error.passkey.ended': 'Yêu cầu khoá truy cập đó đã hết hạn. Hãy thử lại.',
  'error.passkey.noUnlock': 'Khoá truy cập đó không mở được khoá của tài khoản này. Hãy đăng nhập bằng mật khẩu.',
  'error.passkey.noUnlockProvider':
    'Khoá truy cập đó không mở được khoá của tài khoản này. Hãy tiếp tục bằng Google hoặc GitHub.',
  'error.passkey.masterPassword':
    'Kho khoá bằng mật khẩu chính không thể đăng nhập bằng khoá truy cập. Hãy đăng nhập bằng mật khẩu tài khoản, hoặc bằng Google hay GitHub.',
  'error.passkey.permission':
    'Keyrook Authenticator cần Chrome cho phép dùng khoá truy cập của account.keyrook.com. Hãy chọn lại khoá truy cập và cho phép.',
  'error.passkey.cancelled': 'Chưa có khoá truy cập nào được dùng. Hãy thử lại, hoặc đăng nhập cách khác.',
  'error.passkey.failed': 'Chrome không hỏi được khoá truy cập. Hãy thử lại, hoặc đăng nhập cách khác.',
  'error.secondStep.missing': 'Hãy nhập cả mã từ app xác thực của bạn.',
  'error.secondStep.wrongCode': 'Mã đó không đúng. Hãy nhập mã app xác thực đang hiện lúc này.',
  'error.secondStep.expired': 'Lượt đăng nhập đó đã hết hạn. Hãy đăng nhập lại.',
  'error.secondStep.used': 'Mã đó vừa được dùng để đăng nhập. Hãy chờ app hiện mã kế tiếp.',
  'error.provider.refusedBy': '{provider} đã từ chối lượt đăng nhập.',
  'error.provider.unreachable': 'Không kết nối được {provider}. Hãy thử lại sau giây lát.',
  'error.provider.refused': 'Lượt đăng nhập bị từ chối. Hãy thử lại.',
  'error.provider.githubRefused': 'GitHub đã từ chối lượt đăng nhập.',
  'error.provider.noReauth': 'Google đã không yêu cầu bạn đăng nhập lại.',
  'error.provider.unverifiedEmail': 'Google chưa xác minh địa chỉ email đó.',
  'error.provider.githubNoEmail': 'Tài khoản GitHub của bạn chưa có email chính đã xác minh.',
  'error.server.badRequest': 'Máy chủ đồng bộ không đọc được yêu cầu đó.',
  'error.server.session': 'Phiên đăng nhập đó không còn hiệu lực.',
  'error.server.accountGone': 'Tài khoản đó không còn tồn tại.',
  'error.server.signupExpired': 'Lượt đăng ký đó đã hết hạn. Hãy đăng nhập lại.',
  'error.server.signinExpired': 'Lượt đăng nhập đó đã hết hạn. Hãy thử lại.',
  'error.server.tooManyCodes': 'Nhập sai mã quá nhiều lần. Hãy xin mã mới.',
  'error.server.tooManyPairings': 'Có quá nhiều thiết bị đang chờ tham gia tài khoản này. Hãy thử lại sau vài phút.',
  'error.server.wrongKey': 'Thiết bị này không giữ khoá của tài khoản.',
  'error.server.providerAccount': 'Tài khoản này đăng nhập bằng Google hoặc GitHub, không dùng mật khẩu.',
  'error.server.mailFailed': 'Không gửi được email. Hãy thử lại sau một phút.',
  'error.server.pairingTaken': 'Yêu cầu đó đã kết thúc, hoặc một thiết bị khác đang duyệt nó.',
  'error.server.passwordWrong': 'Mật khẩu đó không đúng.',
  'error.server.badCredentials': 'Email hoặc mật khẩu không đúng.',
  'error.server.badCode': 'Mã đó không đúng hoặc đã hết hạn. Hãy kiểm tra email, hoặc xin mã mới.',
  'error.server.reauthMismatch': 'Hãy đăng nhập lại bằng đúng tài khoản bạn dùng cho Keyrook để xác nhận.',
  'error.server.kitRace': 'Một thiết bị khác vừa đổi khoá khôi phục.',
  'error.server.unavailable': 'Máy chủ đồng bộ chưa làm được việc đó lúc này. Hãy thử lại sau giây lát.',
  'error.server.lockedOut': { other: 'Thử sai quá nhiều lần. Hãy thử lại sau {count} giây.' },
  'error.server.rateLimited': { other: 'Thử quá nhiều lần. Hãy thử lại sau {count} giây.' },
  'error.server.emailTaken': '{email} đã có tài khoản Keyrook.',
  'error.server.recordTooLarge': 'Một tài khoản của bạn quá lớn để đồng bộ ({id}).',
  'error.server.codeTooSoon': 'Mã vừa được gửi. Hãy đợi một chút rồi mới xin mã mới.',
  'error.server.keyRace': 'Một thiết bị khác vừa thiết lập khoá. Hãy thử lại.',
  'error.server.archiveNeedsOldKeys': 'Chỉ mật khẩu cũ hoặc khoá khôi phục cũ mới xoá được dữ liệu được giữ lại trước khi hết hạn.',
  'error.server.signupNeedsKeys': 'Không tạo được tài khoản này. Hãy cập nhật Keyrook Authenticator rồi thử lại.',
  'error.server.accountIdTaken': 'Mã định danh tài khoản đó đã được dùng. Hãy đăng ký lại.',
  'error.server.archiveWrongKey': 'Cái đó không mở được dữ liệu được giữ lại.',
  'error.server.flowExpired': 'Đã hết hạn. Hãy xin mã mới và bắt đầu lại.',
  'error.server.archiveGone': 'Dữ liệu đó không còn được giữ.',
  'error.server.notProductKey': 'Khoá đó không thuộc về Keyrook Authenticator.',
  'error.server.foreignRecord': 'Bản ghi đó thuộc về một sản phẩm Keyrook khác.',
  'error.server.rootChanged': 'Khoá của tài khoản vừa đổi trên một thiết bị khác. Hãy thử lại.',
  'error.server.rootExists': 'Tài khoản này đã có khoá gốc.',
  'error.server.noRoot': 'Tài khoản này chưa có khoá gốc.',
  'error.server.startOverLimit': 'Tài khoản này đã bắt đầu lại quá nhiều lần gần đây. Hãy thử lại sau {date}.',
  'error.server.wrongRootKey': 'Thiết bị này không giữ khoá gốc của tài khoản.',
  'error.server.sessionReplayed': 'Thiết bị này đã bị đăng xuất vì phiên của nó được dùng ở nơi khác. Hãy đăng nhập lại.',
  'error.server.noProductKey': 'Keyrook Authenticator chưa có khoá trên tài khoản này.',
  'error.server.productKeyChanged': 'Khoá của Keyrook Authenticator trên tài khoản này đã đổi. Hãy thử lại.',
  'error.server.productKeyReplaced': 'Khoá của Keyrook Authenticator đã được thay trên một thiết bị khác. Hãy đăng nhập lại.',
  'error.server.updateRequired': 'Hãy cập nhật Keyrook Authenticator để tiếp tục dùng tài khoản này.',
  'error.server.olderBuildsRetired': 'Các phiên bản cũ của Keyrook Authenticator không dùng được tài khoản này nữa.',
  'error.server.emailTakenOtherProvider': '{email} đã có tài khoản Keyrook đăng nhập bằng một nhà cung cấp khác.',
  'error.server.emailTakenPassword': '{email} đã có tài khoản Keyrook có mật khẩu. Hãy đăng nhập bằng email và mật khẩu.',
  'error.server.signInWithPassword': 'Tài khoản đó đăng nhập bằng mật khẩu. Hãy đăng nhập tại đây bằng email và mật khẩu.',
  'error.server.pageCodeWrong': 'Mã đó không phải mã trang tài khoản đang hiện. Hãy kiểm tra lại, hoặc bắt đầu lại ở đó.',
  'error.server.pageRequestEnded': 'Yêu cầu đó đã hết hạn hoặc đã kết thúc. Hãy bắt đầu lại trên trang tài khoản.',
  'error.server.noKeyrookAccount': 'Tài khoản Google hoặc GitHub này chưa có tài khoản Keyrook. Hãy tạo trong Keyrook Authenticator hoặc Passhold.',
  'error.account.productKeyMismatch': 'Khoá của {product} không mở được bằng khoá gốc của tài khoản này. Không có gì bị thay đổi.',
  'error.account.confirmWithPassword': 'Tài khoản này có mật khẩu. Hãy xác nhận bằng mật khẩu.',
  'error.account.chooseNewPassword': 'Hãy chọn mật khẩu mới cho tài khoản này.',
  'error.account.archiveNotOpened': 'Không có dữ liệu được giữ lại nào của Keyrook Authenticator mở được bằng cái đó.',
  'error.account.keyNotConfirmed': 'Khoá tài khoản không phải khoá bạn đã xác nhận. Hãy xem lại.',
  'error.account.serverMismatch': 'Câu trả lời của máy chủ đồng bộ không khớp với tài khoản này. Không có gì được mở bằng nó.',
  'error.account.archiveNoPassword': 'Khi đó tài khoản này chưa có mật khẩu.',
  'error.account.noPasswordForKeys': 'Tài khoản này không có mật khẩu để mở khoá của nó.',
  'error.account.noRecoveryKey': 'Tài khoản này chưa có khoá khôi phục.',

  // --- Màn hình mở khoá ---------------------------------------------------------
  'unlock.prompt': 'Nhập mật khẩu chính để mở khoá.',
  'unlock.placeholder': 'Mật khẩu chính',
  'unlock.submit': 'Mở khoá',
  'unlock.forgot': 'Quên rồi? <link>Dùng khoá khôi phục</link>',
  'platformUnlock.unlock': 'Mở khoá bằng vân tay, khuôn mặt hoặc PIN',
  'platformUnlock.title': 'Vân tay, khuôn mặt hoặc PIN',
  'platformUnlock.body': 'Mở kho bằng chính bước kiểm tra của máy này — Touch ID, Windows Hello hoặc mã PIN của máy — thay vì gõ mật khẩu chính. Mật khẩu vẫn mở được kho, và các thay đổi vẫn cần đến nó.',
  'platformUnlock.on': 'Kho cũng mở được bằng bước kiểm tra của chính máy này. Gỡ mật khẩu chính thì tính năng này tắt theo.',
  'passkeyUnlock.turnOn': 'Bật',
  'passkeyUnlock.turnOff': 'Tắt',
  'platformUnlock.confirm': 'Sau đó máy sẽ hỏi vân tay, khuôn mặt hoặc mã PIN của bạn.',
  'error.passkeyUnlock.cancelled': 'Bước kiểm tra đã bị huỷ hoặc quá lâu. Hãy thử lại, hoặc dùng mật khẩu chính.',
  'error.platformUnlock.noPrf': 'Nơi lưu khoá truy cập này không giữ được khoá, nên không mở được kho. Hãy bật lại và chọn nơi lưu khác khi được hỏi lưu ở đâu — hoặc tiếp tục dùng mật khẩu chính.',
  'error.passkeyUnlock.failed': 'Không mở được kho. Hãy dùng mật khẩu chính, rồi bật lại mục này trong Bảo mật.',
  'securityKey.unlock': 'Mở khoá bằng khoá bảo mật',
  'securityKey.title': 'Khoá bảo mật',
  'securityKey.body': 'Mở kho bằng khoá bảo mật USB và mã PIN của nó thay vì gõ mật khẩu chính. Ai cầm khoá và biết mã PIN của nó cũng mở được kho trên máy này. Lỡ mất khoá thì mật khẩu chính vẫn mở được kho.',
  'securityKey.on': 'Kho cũng mở được bằng khoá bảo mật của bạn và mã PIN của nó, trên máy này. Ai cầm khoá và biết mã PIN của nó đều mở được kho ở đây, nên nếu mất khoá, hãy tắt mục này. Gỡ mật khẩu chính thì tính năng này tắt theo.',
  'securityKey.confirm': 'Sau đó cắm khoá bảo mật, gõ mã PIN của khoá rồi chạm vào khoá. Một số khoá sẽ hỏi hai lần.',
  'error.securityKey.noPrf': 'Khoá bảo mật này không giữ được khoá, nên không mở được kho. Các khoá chỉ làm cho đăng nhập hai bước thì không làm được. Hãy thử khoá khác, hoặc tiếp tục dùng mật khẩu chính.',

  // --- Kho không mở được nữa ----------------------------------------------------
  'unrecoverable.title': 'Kho này không thể mở được nữa',
  'unrecoverable.why':
    'Khoá mã hoá của nó nằm trong hồ sơ trình duyệt này và đã mất — thường do dữ liệu duyệt web bị xoá, tiện ích bị cài lại, hoặc đây là một hồ sơ khác. Không có khoá đó thì không ai giải mã được các tài khoản đã lưu, kể cả chúng tôi.',
  'unrecoverable.hasKit':
    'Bạn đã tạo khoá khôi phục cho kho này. Khoá đó bọc cùng dữ liệu, độc lập với khoá đã mất — nó sẽ mở được tất cả.',
  'unrecoverable.useKit': 'Dùng khoá khôi phục của tôi',
  'unrecoverable.noKit':
    'Hãy bắt đầu lại và khôi phục từ tệp sao lưu nếu bạn có. Nếu không, bạn sẽ phải thiết lập lại xác thực hai lớp trên từng trang, bằng các mã khôi phục mà trang đó đã cấp cho bạn.',
  'unrecoverable.confirmErase': 'Đồng ý, xoá và bắt đầu lại',
  'common.cancel': 'Huỷ',
  'unrecoverable.startOver': 'Bắt đầu lại',

  // --- Độ mạnh mật khẩu ---------------------------------------------------------
  'strength.0': 'rất yếu',
  'strength.1': 'yếu',
  'strength.2': 'tạm được',
  'strength.3': 'mạnh',
  'strength.4': 'rất mạnh',
  'strength.line': 'Độ mạnh: {label}',
  'strength.lineWithWarning': 'Độ mạnh: {label} — {warning}',
  'strength.tooShort': 'Dùng ít nhất 10 ký tự — độ dài là quan trọng nhất.',
  'strength.digitsOnly': 'Chỉ toàn chữ số thì dễ đoán.',
  'strength.repeated': 'Tránh lặp lại ký tự.',

  // --- Lần đầu ------------------------------------------------------------------
  'setup.prompt': 'Chọn cách bảo vệ các khoá bí mật 2FA của bạn.',
  'setup.device.title': 'Bắt đầu luôn',
  'setup.device.badge': 'Khuyên dùng',
  'setup.device.description':
    'Khoá bí mật của bạn được mã hoá bằng một khoá do trình duyệt này giữ giùm. Không cần nhớ, không cần gõ gì.',
  'setup.device.footnote':
    'Chống được mọi thứ chạy script hoặc đọc dữ liệu tiện ích. Không chống được mã độc chạy dưới tài khoản của bạn trên máy này.',
  'setup.password.title': 'Thêm mật khẩu chính',
  'setup.password.description':
    'Một mật khẩu để mở kho, rồi kho tự khoá lại khi bạn thôi dùng.',
  'setup.password.footnote':
    'Lựa chọn mạnh nhất: một khi đã khoá, không gì trên máy này mở được kho nếu không có mật khẩu.',
  'setup.footer': 'Cách nào cũng là AES-256-GCM. Đổi lúc nào cũng được; đồng bộ là tuỳ chọn, trong Cài đặt.',
  'setup.footer.noSync': 'Cách nào cũng là AES-256-GCM. Đổi lúc nào cũng được, trong Cài đặt.',
  'setup.source': 'Mã nguồn mở — đọc mã nguồn',
  'common.back': 'Quay lại',
  'setup.passwordStep.title': 'Đặt mật khẩu chính',
  'setup.passwordStep.warning':
    'Không ai đặt lại được mật khẩu này. Nếu quên, chỉ khoá khôi phục mới mở được kho — hãy tạo một khoá trong Cài đặt → Bảo mật, và ghi mật khẩu ra chỗ an toàn.',
  'setup.passwordStep.label': 'Mật khẩu chính',
  'setup.passwordStep.placeholder': 'Ít nhất 8 ký tự',
  'setup.passwordStep.confirm': 'Nhập lại mật khẩu',
  'common.passwordsDiffer': 'Hai mật khẩu không khớp.',
  'setup.passwordStep.submit': 'Tạo kho của tôi',
  'setup.passwordStep.footer': 'AES-256-GCM · khoá dẫn xuất bằng PBKDF2 (600.000 vòng)',

  // --- Khoá khôi phục, mở kho ---------------------------------------------------
  'recover.title': 'Dùng khoá khôi phục',
  'recover.intro':
    'Khoá 32 ký tự trên tờ giấy bạn đã lưu khi tạo kho này. Dùng nó sẽ thay cách kho được khoá, nên hãy chọn luôn ở dưới.',
  'recover.keyLabel': 'Khoá khôi phục',
  'recover.hintEmpty': 'Chỉ chữ cái và chữ số — khoảng trắng không quan trọng.',
  'recover.hintRight': 'Đúng định dạng rồi.',
  'recover.hintCount': '{count}/32 ký tự.',
  'recover.lockQuestion': 'Từ giờ kho này khoá bằng gì?',
  'recover.lockPassword': 'Đặt mật khẩu chính mới',
  'recover.lockDevice': 'Không mật khẩu — để thiết bị này giữ khoá',
  'recover.newPassword': 'Mật khẩu chính mới',
  'recover.atLeast8': 'Ít nhất 8 ký tự.',
  'recover.submit': 'Mở khoá và khoá lại kho này',

  // --- Ô mật khẩu ---------------------------------------------------------------
  'meter.0': 'Quá yếu',
  'meter.1': 'Yếu',
  'meter.2': 'Tạm được',
  'meter.3': 'Mạnh',
  'meter.4': 'Rất mạnh',
  'password.show': 'Hiện mật khẩu',
  'password.hide': 'Ẩn mật khẩu',

  // --- Cửa sổ tiện ích: danh sách -------------------------------------------------
  'vault.search': 'Tìm tài khoản',
  'vault.add': 'Thêm tài khoản',
  'vault.settings': 'Cài đặt',
  'vault.lock': 'Khoá ngay',
  'vault.count': { other: '{count} tài khoản' },
  'vault.syncedWith': 'Đồng bộ với {email}',
  'vault.syncedAs': 'đồng bộ với {email}',
  'vault.changeOrder': 'Đổi thứ tự',
  'vault.byName': 'Theo tên',
  'vault.orderAdded': 'Thứ tự thêm vào',
  'vault.joinRequests': {
    other: '{count} thiết bị đang xin tham gia tài khoản của bạn.',
  },
  'vault.joinRequestsHint': 'Chỉ duyệt thiết bị mà chính bạn đang đăng nhập, ngay lúc này.',
  'vault.reviewInSettings': 'Xem trong Cài đặt',
  'vault.noMatch': 'Không có tài khoản nào khớp với “{query}”.',
  'vault.forHost': 'Cho {host}',
  'vault.fieldDetected': 'đã thấy ô nhập mã',
  'common.encryptedHere': 'Mã hoá ngay trên thiết bị này',
  'vault.fillWarning':
    '<b>{account}</b> dành cho <b>{domain}</b>, nhưng trang này là <b>{host}</b>. Nếu bạn không ngờ tới điều đó, trang này có thể đang giả mạo trang kia.',
  'vault.dontFill': 'Không điền',
  'vault.fillAnyway': 'Vẫn điền',
  'vault.empty.title': 'Chưa có tài khoản nào',
  'vault.empty.body':
    'Mở trang thiết lập xác thực hai lớp trên bất kỳ trang web nào, rồi quét mã QR ngay từ tab đó.',
  'vault.empty.add': 'Thêm tài khoản đầu tiên',

  // --- Cửa sổ tiện ích: một tài khoản ---------------------------------------------
  'common.untitled': 'Chưa đặt tên',
  'row.copyHint': 'Bấm để sao chép',
  'row.share': 'Chia sẻ hoặc chuyển',
  'row.shareHint': 'Gửi mã của tài khoản trong một lúc, hoặc chuyển sang app khác',
  'row.favouriteAdd': 'Thêm vào yêu thích',
  'row.favouriteRemove': 'Bỏ khỏi yêu thích',
  'row.fillHint': 'Điền mã này vào trang',
  'row.fill': 'Điền',
  'row.copied': 'Đã chép',
  'row.copy': 'Sao chép mã',
  'row.next': 'Tạo mã tiếp theo',
  'row.counter': 'Bộ đếm: {counter}',

  // --- Cửa sổ tiện ích: xin đánh giá ------------------------------------------------
  'rate.region': 'Đánh giá Keyrook Authenticator',
  'rate.body': '<b>Thấy Keyrook Authenticator có ích?</b> Một lượt đánh giá trên {store} là cách người khác tìm thấy nó.',
  'rate.store.chrome': 'Chrome Web Store',
  'rate.store.edge': 'Edge Add-ons',
  'rate.notNow': 'Để sau',
  'rate.rate': 'Đánh giá',

  // --- Dùng chung ---------------------------------------------------------------
  'common.openSource': 'Mã nguồn mở',

  // --- Thêm tài khoản -----------------------------------------------------------
  'add.title.manual': 'Nhập khoá thiết lập',
  'add.title.camera': 'Quét bằng camera',
  'add.title.quick': 'Lấy mã mà không lưu',
  'add.title.choose': 'Thêm tài khoản',
  'add.page.title': 'Quét mã QR trên trang này',
  'add.page.description': 'Chụp phần đang hiện của tab và đọc mã từ ảnh đó.',
  'add.camera.title': 'Quét bằng camera',
  'add.camera.description': 'Cho mã đang hiện trên điện thoại — kể cả dữ liệu xuất từ Google Authenticator.',
  'add.camera.elsewhere':
    'Mở Cài đặt một lần để Chrome xin quyền dùng camera. Sau đó quét ngay tại đây được.',
  'add.upload.title': 'Tải lên ảnh QR',
  'add.upload.description': 'Ảnh chụp màn hình hoặc ảnh bạn đã lưu trước đó.',
  'add.manual.title': 'Nhập khoá thiết lập thủ công',
  'add.manual.description': 'Cho những trang hiện một đoạn mã thay vì QR.',
  'add.quick.title': 'Chỉ lấy mã',
  'add.quick.description': 'Dán khoá và xem mã ngay. Không lưu gì cả.',
  'add.fromGoogle':
    'Chuyển từ Google Authenticator sang? Hãy xuất tài khoản ở đó, rồi quét mã nó hiện ra bằng camera hoặc tải lên ảnh chụp màn hình. Nếu có nhiều mã, làm lần lượt từng mã.',
  'common.done': 'Xong',
  'add.noNativeReader':
    'Chrome trên máy này không có trình đọc QR sẵn, nên mã lớn — như dữ liệu xuất từ Google Authenticator — thường không quét được bằng camera. Nếu không quét được, hãy chụp màn hình trên điện thoại rồi dùng Tải lên ảnh QR.',
  'add.openScannerInSettings': 'Mở trình quét trong Cài đặt',
  'add.noneFound': 'Không tìm thấy tài khoản nào.',
  'add.noQrOnPage': 'Không thấy mã QR ở phần đang hiện của trang. Cuộn tới chỗ có mã rồi thử lại.',
  'add.noQrInImage': 'Không thấy mã QR trong ảnh đó.',
  'add.cannotReadUri': 'Không đọc được URI đó.',
  'add.enterKey': 'Nhập khoá thiết lập mà trang web cung cấp.',
  'add.offeredOn': 'Mã cho {domain} sẽ được gợi ý trên trang đó.',
  'add.startTyping': 'Cứ gõ — dịch vụ quen thuộc sẽ tự điền thông tin.',
  'add.account': 'Tài khoản',
  'add.accountPlaceholder': 'ban@example.com',
  'add.setupKey': 'Khoá thiết lập',
  'add.linkDetected': 'Đã nhận ra liên kết otpauth:// — ô dịch vụ và tài khoản sẽ được điền từ đó.',
  'add.spacesFine': 'Có khoảng trắng hay chữ thường đều được.',
  'add.submit': 'Thêm tài khoản',
  'add.summary': { other: 'Đã quét đủ {count} mã.' },
  'add.summaryAdded': { other: 'Đã thêm {count} tài khoản.' },
  'add.summarySkipped': { other: '{count} tài khoản đã có trong kho nên được giữ nguyên.' },
  'error.badKey':
    'Khoá thiết lập chỉ dùng chữ A–Z và số 2–7. Hãy kiểm tra đã chép đủ, không thừa ký tự nào.',
  'error.quickIsMigration':
    'Đó là liên kết chuyển dữ liệu của Google Authenticator, chứa nhiều tài khoản một lúc. Hãy nhập nó thay vì dùng ở đây.',
  'error.keyTooShort': 'Quá ngắn để là khoá thiết lập.',
  'error.fileTooLarge': 'Tệp đó quá lớn để đọc.',
  'error.notSetupQr': 'Mã QR đó không phải mã thiết lập 2FA.',
  'error.alreadyInVault': 'Tài khoản đó đã có trong kho.',
  'error.gaSkipPeriod': 'Google Authenticator chỉ giữ mã 30 giây; mã này dùng {period}.',
  'error.gaSkipDigits': 'Google Authenticator chỉ giữ mã 6 hoặc 8 chữ số; mã này có {digits}.',
  'error.gaSkipSteam': 'Google Authenticator không tạo được mã Steam Guard.',

  // --- Quét bằng camera ---------------------------------------------------------
  'scan.progressBatch': 'Đã quét mã {seen}/{total} — {accounts}. Hãy đưa mã tiếp theo.',
  'scan.progress': '{accounts}.',
  'scan.added': { other: 'Đã thêm {count} tài khoản' },
  'scan.found': { other: 'Tìm thấy {count} tài khoản' },
  'scan.skippedVault': { other: '{count} tài khoản đã có trong kho.' },
  'scan.skippedScanned': { other: '{count} tài khoản đã quét rồi.' },
  'camera.noCamera': 'Trình duyệt này không cho tiện ích dùng camera.',
  'camera.preview': 'Xem trước camera',
  'camera.failedHint':
    'Bạn vẫn có thể thêm tài khoản bằng cách tải lên ảnh mã QR, hoặc gõ khoá thiết lập.',
  'camera.hint':
    'Giữ mã QR nằm trong khung. Chuyển từ Google Authenticator? Mở màn hình xuất dữ liệu trên điện thoại rồi hướng camera vào — nếu có nhiều mã, đưa lần lượt từng mã.',
  'camera.privacy':
    'Hình ảnh được đọc ngay trên thiết bị này rồi bỏ đi. Không ghi lại, không tải lên đâu cả.',
  'camera.blocked':
    'Chrome đã chặn quyền dùng camera. Hãy cho phép trên trang này, hoặc dùng cách thêm tài khoản khác.',
  'camera.none': 'Không tìm thấy camera trên máy này.',
  'camera.busy': 'Camera đang được chương trình khác sử dụng.',

  // --- Hình ảnh và ảnh QR -------------------------------------------------------
  'image.unreadable': 'Không đọc được tệp đó dưới dạng ảnh.',
  'image.wrongType': 'Hãy dùng ảnh PNG, JPEG, WebP, GIF hoặc BMP.',
  'image.tooBig': 'Ảnh đó quá lớn. Hãy thử ảnh dưới 8 MB.',
  'image.cannotPrepare': 'Không xử lý được ảnh.',
  'image.wontCompress':
    'Ảnh đó không nén nhỏ được nữa. Một logo đơn giản sẽ hợp hơn ảnh chụp.',
  'image.wrongScreenshotType': 'Hãy dùng ảnh chụp màn hình PNG, JPEG, WebP, GIF hoặc BMP.',
  'brand.account': 'Tài khoản',
  'brand.unknown': 'Dịch vụ không rõ',

  // --- Ô dịch vụ ----------------------------------------------------------------
  'service.label': 'Dịch vụ',
  'service.matches': 'Dịch vụ phù hợp',

  // --- Chuyển một tài khoản sang ứng dụng khác ------------------------------------
  'share.intro':
    'Quét bằng Google Authenticator, Microsoft Authenticator, 1Password, Authy — bất kỳ ứng dụng xác thực nào — và nó sẽ tạo ra đúng các mã như ở đây.',
  'share.warning':
    'Ai nhìn thấy hoặc chụp lại mã này đều tạo được mã của bạn cho {account}, chừng nào tài khoản còn tồn tại. Chỉ đưa nó cho ứng dụng bạn đang chuyển sang.',
  'share.show': 'Hiện mã QR',
  'share.qrLabel': 'Mã QR thiết lập cho {account}',
  'share.hidesIn': 'Quét bằng ứng dụng kia. Tự ẩn sau {seconds} giây.',
  'share.linkCopied': 'Đã chép liên kết',
  'share.copyLink': 'Chép liên kết thiết lập',
  'share.saveImage': 'Lưu thành ảnh',
  'share.linkWarning':
    'Liên kết cũng chứa khoá bí mật. Dán vào ứng dụng kia, rồi chép một thứ khác đè lên.',
  'share.hideNow': 'Ẩn ngay',
  'shareCodes.modeLabel': 'Chia sẻ hoặc chuyển',
  'shareCodes.modeCodes': 'Gửi mã',
  'shareCodes.modeMove': 'Chuyển sang app khác',
  'shareCodes.noSecret': 'Tài khoản này không có khoá thiết lập, nên không tạo được mã và không có gì để chia sẻ hay chuyển đi. Hãy xoá nó, rồi thêm lại tài khoản từ mã QR của nó.',
  'shareCodes.intro': 'Tạo một link hiện mã của tài khoản này cho đến khi hết hạn — không bao giờ kèm khoá tạo ra mã.',
  'shareCodes.lengthLabel': 'Dùng được trong',
  'shareCodes.min5': '5 phút',
  'shareCodes.min15': '15 phút',
  'shareCodes.hour': '1 giờ',
  'shareCodes.cannotRecall': 'Link đã gửi thì không thu hồi được. Ai có link đều dùng được mã cho đến khi hết hạn, nên chỉ gửi cho đúng người cần.',
  'shareCodes.copy': 'Sao chép link',
  'shareCodes.copied': 'Đã sao chép link. Link dùng được đến {time}.',
  'shareCodes.counter': 'Mã đếm theo lượt không gửi được theo cách này: mỗi mã dùng hết ngay khi được tạo. Hãy chuyển tài khoản sang app khác.',

  // --- Lấy mã mà không lưu ------------------------------------------------------
  'quick.label': 'Khoá thiết lập hoặc liên kết otpauth://',
  'quick.copyHint': 'Bấm để sao chép',
  'quick.current': 'Mã hiện tại',
  'quick.next': 'Tiếp theo: <code>{code}</code>',
  'quick.notSaved': 'Không lưu ở đâu cả. Đóng lại là khoá biến mất.',
  'quick.save': 'Lưu thành tài khoản',
  'quick.settings': '{digits} chữ số · mỗi {period} giây · {algorithm}',
  'quick.change': 'đổi',
  'quick.digits': 'Số chữ số',
  'quick.every': 'Mỗi',
  'quick.seconds': '{seconds} giây',
  'quick.hash': 'Hàm băm',

  // --- Cài đặt: khung -----------------------------------------------------------
  'nav.accounts': 'Mã 2FA',
  'nav.backup': 'Sao lưu',
  'nav.security': 'Bảo mật',
  'nav.about': 'Giới thiệu',
  'options.count': { other: '{count} tài khoản' },
  'options.sourceOnGithub': 'Mã nguồn mở trên GitHub',
  // --- Khoá khôi phục mới -------------------------------------------------------
  'sheet.once':
    'Đây là lần duy nhất khoá này được hiện ra. Nó không được lưu ở đâu cả — nếu làm mất, hãy tạo khoá mới.',
  'sheet.print': 'In',
  'sheet.apart': 'Hãy cất riêng, xa email của bạn, và đừng bao giờ tự gửi nó qua email: có khoá này và địa chỉ email của bạn, người khác có thể đặt mật khẩu mới và mở mã của bạn.',
  'sheet.apartProvider': 'Hãy cất riêng, xa tài khoản Google hoặc GitHub bạn dùng để đăng nhập, và đừng bao giờ để nó trong thư hay ổ lưu trữ của tài khoản đó: có khoá này và tài khoản đó, người khác có thể mở mã của bạn.',
  'sheet.kept': 'Tôi đã lưu',
  'sheet.checkHeading': 'Kiểm tra xem bạn đã lưu chưa',
  'sheet.checkLead': 'Gõ hai nhóm của khoá theo bản bạn đã lưu. Nhóm là các khối bốn ký tự nằm giữa dấu gạch, đếm từ trái sang.',
  'sheet.group': 'Nhóm {position}',
  'sheet.check': 'Kiểm tra',
  'sheet.mismatch': 'Khoá của bạn không ghi như vậy. Hãy xem lại bản đã lưu, hoặc hiện lại khoá và lưu ngay bây giờ.',
  'sheet.showAgain': 'Hiện lại khoá',
  'sheet.download': 'Tải tờ khoá về',
  'sheet.copy': 'Sao chép',

  // --- Nhóm ---------------------------------------------------------------------
  'groups.title': 'Nhóm',
  'groups.description':
    'Tiêu đề trong danh sách, để kho dài vẫn đọc được trong nháy mắt. Tài khoản được xếp vào nhóm từ màn hình Sửa của chính nó.',
  'groups.new': 'Nhóm mới',
  'groups.newPlaceholder': 'Công việc',
  'groups.add': 'Thêm',
  'groups.none':
    'Chưa có nhóm nào. Mọi thứ nằm trong một danh sách — vậy là ổn cho tới khi nó đủ dài để cần chia.',
  'groups.moveUp': 'Đưa {name} lên',
  'groups.moveDown': 'Đưa {name} xuống',
  'common.save': 'Lưu',
  'groups.count': { other: '{count} tài khoản' },
  'groups.removeNote': 'Tài khoản vẫn giữ nguyên, chỉ không còn nhóm.',
  'common.remove': 'Gỡ bỏ',
  'groups.rename': 'Đổi tên',
  'groups.removeNamed': 'Gỡ {name}',
  'groups.ungrouped': {
    other: '{count} tài khoản không thuộc nhóm nào, và nằm dưới mục “Chưa phân nhóm” ở cuối danh sách.',
  },

  // --- Giới thiệu ---------------------------------------------------------------
  'about.fact.sync.title': 'Khoá bí mật được mã hoá trước khi bất cứ thứ gì rời thiết bị',
  'about.fact.sync.body':
    'Đồng bộ là tuỳ chọn. Khi bật, máy chủ chỉ nhận dữ liệu đã mã hoá và không có cách nào giải mã. Mã luôn được tính ngay trên máy. Không có thu thập dữ liệu sử dụng.',
  'about.fact.local.title': 'Khoá bí mật không bao giờ rời thiết bị này',
  'about.fact.local.body':
    'Bản này không có máy chủ, không có tài khoản, không thu thập dữ liệu sử dụng. Mã được tính ngay trên máy từ các khoá bí mật lưu trong kho đã mã hoá.',
  'about.fact.keys.title': 'Hai cách giữ khoá, đều là AES-256-GCM',
  'about.fact.keys.body':
    'Tài khoản của bạn được mã hoá bằng một khoá dữ liệu, và khoá này lại được bọc thêm một lớp. Với mật khẩu chính, khoá bọc được dẫn xuất bằng PBKDF2 600.000 vòng và chỉ nằm trong bộ nhớ khi đang mở. Không có mật khẩu, đó là khoá không xuất ra được do trình duyệt giữ — không script nào đọc được nó, dù nó không nằm trong phần cứng bảo mật.',
  'about.fact.access.title': 'Không xin quyền trên mọi trang web',
  'about.fact.access.body':
    'Tiện ích không xin quyền truy cập trang web nào. Đọc mã QR trên trang, hay điền mã vào đó, đều dùng activeTab — quyền Chrome chỉ cấp cho đúng tab bạn vừa mở tiện ích.',
  'about.fact.standards.title': 'Theo chuẩn, không trói buộc',
  'about.fact.standards.body':
    'TOTP theo RFC 6238 và HOTP theo RFC 4226, nhập và xuất otpauth://. Bạn có thể chuyển sang ứng dụng khác bất cứ lúc nào và mang theo mọi thứ.',
  'about.version': 'Phiên bản {version}',
  'about.source': 'Mã nguồn',
  'about.viewOnGithub': 'Xem trên GitHub',
  'about.securityModel': 'Mô hình bảo mật',
  'about.securityModelDescription': 'Những gì tiện ích cam kết, kể cả trước chính máy chủ đồng bộ.',
  'about.readIt': 'Đọc',
  'about.rate': 'Đánh giá Keyrook Authenticator',
  'about.rateWhere': 'Trên {store}. Chỉ mất vài giây.',
  'about.report': 'Báo lỗi hoặc góp ý',
  'about.reportDescription':
    'Trên GitHub, nơi ai cũng đọc được. Đừng bao giờ dán khoá thiết lập, mã hay bản sao lưu vào đó.',
  'about.openIssue': 'Tạo issue',
  'about.how': 'Cách hoạt động',
  'about.logos.title': 'Logo dịch vụ',
  'about.logos.description':
    'Logo được đóng gói sẵn trong tiện ích, không bao giờ tải về. Nếu hỏi mạng để lấy logo, bên trả lời sẽ biết bạn bật xác thực hai lớp ở những dịch vụ nào.',
  'about.logos.body':
    '{count} dịch vụ có logo thật. Hình từ <simple>Simple Icons</simple> (CC0 1.0), LobeHub Icons, SVG Logos, CoreUI Brands, Arcticons và <fa>Font Awesome Free</fa> (biểu tượng, CC BY 4.0). Mọi tên sản phẩm và logo thuộc về chủ sở hữu, chỉ dùng để nhận ra dịch vụ của tài khoản. Dịch vụ không có logo trong các bộ đó sẽ hiện ô chữ cái.',
  'about.shortcut.change': 'Đổi tại chrome://extensions/shortcuts.',
  // --- Cài đặt: tài khoản -------------------------------------------------------
  'accounts.title': 'Mã 2FA',
  'accounts.description':
    'Mọi thứ đang lưu trong kho này. Mã được tạo ngay trên thiết bị, không bao giờ do máy chủ tạo.',
  'accounts.empty': 'Chưa có tài khoản nào. Thêm một tài khoản để bắt đầu.',
  'accounts.digits': '{type} {digits} chữ số',
  'accounts.period': ' · {seconds} giây',
  'accounts.counter': ' · bộ đếm {counter}',
  'accounts.steam': 'Steam Guard',
  'accounts.moveNamed': 'Chia sẻ hoặc chuyển {name}',
  'accounts.edit': 'Sửa',
  'common.delete': 'Xoá',
  'accounts.deleteNamed': 'Xoá {name}',
  'accounts.deleted.title': 'Đã xoá gần đây',
  'accounts.deleted.description':
    'Được giữ lại để các thiết bị khác biết việc xoá khi bật đồng bộ. Khôi phục những gì bạn lỡ tay xoá.',
  'accounts.deleted.on': 'Đã xoá {date}',
  'accounts.restore': 'Khôi phục',
  'common.close': 'Đóng',
  'editor.title': 'Sửa tài khoản',
  'editor.picture': 'Hình ảnh',
  'editor.pictureOwn': 'Ảnh của riêng bạn, dùng thay cho logo dịch vụ.',
  'editor.pictureNone': 'Chọn ảnh cho dịch vụ chưa có logo ở đây, hoặc để phân biệt hai tài khoản.',
  'editor.replace': 'Thay ảnh',
  'editor.choose': 'Chọn ảnh…',
  'editor.websites': 'Trang web',
  'editor.websitesHint': 'Cách nhau bằng dấu phẩy. Dùng để gợi ý tài khoản này trên trang khớp.',
  'editor.note': 'Ghi chú',
  'editor.group': 'Nhóm',
  'editor.ungrouped': 'Chưa phân nhóm',
  'editor.noGroups': 'Hãy tạo nhóm trong mục Mã 2FA trước.',
  'editor.setupKey': 'Khoá thiết lập',
  'editor.setupKeyHint': 'Khoá bí mật của tài khoản này. Ai thấy nó đều tạo được mã của bạn.',
  'editor.hide': 'Ẩn',
  'editor.reveal': 'Hiện',
  'editor.revealWarning':
    'Chỉ hiện trên màn hình không ai khác nhìn thấy. Chép liên kết này vào ứng dụng xác thực khác là cách chuyển tài khoản sang điện thoại.',
  'editor.save': 'Lưu thay đổi',

  // --- Cài đặt: nhập ------------------------------------------------------------
  'import.incomplete': {
    other: 'Các ảnh chụp này chỉ chứa {seen}/{total} mã của lần xuất từ Google Authenticator, nên tài khoản trong {count} mã còn lại không có ở đây. Hãy chọn cùng lúc mọi ảnh chụp của lần xuất đó để mang sang đủ.',
  },
  'import.oneOrScreenshots': 'Chọn một tệp sao lưu, hoặc một hay nhiều ảnh chụp mã QR.',
  'import.noQrInThis': 'Không thấy mã QR trong ảnh này.',
  'import.noAccountsInImages': 'Các ảnh đó không chứa tài khoản nào.',
  'import.tooLarge': 'Tệp đó quá lớn để là bản sao lưu.',
  'import.noAccountsInFile': 'Tệp đó không chứa tài khoản nào.',
  'import.description':
    'Đưa tài khoản vào từ tệp sao lưu, từ dữ liệu xuất của ứng dụng xác thực khác — quét bằng camera hoặc chọn ảnh chụp màn hình — hoặc dán liên kết otpauth://.',
  'import.stopAndReview': 'Dừng và xem lại {count}',
  'import.noNativeReader':
    'Chrome trên máy này không có trình đọc QR sẵn, nên mã lớn — như dữ liệu xuất từ Google Authenticator — thường không quét được bằng camera. Nếu không quét được, hãy chụp từng mã trên điện thoại rồi chọn tất cả bằng Chọn tệp.',
  'import.encrypted': 'Bản sao lưu này đã được mã hoá. Nhập mật khẩu đã dùng khi tạo nó.',
  'import.backupPassword': 'Mật khẩu bản sao lưu',
  'import.open': 'Mở bản sao lưu',
  'import.found': { other: 'Tìm thấy {count} tài khoản mới' },
  'import.skipping': ', bỏ qua {count} tài khoản đã có trong kho',
  'import.unreadable': ', và {count} mục không đọc được',
  'import.foundEnd': '.',
  'import.showFailed': 'Xem các dòng bị lỗi',
  'import.import': 'Nhập {count}',
  'import.scan': 'Quét bằng camera',
  'import.choose': 'Chọn tệp…',
  'import.paste': '…hoặc dán liên kết otpauth://, mỗi dòng một liên kết',
  'import.read': 'Đọc liên kết',

  // --- Chuyển tất cả sang ứng dụng khác -------------------------------------------
  'dest.google.steps':
    'Trong Google Authenticator: menu → Chuyển tài khoản → Nhập tài khoản, rồi quét lần lượt các mã.',
  'dest.microsoft.steps':
    'Microsoft Authenticator không nhập được từ ứng dụng khác, nên phải chuyển từng tài khoản một. Trong đó: + → Tài khoản khác, quét, rồi bấm Tiếp ở đây.',
  'dest.apple.steps':
    'Ứng dụng Mật khẩu chỉ nhập từng mã một. Trong Mật khẩu: Mã → +, quét, rồi bấm Tiếp ở đây.',
  'dest.authy.steps':
    'Authy không nhập được từ ứng dụng khác, nên phải chuyển từng tài khoản một. Trong Authy: + → Quét mã QR, rồi bấm Tiếp ở đây.',
  'dest.1password.steps':
    '1Password thêm mã theo từng mục đăng nhập. Mở hoặc tạo mục đăng nhập → Sửa → thêm mật khẩu dùng một lần → quét, rồi bấm Tiếp ở đây. Trên máy tính, nó đọc mã thẳng từ màn hình này được.',
  'dest.bitwarden.steps':
    'Trình quản lý mật khẩu: Nhập dữ liệu → định dạng tệp “Bitwarden (json)” → chọn tệp. Ứng dụng Bitwarden Authenticator: nhập từ Google Authenticator và quét các mã chuyển dữ liệu.',
  'dest.proton.steps':
    'Trong Proton Authenticator, nhập từ Google Authenticator và quét các mã chuyển dữ liệu — hoặc nhập từ Aegis và chọn tệp.',
  'dest.ente.steps':
    'Trong Ente Auth, nhập mã từ Google Authenticator và quét các mã chuyển dữ liệu — hoặc chọn “Văn bản thuần” (Plain text) và tệp .txt.',
  'dest.aegis.steps': 'Trong Aegis: Nhập & Xuất → Nhập từ tệp → Aegis, rồi chọn tệp.',
  'dest.2fas.steps':
    'Trong 2FAS, nhập từ Google Authenticator và quét các mã chuyển dữ liệu — hoặc nhập từ Aegis và chọn tệp.',
  'dest.other.steps':
    'Ứng dụng xác thực nào cũng quét được mã thiết lập, nên chuyển lần lượt từng tài khoản luôn làm được. Nhiều ứng dụng còn nhập được mã chuyển dữ liệu của Google Authenticator, hoặc tệp liên kết otpauth:// — hãy tìm tuỳ chọn nhập.',
  'dest.other.name': 'Ứng dụng khác',

  // --- Cài đặt: xuất ------------------------------------------------------------
  'export.what': 'Xuất những gì',
  'export.all': { other: 'Cả {count} tài khoản.' },
  'export.someChosen': 'Đã chọn {chosen}/{total}.',
  'export.choose': 'Chọn…',
  'export.chipAll': 'Tất cả',
  'export.chipNone': 'Không chọn',
  'export.encrypted.description':
    'Một tệp được khoá bằng mật khẩu bạn chọn ở đây. Hãy giữ một bản ở nơi an toàn — nếu thiết bị này hỏng, tệp này là cách lấy lại tài khoản.',
  'export.encrypted.hint': 'Ít nhất 8 ký tự. Có thể khác mật khẩu chính.',
  'export.encrypted.download': 'Tải bản sao lưu mã hoá ({count})',
  'export.move.title': 'Chuyển sang ứng dụng khác',
  'export.move.description':
    'Dữ liệu xuất đọc được, để chuyển sang ứng dụng xác thực khác hoặc giữ trên giấy. Khác với bản sao lưu, không cái nào được mã hoá.',
  'export.move.danger':
    'Những thứ này chứa khoá bí mật 2FA ở dạng đọc được. Ai thấy các mã hoặc mở các tệp đều tạo được mã của bạn chừng nào tài khoản còn tồn tại. Làm xong thì xoá tệp, huỷ giấy.',
  'export.move.understood': 'Tôi hiểu những thứ này không được mã hoá.',
  'common.continue': 'Tiếp tục',
  'export.move.which': 'Bạn đang chuyển sang ứng dụng nào?',
  'export.filesAndPaper': 'Tệp và giấy:',
  'export.aegis': 'Aegis .json',
  'export.bitwarden': 'Bitwarden .json',
  'export.text': 'otpauth .txt',
  'export.print': 'Trang để in',
  'export.closesIn': { other: '{accounts}. Tự đóng lại sau {count} phút.' },
  'export.closesSoon': '{accounts}. Sắp tự đóng lại.',
  'export.accounts': { other: '{count} tài khoản' },
  'export.closeNow': 'Đóng ngay',
  'export.method.transfer': 'Hiện mã chuyển dữ liệu',
  'export.method.oneByOne': 'Quét từng mã một',
  'export.method.aegis': 'Tải tệp Aegis',
  'export.method.bitwarden': 'Tải tệp Bitwarden',
  'export.method.text': 'Tải tệp văn bản',
  'export.allAtOnce': 'Tất cả một lần',
  'export.oneAtATime': 'Từng cái một',
  'export.transfer.label': 'Mã chuyển dữ liệu cho {app}',
  'export.transfer.title': 'Mã chuyển dữ liệu của Google Authenticator',
  'export.moveTo': 'Chuyển sang {app}',
  'export.transfer.none': 'Không tài khoản nào đã chọn chuyển được sang Google Authenticator.',
  'export.transfer.codeLabel': 'Mã chuyển dữ liệu {index}/{total}',
  'export.previous': 'Trước',
  'export.next': 'Tiếp',
  'export.transfer.code': 'Mã {index}/{total}',
  'export.transfer.oneHolds': { other: 'Một mã chứa cả {count} tài khoản.' },
  'export.transfer.notIncluded': 'Không có trong đây — hãy chuyển từng cái một:',
  'export.oneByOne.label': 'Mã thiết lập cho {app}, từng cái một',
  'export.oneByOne.title': 'Từng tài khoản một',
  'export.oneByOne.progress': 'Đã hiện',
  'export.oneByOne.position': 'Tài khoản {index}/{total}',
  'export.oneByOne.keys': '→ hoặc phím cách để sang cái tiếp, Esc để dừng',
  'export.steamRefused': '{app} không tạo được mã Steam Guard, nên sẽ không nhận tài khoản này.',
  'export.print.label': 'Mã QR để in hoặc quét',
  'export.print.title': 'Keyrook Authenticator — mã thiết lập',
  'export.print.body':
    '{accounts}, {date}. Mỗi mã thiết lập tài khoản trong bất kỳ ứng dụng xác thực nào. Ai giữ tờ này đều tạo được mã của bạn: hãy cất kỹ.',
  'export.print.print': 'In hoặc lưu thành PDF',

  // --- Cài đặt: bảo mật ---------------------------------------------------------
  'security.locking': 'Khoá kho',
  'security.lockAfter': 'Tự khoá khi không dùng',
  'security.lockAfter.passphrase':
    'Khoá giải mã bị xoá khỏi bộ nhớ. Bạn sẽ cần nhập lại mật khẩu chính.',
  'security.lockAfter.device':
    'Chỉ áp dụng khi có mật khẩu chính — kho dùng khoá thiết bị không có gì để mở khoá.',
  'security.autoLock': 'Thời gian tự khoá',
  'security.minutes': { other: '{count} phút' },
  'security.hour': '1 giờ',
  'security.never': 'Không bao giờ',
  'security.needsPassword': 'Cần mật khẩu chính',
  'security.blur': 'Làm mờ mã cho tới khi rê chuột vào',
  'security.blurDescription': 'Giữ mã không lộ ra khi bạn chia sẻ màn hình.',
  'security.blurToggle': 'Làm mờ mã',
  'security.autofill': 'Tự điền',
  'security.autofillRow': 'Gợi ý điền mã trên trang web',
  'security.appearance': 'Giao diện',
  'security.theme': 'Chủ đề',
  'security.theme.system': 'Theo hệ thống',
  'security.theme.light': 'Sáng',
  'security.theme.dark': 'Tối',
  'security.sortBy': 'Sắp xếp tài khoản theo',
  'security.sortOrder': 'Thứ tự sắp xếp',
  'security.sort.added': 'Thứ tự thêm vào',
  'security.sort.name': 'Tên',
  'security.language': 'Ngôn ngữ',
  'security.languageBrowser': 'Theo trình duyệt ({language})',
  // --- Cài đặt: cách kho được bảo vệ ----------------------------------------------
  'protect.msg.removedSignedIn':
    'Thiết bị này giờ mở mà không cần mật khẩu. Mật khẩu tài khoản của bạn vẫn giữ nguyên.',
  'protect.msg.removed': 'Đã gỡ mật khẩu chính. Kho này giờ tự mở trên thiết bị này.',
  'protect.msg.setSignedIn': 'Thiết bị này giờ khoá bằng mật khẩu tài khoản của bạn.',
  'protect.msg.set': 'Đã đặt mật khẩu chính. Bạn sẽ được hỏi mật khẩu sau khi kho khoá.',
  'protect.msg.changedSignedIn':
    'Đã đổi mật khẩu, cho cả kho này và tài khoản. Các thiết bị khác sẽ yêu cầu bạn đăng nhập lại bằng mật khẩu mới.',
  'protect.msg.changed': 'Đã đổi mật khẩu chính.',
  'protect.state.accountPassword': 'Khoá bằng mật khẩu tài khoản',
  'protect.state.master': 'Mật khẩu chính',
  'protect.state.device': 'Khoá thiết bị (không mật khẩu)',
  'protect.lockWithAccount': 'Khoá bằng mật khẩu tài khoản',
  'protect.addMaster': 'Thêm mật khẩu chính',
  'protect.changePassword': 'Đổi mật khẩu',
  'protect.note.passphrase':
    'Đây cũng là mật khẩu tài khoản đồng bộ. Đổi ở đây là đổi luôn ở đó, và các thiết bị khác sẽ yêu cầu bạn đăng nhập lại.',
  'protect.note.device':
    'Tài khoản đồng bộ có mật khẩu riêng, thiết bị này không hỏi tới. Bạn cần nó trên thiết bị mới, và khi đổi tài khoản hoặc khoá khôi phục.',
  'protect.removeWarning':
    'Kho vẫn được mã hoá, nhưng sẽ tự mở mỗi khi hồ sơ trình duyệt này đang mở. Khi đó ai dùng máy tính này cũng xem được mã của bạn.',
  'protect.removeWarningSignedIn':
    ' Tài khoản vẫn giữ mật khẩu — bạn vẫn cần nó trên thiết bị mới.',
  'protect.currentPassword': 'Mật khẩu hiện tại',
  'protect.currentMaster': 'Mật khẩu chính hiện tại',
  'protect.accountPassword': 'Mật khẩu tài khoản',
  'protect.accountPasswordHint':
    'Mật khẩu bạn dùng để đăng nhập đồng bộ. Thiết bị này sẽ hỏi mật khẩu đó sau khi khoá.',
  'protect.newPassword': 'Mật khẩu mới',
  'protect.hint12': 'Ít nhất 12 ký tự đủ loại, hoặc bốn, năm từ không liên quan.',
  'protect.confirmNew': 'Nhập lại mật khẩu mới',
  'protect.removePassword': 'Gỡ mật khẩu',
  'protect.lockWithIt': 'Khoá bằng mật khẩu này',
  'protect.setPassword': 'Đặt mật khẩu',
  'danger.title': 'Xoá kho này',
  'danger.description':
    'Xoá mọi tài khoản và kho đã mã hoá khỏi thiết bị này. Không hoàn tác được, và không còn bản nào ở nơi khác.',
  'danger.open': 'Xoá kho này…',
  'danger.warning':
    'Trước hết hãy chắc rằng bạn còn cách khác để vào từng tài khoản — tệp sao lưu, mã khôi phục, hoặc cùng các tài khoản đó trên điện thoại.',
  'common.typeToConfirm': 'Gõ {word} để xác nhận',
  'danger.confirm': 'Xoá tất cả',

  // --- Cài đặt: khoá khôi phục --------------------------------------------------
  'kit.title': 'Khoá khôi phục',
  'kit.provider':
    'Tài khoản của bạn không có mật khẩu. Khoá khôi phục là lối quay lại nếu mất hết mọi thiết bị đã đăng nhập: nó cho thiết bị mới vào tài khoản mà không cần thiết bị khác duyệt. {provider} không làm được việc đó cho bạn.',
  'kit.signedIn':
    'Không ai đặt lại mật khẩu thay bạn được — kể cả chúng tôi. Khoá khôi phục là lối duy nhất nếu bạn quên: nó mở kho này, các thiết bị khác, và tài khoản của bạn trên thiết bị mới.',
  'kit.passphrase':
    'Không ai đặt lại được mật khẩu chính của bạn — kể cả chúng tôi. Chính điều đó ngăn người khác mở kho, và cũng vì thế khoá khôi phục là lối duy nhất nếu bạn quên.',
  'kit.device':
    'Kho này mở bằng một khoá do trình duyệt giữ. Nếu khoá đó mất — xoá dữ liệu duyệt web, hồ sơ mới, cài lại — thì chỉ khoá khôi phục mới còn mở được kho.',
  'kit.none': 'Chưa có khoá khôi phục',
  'kit.vaultOnly': 'Mở được kho này, nhưng không mở được tài khoản',
  'kit.issued': 'Đã tạo khoá khôi phục',
  'kit.issueNew': 'Tạo khoá mới',
  'kit.create': 'Tạo khoá khôi phục',
  'kit.beforeSignIn':
    'Khoá này được tạo trước khi bạn đăng nhập, nên tài khoản không có nó. Nó vẫn mở được kho ở đây, nhưng không dùng được trên thiết bị mới. Hãy tạo khoá mới để dùng cho cả hai.',
  'kit.replaces':
    'Tạo khoá mới sẽ làm khoá cũ hết hiệu lực, nên tờ giấy in cũ có thể vứt đi sau khi đã thay.',
  'kit.replacesSignedIn':
    'Tạo khoá mới sẽ làm khoá cũ hết hiệu lực, ở đây và trên các thiết bị khác, nên tờ giấy in cũ có thể vứt đi sau khi đã thay.',
  'kit.withoutProvider':
    'Không có nó, nếu mất hết mọi thiết bị đã đăng nhập tài khoản thì mọi tài khoản trong kho này sẽ mất vĩnh viễn.',
  'kit.withoutPassword':
    'Không có nó, nếu quên mật khẩu thì mọi tài khoản trong kho này sẽ mất vĩnh viễn.',
  'kit.withoutDevice':
    'Không có nó, nếu khoá trình duyệt đang giữ bị mất thì mọi tài khoản trong kho này sẽ mất vĩnh viễn.',
  'kit.noSupport': 'Không có yêu cầu hỗ trợ nào lấy lại được.',
  'kit.removeProvider':
    'Gỡ nó đi thì chỉ còn một thiết bị đã đăng nhập là cách duy nhất cho thiết bị mới vào tài khoản.',
  'kit.removePassword': 'Gỡ nó đi thì mật khẩu là lối vào duy nhất.',
  'kit.removePasswordSignedIn':
    'Gỡ nó đi thì mật khẩu là lối vào duy nhất — trên thiết bị này, các thiết bị khác và tài khoản của bạn.',
  'kit.reauth':
    'Khoá khôi phục có thể cho một thiết bị vào tài khoản, nên {provider} yêu cầu bạn đăng nhập lại một lần trước.',
  'kit.passwordHint': 'Khoá khôi phục có thể đặt lại tài khoản, nên muốn đổi nó cần mật khẩu của bạn.',
  'kit.removeConfirm': 'Gỡ khoá khôi phục',
  'kit.createConfirm': 'Tạo khoá',

  // --- Cài đặt: tài khoản và đồng bộ ----------------------------------------------
  'account.title': 'Tài khoản',
  'facts.stored': 'Số tài khoản lưu được',
  'facts.noLimit': 'Không giới hạn',
  'facts.encryption': 'Mã hoá',
  'facts.autofill': 'Tự điền và quét QR',
  'facts.included': 'Có sẵn',
  'facts.backup': 'Tệp sao lưu mã hoá',
  'facts.sync': 'Đồng bộ giữa các thiết bị',
  'facts.needsAccount': 'Cần tài khoản',
  'facts.notYet': 'Chưa có',
  'facts.withoutAccount': 'Không cần tài khoản, trên thiết bị này',
  'facts.title': 'Kho cục bộ miễn phí cho bạn những gì',
  'facts.description':
    'Không tài khoản, không email, không máy chủ — và không giới hạn ở những phần quan trọng cho bảo mật.',
  'account.localOnly': 'Chỉ trên máy — chưa đăng nhập',
  'account.noServer':
    'Bản này được build không có máy chủ đồng bộ, nên mọi thứ bạn thêm vào không rời khỏi máy.',
  'account.signedInWith': 'Đăng nhập bằng {provider} · ',
  'account.lastSynced': 'Đồng bộ lần cuối {time}',
  'account.notSynced': 'Chưa đồng bộ',
  'account.every5': ' · đồng bộ mỗi 5 phút',
  'account.syncNow': 'Đồng bộ ngay',
  'account.signOut': 'Đăng xuất',
  'account.noKitProvider':
    'Tài khoản của bạn chưa có khoá khôi phục. Nếu mất hết mọi thiết bị đã đăng nhập, không gì lấy lại được tài khoản — kể cả chúng tôi hay {provider}.',
  'account.noKit':
    'Tài khoản của bạn chưa có khoá khôi phục. Nếu bạn quên mật khẩu và mất thiết bị này, không gì lấy lại được tài khoản — kể cả chúng tôi, hay bất kỳ ai.',
  'account.createUnderSecurity': 'Tạo một khoá trong mục Bảo mật',
  'summary.sentReceived': 'Đã gửi {sent}, đã nhận {received}',
  'summary.conflicts': ', giữ bản của thiết bị này cho {count} mục',
  'summary.overLimit': ', {count} mục không vừa — mỗi tài khoản chứa tối đa 10.000 — nên vẫn ở trên thiết bị này',
  'summary.end': '.',
  'summary.deleted': {
    other: ' {count} tài khoản đã bị xoá trên thiết bị khác — bạn có thể khôi phục trong mục Mã 2FA.',
  },
  'summary.rejected': {
    other: ' {count} bản ghi không giải mã được nên đã bị bỏ qua. Nếu cứ lặp lại, bản sao đang lưu có vấn đề.',
  },
  'account.signOutNote':
    'Đăng xuất sẽ xoá các mã khỏi trình duyệt này. Mã vẫn còn trong tài khoản Keyrook của bạn — đăng nhập lại là có lại.',
  'accountPage.title': 'Tài khoản Keyrook của bạn',
  'accountPage.body': 'Mật khẩu, khoá khôi phục, bắt đầu lại và xoá tài khoản đều nằm ở trang tài khoản, dùng chung cho mọi app Keyrook.',
  'accountPage.bodyNoRoot': 'Mật khẩu và xoá tài khoản nằm ở trang tài khoản. Khoá khôi phục được tạo ở đây, trong mục Bảo mật, cho đến khi một app Keyrook khác dùng tài khoản.',
  'accountPage.bodyProvider': 'Khoá khôi phục, bắt đầu lại và xoá tài khoản đều nằm ở trang tài khoản, dùng chung cho mọi app Keyrook.',
  'accountPage.bodyNoRootProvider': 'Xoá tài khoản nằm ở trang tài khoản. Khoá khôi phục được tạo ở đây, trong mục Bảo mật, cho đến khi một app Keyrook khác dùng tài khoản.',
  'sheetCheck.lead': 'Gõ khoá khôi phục bạn đã lưu một lần, để app này biết khoá đó lấy lại được mã của bạn. Khoá được kiểm tra ngay trên máy này và không gửi đi đâu cả.',
  'sheetCheck.submit': 'Kiểm tra',
  'sheetCheck.lost': 'Bị mất, hay chưa từng có? Hãy tạo khoá mới ở trang tài khoản.',
  'accountPage.noSheetYet': 'Chưa có gì cho thấy khoá khôi phục của bạn bảo vệ Keyrook Authenticator. Không có nó, quên mật khẩu là có thể mất mã. Hãy gõ khoá một lần trong mục Bảo mật, hoặc tạo khoá mới ở trang tài khoản.',
  'account.checkUnderSecurity': 'Kiểm tra trong mục Bảo mật',
  'accountPage.open': 'Mở trang tài khoản',
  'accountPage.recoveryKey': 'Khoá khôi phục của kho đã đăng nhập là khoá của tài khoản Keyrook. Tạo và đổi khoá này ở trang tài khoản.',
  'accountPage.sheetProtects': 'Khoá khôi phục của tài khoản đang bảo vệ Keyrook Authenticator',
  'accountPage.sheetUnknown': 'Chưa biết có bảo vệ Keyrook Authenticator hay không',
  'secondStep.title': 'Thêm một bước nữa',
  'secondStep.lead': 'Tài khoản Keyrook của bạn yêu cầu bước thứ hai. Hãy nhập mã 6 số mà app xác thực hiện cho tài khoản này.',
  'secondStep.field': 'Mã, hoặc khoá khôi phục',
  'secondStep.hint': 'Mất app đó rồi? Hãy nhập khoá khôi phục của tài khoản thay vào.',
  'secondStep.passkey': 'Dùng khoá truy cập thay vào',
  'secondStep.where': 'Đăng nhập hai bước được bật và tắt trên account.keyrook.com.',
  'secondStep.ownerLead': 'Việc này cũng cần bước thứ hai của tài khoản: mã từ app xác thực, hoặc khoá khôi phục của bạn.',
  'secondStep.nextCode': 'Mỗi mã chỉ dùng được một lần. Nếu bạn vừa đăng nhập bằng một mã, hãy chờ app hiện mã kế tiếp.',
  'secondStepTip.title': 'Đăng nhập hai bước',
  'secondStepTip.suggest': 'Hỏi thêm mã mỗi khi tài khoản này đăng nhập trên thiết bị khác. Bật ở account.keyrook.com rồi giữ mã ngay tại đây: trên trang đó, mở Keyrook Authenticator và chọn “{scan}”.',
  'secondStepTip.kept': 'Mã đăng nhập của chính tài khoản này được giữ ở đây, trên mọi thiết bị đang đăng nhập vào nó.',
  'secondStepTip.warning': 'Nếu mất hết các thiết bị đang giữ mã, hãy đăng nhập bằng khoá khôi phục thay cho mã. Hãy cất khoá khôi phục ở một nơi riêng.',
  'secondStepTip.open': 'Bật',
  'signin.providerHasPassword': '{provider} đã xác nhận đó là bạn, và {email} còn có mật khẩu. Hãy nhập mật khẩu để mở các mã của bạn ở đây.',
  'provider.addOnPage': 'Muốn đăng nhập cả bằng Google hay GitHub, hãy đăng nhập trang tài khoản bằng mật khẩu rồi thêm ở đó.',
  'startOver.title': 'Tài khoản Keyrook của bạn sẽ bắt đầu lại vào {date}',
  'startOver.lead': 'Ai đó trên “{device}” đã yêu cầu việc này vào {date}, bằng mã chúng tôi gửi qua email: mật khẩu mới và khoá mới, và các app của bạn sẽ bắt đầu trống trơn.',
  'startOver.ifYou': 'Nếu đó là bạn, bạn không cần làm gì. Nếu không phải, hãy huỷ ngay, rồi đổi mật khẩu email của bạn: người yêu cầu đọc được email của bạn.',
  'startOver.cancel': 'Không phải tôi — huỷ yêu cầu',
  'kept.title': 'Được giữ lại từ trước khi tài khoản bắt đầu lại',
  'kept.body': 'Khi tài khoản này bắt đầu lại, dữ liệu của Keyrook Authenticator trong đó được giữ đến {date}. Hãy đưa về bằng mật khẩu tài khoản lúc đó, hoặc khoá khôi phục lúc đó.',
  'kept.password': 'Mật khẩu lúc đó',
  'kept.recoveryKey': 'Khoá khôi phục lúc đó',
  'kept.usePassword': 'Dùng mật khẩu lúc đó',
  'kept.useRecoveryKey': 'Dùng khoá khôi phục lúc đó',
  'kept.bring': 'Đưa về',
  'kept.done': 'Đã về lại kho này, và đang được gửi tới các thiết bị khác của bạn.',
  'error.keys.awaitingConfirmation': 'Một app Keyrook khác đã thay khoá của tài khoản này, và khoá của Keyrook Authenticator chưa theo kịp. Hãy mở trang tài khoản để kiểm tra, rồi đăng nhập lại.',
  'password.changedBoth':
    'Đã đổi mật khẩu, cho cả tài khoản và kho này. Các thiết bị khác sẽ yêu cầu bạn đăng nhập lại bằng mật khẩu mới.',
  'password.changedAccount':
    'Đã đổi mật khẩu tài khoản. Các thiết bị khác sẽ yêu cầu bạn đăng nhập lại bằng mật khẩu mới.',
  'password.title': 'Mật khẩu',
  'password.row': 'Mật khẩu tài khoản',
  'password.rowDescription':
    'Dùng để đăng nhập trên thiết bị mới. Không ai đặt lại được giùm bạn — hãy giữ kỹ khoá khôi phục.',
  'password.change': 'Đổi mật khẩu…',
  'password.formTitle': 'Đổi mật khẩu tài khoản',
  'devices.title': 'Thiết bị đã đăng nhập',
  'devices.description':
    'Đăng xuất thiết bị bạn không dùng nữa hoặc không còn giữ. Nếu nó chạy Keyrook Authenticator bản mới, lần kết nối tới nó sẽ tự xoá các mã của tài khoản này, chỉ giữ lại những gì chưa từng gửi lên. Cho đến lúc đó, hoặc nếu nó không bao giờ kết nối lại, nó vẫn giữ những gì đã có, khoá bằng mật khẩu cũ.',
  'devices.descriptionProvider':
    'Đăng xuất thiết bị bạn không dùng nữa hoặc không còn giữ. Nếu nó chạy Keyrook Authenticator bản mới, lần kết nối tới nó sẽ tự xoá các mã của tài khoản này, chỉ giữ lại những gì chưa từng gửi lên. Cho đến lúc đó, hoặc nếu nó không bao giờ kết nối lại, nó vẫn giữ những gì đã có, khoá theo cách kho trên thiết bị đó đang khoá.',
  'devices.this': 'Thiết bị này',
  'devices.when': 'Đăng nhập {created} · hoạt động lần cuối {seen}',
  'removed.kept': 'Những mã được thêm hoặc sửa ở đây mà chưa kịp lên tài khoản vẫn còn ở đây.',
  'delete.row': 'Xoá tài khoản của bạn',
  'delete.rowDescription':
    'Xoá mọi bản sao đã mã hoá trên máy chủ. Thiết bị này giữ nguyên kho; các thiết bị khác ngừng đồng bộ.',
  'delete.open': 'Xoá tài khoản…',
  'delete.warning':
    'Không hoàn tác được. Nếu sau việc này thiết bị này là nơi duy nhất còn tài khoản của bạn, hãy giữ nó — hoặc xuất bản sao lưu trước.',
  'delete.reauth': '{provider} yêu cầu bạn đăng nhập lại một lần trước khi xoá bất cứ thứ gì.',
  'delete.confirm': 'Xoá tài khoản',

  // --- Đăng nhập: thẻ đầu tiên --------------------------------------------------
  'intro.benefit1': 'Cùng các mã trên mọi thiết bị bạn đăng nhập.',
  'intro.benefit2': 'Mất hay hỏng laptop không có nghĩa là mất kho.',
  'intro.benefit3': 'Miễn phí và tuỳ chọn — không bật thì mọi thứ trên thiết bị này vẫn chạy bình thường.',
  'intro.title': 'Đồng bộ kho của bạn',
  'intro.subtitle':
    'Mã hoá trên thiết bị này trước khi gửi đi. Máy chủ lưu thứ nó không đọc được — và chúng tôi cũng vậy.',
  'intro.signedOutProvider':
    'Thiết bị này đã bị đăng xuất khỏi {email} — nó đã bị gỡ từ một thiết bị khác. Tiếp tục với {provider} để đăng nhập lại.',
  'intro.orEmail': 'hoặc dùng email',
  'intro.create': 'Tạo tài khoản',
  'intro.signIn': 'Đăng nhập',
  'intro.source': 'Mã nguồn mở — xem cách mã của bạn được mã hoá',

  // --- Đăng nhập: form email ----------------------------------------------------
  'form.email': 'Email',
  'form.emailPlaceholder': 'ban@example.com',
  'create.checkEmail': 'Kiểm tra email của bạn',
  'create.codeSent': 'Chúng tôi đã gửi mã sáu chữ số tới <b>{email}</b>. Mã dùng được một lần, trong 15 phút.',
  'create.code': 'Mã',
  'create.spam':
    'Không thấy trong hộp thư đến? Hãy tìm trong <b>Thư rác</b> thư từ <b>Keyrook</b>, rồi đánh dấu <b>Không phải thư rác</b>.',
  'create.submit': 'Tạo tài khoản',
  'create.existing':
    'Nếu địa chỉ này đã có tài khoản, email sẽ báo như vậy — khi đó hãy đăng nhập.',
  'create.stillNothing': 'Vẫn chưa thấy?',
  'create.resendIn': 'Gửi mã mới sau {seconds} giây',
  'create.resend': 'Gửi mã mới',
  'create.wrongAddress': '. Sai địa chỉ?',
  'create.changeIt': 'Đổi địa chỉ',
  'create.title': 'Tạo tài khoản',
  'create.choosing': 'Bạn sẽ cần mật khẩu này trên thiết bị mới. Thiết bị này vẫn mở mà không cần nó.',
  'create.sharing': 'Mật khẩu chính cũng trở thành mật khẩu tài khoản — vẫn chỉ một mật khẩu.',
  'create.password': 'Mật khẩu',
  'create.master': 'Mật khẩu chính',
  'create.next':
    'Tiếp theo, chúng tôi gửi email một mã để xác nhận địa chỉ, rồi bạn lưu khoá khôi phục — lối duy nhất nếu bạn quên mật khẩu.',
  'create.agree': 'Tạo tài khoản nghĩa là bạn đồng ý với <link>chính sách quyền riêng tư</link>.',
  'create.haveAccount': 'Đã có tài khoản?',
  'signin.subtitle': 'Các mã đang có trên thiết bị này sẽ được thêm vào tài khoản.',
  'signin.signedOut':
    'Thiết bị này đã bị đăng xuất khỏi {email} — mật khẩu đã được đổi hoặc thiết bị đã bị gỡ từ máy khác. Đăng nhập lại để tiếp tục đồng bộ.',
  'signin.forgot': 'Quên mật khẩu?',
  'signin.locksWithAccount': 'Từ đó thiết bị này sẽ khoá bằng mật khẩu tài khoản.',
  'signin.keepsOpening': 'Thiết bị này vẫn mở mà không cần mật khẩu.',
  'signin.newHere': 'Mới dùng?',
  'recoverAccount.title': 'Khôi phục tài khoản',
  'recoverAccount.subtitle':
    'Dùng khoá khôi phục bạn đã lưu khi tạo tài khoản, rồi chọn mật khẩu mới.',
  'recoverAccount.keyHint': '32 ký tự trên tờ giấy đã in. Khoảng trắng và gạch ngang không quan trọng.',
  'recoverAccount.submit': 'Khôi phục và đăng nhập',
  'recoverAccount.elsewhere': 'Nếu một app Keyrook khác cũng dùng tài khoản này, mật khẩu được đặt lại ở trang tài khoản.',
  'recoverAccount.note':
    'Mọi thiết bị của tài khoản sẽ bị đăng xuất và được hỏi mật khẩu mới. Khoá khôi phục vẫn dùng được.',

  // --- Đăng nhập: sau đó --------------------------------------------------------
  'ready.empty': 'Tài khoản của bạn đã sẵn sàng.',
  'ready.all': {
    other: 'Tài khoản của bạn đã sẵn sàng, và cả {count} tài khoản trên thiết bị này đã được sao lưu lên đó.',
  },
  'ready.some':
    'Tài khoản của bạn đã sẵn sàng. Đã sao lưu {done}/{total} tài khoản; phần còn lại sẽ theo ở lần đồng bộ tới.',
  'fresh.title': 'Lưu khoá khôi phục',
  'fresh.provider':
    'Nếu mất hết mọi thiết bị đã đăng nhập tài khoản, khoá này là lối duy nhất để vào lại — {provider} không khôi phục được kho của bạn, chúng tôi cũng không.',
  'fresh.password':
    'Nếu bạn quên mật khẩu, khoá này là lối duy nhất để vào lại — không ai đặt lại được giùm bạn, kể cả chúng tôi.',
  'welcome.fromAccount': '{count} từ tài khoản của bạn',
  'welcome.fromDevice': '{count} thêm từ thiết bị này',
  'welcome.inSync': 'Đã đồng bộ sẵn.',
  'welcome.nothing': 'Chưa có gì ở đây.',
  'welcome.failed': 'Đã đăng nhập — lần đồng bộ đầu chưa xong',
  'welcome.back': 'Bạn đã vào lại',
  'welcome.signedIn': 'Bạn đã đăng nhập',
  'welcome.nothingLost':
    'Không mất gì cả: các mã sẽ về ở lần đồng bộ tới. Thử lại ngay, hoặc nó tự chạy trong vòng năm phút.',
  'welcome.onDevice': { other: 'tài khoản trên thiết bị này' },
  'welcome.uploading': {
    other: ' · {count} tài khoản vẫn đang tải lên và sẽ theo ở lần đồng bộ tới',
  },
  'welcome.othersSignedOut': 'Mọi thiết bị khác đã bị đăng xuất, và sẽ hỏi mật khẩu mới.',
  'welcome.tryAgain': 'Thử lại',
  'welcome.seeAccounts': 'Xem các tài khoản',
  'welcome.toolbar': 'Chúng cũng chỉ cách một cú bấm: biểu tượng Keyrook Authenticator trên thanh công cụ.',

  // --- Đăng nhập bằng Google hoặc GitHub ------------------------------------------
  'provider.continue': 'Tiếp tục với {provider}',
  'provider.finishInWindow': 'Hoàn tất trong cửa sổ {provider} vừa mở.',
  'provider.confirmed': '{provider} đã xác nhận <b>{email}</b>. Chưa có tài khoản nào dùng email này.',
  'provider.point1':
    'Không mật khẩu. Trên thiết bị mới, bạn tiếp tục với {provider}, và một thiết bị đã đăng nhập sẽ cho nó vào sau khi bạn kiểm tra hai bên hiện cùng một mã.',
  'provider.point2':
    '{provider} xác nhận đó là bạn. Họ không bao giờ thấy mã của bạn: mã được mã hoá ở đây, bằng khoá chỉ nằm trên các thiết bị của bạn.',
  'provider.point3':
    'Tiếp theo bạn lưu khoá khôi phục — lối quay lại nếu mất hết mọi thiết bị đã đăng nhập. {provider} không khôi phục được kho của bạn.',
  'provider.notRight': 'Không đúng tài khoản?',
  'provider.startAgain': 'Bắt đầu lại',
  'passkey.continue': 'Tiếp tục bằng khoá truy cập',
  'passkey.where':
    'Khoá bạn đã thêm ở <link>trang tài khoản</link>, mục Khoá truy cập. Lần đầu, Chrome sẽ hỏi có cho Keyrook Authenticator dùng nó không.',
  'pairing.codeLabel': 'Mã {code}',
  'join.title': 'Cho trình duyệt này vào',
  'join.subtitle':
    '<b>{email}</b> đã có tài khoản. Hãy duyệt trình duyệt này từ một thiết bị đã đăng nhập.',
  'join.masterPassword': 'Mật khẩu chính của kho này',
  'join.masterHint': 'Nó vẫn khoá kho ở đây; bản thân tài khoản không có mật khẩu.',
  'join.ask': 'Xin tham gia',
  'join.step1':
    'Trên một thiết bị đã đăng nhập, mở Keyrook Authenticator. Yêu cầu sẽ hiện ở đó — phía trên các mã, và trong Cài đặt ở mục Đồng bộ.',
  'join.step2': 'Kiểm tra nó hiện đúng mã như trang này, rồi duyệt.',
  'join.askAgain': 'Gửi lại',
  'join.compare': 'Thiết bị kia cũng hiện một mã. Chỉ duyệt ở đó nếu đúng y mã này.',
  'join.waiting': 'Đang chờ thiết bị khác…',
  'join.noOther': 'Không còn thiết bị nào khác?',
  'join.useKey': 'Dùng khoá khôi phục',
  'join.wrongAccount': 'Đăng nhập {provider} nhầm tài khoản?',
  'joinKey.subtitle':
    'Khoá bạn đã lưu khi tạo tài khoản. Nó cho trình duyệt này vào mà không cần thiết bị khác.',
  'joinKey.submit': 'Tham gia tài khoản',
  'approve.approved': 'Đã duyệt. Thiết bị kia sẽ mở kho của bạn trong giây lát.',
  'approve.mismatch':
    'Đã từ chối. Nếu vừa rồi không phải chính bạn đăng nhập, người khác đang vào được tài khoản {provider} của bạn — hãy đổi mật khẩu và kiểm tra cài đặt bảo mật của nó.',
  'approve.declined': 'Đã từ chối. Không gửi gì đi cả.',
  'approve.title': 'Thiết bị xin tham gia',
  'approve.description':
    'Mỗi yêu cầu đến từ ai đó vừa đăng nhập bằng tài khoản {provider} của bạn. Chỉ duyệt thiết bị mà chính bạn đang đăng nhập, ngay lúc này.',
  'approve.descriptionAny':
    'Mỗi yêu cầu đến từ ai đó vừa đăng nhập bằng tài khoản Google hoặc GitHub của bạn. Chỉ duyệt thiết bị mà chính bạn đang đăng nhập, ngay lúc này.',
  'approve.mismatchAny':
    'Đã từ chối. Nếu vừa rồi không phải chính bạn đăng nhập, người khác đang vào được tài khoản Google hoặc GitHub của bạn — hãy đổi mật khẩu và kiểm tra cài đặt bảo mật của nó.',
  'approve.askedAt': 'Gửi lúc {time}',
  'approve.review': 'Xem xét',
  'approve.deny': 'Từ chối',
  'approve.question':
    'Thiết bị đang xin vào có hiện đúng y mã này không? Nếu không, ai đó đang cố vào.',
  'approve.matches': 'Khớp — cho vào',
  'approve.doesNotMatch': 'Không khớp',

  // --- Lỗi, tiếp ----------------------------------------------------------------
  'error.vaultNewer':
    'Kho này được tạo bởi phiên bản Keyrook Authenticator mới hơn. Hãy cập nhật trước khi mở.',
  'error.uriUnsupported': 'Liên kết đó dùng một cài đặt mà ứng dụng này không đọc được ({value}).',

  // --- Cài đặt: tài khoản, tiếp -------------------------------------------------
  'editor.websitesPlaceholder': 'github.com, gist.github.com',

  // --- Lỗi, cuối ----------------------------------------------------------------
  'error.noWorker': 'Tiện ích không phản hồi. Đóng cái này lại rồi mở lại.',

  // --- Cài đặt, theo việc -------------------------------------------------------
  'nav.sync': 'Đồng bộ',
  'nav.general': 'Chung',
  'nav.needsAttention': 'Cần xử lý',
  'sync.description': 'Cùng các mã trên mọi thiết bị bạn đăng nhập, được mã hoá ở đây trước khi gửi đi.',
  'backup.description': 'Giữ một bản mã hoá, đưa tài khoản vào, hoặc chuyển chúng sang ứng dụng khác.',
  'backup.choice.backup.title': 'Sao lưu',
  'backup.choice.backup.body': 'Một tệp mã hoá, khoá bằng mật khẩu bạn chọn.',
  'backup.choice.import.title': 'Nhập',
  'backup.choice.import.body': 'Từ bản sao lưu, dữ liệu xuất của ứng dụng khác, hoặc liên kết otpauth://.',
  'backup.choice.move.body': 'Mã chuyển dữ liệu, trang để in, hoặc tệp đọc được. Không mã hoá.',
  'security.description': 'Cách kho này được mở, và lối quay lại nếu mất trình duyệt này.',
  'security.deviceKeyHint': 'Không cần gõ gì. Không chống được mã độc chạy dưới tài khoản của bạn trên máy này.',
  'security.passwordHint': 'Được hỏi mỗi khi kho đã khoá.',
  'general.description': 'Giao diện và cách tiện ích hoạt động, cùng nguồn gốc của nó.',
  'general.inBrowser': 'Trong trình duyệt',
  'general.autofillHint':
    'Mở cửa sổ tiện ích trên trang đăng nhập sẽ gợi ý đúng mã. Chỉ đọc đúng tab đó.',
  'vault.signInToSync': 'Đăng nhập để đồng bộ',
  'vault.empty.signIn':
    'Đang dùng Keyrook Authenticator trên thiết bị khác? <link>Đăng nhập</link> để mang mã của bạn về đây.',
  'setup.haveAccount': 'Đã dùng Keyrook Authenticator? <link>Đăng nhập</link> để mang mã của bạn về đây.',
  'popup.signInOpensTab': 'Mở trong tab mới và hoàn tất trong Cài đặt.',
  'error.backupWrongPassword': 'Mật khẩu đó không mở được tệp này.',
  'error.foreign.steamFolder': 'Hãy chọn cùng lúc mọi tệp trong thư mục maFiles của Steam Desktop Authenticator: manifest.json và các tệp .maFile bên cạnh.',
  'error.foreign.locked':
    'Tệp xuất này được khoá bằng kiểu mật khẩu mà Keyrook Authenticator không mở được. Hãy xuất lại mà không đặt mật khẩu.',
  'import.lockedFrom': '{app} đã khoá tệp xuất này bằng mật khẩu. Nhập mật khẩu bạn đã đặt trong {app}.',
  'import.fromApps':
    'Tệp xuất từ Aegis, 2FAS, Bitwarden, Proton, Ente Auth, andOTP, FreeOTP+, Steam Desktop Authenticator, tiện ích Authenticator và Google Authenticator đều dùng được — kể cả tệp CSV từ Mật khẩu của Apple, 1Password hay trình quản lý mật khẩu khác.',
  'shortcut.open': 'Mở Keyrook Authenticator',
  'shortcut.fill': 'Điền mã cho trang này',
  'shortcut.fillHint': 'Chỉ điền khi đúng một tài khoản thuộc về trang; còn lại sẽ mở danh sách.',
  'shortcut.notSet': 'Chưa đặt',
  'vault.shortcutHint': 'Bấm {keys} để điền mà không cần mở cửa sổ này.',
  'import.csvWarning':
    'Tệp này chứa mật khẩu của bạn ở dạng đọc được. Chỉ khoá 2FA được đọc, ngoài ra không giữ lại gì — hãy xoá tệp khi xong.',
  'import.noKeysInCsv': 'Tệp đó không có khoá 2FA nào — chỉ có mật khẩu.',
  'crash.title': 'Đã xảy ra lỗi',
  'crash.body':
    'Màn hình này gặp sự cố và đã dừng lại. Các tài khoản đã lưu của bạn không bị ảnh hưởng. Tải lại thường sẽ khắc phục được.',
  'crash.reload': 'Tải lại',
  'setup.device.description.phone':
    'Khoá bí mật của bạn được mã hoá bằng một khoá do điện thoại này giữ giùm. Không cần nhớ, không cần gõ gì.',
  'setup.device.footnote.phone':
    'Chống được việc sao chép tệp của ứng dụng. Không chống được người mở khoá được điện thoại này.',
  'setup.password.footnote.phone':
    'Lựa chọn mạnh nhất: một khi đã khoá, không gì trên điện thoại này mở được kho nếu không có mật khẩu.',
  'unrecoverable.why.phone':
    'Khoá mã hoá của nó do điện thoại này giữ và đã mất — thường do dữ liệu ứng dụng bị xoá, ứng dụng bị cài lại, hoặc kho đến từ bản sao lưu của một điện thoại khác. Không có khoá đó thì không ai giải mã được các tài khoản đã lưu, kể cả chúng tôi.',
  'vault.empty.body.phone':
    'Khi một trang web hiện mã QR để thiết lập xác thực hai lớp, hãy quét nó bằng camera của điện thoại này.',
  'add.camera.description.phone':
    'Cho mã đang hiện trên màn hình khác — kể cả dữ liệu xuất từ Google Authenticator.',
  'add.fromGoogle.phone':
    'Chuyển từ Google Authenticator trên điện thoại khác sang? Hãy xuất tài khoản ở đó, rồi quét mã nó hiện ra bằng camera của điện thoại này. Nếu có nhiều mã, làm lần lượt từng mã.',
  'camera.noCamera.phone': 'Điện thoại này không cho ứng dụng dùng camera.',
  'camera.blocked.phone':
    'Ứng dụng chưa được phép dùng camera. Hãy cho phép trong phần cài đặt của điện thoại, hoặc dùng cách thêm tài khoản khác.',
  'camera.none.phone': 'Không tìm thấy camera trên điện thoại này.',
  'security.languageBrowser.phone': 'Theo điện thoại ({language})',
  'protect.removeWarning.phone':
    'Kho vẫn được mã hoá, nhưng sẽ tự mở mỗi khi ứng dụng mở. Khi đó ai mở khoá được điện thoại này cũng xem được mã của bạn.',
  'kit.device.phone':
    'Kho này mở bằng một khoá do điện thoại của bạn giữ. Nếu khoá đó mất — xoá dữ liệu ứng dụng, cài lại, điện thoại mới — thì chỉ khoá khôi phục mới còn mở được kho.',
  'kit.withoutDevice.phone':
    'Không có nó, nếu khoá điện thoại đang giữ bị mất thì mọi tài khoản trong kho này sẽ mất vĩnh viễn.',
  'security.description.phone': 'Cách kho này được mở, và lối quay lại nếu mất điện thoại này.',
  'security.deviceKeyHint.phone': 'Không cần gõ gì. Ai mở khoá được điện thoại này cũng mở được kho.',
  'general.description.phone': 'Giao diện và cách ứng dụng hoạt động, cùng nguồn gốc của nó.',
  'about.securityModelDescription.phone': 'Những gì ứng dụng cam kết, và những gì không.',
  'about.logos.description.phone':
    'Logo được đóng gói sẵn trong ứng dụng, không bao giờ tải về. Nếu hỏi mạng để lấy logo, bên trả lời sẽ biết bạn bật xác thực hai lớp ở những dịch vụ nào.',
  'about.fact.access.title.phone': 'Chỉ camera, và chỉ để quét',
  'about.fact.access.body.phone':
    'Ứng dụng không xin quyền nào ngoài camera, và chỉ khi bạn chọn quét mã. Những gì camera thấy không bao giờ rời khỏi điện thoại.',
  'about.fact.keys.body.phone':
    'Tài khoản của bạn được mã hoá bằng một khoá dữ liệu, và khoá này lại được bọc thêm một lớp. Với mật khẩu chính, khoá bọc được dẫn xuất bằng PBKDF2 600.000 vòng và chỉ nằm trong bộ nhớ khi đang mở. Không có mật khẩu, đó là khoá được niêm phong bởi kho khoá của chính điện thoại, nên một bản sao tệp của ứng dụng không mở được kho.',
  'rate.store.play': 'Google Play',
  'add.noNativeReader.phone':
    'Mã lớn — như dữ liệu xuất từ Google Authenticator — thường không quét được bằng camera ở đây. Nếu không quét được, hãy chụp ảnh nó bằng ứng dụng camera của điện thoại rồi dùng Tải lên ảnh QR.',
  'import.noNativeReader.phone':
    'Mã lớn — như dữ liệu xuất từ Google Authenticator — thường không quét được bằng camera ở đây. Nếu không quét được, hãy chụp ảnh từng mã bằng ứng dụng camera của điện thoại rồi chọn tất cả bằng Chọn tệp.',
  'error.signOutUnsynced.phone':
    'Một số thay đổi trên điện thoại này chưa lên tới tài khoản của bạn, đăng xuất bây giờ sẽ làm mất chúng. Hãy kết nối mạng rồi thử lại.',
  'account.signOutNote.phone':
    'Đăng xuất sẽ xoá các mã khỏi điện thoại này. Mã vẫn còn trong tài khoản Keyrook của bạn — đăng nhập lại là có lại.',
  'secondStepTip.suggest.phone':
    'Hỏi thêm mã mỗi khi tài khoản này đăng nhập trên thiết bị khác. Bật ở account.keyrook.com rồi giữ mã ngay tại đây: thêm tài khoản trong ứng dụng này và quét mã QR mà trang đó hiện.',
  'intro.benefit2.phone': 'Mất hay hỏng điện thoại không có nghĩa là mất kho.',
  'provider.finishInWindow.phone': 'Hoàn tất trên trang {provider} vừa mở trong trình duyệt.',
  'join.title.phone': 'Cho điện thoại này vào',
  'join.subtitle.phone':
    '<b>{email}</b> đã có tài khoản. Hãy duyệt điện thoại này từ một thiết bị đã đăng nhập.',
  'joinKey.subtitle.phone':
    'Khoá bạn đã lưu khi tạo tài khoản. Nó cho điện thoại này vào mà không cần thiết bị khác.',
  'facts.autofill.phone': 'Quét QR',
};
