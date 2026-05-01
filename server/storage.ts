/**
 * Storage helpers — dual-mode:
 *   1. Manus Forge API proxy  (when BUILT_IN_FORGE_API_URL + BUILT_IN_FORGE_API_KEY are set)
 *   2. Local disk storage     (fallback — files saved to UPLOADS_DIR, served at /uploads/*)
 *
 * Mode is selected automatically at runtime based on env vars.
 */
import fs from "fs";
import path from "path";
import { ENV } from './_core/env';

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function ensureTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`;
}

function buildAuthHeaders(apiKey: string): HeadersInit {
  return { Authorization: `Bearer ${apiKey}` };
}

function toFormData(data: Buffer | Uint8Array | string, contentType: string, fileName: string): FormData {
  const blob =
    typeof data === "string"
      ? new Blob([data], { type: contentType })
      : new Blob([data as any], { type: contentType });
  const form = new FormData();
  form.append("file", blob, fileName || "file");
  return form;
}

// ── Forge API (Manus platform) ─────────────────────────────────────────────────

async function forgePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType: string
): Promise<{ key: string; url: string }> {
  const baseUrl = ENV.forgeApiUrl.replace(/\/+$/, "");
  const apiKey = ENV.forgeApiKey;
  const key = normalizeKey(relKey);
  const uploadUrl = new URL("v1/storage/upload", ensureTrailingSlash(baseUrl));
  uploadUrl.searchParams.set("path", key);
  const formData = toFormData(data, contentType, key.split("/").pop() ?? key);
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: buildAuthHeaders(apiKey),
    body: formData,
  });
  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(`Forge upload failed (${response.status}): ${message}`);
  }
  const url = (await response.json()).url;
  return { key, url };
}

async function forgeGet(relKey: string): Promise<{ key: string; url: string }> {
  const baseUrl = ENV.forgeApiUrl.replace(/\/+$/, "");
  const apiKey = ENV.forgeApiKey;
  const key = normalizeKey(relKey);
  const downloadApiUrl = new URL("v1/storage/downloadUrl", ensureTrailingSlash(baseUrl));
  downloadApiUrl.searchParams.set("path", key);
  const response = await fetch(downloadApiUrl, { method: "GET", headers: buildAuthHeaders(apiKey) });
  const url = (await response.json()).url;
  return { key, url };
}

// ── Local disk storage ─────────────────────────────────────────────────────────

function getUploadsDir(): string {
  const dir = path.isAbsolute(ENV.uploadsDir)
    ? ENV.uploadsDir
    : path.join(process.cwd(), ENV.uploadsDir);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function localFileUrl(flatKey: string): string {
  const base = ENV.publicBaseUrl ? ENV.publicBaseUrl.replace(/\/+$/, "") : "";
  return `${base}/uploads/${flatKey}`;
}

async function localPut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  _contentType: string
): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  // Flatten path separators so files are stored flat in the uploads dir
  const flatKey = key.replace(/\//g, "_");
  const uploadsDir = getUploadsDir();
  const filePath = path.join(uploadsDir, flatKey);
  const buffer = typeof data === "string" ? Buffer.from(data) : Buffer.from(data as any);
  fs.writeFileSync(filePath, buffer);
  return { key: flatKey, url: localFileUrl(flatKey) };
}

async function localGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey).replace(/\//g, "_");
  return { key, url: localFileUrl(key) };
}

// ── Public API ─────────────────────────────────────────────────────────────────

function isForgeConfigured(): boolean {
  return Boolean(ENV.forgeApiUrl && ENV.forgeApiKey);
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  if (isForgeConfigured()) {
    return forgePut(relKey, data, contentType);
  }
  return localPut(relKey, data, contentType);
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  if (isForgeConfigured()) {
    return forgeGet(relKey);
  }
  return localGet(relKey);
}
