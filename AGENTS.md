# Architecture rules

- Default Nitro deployment to `cloudflare-module` with `dist/server/index.mjs` and static assets in `dist/client` so Lovable can discover the SSR entry; use `NITRO_PRESET` only for explicit deployment-target overrides.
- Define page-specific metadata on content routes; keep shared document settings in the root route.