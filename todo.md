# Tube Tracker TODO

- [x] Basic station list with all 11 lines and official TfL colours
- [x] Checkbox to mark stations as visited (localStorage)
- [x] Search and filter (All / Visited / Unvisited)
- [x] Expand/Collapse all lines
- [x] Per-line Mark All / Unmark All
- [x] Progress ring and progress bar
- [x] Reset all progress with confirmation dialog
- [x] Fix nested button HTML error in LineSection header
- [x] Upgrade to full-stack (server + database + S3 storage)
- [x] Add station_visits table to database schema
- [x] Add S3 photo upload tRPC procedure
- [x] Add photo delete tRPC procedure
- [x] Migrate visited state from localStorage to database
- [x] Add drag-and-drop photo upload UI per station
- [x] Show photo thumbnail next to visited stations
- [x] Photo lightbox/full-size view on click
- [x] Write vitest tests for photo upload procedure
- [x] Sort stations within each line: unvisited first (alphabetical), visited below
- [x] Audit project for incomplete/partially-wired features — all features confirmed complete
- [x] TypeScript check passes with 0 errors
- [x] All 8 vitest tests pass
- [x] Push code to GitHub (taverner100/tube-tracker)
- [x] Deploy to Hetzner server at 178.104.241.78 via SSH
- [x] Run pnpm install, pnpm build, pnpm db:push on Hetzner server
- [x] Start app with pm2 (tube-tracker, port 3002)
- [x] Configure nginx reverse proxy on port 8082
- [x] Verify HTTP 200 at http://178.104.241.78:8082/

## Self-hosted Hetzner Migration
- [x] Replace Manus OAuth with PIN-based auth (server-side bcrypt hash)
- [x] Replace Manus Forge storage with local disk storage (Express static serving)
- [x] Switch drizzle config to support both TiDB (Manus) and local MySQL (Hetzner)
- [x] Update frontend PIN login page (replace OAuth redirect)
- [x] Update useAuth hook to use PIN session instead of OAuth
- [x] Run tests and save checkpoint
- [x] Push to GitHub and rebuild on Hetzner
- [x] Verify photo upload, auth, and station tracking work on Hetzner
