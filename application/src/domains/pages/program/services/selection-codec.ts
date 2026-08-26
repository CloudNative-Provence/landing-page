import { strFromU8, strToU8, unzlibSync, zlibSync } from 'fflate';

// '.' is form-url safe and never begins a legacy comma-separated id list.
const COMPACT_TOKEN_PREFIX = '.';
const ID_TOKEN_PREFIX = 'i';

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBytes(token: string): Uint8Array {
  const base64 = token.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

export class ProgramSelectionCodec {
  static serialize(ids: Iterable<string>): string {
    return [...new Set(ids)].sort().join(',');
  }

  static parse(value: string | null | undefined, validIds: readonly string[]): string[] {
    if (!value) {
      return [];
    }

    const decoded = ProgramSelectionCodec.decode(value, validIds);
    if (decoded) {
      return decoded;
    }

    const validIdSet = new Set(validIds);
    return [
      ...new Set(
        value
          .split(',')
          .map((entry) => entry.trim())
          .filter((entry) => validIdSet.has(entry))
      ),
    ];
  }

  /** Encodes a selection as a compact, id-based compressed token. */
  static encode(ids: Iterable<string>, validIds: readonly string[]): string {
    const serialized = ProgramSelectionCodec.normalizeIds(ids, validIds).join(',');
    if (!serialized) {
      return '';
    }

    const compressed = zlibSync(strToU8(serialized), { level: 9 });
    return `${COMPACT_TOKEN_PREFIX}${ID_TOKEN_PREFIX}${bytesToBase64Url(compressed)}`;
  }

  /** Decodes a compact token back to ids; returns null when the value is not a compact token. */
  static decode(value: string | null | undefined, validIds: readonly string[]): string[] | null {
    if (!value || !value.startsWith(COMPACT_TOKEN_PREFIX)) {
      return null;
    }

    const body = value.slice(COMPACT_TOKEN_PREFIX.length);
    if (!body) {
      return [];
    }

    if (body.startsWith(ID_TOKEN_PREFIX)) {
      return ProgramSelectionCodec.decodeIdToken(body.slice(ID_TOKEN_PREFIX.length), validIds);
    }

    return ProgramSelectionCodec.decodeLegacyBitmask(body, validIds);
  }

  private static decodeIdToken(body: string, validIds: readonly string[]): string[] {
    let bytes: Uint8Array;
    try {
      bytes = base64UrlToBytes(body);
    } catch {
      return [];
    }

    try {
      const serialized = strFromU8(unzlibSync(bytes));
      return ProgramSelectionCodec.parseSerializedIds(serialized, validIds);
    } catch {
      return [];
    }
  }

  private static decodeLegacyBitmask(body: string, validIds: readonly string[]): string[] {
    let bytes: Uint8Array;
    try {
      bytes = base64UrlToBytes(body);
    } catch {
      return [];
    }

    const ids: string[] = [];
    for (let index = 0; index < validIds.length; index += 1) {
      const byte = bytes[index >> 3] ?? 0;
      if (byte & (1 << (index & 7))) {
        ids.push(validIds[index]);
      }
    }
    return ids;
  }

  private static parseSerializedIds(value: string, validIds: readonly string[]): string[] {
    const validIdSet = new Set(validIds);
    return [
      ...new Set(
        value
          .split(',')
          .map((entry) => entry.trim())
          .filter((entry) => validIdSet.has(entry))
      ),
    ];
  }

  private static normalizeIds(ids: Iterable<string>, validIds: readonly string[]): string[] {
    const selectedIds = new Set(ids);
    return validIds.filter((id) => selectedIds.has(id));
  }
}
