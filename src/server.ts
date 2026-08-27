import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

type RuntimeEnv = {
  ASAAS_WEBHOOK_TOKEN?: string;
  ASAAS_WEBHOOK_ENABLED?: string;
};

type AsaasWebhookPayload = {
  id?: string;
  event?: string;
  payment?: {
    id?: string;
    status?: string;
  };
};

const asaasWebhookPath = "/api/webhooks/asaas";

function jsonResponse(payload: object, status: number) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function tokensMatch(received: string | null, expected: string) {
  if (!received || received.length !== expected.length) return false;

  let mismatch = 0;
  for (let index = 0; index < expected.length; index += 1) {
    mismatch |= received.charCodeAt(index) ^ expected.charCodeAt(index);
  }
  return mismatch === 0;
}

async function asaasWebhookResponse(request: Request, env: unknown) {
  const url = new URL(request.url);
  if (url.pathname !== asaasWebhookPath) return undefined;

  if (request.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }

  const runtime = (env as RuntimeEnv) || {};
  const webhookToken =
    runtime['ASAAS_WEBHOOK_TOKEN'] ||
    (typeof process !== "undefined" ? process.env?.['ASAAS_WEBHOOK_TOKEN'] : undefined);

  if (!webhookToken) {
    console.error("Asaas webhook rejected: ASAAS_WEBHOOK_TOKEN is not configured.");
    return jsonResponse({ error: "webhook_not_configured" }, 503);
  }

  if (!tokensMatch(request.headers.get("asaas-access-token"), webhookToken)) {
    console.warn("Asaas webhook rejected: invalid authentication token.");
    return jsonResponse({ error: "unauthorized" }, 401);
  }

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return jsonResponse({ error: "unsupported_media_type" }, 415);
  }

  let payload: AsaasWebhookPayload;
  try {
    payload = (await request.json()) as AsaasWebhookPayload;
  } catch {
    return jsonResponse({ error: "invalid_json" }, 400);
  }

  if (!payload.id || !payload.event || !payload.payment?.id) {
    return jsonResponse({ error: "invalid_webhook_payload" }, 400);
  }

  // Keep production delivery disabled until the persistent provisioning worker is
  // configured. A non-2xx response makes Asaas retry instead of falsely marking
  // a payment as provisioned.
  const webhookEnabled =
    runtime['ASAAS_WEBHOOK_ENABLED'] ||
    (typeof process !== "undefined" ? process.env?.['ASAAS_WEBHOOK_ENABLED'] : undefined);

  if (webhookEnabled !== "true") {
    console.error("Asaas webhook received before the provisioning worker was enabled.");
    return jsonResponse({ error: "webhook_processing_not_enabled" }, 503);
  }

  console.info("Asaas webhook accepted", {
    eventId: payload.id,
    event: payload.event,
    paymentId: payload.payment.id,
    paymentStatus: payload.payment.status,
  });

  // The event receiver is intentionally separate from account provisioning.
  // The latter must persist the event ID first, then create the company, owner,
  // subscription and welcome email atomically. Until that worker is connected,
  // this endpoint must not be enabled in production.
  return jsonResponse({ received: true }, 202);
}

function seoDocument(request: Request) {
  const url = new URL(request.url);

  if (url.pathname === "/robots.txt") {
    return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${url.origin}/sitemap.xml\n`, {
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  if (url.pathname === "/sitemap.xml") {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${url.origin}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
    return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8" } });
  }

  return undefined;
}

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const webhookResponse = await asaasWebhookResponse(request, env);
      if (webhookResponse) return webhookResponse;
      const seoResponse = seoDocument(request);
      if (seoResponse) return seoResponse;
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
