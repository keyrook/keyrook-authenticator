/**
 * @authx/core — this app's half of everything that is not tied to a browser
 * extension: OTP, the vault, the sync engine, the service catalogue.
 *
 * The Keyrook account — how a password becomes keys, the wire format, the
 * recovery kit — is @keyrook/account, which every Keyrook product copies from
 * keyrook-account (vendor/keyrook-account). It is re-exported here, so the app
 * imports one package.
 *
 * The Chrome extension, and later the desktop and mobile apps, all consume this
 * package; nothing in here may reference `chrome.*`, `window` or the DOM.
 */

// The Keyrook account
export * from '@keyrook/account';

// OTP
export * from './otp/types.js';
export * from './otp/totp.js';
export * from './otp/uri.js';
export * from './otp/migration.js';
export * from './otp/quick.js';
export * from './otp/share.js';

// Vault
export * from './vault/model.js';
export * from './vault/vault.js';
export * from './vault/recovery.js';
export * from './vault/backup.js';
export * from './vault/foreign.js';
export * from './vault/autofill.js';
export * from './vault/csv.js';

// Brands
export * from './brand/registry.js';

// Sync
export * from './sync/engine.js';

// Utilities worth exposing to app code
export { base32Decode, base32Encode, canonicalSecret, isValidBase32 } from './util/base32.js';
