export function imageDataToBlob(source: string): Blob {
  const match = /^data:(image\/(?:png|jpeg|webp));base64,([\s\S]+)$/.exec(source);
  if (!match) throw new Error('Choose a PNG, JPEG, or WebP image.');
  const bytes = Uint8Array.from(atob(match[2]), character => character.charCodeAt(0));
  if (bytes.byteLength > 5 * 1024 * 1024) throw new Error('Image must be under 5 MB.');
  return new Blob([bytes], { type: match[1] });
}
