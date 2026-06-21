/**
 * QR codes are generated via the free goqr.me / QR Server API —
 * no key required, just a GET request that returns a PNG.
 * Docs: https://goqr.me/api/
 */
const QR_ENDPOINT = "https://api.qrserver.com/v1/create-qr-code/";

export interface QrOptions {
  size?: number; // px, square
  margin?: number; // quiet-zone modules
  /** hex without '#', e.g. "1B264F" */
  foreground?: string;
  /** hex without '#', e.g. "FFFFFF" */
  background?: string;
}

export function buildQrCodeUrl(data: string, opts: QrOptions = {}): string {
  const { size = 320, margin = 1, foreground = "1B264F", background = "FFFFFF" } =
    opts;

  const params = new URLSearchParams({
    data,
    size: `${size}x${size}`,
    margin: String(margin),
    color: foreground,
    bgcolor: background,
    format: "png",
    qzone: "1",
  });

  return `${QR_ENDPOINT}?${params.toString()}`;
}
