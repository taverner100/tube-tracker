export const ENV = {
  appId: process.env.VITE_APP_ID ?? "tube-tracker",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "pin-owner",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  // PIN auth — SHA-256 hex hash of the user's chosen PIN
  pinHash: process.env.PIN_HASH ?? "",
  // Local file storage path (used when Forge API is unavailable)
  uploadsDir: process.env.UPLOADS_DIR ?? "uploads",
  // Public base URL for serving uploaded files
  publicBaseUrl: process.env.PUBLIC_BASE_URL ?? "",
};
