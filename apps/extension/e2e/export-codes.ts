import QRCode from 'qrcode';

/**
 * Google Authenticator exports, as codes and as a camera sees them: for the
 * extension's camera tests and the phone app's, which read the same codes
 * through different readers.
 */

export function base32Bytes(input: string): Buffer {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const char of input) {
    value = (value << 5) | alphabet.indexOf(char);
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

/** Build a Google Authenticator export payload, protobuf wire format by hand. */
export function migrationUri(
  entries: { secret: string; name: string; issuer: string }[],
  batch: { size: number; index: number; id?: number } = { size: 1, index: 0 },
): string {
  const varint = (value: number): number[] => {
    const out: number[] = [];
    let rest = value;
    while (rest > 0x7f) {
      out.push((rest & 0x7f) | 0x80);
      rest = Math.floor(rest / 128);
    }
    out.push(rest);
    return out;
  };
  const tag = (field: number, wire: number) => varint((field << 3) | wire);
  const bytes = (field: number, value: Buffer | Uint8Array) => [
    ...tag(field, 2),
    ...varint(value.length),
    ...value,
  ];
  const str = (field: number, value: string) => bytes(field, Buffer.from(value, 'utf8'));
  const num = (field: number, value: number) => [...tag(field, 0), ...varint(value)];

  const body: number[] = [];
  for (const entry of entries) {
    const params = [
      ...bytes(1, base32Bytes(entry.secret)),
      ...str(2, entry.name),
      ...str(3, entry.issuer),
      ...num(4, 1), // SHA1
      ...num(5, 1), // six digits
      ...num(6, 2), // TOTP
    ];
    body.push(...tag(1, 2), ...varint(params.length), ...params);
  }
  body.push(...num(2, 1), ...num(3, batch.size), ...num(4, batch.index));
  if (batch.id !== undefined) body.push(...num(5, batch.id));

  return `otpauth-migration://offline?data=${encodeURIComponent(
    Buffer.from(body).toString('base64'),
  )}`;
}

/** A distinct, valid base32 secret per account, the length Google issues. */
export function secretFor(i: number): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let out = '';
  let value = i * 2654435761 + 97;
  for (let k = 0; k < 32; k += 1) {
    value = (value * 1103515245 + 12345) & 0x7fffffff;
    out += alphabet[value % 32];
  }
  return out;
}

/** An export as Google Authenticator makes it: `codes` codes of `perCode` accounts. */
export function fullExport(codes: number, perCode: number, id: number): { codes: string[]; issuers: string[] } {
  const issuers: string[] = [];
  const out: string[] = [];
  for (let c = 0; c < codes; c += 1) {
    const entries = [];
    for (let a = 0; a < perCode; a += 1) {
      const i = c * perCode + a;
      const issuer = `Service${String(i + 1).padStart(2, '0')}`;
      issuers.push(issuer);
      entries.push({ secret: secretFor(i), name: `nguyen.van.a${i}@gmail.com`, issuer });
    }
    out.push(migrationUri(entries, { size: codes, index: c, id }));
  }
  return { codes: out, issuers };
}

/**
 * What a webcam actually delivers when a phone is held up to it, as opposed to
 * the pristine codes above.
 *
 * The codes above are a few dozen modules, drawn black on white at 8 px a
 * module. Every reader passes them, which is exactly why they were not enough:
 * the scanner shipped with them green and failed on the first real export it
 * was shown. A Google Authenticator export packs up to ten accounts into a
 * code of 117 modules a side, and the camera sees it through a phone's
 * contrast, a fixed-focus lens's softness and sensor noise.
 *
 * `ppm` is pixels per module. 3.5 is about what a 720p webcam gives an export
 * held at the closest distance it stays sharp.
 */
export function webcamY4m(
  texts: string[],
  { width = 1280, height = 720, ppm = 3.5, framesEach = 6 } = {},
): Buffer {
  const dark = 45;
  const light = 205;
  const quiet = 4;
  let seed = 11;
  const random = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);

  const chroma = Buffer.alloc((width / 2) * (height / 2), 0x80);
  const header = Buffer.from(`YUV4MPEG2 W${width} H${height} F30:1 Ip A1:1 C420mpeg2\n`);
  const parts = [header];

  for (const text of texts) {
    const qr = QRCode.create(text, { errorCorrectionLevel: 'M' });
    const n = qr.modules.size;
    const side = Math.ceil((n + 2 * quiet) * ppm);
    const left = Math.floor((width - side) / 2);
    const top = Math.floor((height - side) / 2);
    const dark_at = (x: number, y: number) => {
      const mx = Math.floor(x) - quiet;
      const my = Math.floor(y) - quiet;
      return mx >= 0 && my >= 0 && mx < n && my < n && qr.modules.data[my * n + mx] ? 1 : 0;
    };

    // Resample at a fractional scale, averaging four points per pixel the way
    // a sensor pixel integrates whatever falls on it.
    const sharp = new Float32Array(width * height).fill(light);
    for (let py = 0; py < side; py += 1) {
      for (let px = 0; px < side; px += 1) {
        let cover = 0;
        for (const sy of [0.25, 0.75]) for (const sx of [0.25, 0.75]) cover += dark_at((px + sx) / ppm, (py + sy) / ppm);
        sharp[(top + py) * width + left + px] = light - (light - dark) * (cover / 4);
      }
    }
    // A fixed-focus lens up close: one pass of a 3×3 blur.
    const soft = new Float32Array(width * height).fill(light);
    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        let sum = 0;
        for (let dy = -1; dy <= 1; dy += 1) for (let dx = -1; dx <= 1; dx += 1) sum += sharp[(y + dy) * width + x + dx]!;
        soft[y * width + x] = sum / 9;
      }
    }
    // Fresh sensor noise every frame, as a real one has.
    for (let f = 0; f < framesEach; f += 1) {
      const luma = Buffer.alloc(width * height);
      for (let i = 0; i < luma.length; i += 1) {
        luma[i] = Math.max(0, Math.min(255, Math.round(soft[i]! + (random() - 0.5) * 28)));
      }
      parts.push(Buffer.from('FRAME\n'), luma, chroma, chroma);
    }
  }
  return Buffer.concat(parts);
}
