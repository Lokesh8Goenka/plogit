// Perceptual hashing + thumbnail generation, all client-side via canvas.
//
// dHash (difference hash): downscale to 9x8 grayscale, compare each pixel to
// its right neighbour -> 64 bits. Robust to resize/recompression, so it catches
// the same photo re-uploaded even if lightly edited. Near-duplicates are found
// by Hamming distance, not exact equality.

/** Loads a File into an HTMLImageElement. */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

/** 64-bit dHash as a 16-char hex string. */
export async function computeDHash(file: File): Promise<string> {
  const img = await loadImage(file);
  const w = 9, h = 8;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, w, h);
  const { data } = ctx.getImageData(0, 0, w, h);

  const gray = (x: number, y: number) => {
    const i = (y * w + x) * 4;
    return 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  };

  let bits = "";
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w - 1; x++) {
      bits += gray(x, y) < gray(x + 1, y) ? "1" : "0";
    }
  }
  // 64 bits -> 16 hex chars
  let hex = "";
  for (let i = 0; i < 64; i += 4) {
    hex += parseInt(bits.slice(i, i + 4), 2).toString(16);
  }
  return hex;
}

/** Hamming distance between two hex dHashes (0 = identical). */
export function hammingDistance(a: string, b: string): number {
  if (a.length !== b.length) return 64;
  let dist = 0;
  for (let i = 0; i < a.length; i++) {
    let x = parseInt(a[i], 16) ^ parseInt(b[i], 16);
    while (x) {
      dist += x & 1;
      x >>= 1;
    }
  }
  return dist;
}

/**
 * True if `hash` is close to any known hash. Threshold ~8/64: catches the same
 * photo re-uploaded (incl. resize/recompress) while allowing genuinely
 * different scenes through. Lower = stricter.
 */
export function isDuplicate(hash: string, known: string[], threshold = 8): boolean {
  return known.some((k) => hammingDistance(hash, k) <= threshold);
}

/** Small JPEG data URL (max ~240px) for storing in the profile history. */
export async function makeThumbnail(file: File, max = 240): Promise<string> {
  const img = await loadImage(file);
  const scale = Math.min(1, max / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.7);
}
