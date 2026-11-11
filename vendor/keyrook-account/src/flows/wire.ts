/**
 * A family's boxes between the wire and the key code: the server keeps each
 * as JSON it cannot read (`OrgBox`), and the key code takes the shape it
 * sealed, checking it as it opens. Shared by the page's flows and a
 * product's, so both read what the server sends the same way.
 */
import type { SealedBox } from '../crypto/aead.js';
import type { AuthBox } from '../keys/org/authbox.js';
import type { MemberRootBox } from '../keys/org/member.js';
import type { OrgBox } from '../sync/protocol.js';

/** A box as the wire carries it. */
export const wire = (box: SealedBox | AuthBox | MemberRootBox): OrgBox => ({ ...box });

/** A box the server sent, as the account package opens it: one malformed fails to open. */
export const boxFrom = <T extends SealedBox>(box: OrgBox): T => box as unknown as T;
