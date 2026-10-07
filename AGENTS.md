# Architecture rules

- Default Nitro deployment to `cloudflare-pages` so Lovable receives static assets and the server Worker in `dist/`; use `NITRO_PRESET` only for explicit deployment-target overrides.
- Define page-specific metadata on content routes; keep shared document settings in the root route.