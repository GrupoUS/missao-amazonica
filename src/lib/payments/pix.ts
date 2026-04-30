/**
 * Pix BR-Code (EMV) generator.
 *
 * Pure function — no I/O beyond `qrcode.toDataURL`.
 * Produces a payload string compliant with Banco Central do Brasil EMV spec
 * and a QR data URL ready for inline rendering.
 */

import QRCode from 'qrcode';

export interface BuildPixPayloadArgs {
  pixKey: string;
  txid: string;
  amountCents: number;
  merchantName: string;
  merchantCity: string;
  description?: string;
}

export interface BuildPixPayloadResult {
  payload: string;
  qrDataUrl: string;
}

/** EMV TLV (Tag-Length-Value) helper. */
function emv(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

/** Strip diacritics and uppercase for ASCII-only fields. */
function ascii(input: string, maxLen: number): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\x20-\x7E]/g, '')
    .toUpperCase()
    .slice(0, maxLen)
    .trim();
}

/** CRC16/CCITT-FALSE — standard Pix BR-Code checksum. */
function crc16(input: string): string {
  let crc = 0xffff;
  for (let i = 0; i < input.length; i++) {
    crc ^= input.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function buildPixPayloadString({
  pixKey,
  txid,
  amountCents,
  merchantName,
  merchantCity,
  description,
}: BuildPixPayloadArgs): string {
  if (!pixKey) throw new Error('PIX key is required');
  if (!txid || txid.length > 25) throw new Error('TXID must be 1-25 chars');
  if (amountCents < 100) throw new Error('Amount must be >= R$ 1,00');

  const cleanKey = pixKey.trim();
  const cleanName = ascii(merchantName, 25) || 'NA';
  const cleanCity = ascii(merchantCity, 15) || 'BR';
  const cleanTxid = ascii(txid, 25);

  // 26 — Merchant Account Information (GUI + key + optional description)
  const subPieces: string[] = [emv('00', 'br.gov.bcb.pix'), emv('01', cleanKey)];
  if (description) {
    const descAscii = ascii(description, 30);
    if (descAscii.length > 0) subPieces.push(emv('02', descAscii));
  }
  const merchantAccountInfo = subPieces.join('');

  // 62 — Additional Data Field (TXID under tag 05)
  const additionalData = emv('05', cleanTxid);

  // Amount: Brazilian Real with dot decimal separator
  const amountReais = (amountCents / 100).toFixed(2);

  let raw =
    emv('00', '01') + // Payload Format Indicator
    emv('26', merchantAccountInfo) +
    emv('52', '0000') + // Merchant Category Code
    emv('53', '986') + // Currency: BRL
    emv('54', amountReais) +
    emv('58', 'BR') + // Country
    emv('59', cleanName) +
    emv('60', cleanCity) +
    emv('62', additionalData);

  raw += '6304'; // CRC tag + length placeholder
  const crc = crc16(raw);
  return raw + crc;
}

export async function buildPixPayload(
  args: BuildPixPayloadArgs,
): Promise<BuildPixPayloadResult> {
  const payload = buildPixPayloadString(args);
  const qrDataUrl = await QRCode.toDataURL(payload, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 256,
    color: {
      dark: '#012d1d',
      light: '#ffffff',
    },
  });
  return { payload, qrDataUrl };
}

/** TXID format: MIS<itemSlug8><ulidSuffix12> — uppercase, ≤25 chars. */
export function buildItemTxid(itemId: string, ulidSuffix: string, prefix = 'MIS'): string {
  const itemPart = itemId.replace(/-/g, '').slice(0, 8).toUpperCase();
  const suffix = ulidSuffix.slice(-12).toUpperCase();
  const txid = `${prefix}${itemPart}${suffix}`;
  return txid.slice(0, 25);
}
