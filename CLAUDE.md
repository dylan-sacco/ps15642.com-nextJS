# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Dev server
npm run build    # Production build (also runs next-sitemap)
npm run lint     # Lint
```

No test suite is configured.

## What This Is

Next.js 15 (App Router) portfolio/business website for P&S Contracting And Landscape, with a full admin dashboard for managing articles, gallery images, users, and backups. Deployed on a self-hosted server via PM2 + GitHub webhook auto-deploy.

## Content Storage (No Database)

All content is file-based:

- `content/articles/*.md` — blog articles with gray-matter YAML frontmatter (`title`, `date`, `excerpt`, `tags`, `published`, `image`)
- `content/pages/*.md` — static service pages (contracting, hardscape, landscape, etc.) served by `/(pages)/[slug]`
- `content/uploads/` — gallery images + `_order.json` (display order) + `_disabled.json` (hidden images)
- `data/users.json` — user accounts with PBKDF2-hashed passwords

`src/lib/paths.js` exports directory constants (`GALLERY_DIR`, `ARTICLES_DIR`, etc.).

## Auth & Security

**Custom stateless auth** — no auth library:
- Tokens are HMAC-SHA256 signed, base64url-encoded, 7-day expiry. Signing key: `ADMIN_SECRET` env var (required, 32-byte hex).
- Stored in `admin_auth` cookie (HttpOnly, SameSite=Strict).
- Verified in Edge Runtime middleware (`src/middleware.js`) using Web Crypto API.
- Password hashing: PBKDF2, 100k iterations, 16-byte salt.

**IP access control** — middleware restricts `/admin` and `/api/admin` to local IPs (127.x, 10.x, 192.168.x, 172.16-31.x) by default. Set `ADMIN_DISABLE_IP_CHECK=true` to bypass in dev. A 24-hour bypass token is available for remote access via `/api/admin/auth/bypass`.

The Edge middleware lives in **`src/proxy.js`** (not `middleware.js`). It exports a `proxy` function and `config` with matcher — Next.js/Turbopack picks it up as the middleware module. IP check prefers `x-real-ip` (set by Nginx), falls back to `x-forwarded-for`, then `request.ip`.

## Permissions (RBAC)

Four roles in ascending order: **Editor → Publisher → Owner → Admin**.

Permission strings (~20+) are defined in `src/config/roles.js`. Every protected API route calls `requireApiPermission('permission.string')` from `src/lib/adminAuth.js` as its first step. Users cannot manage accounts of equal or higher role level than themselves. The Admin role has a `*` wildcard permission.

Key helpers:
- `src/lib/adminAuth.js` — `getSessionUser()`, `requireApiPermission()`
- `src/lib/permissions.js` — `hasPermission(role, permission)`

## API Conventions

- Standard REST: GET list/read, POST create, PUT update, DELETE remove
- All admin API routes live under `src/app/api/admin/` and call `requireApiPermission()` first
- Article slugs: `^[a-z0-9]+(?:-[a-z0-9]+)*$` — enforced at creation
- Gallery images are served via `/api/uploads/[filename]` (not `/public`) from `content/uploads/`. URLs include `?v=<mtime>` (Unix timestamp) for cache-busting — never strip this when referencing gallery images. Images cache for 1 hour; videos cache for 7 days.
- Video files get a `<basename>.thumb.webp` sidecar thumbnail generated at upload time (requires ffmpeg). The gallery API filters these out from the image list.

## Key Environment Variables

| Variable | Purpose |
|---|---|
| `ADMIN_SECRET` | **Required.** Signs auth tokens (`openssl rand -hex 32`) |
| `INTERNAL_SECRET` | **Required.** Secures `/api/internal/whitelist-check` |
| `ADMIN_DISABLE_IP_CHECK` | Set `true` to skip IP gate in dev |
| `ADMIN_BYPASS_TOKEN` | 32-byte hex for remote access bypass |
| `WEBHOOK_SECRET` | GitHub webhook HMAC secret |
| `DEPLOY_BRANCH` | Branch that triggers auto-deploy (default: `main`) |
| `DEPLOY_DIR` | Absolute path to repo on server |
| `NVM_DIR` | Path to nvm install dir (for deploy shell — nvm not in PATH by default) |
| `BACKUP_DIR` | Where auto-deploy gallery zips are stored (default: `~/gallery-backups`) |
| `BACKUP_KEEP_WEEKS` | Weeks of auto-deploy backups to retain (default: 12) |
| `ADMIN_BACKUP_DIR` | Where admin-panel backups are stored (default: `data/backups`) |
| `ADMIN_BACKUP_SIZE_LIMIT_MB` | Quota for admin backups in MB (default: 500) |
| `EMAIL_USER` / `EMAIL_PASS` | Gmail + app password for contact form |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` / `RECAPTCHA_SECRET_KEY` | reCAPTCHA v3 (contact form) |
| `NEXT_PUBLIC_SKIP_RECAPTCHA` | Set `true` in dev to skip reCAPTCHA script load + client token fetch |
| `SKIP_RECAPTCHA` | Set `true` in dev to bypass server-side reCAPTCHA verification |
| `SKIP_EMAIL` | Set `true` in dev to log email payload to console instead of sending |
| `CONTACT_RETENTION_DAYS` | Days to keep contact submissions before auto-purge (default: 90) |
| `NEXT_PUBLIC_APP_VERSION` | Auto-injected from `package.json` version by `next.config.js` |

## Server Dependencies

- **sharp** — image processing (WebP conversion, rotation). Installed as an npm dependency; native binaries are platform-specific (`npm install` on the server pulls the Linux build).
- **ffmpeg** — video transcoding (MP4/MOV → WebM on gallery upload). Must be installed on the server separately:
  ```bash
  sudo apt install ffmpeg
  ```
  If ffmpeg is absent, video uploads still succeed but are saved in their original format without conversion. No crash occurs.

## Auto-Deploy

GitHub webhook at `/api/github-webhook` — validates HMAC signature, then runs `git reset --hard` → `npm install` → `npm run build` → `pm2 startOrRestart`. Only fires on pushes to `DEPLOY_BRANCH`. Backs up gallery before deploying.
