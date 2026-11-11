/**
 * A shared collection's key, its name and its records.
 *
 * Each collection has a key of its own, with generations, held only by the
 * members let into it, each in an authenticated box from the organiser who
 * let them in. Its name and every record in it are sealed under it, bound to
 * the organisation, the collection and the generation, and a record to its
 * id and revision too, as a record's deletion is, under a label of its own:
 * so a server cannot move a record to another collection or generation, hand
 * back an older revision as the current one, or delete one, without it
 * failing to open.
 */
import { openJson, sealJson, type SealedBox } from '../../crypto/aead.js';
import { openKeyFromAuthBox, sealKeyInAuthBox, type AuthBox, type KeyBoxRecipient, type KeyBoxSender } from './authbox.js';
import type { OrgCollection } from '../../sync/protocol.js';
import { COLLECTION_BOX_INFO, collectionBoxAad, collectionHoldersAad, collectionNameAad, orgRecordAad, orgTombstoneAad } from './labels.js';

/** As the server keeps a display name: a person's words, never so long a screen cannot show them. */
const MAX_NAME = 128;

/** Where a collection's key, name or record belongs. */
export interface CollectionPlace {
  orgId: string;
  collectionId: string;
  generation: number;
}

/** Where a record belongs, and which revision of it this is. */
export interface OrgRecordPlace extends CollectionPlace {
  id: string;
  rev: number;
}

/** A new collection key, made by an organiser's device: for a new collection, or the next generation of one. */
export async function newCollectionKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
}

/** A collection's key of `place.generation`, sealed from one member to another. */
export async function sealCollectionKey(collectionKey: CryptoKey, from: KeyBoxSender, place: CollectionPlace): Promise<AuthBox> {
  return sealKeyInAuthBox(
    collectionKey,
    from,
    COLLECTION_BOX_INFO,
    collectionBoxAad(place.orgId, place.collectionId, place.generation, from.senderId, from.recipientId),
  );
}

/** Opens a collection's key, as sent by `to.senderId` with the key the pinned roster lists for them. */
export async function openCollectionKey(box: AuthBox, to: KeyBoxRecipient, place: CollectionPlace): Promise<CryptoKey> {
  return openKeyFromAuthBox(box, to, COLLECTION_BOX_INFO, collectionBoxAad(place.orgId, place.collectionId, place.generation, to.senderId, to.recipientId));
}

export async function sealCollectionName(collectionKey: CryptoKey, name: string, place: CollectionPlace): Promise<SealedBox> {
  if (typeof name !== 'string' || name.trim().length === 0 || name.length > MAX_NAME) throw new Error('A collection needs a name of up to 128 characters.');
  return sealJson(collectionKey, { name }, collectionNameAad(place.orgId, place.collectionId, place.generation));
}

/** Opens a collection's name. One from another collection or generation fails as a `DecryptionError`. */
export async function openCollectionName(collectionKey: CryptoKey, box: SealedBox, place: CollectionPlace): Promise<string> {
  const opened = await openJson<{ name?: unknown }>(collectionKey, box, collectionNameAad(place.orgId, place.collectionId, place.generation));
  if (typeof opened?.name !== 'string' || opened.name.length > MAX_NAME) throw new Error('Malformed collection name.');
  return opened.name;
}

/**
 * Who holds the key, sealed under it. The server's list of holders is its
 * word, and a device changing a key with nobody watching must not let in
 * whoever that list names: what it seals to comes from here, which only
 * someone holding the key could write. Each generation has its own, and
 * whoever lets someone in writes it again.
 */
export async function sealCollectionHolders(collectionKey: CryptoKey, holders: string[], place: CollectionPlace): Promise<SealedBox> {
  return sealJson(collectionKey, { holders: [...new Set(holders)].sort() }, collectionHoldersAad(place.orgId, place.collectionId, place.generation));
}

/** Opens who holds a collection. One from another collection or generation fails as a `DecryptionError`. */
export async function openCollectionHolders(collectionKey: CryptoKey, box: SealedBox, place: CollectionPlace): Promise<string[]> {
  const opened = await openJson<{ holders?: unknown }>(collectionKey, box, collectionHoldersAad(place.orgId, place.collectionId, place.generation));
  if (!Array.isArray(opened?.holders) || opened.holders.some((holder) => typeof holder !== 'string')) throw new Error('Malformed collection holders.');
  return opened.holders as string[];
}

/** Those the list under `collectionKey` names, or null when there is none that opens: then nobody can be told who stays. */
export async function sealedHoldersOf(collectionKey: CryptoKey, orgId: string, collection: Pick<OrgCollection, 'id' | 'generation' | 'holdersBox'>): Promise<string[] | null> {
  if (!collection.holdersBox) return null;
  try {
    return await openCollectionHolders(collectionKey, collection.holdersBox as unknown as SealedBox, { orgId, collectionId: collection.id, generation: collection.generation });
  } catch {
    return null;
  }
}

/** Seals a record of a collection under its key of `place.generation`, at `place.rev`. */
export async function sealOrgRecord<T>(collectionKey: CryptoKey, value: T, place: OrgRecordPlace): Promise<SealedBox> {
  return sealJson(collectionKey, value, orgRecordAad(place.orgId, place.collectionId, place.generation, place.id, place.rev));
}

/**
 * Opens a record with the key of the generation the server says it is under,
 * at the revision it says. A record moved to another collection or
 * generation, given another id, or handed back at another revision, fails as
 * a `DecryptionError`.
 */
export async function openOrgRecord<T>(collectionKey: CryptoKey, box: SealedBox, place: OrgRecordPlace): Promise<T> {
  return openJson<T>(collectionKey, box, orgRecordAad(place.orgId, place.collectionId, place.generation, place.id, place.rev));
}

/**
 * A record's deletion, sealed under its collection's key at its revision, as
 * the record itself would be: only someone holding the key deletes.
 */
export async function sealOrgTombstone(collectionKey: CryptoKey, place: OrgRecordPlace): Promise<SealedBox> {
  return sealJson(collectionKey, { deleted: true }, orgTombstoneAad(place.orgId, place.collectionId, place.generation, place.id, place.rev));
}

/** Opens a deletion. A record's own box, or a deletion of another record, generation or revision, fails as a `DecryptionError`. */
export async function openOrgTombstone(collectionKey: CryptoKey, box: SealedBox, place: OrgRecordPlace): Promise<void> {
  const opened = await openJson<{ deleted?: unknown }>(collectionKey, box, orgTombstoneAad(place.orgId, place.collectionId, place.generation, place.id, place.rev));
  if (opened?.deleted !== true) throw new Error('Malformed family record.');
}
