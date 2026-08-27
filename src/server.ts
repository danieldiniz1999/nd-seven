import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { AsaasClient, type AsaasBillingType, type AsaasCycle } from "./lib/asaas";
import { provisionAccount, updateSubscriptionStatus } from "./lib/provisioning";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

type RuntimeEnv = {
  ASAAS_API_KEY?: string;
  ASAAS_ACCESS_TOKEN?: string;
  ASAAS_WEBHOOK_TOKEN?: string;
  ASAAS_WEBHOOK_ENABLED?: string;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
};

type AsaasWebhookPayload = {
  id?: string;
  event?: string;
  payment?: {
    id?: string;
    customer?: string;
    subscription?: string;
    value?: number;
    status?: string;
    billingType?: string;
    dueDate?: string;
    description?: string;
  };
};

const asaasWebhookPath = "/api/webhooks/asaas";
const checkoutApiPath = "/api/checkout";
const checkoutStatusPath = "/api/checkout/status";

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

function getEnvValue(env: unknown, key: keyof RuntimeEnv): string | undefined {
  const runtime = (env as RuntimeEnv) || {};
  return runtime[key] || (typeof process !== "undefined" ? (process.env as Record<string, string | undefined>)?.[key] : undefined);
}

// Plan Cycle & Pricing Mapping
const planPricing: Record<string, { value: number; cycle: AsaasCycle; planCode: string }> = {
  Mensal: { value: 129.9, cycle: "MONTHLY", planCode: "pro-monthly" },
  Trimestral: { value: 359.7, cycle: "QUARTERLY", planCode: "pro-quarterly" },
  Semestral: { value: 659.4, cycle: "SEMIANNUALLY", planCode: "pro-semiannually" },
  Anual: { value: 1198.8, cycle: "ANNUALLY", planCode: "pro-annually" },
};

async function checkoutHandler(request: Request, env: unknown): Promise<Response | undefined> {
  const url = new URL(request.url);

  // Status check endpoint
  if (url.pathname === checkoutStatusPath && request.method === "GET") {
    const paymentId = url.searchParams.get("paymentId");
    if (!paymentId) {
      return jsonResponse({ error: "missing_payment_id" }, 400);
    }
    const apiKey = getEnvValue(env, "ASAAS_API_KEY") || getEnvValue(env, "ASAAS_ACCESS_TOKEN");
    const asaas = new AsaasClient(apiKey);
    try {
      const payment = await asaas.getPayment(paymentId);
      return jsonResponse({ status: payment.status, isPaid: payment.status === "RECEIVED" || payment.status === "CONFIRMED" }, 200);
    } catch (err: unknown) {
      return jsonResponse({ error: err instanceof Error ? err.message : "Error checking payment" }, 500);
    }
  }

  if (url.pathname !== checkoutApiPath) return undefined;

  if (request.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }

  try {
    const body = (await request.json()) as {
      fullName: string;
      email: string;
      companyName: string;
      phone: string;
      document: string;
      cycle: string;
      paymentMethod: "card" | "pix" | "boleto";
      postalCode?: string;
      address?: string;
      addressNumber?: string;
      complement?: string;
      province?: string;
      creditCard?: {
        holderName: string;
        number: string;
        expiryMonth: string;
        expiryYear: string;
        ccv: string;
      };
    };

    if (!body.fullName || !body.email || !body.document) {
      return jsonResponse({ error: "Dados obrigatórios ausentes." }, 400);
    }

    const apiKey = getEnvValue(env, "ASAAS_API_KEY") || getEnvValue(env, "ASAAS_ACCESS_TOKEN");
    if (!apiKey) {
      return jsonResponse({ error: "Chave de API do Asaas não configurada no servidor." }, 500);
    }

    const asaas = new AsaasClient(apiKey);

    // 1. Find or create Customer in Asaas
    const customer = await asaas.findOrCreateCustomer({
      name: body.fullName,
      email: body.email,
      cpfCnpj: body.document,
      phone: body.phone,
      mobilePhone: body.phone,
      postalCode: body.postalCode,
      address: body.address,
      addressNumber: body.addressNumber,
      complement: body.complement,
      province: body.province,
    });

    const planConfig = planPricing[body.cycle] || planPricing['Mensal']!;
    let billingType: AsaasBillingType = "PIX";
    if (body.paymentMethod === "card") billingType = "CREDIT_CARD";
    if (body.paymentMethod === "boleto") billingType = "BOLETO";

    // 2. Create Subscription in Asaas
    const subscription = await asaas.createSubscription({
      customerId: customer.id,
      billingType,
      value: planConfig.value,
      cycle: planConfig.cycle,
      description: `ND7 CRM - Plano ${body.cycle} (${body.companyName || body.fullName})`,
      creditCard: body.creditCard,
      creditCardHolderInfo: body.creditCard
        ? {
            name: body.creditCard.holderName,
            email: body.email,
            cpfCnpj: body.document.replace(/\D/g, ""),
            postalCode: (body.postalCode || "").replace(/\D/g, ""),
            addressNumber: body.addressNumber || "S/N",
            phone: (body.phone || "").replace(/\D/g, ""),
            addressComplement: body.complement,
          }
        : undefined,
    });

    // 3. Retrieve first payment details for PIX / Boleto
    const payments = await asaas.getSubscriptionPayments(subscription.id);
    const firstPayment = payments.length > 0 ? payments[0] : null;

    let pixQrCode: { encodedImage: string; payload: string; expirationDate: string } | undefined;
    if (billingType === "PIX" && firstPayment) {
      try {
        pixQrCode = await asaas.getPixQrCode(firstPayment.id);
      } catch (pixErr) {
        console.error("Error generating PIX QR Code:", pixErr);
      }
    }

    return jsonResponse(
      {
        success: true,
        customerId: customer.id,
        subscriptionId: subscription.id,
        paymentId: firstPayment?.id,
        status: firstPayment?.status || "PENDING",
        invoiceUrl: firstPayment?.invoiceUrl,
        bankSlipUrl: firstPayment?.bankSlipUrl,
        pix: pixQrCode
          ? {
              qrCodeImage: pixQrCode.encodedImage,
              payload: pixQrCode.payload,
              expirationDate: pixQrCode.expirationDate,
            }
          : undefined,
      },
      200,
    );
  } catch (err: unknown) {
    console.error("Checkout error:", err);
    return jsonResponse({ error: err instanceof Error ? err.message : "Erro ao processar checkout." }, 400);
  }
}

async function asaasWebhookResponse(request: Request, env: unknown) {
  const url = new URL(request.url);
  if (url.pathname !== asaasWebhookPath) return undefined;

  if (request.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }

  const webhookToken = getEnvValue(env, "ASAAS_WEBHOOK_TOKEN");
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

  if (!payload.id || !payload.event) {
    return jsonResponse({ error: "invalid_webhook_payload" }, 400);
  }

  const webhookEnabled = getEnvValue(env, "ASAAS_WEBHOOK_ENABLED");
  if (webhookEnabled !== "true") {
    console.warn("Asaas webhook received while ASAAS_WEBHOOK_ENABLED is not 'true'. Processing will still attempt idempotent provisioning.");
  }

  console.info("Asaas webhook received", {
    eventId: payload.id,
    event: payload.event,
    paymentId: payload.payment?.id,
    paymentStatus: payload.payment?.status,
  });

  const event = payload.event;
  const payment = payload.payment;

  // Handle Confirmed / Received Payments (Account Provisioning)
  if (event === "PAYMENT_CONFIRMED" || event === "PAYMENT_RECEIVED") {
    if (payment?.customer) {
      try {
        const apiKey = getEnvValue(env, "ASAAS_API_KEY") || getEnvValue(env, "ASAAS_ACCESS_TOKEN");
        const asaas = new AsaasClient(apiKey);
        const customer = await asaas.getCustomer(payment.customer);

        const planCode = payment.description?.toLowerCase().includes("anual")
          ? "pro-annually"
          : payment.description?.toLowerCase().includes("semestral")
            ? "pro-semiannually"
            : payment.description?.toLowerCase().includes("trimestral")
              ? "pro-quarterly"
              : "pro-monthly";

        const provisionRes = await provisionAccount({
          legalName: customer.name,
          document: customer.cpfCnpj,
          email: customer.email,
          fullName: customer.name,
          phone: customer.mobilePhone || customer.phone,
          asaasCustomerId: customer.id,
          asaasSubscriptionId: payment.subscription,
          planCode,
          amount: payment.value || 129.9,
        });

        console.info("Account provisioned successfully:", provisionRes);
      } catch (provErr) {
        console.error("Error during webhook account provisioning:", provErr);
      }
    }
  } else if (event === "PAYMENT_OVERDUE" && payment?.subscription) {
    await updateSubscriptionStatus(payment.subscription, "past_due");
  } else if ((event === "SUBSCRIPTION_INACTIVATED" || event === "SUBSCRIPTION_DELETED") && payment?.subscription) {
    await updateSubscriptionStatus(payment.subscription, "cancelled");
  }

  return jsonResponse({ received: true }, 200);
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
      const checkoutRes = await checkoutHandler(request, env);
      if (checkoutRes) return checkoutRes;

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
