/**
 * The wire contract between the client and the sync server.
 *
 * Types only. Keeping the contract in the
 * shared package means the extension, the future native apps and the server all
 * compile against one definition rather than three drifting copies.
 *
 * What the client guarantees whatever the server does is set out in
 * docs/security-model.md.
 */
import type { SealedBox } from '../crypto/aead.js';
import type { RecoveryWrap } from './kit.js';
import type { ProductBox } from '../keys/box.js';
import type { AccountKdfParams } from './account.js';
import type { RemoteRecord } from './adapter.js';

export const SYNC_API_VERSION = 1;

// --- POST /auth/prelogin ----------------------------------------------------

export interface PreloginRequest {
  email: string;
}

/**
 * Returns the KDF parameters for an account so the client can derive its keys
 * before authenticating. Unknown emails get deterministic pseudo-parameters
 * derived from a server secret, so this cannot be used to enumerate accounts.
 */
export interface PreloginResponse {
  kdf: AccountKdfParams;
}

// --- POST /auth/register/start ----------------------------------------------

/**
 * Asks for a one-time code to be sent to the address. Answered the same way
 * whether or not the address already has an account: if it does, the email
 * says so instead of carrying a code, and only the address's owner reads it.
 */
export interface RegisterStartRequest {
  email: string;
}

// --- POST /auth/register ----------------------------------------------------

export interface RegisterRequest {
  email: string;
  /** The six-digit code sent to `email`. An account only exists once it is proved. */
  code: string;
  /** HKDF output; the server hashes it again before storing. */
  authHash: string;
  kdf: AccountKdfParams;
  /**
   * Keyrook Authenticator's data key, wrapped under the stretched key, as every
   * build before keys per product signs up. Only Authenticator sends it.
   */
  protectedKey?: SealedBox;
  /** Proof of holding that key; see `deriveKeyCheck`. Sent with `protectedKey`. */
  keyCheck?: string;
  /** The account's root and the signing-up product's key, from the start. */
  keys?: InitialKeys;
  /** Shown in the device list so a user can recognise their own sessions. */
  deviceName: string;
  deviceId: string;
}

/**
 * An account made with keys per product from its first moment: its root, and
 * the key of the product it was made from, sealed to that root.
 */
export interface InitialKeys {
  /**
   * The new account's id, a random UUID the device chose: every wrap, box and
   * pin below is bound to it, so it exists before the account does.
   */
  accountId: string;
  root: {
    publicKey: string;
    rootCheck: string;
    /** Under the password. Required on an account made with one. */
    passwordWrap: SealedBox | null;
    /** Under the recovery key. Required on an account made with Google or GitHub. */
    recoveryWrap: SealedBox | null;
    recoveryAuthHash: string | null;
  };
  /**
   * The calling product's key, sealed to the root, with its pin and proof
   * (`deriveProductKeyCheck`): all three, or none. None only when the account
   * page starts an account over, with its root alone; each product then joins
   * with the key it still holds, or a new one.
   */
  box?: ProductBox;
  pin?: SealedBox;
  keyCheck?: string;
}

// --- POST /auth/login -------------------------------------------------------

export interface LoginRequest {
  email: string;
  authHash: string;
  deviceId: string;
  deviceName: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  /**
   * Keyrook Authenticator's data key under the password, as before keys were
   * per product. Absent when there is none, or when the password changed
   * through another product and Authenticator has not wrapped it again yet;
   * the account's root, under the same password, opens it then.
   */
  protectedKey?: SealedBox;
  account: {
    /** The server's id for the account: what product keys, boxes and pins are bound to. Never changes. */
    id: string;
    email: string;
    /** How the account proves who is signing in. */
    method?: AccountMethod;
  };
}

/**
 * `password`: the account password, as since 0.2. `provider`: Google or
 * GitHub, with no password at all; docs/provider-sign-in.md.
 */
export type AccountMethod = 'password' | 'provider';
export type SignInProvider = 'google' | 'github';

// --- Sign in with a provider ------------------------------------------------
//
// GET /oauth/:provider/start?ext=<extension id>&challenge=<S256 of a verifier>
//     &state=<client state>&purpose=signin|reauth
//   → the provider's consent page → /oauth/:provider/callback
//   → https://<extension id>.chromiumapp.org/oauth#ticket=…&state=…
//     (or #error=…&state=…)
//
// The ticket is worth nothing without the verifier, which never leaves the
// extension.

/** A ticket from the callback, and the verifier its challenge was made from. */
export interface ProviderTicket {
  ticket: string;
  verifier: string;
}

export interface ProviderSessionRequest extends ProviderTicket {
  deviceId: string;
  deviceName: string;
}

/**
 * A provider account's session. No `protectedKey`: nothing wraps its data key
 * for the server, which is the point — a new browser gets the key by
 * `PairingRequest` or with the recovery key (`RecoveryWrapRequest`).
 */
export type ProviderLogin = Omit<LoginResponse, 'protectedKey'>;

/**
 * `existing`: signed in; the device holds no data key yet unless it already
 * had the account's. `new`: no account has this identity — `signupToken`
 * creates one within ten minutes.
 */
export type ProviderSessionResponse =
  | { status: 'existing'; session: ProviderLogin }
  | { status: 'new'; signupToken: string; email: string };

export interface ProviderRegisterRequest {
  signupToken: string;
  /** Proof of holding Keyrook Authenticator's data key; see `deriveKeyCheck`. Sent with `recovery`. */
  keyCheck?: string;
  /**
   * Keyrook Authenticator's recovery kit, as every build before keys per
   * product signs up. For an account with no password a recovery key is the
   * only way back in once every device is gone, so an account has either this
   * or `keys`, whose root is wrapped under one.
   */
  recovery?: {
    issuedAt: number;
    state: SealedBox;
    wrap: RecoveryWrap;
    recoveryAuthHash: string;
  };
  /** The account's root, under the recovery key, and the signing-up product's key. */
  keys?: InitialKeys;
  deviceId: string;
  deviceName: string;
}

/**
 * What a change to a provider account needs instead of the password: a fresh
 * sign-in with the provider, made for this purpose within the last minutes.
 */
export type OwnerProof = { authHash: string } | { reauth: ProviderTicket };

// --- Joining by approval: /pairing ------------------------------------------

/** A browser signed in to the account, without its data key, asks to join. */
export interface PairingRequest {
  /** An ephemeral ECDH P-256 public key, raw, base64. */
  publicKey: string;
  deviceName: string;
}

export interface PairingCreated {
  id: string;
  expiresAt: number;
}

/** An open request, as a browser that could approve it sees it. */
export interface PairingSummary {
  id: string;
  deviceName: string;
  createdAt: number;
  requesterKey: string;
  /** Set once a browser has started approving. */
  approverKey: string | null;
}

export interface PairingsResponse {
  pairings: PairingSummary[];
}

/** The requester's view of its own request. */
export interface PairingStatus {
  status: 'waiting' | 'accepted' | 'approved';
  approverKey: string | null;
  /** The data key wrapped for the requester; see `unwrapPairedDataKey`. */
  wrap: SealedBox | null;
}

/** The approving browser's key, sent before the codes are compared. */
export interface PairingAccept {
  publicKey: string;
}

/** The data key, after the person approving said the codes match. */
export interface PairingApprove {
  wrap: SealedBox;
}

// --- Signing in to the account page by approving it from a product ---------

/**
 * The account page asks to be signed in by a product that already is. It
 * holds `secret`; the person types `code` into the product, which shows where
 * the request came from before they approve it.
 */
export interface ConsoleSignInRequest {
  /** What the browser says it is: "Chrome on macOS". */
  deviceName: string;
}

export interface ConsoleSignInCreated {
  id: string;
  /** Only the page that asked can collect the session with it. Never shown. */
  secret: string;
  /** Shown on the page, `XXXX-XXXX`, for the person to type into a product. */
  code: string;
  expiresAt: number;
}

/** A request, as the product the code was typed into shows it before approving. */
export interface ConsoleRequestFound {
  id: string;
  deviceName: string;
  /** The address the page asked from, as the server saw it. */
  address: string | null;
  createdAt: number;
  expiresAt: number;
}

export interface ConsoleCollectRequest {
  secret: string;
  deviceId: string;
}

export type ConsoleCollected =
  | { status: 'pending' }
  | { status: 'denied' }
  | { status: 'expired' }
  | { status: 'approved'; session: LoginResponse };

// --- POST /account/recovery/wrap ---------------------------------------------

/**
 * A signed-in browser with nothing but the recovery key asks for the kit's
 * wrap — how a provider account joins when no other browser is left.
 */
export interface RecoveryWrapRequest {
  recoveryAuthHash: string;
}

// --- POST /auth/refresh, POST /auth/logout ----------------------------------

export interface RefreshRequest {
  refreshToken: string;
}

export type RefreshResponse = Pick<LoginResponse, 'accessToken' | 'refreshToken' | 'expiresIn'>;

/** Ends this device's session on the server. Answers 204 whatever it finds. */
export type LogoutRequest = RefreshRequest;

// --- GET /account/devices, DELETE /account/devices/:id ----------------------

/** One signed-in session. A device that signs in again replaces its own. */
export interface DeviceSummary {
  id: string;
  name: string;
  /** The product the device signed in to; `console` is the account page. */
  product: string;
  createdAt: number;
  lastSeenAt: number;
  /** The session making this request. */
  current: boolean;
}

export interface DevicesResponse {
  devices: DeviceSummary[];
}

// --- GET /account/console ---------------------------------------------------

/**
 * What the account page shows on its overview. Nothing sealed, wrapped or
 * hashed is in it: the page holds no key, and has no use for one.
 */
export interface ConsoleSummary {
  accountId: string;
  email: string;
  method: 'password' | 'provider';
  /** The Google or GitHub identities that sign in to this account. */
  providers: { provider: string; email: string; since: number }[];
  createdAt: number;
  products: ConsoleProduct[];
  /** What was kept when the account started over, and when each is deleted. */
  archives: { id: string; archivedAt: number; expiresAt: number }[];
}

export interface ConsoleProduct {
  product: string;
  /** The product has a key on this account: a box, or Keyrook Authenticator's key from before keys per product. */
  hasKey: boolean;
  /**
   * The server's word that the recovery key opens this product's key. Shown,
   * never trusted: each product checks this for itself (key design, section 4),
   * and the page says so.
   */
  recoveryKeyProtects: boolean;
  /** Signed-in devices of this product. */
  devices: number;
}

// --- POST /account/password -------------------------------------------------

/**
 * Replaces the account password. The data key does not change — only its
 * wrapping — so nothing is re-encrypted. Proving the *current* password is
 * required: a session token alone must never be enough to take over an
 * account. Every other session is ended.
 */
export interface ChangePasswordRequest {
  currentAuthHash: string;
  authHash: string;
  kdf: AccountKdfParams;
  /**
   * Keyrook Authenticator's data key under the new password. Required on an
   * account without a root. On one with a root, only Authenticator and the
   * account page can send it; without it the old one is marked out of date.
   */
  protectedKey?: SealedBox;
  /**
   * Proof that `protectedKey` wraps Keyrook Authenticator's key
   * (`deriveKeyCheck`). Required with `protectedKey` from the account page,
   * which is not Authenticator and has to show it holds Authenticator's key.
   */
  keyCheck?: string;
  /** The account's root under the new password. Required on an account with a root. */
  rootPasswordWrap?: SealedBox;
}

/**
 * Keyrook Authenticator wrapping its data key under the current password
 * again, after the password changed through another product, so its older
 * builds sign in again.
 */
export interface ProtectedKeyRequest {
  authHash: string;
  protectedKey: SealedBox;
  /** Proof the key is the account's data key (`deriveKeyCheck`). */
  keyCheck: string;
}

// --- PUT /account/recovery --------------------------------------------------

/**
 * Sets or removes the account's recovery kit. Needs the account password and
 * the data key, not just the session: whoever sets the kit can reset the
 * password through it, and anyone at an unlocked vault holds the data key.
 */
export interface SetRecoveryRequest {
  /** Proof of the current account password. Password accounts. */
  authHash?: string;
  /** A fresh sign-in with the provider. Provider accounts. */
  reauth?: ProviderTicket;
  keyCheck: string;
  /**
   * The sealed state's `issuedAt`, in the clear so an honest server can refuse
   * a change that is not newer than the one it holds — two devices racing, or
   * one with a slow clock. A hostile server can ignore it; devices still
   * refuse to go backwards on their own.
   */
  issuedAt: number;
  /** What the account's other devices adopt. */
  state: SealedBox;
  /** What a device with nothing but the recovery key is handed. Null removes. */
  wrap: RecoveryWrap | null;
  recoveryAuthHash: string | null;
}

// --- POST /auth/recover, POST /auth/recover/reset ---------------------------

/** Step one of recovering an account with nothing but its recovery key. */
export interface RecoverRequest {
  email: string;
  recoveryAuthHash: string;
}

export interface RecoverResponse {
  wrap: RecoveryWrap;
}

/**
 * Step two: a new password, with proof that the kit really did open the data
 * key. Every existing session is ended.
 */
export interface RecoverResetRequest {
  email: string;
  recoveryAuthHash: string;
  keyCheck: string;
  authHash: string;
  kdf: AccountKdfParams;
  protectedKey: SealedBox;
  deviceId: string;
  deviceName: string;
}

// --- DELETE /account --------------------------------------------------------

/** Irreversible, so it takes the password — or a fresh provider sign-in — not just a session. */
export interface DeleteAccountRequest {
  authHash?: string;
  reauth?: ProviderTicket;
}

// --- GET /sync?since=<serverRev> -------------------------------------------

export interface PullResponse {
  records: RemoteRecord[];
  serverRev: number;
  hasMore: boolean;
  /**
   * The account's recovery-kit state, sealed under the data key, when it
   * changed after `since`. Opaque to the server; see `openRecoveryState`.
   */
  recovery?: SealedBox;
  /**
   * Names the database's history. It changes only when the server is restored
   * from a backup, which forgets every change made after the backup was taken.
   */
  epoch?: string;
}

// --- POST /sync -------------------------------------------------------------

export interface PushRequest {
  records: RemoteRecord[];
  /** The revision the client believes it is up to date with. */
  baseServerRev: number;
}

export interface PushResponse {
  accepted: { id: string; rev: number; serverRev: number }[];
  /** Records the server refused because it holds a newer revision. */
  conflicts: RemoteRecord[];
  serverRev: number;
  /** Set when a push was trimmed by the account's ceiling on live accounts. */
  rejectedForLimit?: { id: string }[];
}

// --- Errors -----------------------------------------------------------------

export type SyncErrorCode =
  | 'invalid_credentials'
  /** Signed in, but the password or key proof this change needs was wrong. */
  | 'forbidden'
  /** The emailed code was wrong, used, expired, or tried too many times. */
  | 'invalid_code'
  /** A provider identity whose email already belongs to another account. */
  | 'email_taken'
  /** A pairing that has ended, expired, or is not this session's to act on. */
  | 'not_found'
  /** The server could not do something it depends on, such as sending mail. */
  | 'unavailable'
  | 'rate_limited'
  | 'stale_revision'
  | 'payload_too_large'
  /**
   * A build from before keys per product, asked to change an account that
   * has them. It is told to update rather than change what it cannot keep
   * up with.
   */
  | 'update_required'
  | 'unauthorized';

export interface SyncErrorBody {
  error: SyncErrorCode;
  message: string;
  /** Seconds to wait, on `rate_limited`. */
  retryAfter?: number;
}

// --- /account/keys: keys per product ----------------------------------------

/** The account's root, as the server holds it: the public half, and the private half only wrapped. */
export interface RootKeyState {
  publicKey: string;
  /** Goes up when the root itself is replaced. */
  generation: number;
  /** The private half under the account password; null on an account without one. */
  passwordWrap: SealedBox | null;
  /** The private half under the recovery key; null until a recovery key wraps it. */
  recoveryWrap: SealedBox | null;
}

/** A product's key, as the server holds it. */
export interface ProductKeyState {
  box: ProductBox;
  pin: SealedBox;
  /** Goes up when the product replaces its key. */
  keyGeneration: number;
  /** The root generation the box is sealed to. */
  rootGeneration: number;
  /**
   * The recovery key leaked and the root was replaced: the product replaces
   * its own key (`replaceProductKey`) when it is next opened.
   */
  mustReplace: boolean;
}

export interface AccountKeysResponse {
  /** What every box, pin and product pairing is bound to. */
  accountId: string;
  root: RootKeyState | null;
  /** The calling session's product's key; a session never sees another product's. */
  box: ProductKeyState | null;
  /**
   * For showing a person, never for deciding: whether the recovery key
   * protects a product is that product's pin's to say.
   */
  recovery: { wrappedAt: number | null; products: string[] };
}

/**
 * Gives an account its root, once. The root must open with what the account
 * has: the password, on a password account; the recovery key, on one that
 * signs in with Google or GitHub. Proof of the owner as for any change.
 */
export interface CreateRootRequest {
  publicKey: string;
  passwordWrap: SealedBox | null;
  recoveryWrap: SealedBox | null;
  /** Proof of the recovery key `recoveryWrap` is under. */
  recoveryAuthHash: string | null;
  /** `deriveRootCheck` of this root, which the server keeps hashed to check its holder later. */
  rootCheck: string;
  /**
   * `recoveryWrap` is under the recovery key the account already has (Keyrook
   * Authenticator's kit's): refused unless it is, so a mistyped sheet never
   * becomes the only way back in.
   */
  keepsRecoveryKey?: boolean;
  /** Proof of the account password. Password accounts. */
  authHash?: string;
  /** A fresh sign-in with the provider. Provider accounts. */
  reauth?: ProviderTicket;
}

/**
 * Wraps the root under a recovery key: the first one, or a new one that
 * retires the last. Proof of the owner, and of holding the root.
 */
export interface SetRootRecoveryRequest {
  recoveryWrap: SealedBox;
  recoveryAuthHash: string;
  rootCheck: string;
  /** As in `CreateRootRequest`: the recovery key of Keyrook Authenticator's kit, checked. */
  keepsRecoveryKey?: boolean;
  authHash?: string;
  reauth?: ProviderTicket;
}

/** Asks for a code to the account's address, to reset the password with the recovery key. */
export interface RecoverCodeRequest {
  email: string;
}

/** The root, wrapped under the recovery key, for whoever proves the recovery key. */
export interface RootRecoverRequest {
  email: string;
  recoveryAuthHash: string;
}

export interface RootRecoverResponse {
  accountId: string;
  recoveryWrap: SealedBox;
}

/**
 * A new password through the recovery key, on an account with a root. Takes
 * the recovery key, the code sent to the address, and proof the recovery key
 * opened the account's real root: someone who found the printed sheet still
 * needs the inbox, and a planted wrap opens nothing the check accepts.
 */
export interface RootRecoverResetRequest {
  email: string;
  recoveryAuthHash: string;
  code: string;
  rootCheck: string;
  authHash: string;
  kdf: AccountKdfParams;
  /** The root under the new password. */
  rootPasswordWrap: SealedBox;
  deviceId: string;
  deviceName: string;
}

/** Seals the calling session's product's key to the root. The first device of a product wins. */
export interface CreateBoxRequest {
  box: ProductBox;
  pin: SealedBox;
  /** Proof of holding the key in the box (`deriveProductKeyCheck`). */
  keyCheck: string;
  /** The root generation the box is sealed to; refused unless it is the current one. */
  rootGeneration: number;
}

/** Replaces the box and pin of the same key: sealed to a new root, or a pin updated. */
export interface UpdateBoxRequest extends CreateBoxRequest {
  /** The key generation the caller holds; refused unless it is the current one. */
  keyGeneration: number;
}

/**
 * A product replaces its own key: the recovery key leaked (`mustReplace`).
 * The new key's box is sealed to the current root; `previousKeyCheck` proves
 * the key it replaces.
 */
export interface ReplaceBoxRequest extends UpdateBoxRequest {
  previousKeyCheck: string;
}

/**
 * Replaces the account's root, from a device of a product that holds its key:
 * the recovery key was lost on an account without a password, it leaked, or
 * the password is forgotten while a device is still open. Every other session
 * ends, the root's old wraps are gone at once, and the address is told.
 */
export interface RotateRootRequest {
  publicKey: string;
  rootCheck: string;
  /** The new root under the password: the current one, or `newPassword`'s. Password accounts. */
  passwordWrap: SealedBox | null;
  /** The new root under a new recovery key. Required on an account without a password. */
  recoveryWrap: SealedBox | null;
  recoveryAuthHash: string | null;
  /** The calling product's key, sealed to the new root, with its pin. */
  box: ProductBox;
  pin: SealedBox;
  /** Proof of the key in `box`. */
  keyCheck: string;
  /**
   * When `box` holds a new key for the product — the recovery key leaked —
   * proof of the key it replaces.
   */
  previousKeyCheck?: string;
  /** Proof of the owner: the current password, */
  authHash?: string;
  /** or a fresh sign-in with the provider, */
  reauth?: ProviderTicket;
  /** or, with `newPassword`, a code sent to the address. */
  code?: string;
  /** A new password, when the old one is forgotten. Needs `code`. */
  newPassword?: { authHash: string; kdf: AccountKdfParams };
}

// --- The account page's keys -------------------------------------------------

/**
 * Every product's box, for the account page, which opens them with the root
 * to seal them again (`/account/console/rotate`) or bring their pins up to
 * date (`/account/console/pins`). A product's own session never sees another
 * product's box.
 */
export interface ConsoleKeysResponse {
  accountId: string;
  root: RootKeyState | null;
  /** Every product's box, sealed to the root. */
  products: ({ product: string } & ProductKeyState)[];
  /**
   * Keyrook Authenticator's wrap for its older builds, opened at rest, as a
   * sign-in would hand it. Null when it has none, or it is out of date.
   */
  protectedKey: SealedBox | null;
  /** Whether Keyrook Authenticator 0.3 can still use the account (`legacy_retired`). */
  olderAuthenticator: 'active' | 'retired';
}

/**
 * The account page replaces the root and seals every product's key to the new
 * one in one transaction: the recovery key was lost (a password account), or
 * leaked.
 */
export interface ConsoleRotateRequest {
  publicKey: string;
  rootCheck: string;
  /** Under the password; null on an account without one. */
  passwordWrap: SealedBox | null;
  recoveryWrap: SealedBox;
  recoveryAuthHash: string;
  /** Every product whose box is sealed to the current root, sealed again to the new one. */
  products: { product: string; box: ProductBox; pin: SealedBox; keyCheck: string; keyGeneration: number }[];
  /** The recovery key leaked: every product must replace its own key when next opened. */
  leaked: boolean;
  authHash?: string;
  reauth?: ProviderTicket;
}

/** Each product's pin brought up to date by the account page, after a recovery key was made or typed there. */
export interface ConsolePinsRequest {
  pins: { product: string; pin: SealedBox; keyCheck: string; keyGeneration: number }[];
}

// --- /auth/start-over: nothing left but the email ----------------------------

/**
 * Asks for a code to start the account over. The answer is the same whether
 * or not the address has an account.
 */
export interface StartOverCodeRequest {
  email: string;
}

/** Spends the code, and says what the new keys are bound to. */
export interface StartOverBeginRequest {
  email: string;
  code: string;
}

export interface StartOverBeginResponse {
  /** The account's id, the same as before: what every new wrap, box and pin is bound to. */
  accountId: string;
  method: 'password' | 'provider';
  /** Stands for the code in the next step, once, for a few minutes. */
  ticket: string;
}

/**
 * Starts the account over: what it held is put aside, still sealed, for 90
 * days, and the account gets a new root and the calling product's new key.
 * Every session ends and the address is told.
 */
export interface StartOverRequest {
  email: string;
  ticket: string;
  /** A password account's new password. An account without one sends neither. */
  authHash?: string;
  kdf?: AccountKdfParams;
  /** `accountId` is the one `StartOverBeginResponse` gave. */
  keys: InitialKeys;
  deviceId: string;
  deviceName: string;
}

// --- /account/archives: what an account held before it started over --------

export interface AccountArchive {
  id: string;
  archivedAt: number;
  /** When it is deleted. The address is reminded a week before. */
  expiresAt: number;
  /** The old password's KDF, to derive what proves it. Null on an account that had none. */
  kdf: AccountKdfParams | null;
  /** The root as it was. Its wraps are handed out only for proof of the old password or recovery key. */
  root: { publicKey: string; generation: number; underPassword: boolean; underRecoveryKey: boolean } | null;
  /** The calling product's key as it was, sealed to that root. */
  box: ProductKeyState | null;
  /** Keyrook Authenticator's wrap and kit from before keys per product; to Authenticator only. */
  legacy: { underPassword: boolean; underRecoveryKey: boolean } | null;
  /** How many of the calling product's records it holds. */
  records: number;
}

export interface AccountArchivesResponse {
  archives: AccountArchive[];
}

/** Proof of the old password or the old recovery key; one of the two. */
export interface OpenArchiveRequest {
  /** Derived from the old password with the archive's `kdf`. */
  authHash?: string;
  recoveryAuthHash?: string;
}

/** What the proof opens: the root's wrap under it, and, to Authenticator, its own old one. */
export interface OpenArchiveResponse {
  rootPasswordWrap?: SealedBox;
  rootRecoveryWrap?: SealedBox;
  protectedKey?: SealedBox;
  legacyRecoveryWrap?: RecoveryWrap;
}

export interface ArchivedRecordsResponse {
  records: RemoteRecord[];
  /** The `after` for the next page; null on the last. */
  next: number | null;
}

/**
 * Deletes an archive before it expires: the whole of it, for proof of the old
 * root, or the calling product's part, for proof of its old key. The inbox
 * alone deletes nothing.
 */
export interface DeleteArchiveRequest {
  rootCheck?: string;
  keyCheck?: string;
}
