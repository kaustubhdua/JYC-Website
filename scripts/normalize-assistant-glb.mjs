import fs from 'node:fs';
import path from 'node:path';

const MODEL_PATH = path.resolve('public/models/1780947277181-w2z6yhqv.glb');
const MAX_BYTES = 3 * 1024 * 1024;
const GLB_MAGIC = 'glTF';
const JSON_CHUNK = 0x4e4f534a;
const BIN_CHUNK = 0x004e4942;
const WEBP_EXTENSION = 'EXT_texture_webp';

function fail(message) {
  console.error(`GLB normalization failed: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(MODEL_PATH)) fail(`missing model at ${MODEL_PATH}`);
const original = fs.readFileSync(MODEL_PATH);
if (original.length < 20 || original.toString('ascii', 0, 4) !== GLB_MAGIC) fail('invalid GLB header');
if (original.readUInt32LE(4) !== 2) fail('only GLB 2.0 is supported');
if (original.readUInt32LE(8) !== original.length) fail('declared file length does not match actual bytes');

const chunks = [];
let offset = 12;
while (offset < original.length) {
  if (offset + 8 > original.length) fail('truncated chunk header');
  const byteLength = original.readUInt32LE(offset);
  const type = original.readUInt32LE(offset + 4);
  const start = offset + 8;
  const end = start + byteLength;
  if (end > original.length) fail('chunk exceeds file length');
  chunks.push({ type, data: original.subarray(start, end) });
  offset = end;
}
if (offset !== original.length || chunks.length < 2 || chunks[0].type !== JSON_CHUNK || chunks[1].type !== BIN_CHUNK) {
  fail('expected a JSON chunk followed by a BIN chunk');
}

let gltf;
try {
  gltf = JSON.parse(chunks[0].data.toString('utf8').replace(/[\\u0000\\u0020]+$/g, ''));
} catch (error) {
  fail(`invalid JSON chunk: ${error?.message || error}`);
}
if (gltf?.asset?.version !== '2.0') fail('JSON asset version is not glTF 2.0');
if (!Array.isArray(gltf.images) || !Array.isArray(gltf.textures)) fail('missing image/texture arrays');

const webpImages = new Set();
for (let i = 0; i < gltf.images.length; i += 1) {
  if (gltf.images[i]?.mimeType === 'image/webp') webpImages.add(i);
}
if (webpImages.size === 0) {
  console.log('Assistant GLB already uses no unregistered WebP images; no rewrite required.');
  process.exit(0);
}

// EXT_texture_webp is the ratified glTF extension for embedded WebP images.
// This model ships no PNG/JPEG fallback, so the extension must be required.
let convertedTextures = 0;
for (let i = 0; i < gltf.textures.length; i += 1) {
  const texture = gltf.textures[i];
  const source = Number.isInteger(texture.source)
    ? texture.source
    : texture.extensions?.[WEBP_EXTENSION]?.source;
  if (!Number.isInteger(source) || !webpImages.has(source)) continue;
  texture.extensions ||= {};
  texture.extensions[WEBP_EXTENSION] = { ...(texture.extensions[WEBP_EXTENSION] || {}), source };
  delete texture.source;
  convertedTextures += 1;
}
if (convertedTextures === 0) fail('found WebP images but no textures reference them');

gltf.extensionsUsed ||= [];
gltf.extensionsRequired ||= [];
if (!gltf.extensionsUsed.includes(WEBP_EXTENSION)) gltf.extensionsUsed.push(WEBP_EXTENSION);
if (!gltf.extensionsRequired.includes(WEBP_EXTENSION)) gltf.extensionsRequired.push(WEBP_EXTENSION);

const jsonPayload = Buffer.from(JSON.stringify(gltf), 'utf8');
const jsonPadding = (4 - (jsonPayload.length % 4)) % 4;
const paddedJson = Buffer.concat([jsonPayload, Buffer.alloc(jsonPadding, 0x20)]);
const binary = chunks[1].data;
const binaryPadding = (4 - (binary.length % 4)) % 4;
const paddedBinary = binaryPadding ? Buffer.concat([binary, Buffer.alloc(binaryPadding)]) : binary;
const out = Buffer.alloc(12 + 8 + paddedJson.length + 8 + paddedBinary.length);
out.write(GLB_MAGIC, 0, 4, 'ascii');
out.writeUInt32LE(2, 4);
out.writeUInt32LE(out.length, 8);
let cursor = 12;
out.writeUInt32LE(paddedJson.length, cursor);
out.writeUInt32LE(JSON_CHUNK, cursor + 4);
paddedJson.copy(out, cursor + 8);
cursor += 8 + paddedJson.length;
out.writeUInt32LE(paddedBinary.length, cursor);
out.writeUInt32LE(BIN_CHUNK, cursor + 4);
paddedBinary.copy(out, cursor + 8);

if (out.length > MAX_BYTES) fail(`normalized GLB exceeds 3 MiB budget (${out.length} bytes)`);
const tempPath = `${MODEL_PATH}.normalized`;
fs.writeFileSync(tempPath, out);
fs.renameSync(tempPath, MODEL_PATH);
console.log(`Normalized ${convertedTextures} texture source(s) with required ${WEBP_EXTENSION}: ${webpImages.size} embedded WebP images, ${original.length} -> ${out.length} bytes.`);
