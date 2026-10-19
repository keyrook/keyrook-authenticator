/**
 * What the browser and the store show before the extension is opened: its
 * name, its one-line summary, and the toolbar tooltip while it is locked —
 * written into `_locales/<code>/messages.json` and read through `__MSG_…__`
 * in the manifest. The pages themselves are translated in
 * `packages/ui/src/i18n/`; the long description each store shows is
 * `store-assets/listings/<code>.txt`.
 *
 * Chrome and the stores pick the entry for the browser's language, so these
 * follow the browser, not the choice made in Settings.
 *
 * Search in each store matches the listing in the reader's own language, so a
 * name is the words people there type, not a translation of the English: a
 * reader in Vietnam searches "xác thực 2 lớp", one in Korea "OTP", and many
 * type the English "authenticator" whatever their language. The brand comes
 * last, and only where it fits. The research behind each one is
 * `docs/store-listing.md`.
 *
 * A name is 45 characters at most (Edge Add-ons refuses a longer one; Chrome
 * allows 75), a summary 132. `terms` are Edge's hidden search terms: seven at
 * most, 30 characters each, 21 words in all. `test/store-listing.test.ts`
 * holds every entry to these.
 */
export const DEFAULT_LOCALE = 'en';

export const STORE_LOCALES = {
  en: {
    name: '2FA Authenticator - Keyrook',
    description:
      '2FA authenticator for your computer: scan a QR code, fill TOTP codes in one click, import from Google Authenticator. Encrypted sync.',
    locked: 'Keyrook Authenticator — locked',
    fill: 'Fill the code for this page',
    terms: ['2FA', 'authenticator', 'TOTP', 'two-factor authentication', 'Google Authenticator', 'one-time password', 'authenticator app'],
  },
  // Chrome lists these as languages of their own, and falls back to plain
  // English for them anyway: the entries are English, word for word.
  en_US: {
    name: '2FA Authenticator - Keyrook',
    description:
      '2FA authenticator for your computer: scan a QR code, fill TOTP codes in one click, import from Google Authenticator. Encrypted sync.',
    locked: 'Keyrook Authenticator — locked',
    fill: 'Fill the code for this page',
    terms: ['2FA', 'authenticator', 'TOTP', 'two-factor authentication', 'Google Authenticator', 'one-time password', 'authenticator app'],
  },
  en_GB: {
    name: '2FA Authenticator - Keyrook',
    description:
      '2FA authenticator for your computer: scan a QR code, fill TOTP codes in one click, import from Google Authenticator. Encrypted sync.',
    locked: 'Keyrook Authenticator — locked',
    fill: 'Fill the code for this page',
    terms: ['2FA', 'authenticator', 'TOTP', 'two-factor authentication', 'Google Authenticator', 'one-time password', 'authenticator app'],
  },
  en_AU: {
    name: '2FA Authenticator - Keyrook',
    description:
      '2FA authenticator for your computer: scan a QR code, fill TOTP codes in one click, import from Google Authenticator. Encrypted sync.',
    locked: 'Keyrook Authenticator — locked',
    fill: 'Fill the code for this page',
    terms: ['2FA', 'authenticator', 'TOTP', 'two-factor authentication', 'Google Authenticator', 'one-time password', 'authenticator app'],
  },
  de: {
    name: 'Authenticator App für 2FA - Keyrook',
    description:
      'Zwei-Faktor-Authentifizierung (2FA): QR-Code scannen, TOTP-Codes per Klick, Import aus Google Authenticator. Sync verschlüsselt.',
    locked: 'Keyrook Authenticator — gesperrt',
    fill: 'Code für diese Seite ausfüllen',
    terms: ['2FA', 'Authenticator App', 'Zwei-Faktor-Authentifizierung', 'Authentifizierung', 'Google Authenticator', 'TOTP', 'Einmalpasswort'],
  },
  fr: {
    name: '2FA Authenticator : double authentification',
    description:
      'Authentificateur 2FA sur ordinateur : scannez un QR code, codes TOTP en un clic, import depuis Google Authenticator. Sync chiffrée.',
    locked: 'Keyrook Authenticator — verrouillé',
    fill: 'Remplir le code de cette page',
    terms: ['2FA', 'authentificateur', 'double authentification', 'authenticator', 'Google Authenticator', 'TOTP', 'code de vérification'],
  },
  es: {
    name: 'Autenticador 2FA: verificación en dos pasos',
    description:
      'Autenticación de dos factores en tu PC: escanea un QR, códigos TOTP con un clic, importa desde Google Authenticator. Sync cifrada.',
    locked: 'Keyrook Authenticator — bloqueado',
    fill: 'Rellenar el código de esta página',
    terms: ['2FA', 'autenticador', 'verificación en dos pasos', 'autenticación de dos factores', 'Google Authenticator', 'TOTP', 'código de verificación'],
  },
  // Latin America reads the Spanish pages, but says computadora and celular.
  es_419: {
    name: 'Autenticador 2FA: verificación en dos pasos',
    description:
      'Autenticación de dos factores en tu PC: escanea un QR, códigos TOTP con un clic, importa desde Google Authenticator. Sync cifrada.',
    locked: 'Keyrook Authenticator — bloqueado',
    fill: 'Completar el código de esta página',
    terms: ['2FA', 'autenticador', 'verificación en dos pasos', 'autenticación de dos factores', 'Google Authenticator', 'TOTP', 'código de verificación'],
  },
  pt_BR: {
    name: 'Autenticador 2FA: verificação em duas etapas',
    description:
      'Autenticação de dois fatores no PC: leia o QR code, códigos TOTP num clique, importe do Google Authenticator. Sync criptografado.',
    locked: 'Keyrook Authenticator — bloqueado',
    fill: 'Preencher o código desta página',
    terms: ['2FA', 'autenticador', 'verificação em duas etapas', 'autenticação de dois fatores', 'Google Authenticator', 'TOTP', 'código de verificação'],
  },
  // Portugal reads the Brazilian pages (`detectLocale`), but searches in its
  // own words, and without this entry Chrome shows it the English listing.
  pt_PT: {
    name: 'Autenticador 2FA: verificação em dois passos',
    description:
      'Autenticação de dois fatores no PC: leia o código QR, códigos TOTP num clique, importe do Google Authenticator. Sync cifrada.',
    locked: 'Keyrook Authenticator — bloqueado',
    fill: 'Preencher o código desta página',
    terms: ['2FA', 'autenticador', 'verificação em dois passos', 'autenticação de dois fatores', 'Google Authenticator', 'TOTP', 'código de verificação'],
  },
  it: {
    name: 'Authenticator: autenticazione a due fattori',
    description:
      'Autenticatore 2FA per il computer: scansiona il QR, codici TOTP con un clic, importa da Google Authenticator. Sync cifrata.',
    locked: 'Keyrook Authenticator — bloccato',
    fill: 'Compila il codice per questa pagina',
    terms: ['2FA', 'autenticatore', 'autenticazione a due fattori', 'verifica in due passaggi', 'Google Authenticator', 'TOTP', 'authenticator'],
  },
  nl: {
    name: '2FA Authenticator: tweestapsverificatie',
    description:
      'Authenticator-app voor 2FA: scan de QR-code, TOTP-codes met één klik, importeer uit Google Authenticator. Versleutelde sync.',
    locked: 'Keyrook Authenticator — vergrendeld',
    fill: 'Code voor deze pagina invullen',
    terms: ['2FA', 'authenticator', 'tweestapsverificatie', 'authenticatie app', 'Google Authenticator', 'TOTP', 'verificatiecode'],
  },
  ja: {
    name: '2FA Authenticator: 二段階認証アプリ - Keyrook',
    description:
      'パソコンで使える二段階認証（2FA）アプリ。QRコードを読み取り、TOTPコードをワンクリックで入力。Google Authenticator（Google 認証システム）から移行でき、同期も暗号化。',
    locked: 'Keyrook Authenticator — ロック中',
    fill: 'このページのコードを入力',
    terms: ['2FA', '二段階認証', '認証アプリ', 'ワンタイムパスワード', 'Google Authenticator', 'Google 認証システム', 'TOTP'],
  },
  ko: {
    name: '2단계 인증 OTP 인증기 (2FA) - Keyrook',
    description:
      'PC에서 쓰는 2단계 인증 OTP 앱. QR 코드를 스캔하고 클릭 한 번으로 TOTP 코드 입력, 구글 OTP(Google Authenticator)에서 가져오기, 암호화 동기화.',
    locked: 'Keyrook Authenticator — 잠김',
    fill: '이 페이지의 코드 입력',
    terms: ['2단계 인증', 'OTP', '구글 OTP', '인증기', 'OTP 인증', '2FA', 'Google Authenticator'],
  },
  zh_TW: {
    name: '2FA 驗證器：雙重驗證與兩步驟驗證 - Keyrook',
    description:
      '電腦版雙重驗證（2FA）驗證器：掃描 QR 碼，一鍵填入 TOTP 驗證碼，可從 Google Authenticator 匯入，同步採端對端加密。',
    locked: 'Keyrook Authenticator — 已鎖定',
    fill: '填入此頁面的驗證碼',
    terms: ['2FA', '驗證器', '雙重驗證', '兩步驟驗證', '驗證碼', 'Google Authenticator', 'TOTP'],
  },
  zh_CN: {
    name: '2FA 身份验证器：两步验证与双重验证 - Keyrook',
    description:
      '电脑版两步验证（2FA）身份验证器：扫描二维码，一键填入 TOTP 验证码，可从谷歌验证器（Google Authenticator）导入，同步端到端加密。',
    locked: 'Keyrook Authenticator — 已锁定',
    fill: '填入此页面的验证码',
    terms: ['2FA', '身份验证器', '两步验证', '双重验证', '谷歌验证器', 'Google Authenticator', 'TOTP'],
  },
  vi: {
    name: 'Xác thực 2 lớp: 2FA Authenticator - Keyrook',
    description:
      'Ứng dụng xác thực 2 lớp (2FA) trên máy tính: quét mã QR, điền mã TOTP bằng một cú bấm, nhập từ Google Authenticator. Đồng bộ mã hoá.',
    locked: 'Keyrook Authenticator — đang khoá',
    fill: 'Điền mã cho trang này',
    terms: ['xác thực 2 lớp', '2FA', 'mã 2FA', 'ứng dụng xác thực', 'Google Authenticator', 'xác thực hai yếu tố', 'TOTP'],
  },
  ar: {
    name: 'تطبيق المصادقة الثنائية 2FA - Keyrook',
    description:
      'مصادقة ثنائية (2FA) على حاسوبك: امسح رمز QR، واملأ رموز TOTP بنقرة واحدة، واستورد من Google Authenticator. مزامنة مشفّرة.',
    locked: 'Keyrook Authenticator — مقفل',
    fill: 'ملء رمز هذه الصفحة',
    terms: ['المصادقة الثنائية', 'تطبيق مصادقة', 'رمز التحقق', '2FA', 'Google Authenticator', 'التحقق بخطوتين', 'TOTP'],
  },
  am: {
    name: 'Authenticator 2FA: ባለሁለት ደረጃ ማረጋገጫ',
    description:
      'በኮምፒውተርዎ ላይ ባለሁለት ደረጃ ማረጋገጫ (2FA)፦ የQR ኮድ ይቃኙ፣ የTOTP ኮዶችን በአንድ ጠቅታ ይሙሉ፣ ከGoogle Authenticator ያስመጡ። የተመሰጠረ ማመሳሰል።',
    locked: 'Keyrook Authenticator — ተቆልፏል',
    fill: 'ለዚህ ገጽ ኮዱን ሙላ',
    terms: ['2FA', 'authenticator', 'ባለሁለት ደረጃ ማረጋገጫ', 'የማረጋገጫ ኮድ', 'Google Authenticator', 'TOTP', 'OTP'],
  },
  bg: {
    name: 'Автентикатор 2FA: двуфакторна автентикация',
    description:
      '2FA автентикатор на компютъра: сканирайте QR, попълвайте TOTP кодове с един клик, внос от Google Authenticator. Шифрован синхрон.',
    locked: 'Keyrook Authenticator — заключено',
    fill: 'Попълване на кода за тази страница',
    terms: ['2FA', 'автентикатор', 'двуфакторна автентикация', 'authenticator', 'Google Authenticator', 'код за потвърждение', 'TOTP'],
  },
  bn: {
    name: 'Authenticator 2FA: টু-ফ্যাক্টর অথেনটিকেশন',
    description:
      'কম্পিউটারে টু-ফ্যাক্টর অথেনটিকেশন (2FA): QR কোড স্ক্যান করুন, এক ক্লিকে TOTP কোড বসান, Google Authenticator থেকে আনুন।',
    locked: 'Keyrook Authenticator — লক করা',
    fill: 'এই পেজের কোড বসান',
    terms: ['2FA', 'authenticator', 'টু ফ্যাক্টর অথেনটিকেশন', 'অথেনটিকেটর', 'Google Authenticator', 'যাচাইকরণ কোড', 'TOTP'],
  },
  ca: {
    name: 'Autenticador 2FA: verificació en dos passos',
    description:
      "Autenticació de dos factors al PC: escaneja el codi QR, codis TOTP amb un clic, importa des de Google Authenticator. Sync xifrada.",
    locked: 'Keyrook Authenticator — bloquejat',
    fill: "Omple el codi d'aquesta pàgina",
    terms: ['2FA', 'autenticador', 'verificació en dos passos', 'autenticació de dos factors', 'Google Authenticator', 'TOTP', 'authenticator'],
  },
  cs: {
    name: 'Authenticator 2FA: dvoufázové ověření',
    description:
      'Dvoufázové ověření (2FA): naskenujte QR kód, kódy TOTP jedním kliknutím, import z Google Authenticator. Šifrovaná synchronizace.',
    locked: 'Keyrook Authenticator — uzamčeno',
    fill: 'Vyplnit kód pro tuto stránku',
    terms: ['2FA', 'authenticator', 'dvoufázové ověření', 'autentizátor', 'Google Authenticator', 'ověřovací kód', 'TOTP'],
  },
  da: {
    name: 'Authenticator 2FA: totrinsbekræftelse',
    description:
      'Godkendelsesapp til 2FA: scan QR-koden, udfyld TOTP-koder med ét klik, importér fra Google Authenticator. Krypteret synk.',
    locked: 'Keyrook Authenticator — låst',
    fill: 'Udfyld koden til denne side',
    terms: ['2FA', 'authenticator', 'totrinsbekræftelse', 'godkendelsesapp', 'Google Authenticator', 'tofaktorgodkendelse', 'TOTP'],
  },
  el: {
    name: 'Authenticator 2FA: έλεγχος δύο παραγόντων',
    description:
      'Έλεγχος ταυτότητας δύο παραγόντων (2FA) στον υπολογιστή: σάρωση QR, κωδικοί TOTP με ένα κλικ, εισαγωγή από Google Authenticator.',
    locked: 'Keyrook Authenticator — κλειδωμένο',
    fill: 'Συμπλήρωση του κωδικού για αυτή τη σελίδα',
    terms: ['2FA', 'authenticator', 'έλεγχος δύο παραγόντων', 'επαλήθευση σε δύο βήματα', 'Google Authenticator', 'κωδικός επαλήθευσης', 'TOTP'],
  },
  et: {
    name: 'Authenticator 2FA: kaheastmeline autentimine',
    description:
      '2FA autentimisrakendus: skannige QR-kood, sisestage TOTP-koodid ühe klõpsuga, importige Google Authenticatorist. Krüpteeritud sünk.',
    locked: 'Keyrook Authenticator — lukus',
    fill: 'Sisesta selle lehe kood',
    terms: ['2FA', 'authenticator', 'kaheastmeline autentimine', 'autentimisrakendus', 'Google Authenticator', 'kinnituskood', 'TOTP'],
  },
  fa: {
    name: 'احراز هویت دو مرحله‌ای 2FA - Keyrook',
    description:
      'احراز هویت دو مرحله‌ای (2FA): کد QR را اسکن کنید، کدهای TOTP را با یک کلیک وارد کنید، از Google Authenticator منتقل کنید.',
    locked: 'Keyrook Authenticator — قفل است',
    fill: 'وارد کردن کد این صفحه',
    terms: ['احراز هویت دو مرحله‌ای', '2FA', 'authenticator', 'کد تایید', 'Google Authenticator', 'رمز یکبار مصرف', 'TOTP'],
  },
  fi: {
    name: 'Authenticator 2FA: kaksivaiheinen tunnistus',
    description:
      'Todennussovellus 2FA:lle tietokoneella: skannaa QR-koodi, täytä TOTP-koodit yhdellä napsautuksella, tuo Google Authenticatorista.',
    locked: 'Keyrook Authenticator — lukittu',
    fill: 'Täytä tämän sivun koodi',
    terms: ['2FA', 'authenticator', 'kaksivaiheinen', 'tunnistautuminen', 'todennussovellus', 'Google Authenticator', 'vahvistuskoodi'],
  },
  fil: {
    name: '2FA Authenticator: two-factor authentication',
    description:
      '2FA authenticator: i-scan ang QR code, ilagay ang TOTP code sa isang click, i-import mula sa Google Authenticator. Encrypted sync.',
    locked: 'Keyrook Authenticator — naka-lock',
    fill: 'Ilagay ang code para sa page na ito',
    terms: ['2FA', 'authenticator', 'two-factor authentication', 'authenticator app', 'Google Authenticator', 'verification code', 'TOTP'],
  },
  gu: {
    name: 'Authenticator 2FA: ટુ-ફેક્ટર ઓથેન્ટિકેશન',
    description:
      'કમ્પ્યુટર પર 2FA ઓથેન્ટિકેટર: QR કોડ સ્કેન કરો, એક ક્લિકમાં TOTP કોડ ભરો, Google Authenticator માંથી આયાત કરો. એન્ક્રિપ્ટેડ સિંક.',
    locked: 'Keyrook Authenticator — લૉક છે',
    fill: 'આ પેજ માટે કોડ ભરો',
    terms: ['2FA', 'authenticator', 'ટુ ફેક્ટર ઓથેન્ટિકેશન', 'ઓથેન્ટિકેટર', 'Google Authenticator', 'વેરિફિકેશન કોડ', 'TOTP'],
  },
  he: {
    name: 'מאמת 2FA: אימות דו-שלבי - Keyrook',
    description:
      'אימות דו-שלבי (2FA) במחשב: סרקו קוד QR, מלאו קודי TOTP בלחיצה אחת, ייבאו מ-Google Authenticator. סנכרון מוצפן.',
    locked: 'Keyrook Authenticator — נעול',
    fill: 'מילוי הקוד לדף הזה',
    terms: ['אימות דו שלבי', '2FA', 'מאמת', 'authenticator', 'Google Authenticator', 'קוד אימות', 'TOTP'],
  },
  hi: {
    name: 'Authenticator 2FA: टू-फैक्टर ऑथेंटिकेशन',
    description:
      'कंप्यूटर पर टू-फैक्टर ऑथेंटिकेशन (2FA) ऐप: QR कोड स्कैन करें, एक क्लिक में TOTP कोड भरें, Google Authenticator से इम्पोर्ट करें।',
    locked: 'Keyrook Authenticator — लॉक है',
    fill: 'इस पेज के लिए कोड भरें',
    terms: ['2FA', 'authenticator', 'टू फैक्टर ऑथेंटिकेशन', 'ऑथेंटिकेटर ऐप', 'Google Authenticator', 'वेरिफिकेशन कोड', 'TOTP'],
  },
  hr: {
    name: 'Authenticator: dvofaktorska autentifikacija',
    description:
      '2FA autentifikator: skenirajte QR kod, unesite TOTP kodove jednim klikom, uvoz iz Google Authenticatora. Šifrirana sinkronizacija.',
    locked: 'Keyrook Authenticator — zaključano',
    fill: 'Unesi kod za ovu stranicu',
    terms: ['2FA', 'authenticator', 'dvofaktorska autentifikacija', 'autentifikator', 'Google Authenticator', 'kod za provjeru', 'TOTP'],
  },
  hu: {
    name: 'Authenticator 2FA: kétlépcsős azonosítás',
    description:
      '2FA hitelesítő alkalmazás: QR-kód beolvasása, TOTP-kódok egy kattintással, import a Google Authenticatorból. Titkosított szinkron.',
    locked: 'Keyrook Authenticator — zárolva',
    fill: 'Az oldal kódjának kitöltése',
    terms: ['2FA', 'authenticator', 'kétlépcsős azonosítás', 'hitelesítő alkalmazás', 'Google Authenticator', 'kétfaktoros hitelesítés', 'TOTP'],
  },
  id: {
    name: 'Authenticator 2FA: verifikasi dua langkah',
    description:
      'Aplikasi autentikator 2FA: pindai kode QR, isi kode TOTP sekali klik, impor dari Google Authenticator. Sinkronisasi terenkripsi.',
    locked: 'Keyrook Authenticator — terkunci',
    fill: 'Isi kode untuk halaman ini',
    terms: ['2FA', 'authenticator', 'verifikasi dua langkah', 'autentikator', 'Google Authenticator', 'kode verifikasi', 'TOTP'],
  },
  kn: {
    name: 'Authenticator 2FA: ಎರಡು-ಹಂತದ ಪರಿಶೀಲನೆ',
    description:
      'ಕಂಪ್ಯೂಟರ್‌ನಲ್ಲಿ 2FA ಅಥೆಂಟಿಕೇಟರ್: QR ಕೋಡ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ, ಒಂದೇ ಕ್ಲಿಕ್‌ನಲ್ಲಿ TOTP ಕೋಡ್ ತುಂಬಿ, Google Authenticator ನಿಂದ ಆಮದು ಮಾಡಿ.',
    locked: 'Keyrook Authenticator — ಲಾಕ್ ಆಗಿದೆ',
    fill: 'ಈ ಪುಟದ ಕೋಡ್ ತುಂಬಿ',
    terms: ['2FA', 'authenticator', 'ಎರಡು ಹಂತದ ಪರಿಶೀಲನೆ', 'ಅಥೆಂಟಿಕೇಟರ್', 'Google Authenticator', 'ಪರಿಶೀಲನಾ ಕೋಡ್', 'TOTP'],
  },
  lt: {
    name: 'Autentifikatorius 2FA - Keyrook',
    description:
      'Dviejų veiksnių autentifikacija (2FA): nuskaitykite QR kodą, TOTP kodai vienu spustelėjimu, importas iš Google Authenticator.',
    locked: 'Keyrook Authenticator — užrakinta',
    fill: 'Įvesti šio puslapio kodą',
    terms: ['2FA', 'authenticator', 'autentifikatorius', 'patvirtinimas dviem veiksmais', 'Google Authenticator', 'patvirtinimo kodas', 'TOTP'],
  },
  lv: {
    name: 'Authenticator: divfaktoru autentifikācija',
    description:
      '2FA autentifikators: skenējiet QR kodu, TOTP kodi ar vienu klikšķi, imports no Google Authenticator. Šifrēta sinhronizācija.',
    locked: 'Keyrook Authenticator — bloķēts',
    fill: 'Ievadīt šīs lapas kodu',
    terms: ['2FA', 'authenticator', 'divfaktoru autentifikācija', 'autentifikators', 'Google Authenticator', 'verifikācijas kods', 'TOTP'],
  },
  ml: {
    name: 'Authenticator 2FA: ടു-ഫാക്ടർ ഓതന്റിക്കേഷൻ',
    description:
      '2FA ഓതന്റിക്കേറ്റർ: QR കോഡ് സ്കാൻ ചെയ്യുക, ഒറ്റ ക്ലിക്കിൽ TOTP കോഡ് നൽകുക, Google Authenticator-ൽ നിന്ന് ഇമ്പോർട്ട് ചെയ്യുക.',
    locked: 'Keyrook Authenticator — ലോക്ക് ചെയ്തു',
    fill: 'ഈ പേജിലെ കോഡ് നൽകുക',
    terms: ['2FA', 'authenticator', 'ടു ഫാക്ടർ ഓതന്റിക്കേഷൻ', 'ഓതന്റിക്കേറ്റർ', 'Google Authenticator', 'വെരിഫിക്കേഷൻ കോഡ്', 'TOTP'],
  },
  mr: {
    name: 'Authenticator 2FA: टू-फॅक्टर ऑथेंटिकेशन',
    description:
      'संगणकावर टू-फॅक्टर ऑथेंटिकेशन (2FA): QR कोड स्कॅन करा, एका क्लिकमध्ये TOTP कोड भरा, Google Authenticator मधून आयात करा.',
    locked: 'Keyrook Authenticator — लॉक आहे',
    fill: 'या पेजसाठी कोड भरा',
    terms: ['2FA', 'authenticator', 'टू फॅक्टर ऑथेंटिकेशन', 'ऑथेंटिकेटर', 'Google Authenticator', 'पडताळणी कोड', 'TOTP'],
  },
  ms: {
    name: 'Authenticator 2FA: pengesahan dua faktor',
    description:
      'Aplikasi pengesah 2FA: imbas kod QR, isi kod TOTP dengan satu klik, import dari Google Authenticator. Penyegerakan disulitkan.',
    locked: 'Keyrook Authenticator — dikunci',
    fill: 'Isi kod untuk halaman ini',
    terms: ['2FA', 'authenticator', 'pengesahan dua faktor', 'pengesahan dua langkah', 'Google Authenticator', 'kod pengesahan', 'TOTP'],
  },
  no: {
    name: 'Authenticator 2FA: tofaktorautentisering',
    description:
      'Autentiseringsapp for 2FA: skann QR-koden, fyll inn TOTP-koder med ett klikk, importer fra Google Authenticator. Kryptert synk.',
    locked: 'Keyrook Authenticator — låst',
    fill: 'Fyll inn koden for denne siden',
    terms: ['2FA', 'authenticator', 'tofaktorautentisering', 'autentiseringsapp', 'Google Authenticator', 'totrinnsbekreftelse', 'TOTP'],
  },
  pl: {
    name: 'Authenticator 2FA: weryfikacja dwuetapowa',
    description:
      'Uwierzytelnianie dwuskładnikowe: zeskanuj kod QR, kody TOTP jednym kliknięciem, import z Google Authenticator. Szyfrowany sync.',
    locked: 'Keyrook Authenticator — zablokowany',
    fill: 'Wpisz kod dla tej strony',
    terms: ['2FA', 'authenticator', 'weryfikacja dwuetapowa', 'uwierzytelnianie', 'dwuskładnikowe', 'aplikacja uwierzytelniająca', 'Google Authenticator'],
  },
  ro: {
    name: 'Authenticator 2FA: autentificare în doi pași',
    description:
      'Autentificator 2FA: scanează codul QR, completează codurile TOTP dintr-un clic, importă din Google Authenticator. Sync criptat.',
    locked: 'Keyrook Authenticator — blocat',
    fill: 'Completează codul pentru această pagină',
    terms: ['2FA', 'authenticator', 'autentificare în doi pași', 'autentificator', 'Google Authenticator', 'cod de verificare', 'TOTP'],
  },
  ru: {
    name: 'Аутентификатор: двухфакторная аутентификация',
    description:
      '2FA-аутентификатор на ПК: сканируйте QR-код, TOTP-коды в один клик, импорт из Google Authenticator. Шифрованная синхронизация.',
    locked: 'Keyrook Authenticator — заблокирован',
    fill: 'Ввести код для этой страницы',
    terms: ['2FA', 'аутентификатор', 'двухфакторная аутентификация', 'authenticator', 'Google Authenticator', 'код подтверждения', 'TOTP'],
  },
  sk: {
    name: 'Authenticator 2FA: dvojfázové overenie',
    description:
      'Dvojfázové overenie (2FA): naskenujte QR kód, kódy TOTP jedným kliknutím, import z Google Authenticator. Šifrovaná synchronizácia.',
    locked: 'Keyrook Authenticator — zamknuté',
    fill: 'Vyplniť kód pre túto stránku',
    terms: ['2FA', 'authenticator', 'dvojfázové overenie', 'autentifikátor', 'Google Authenticator', 'overovací kód', 'TOTP'],
  },
  sl: {
    name: 'Avtentikator 2FA: dvostopenjsko preverjanje',
    description:
      'Avtentikator za 2FA: skenirajte kodo QR, kode TOTP z enim klikom, uvozite iz Google Authenticatorja. Šifrirana sinhronizacija.',
    locked: 'Keyrook Authenticator — zaklenjeno',
    fill: 'Vnesi kodo za to stran',
    terms: ['2FA', 'authenticator', 'dvostopenjsko preverjanje', 'avtentikator', 'Google Authenticator', 'koda za preverjanje', 'TOTP'],
  },
  sr: {
    name: 'Аутентификатор: двофакторска аутентификација',
    description:
      '2FA аутентификатор: скенирајте QR код, уносите TOTP кодове једним кликом, увоз из Google Authenticator-а. Шифрована синхронизација.',
    locked: 'Keyrook Authenticator — закључано',
    fill: 'Унеси код за ову страницу',
    terms: ['2FA', 'аутентификатор', 'двофакторска аутентификација', 'authenticator', 'Google Authenticator', 'dvofaktorska autentifikacija', 'TOTP'],
  },
  sv: {
    name: 'Authenticator 2FA: tvåfaktorsautentisering',
    description:
      'Autentiseringsapp för 2FA: skanna QR-koden, fyll i TOTP-koder med ett klick, importera från Google Authenticator. Krypterad synk.',
    locked: 'Keyrook Authenticator — låst',
    fill: 'Fyll i koden för den här sidan',
    terms: ['2FA', 'authenticator', 'tvåfaktorsautentisering', 'autentiseringsapp', 'Google Authenticator', 'tvåstegsverifiering', 'TOTP'],
  },
  sw: {
    name: 'Uthibitishaji wa hatua mbili (2FA) - Keyrook',
    description:
      'Kithibitishaji cha 2FA: changanua msimbo wa QR, jaza misimbo ya TOTP kwa mbofyo mmoja, leta kutoka Google Authenticator.',
    locked: 'Keyrook Authenticator — imefungwa',
    fill: 'Jaza msimbo wa ukurasa huu',
    terms: ['2FA', 'authenticator', 'uthibitishaji wa hatua mbili', 'kithibitishaji', 'Google Authenticator', 'msimbo wa uthibitishaji', 'TOTP'],
  },
  ta: {
    name: 'Authenticator 2FA: இரு-காரணி அங்கீகாரம்',
    description:
      'இரு-காரணி அங்கீகாரம் (2FA): QR ஸ்கேன், ஒரே கிளிக்கில் TOTP குறியீடு, Google Authenticator-இலிருந்து இறக்குமதி.',
    locked: 'Keyrook Authenticator — பூட்டப்பட்டது',
    fill: 'இந்தப் பக்கத்தின் குறியீட்டை நிரப்பு',
    terms: ['2FA', 'authenticator', 'இரு காரணி அங்கீகாரம்', 'அங்கீகரிப்பான்', 'Google Authenticator', 'சரிபார்ப்புக் குறியீடு', 'TOTP'],
  },
  te: {
    name: 'Authenticator 2FA: రెండు-దశల ధృవీకరణ',
    description:
      'కంప్యూటర్‌లో 2FA అథెంటికేటర్: QR కోడ్‌ను స్కాన్ చేయండి, ఒక్క క్లిక్‌తో TOTP కోడ్ నింపండి, Google Authenticator నుండి దిగుమతి చేయండి.',
    locked: 'Keyrook Authenticator — లాక్ అయింది',
    fill: 'ఈ పేజీ కోడ్‌ను నింపండి',
    terms: ['2FA', 'authenticator', 'రెండు దశల ధృవీకరణ', 'అథెంటికేటర్', 'Google Authenticator', 'ధృవీకరణ కోడ్', 'TOTP'],
  },
  th: {
    name: 'Authenticator 2FA: ยืนยันตัวตนสองขั้นตอน',
    description:
      'แอปยืนยันตัวตนสองขั้นตอน (2FA) บนคอมพิวเตอร์: สแกนคิวอาร์โค้ด กรอกรหัส TOTP ในคลิกเดียว นำเข้าจาก Google Authenticator',
    locked: 'Keyrook Authenticator — ล็อกอยู่',
    fill: 'กรอกรหัสของหน้านี้',
    terms: ['2FA', 'authenticator', 'ยืนยันตัวตนสองขั้นตอน', 'แอป authenticator', 'Google Authenticator', 'รหัสยืนยัน', 'TOTP'],
  },
  tr: {
    name: 'Kimlik Doğrulayıcı: iki faktörlü doğrulama',
    description:
      "PC'de 2FA doğrulayıcı: QR kodu tarayın, TOTP kodlarını tek tıkla doldurun, Google Authenticator'dan aktarın. Şifreli eşitleme.",
    locked: 'Keyrook Authenticator — kilitli',
    fill: 'Bu sayfanın kodunu doldur',
    terms: ['2FA', 'authenticator', 'iki faktörlü doğrulama', 'iki adımlı doğrulama', 'kimlik doğrulayıcı', 'Google Authenticator', 'doğrulama kodu'],
  },
  uk: {
    name: 'Автентифікатор: двофакторна автентифікація',
    description:
      '2FA-автентифікатор на ПК: скануйте QR-код, TOTP-коди одним кліком, імпорт з Google Authenticator. Шифрована синхронізація.',
    locked: 'Keyrook Authenticator — заблоковано',
    fill: 'Ввести код для цієї сторінки',
    terms: ['2FA', 'автентифікатор', 'двофакторна автентифікація', 'authenticator', 'Google Authenticator', 'код підтвердження', 'TOTP'],
  },
};

/** `_locales/<code>/messages.json` for each language. */
export function localeFiles() {
  return Object.entries(STORE_LOCALES).map(([code, { name, description, locked, fill }]) => {
    if ([...description].length > 132) throw new Error(`${code}: the summary is longer than 132 characters.`);
    if ([...name].length > 45) throw new Error(`${code}: the name is longer than 45 characters.`);
    return {
      code,
      messages: {
        appName: { message: name },
        appDescription: { message: description },
        actionLocked: { message: locked, description: 'Toolbar tooltip while the vault is locked.' },
        commandFill: { message: fill, description: 'The fill shortcut, as chrome://extensions/shortcuts lists it.' },
      },
    };
  });
}
