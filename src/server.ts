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
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
  SITE_URL?: string;
  VITE_SITE_URL?: string;
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

function isAsaasWebhookPath(pathname: string): boolean {
  const normalized = pathname.toLowerCase().replace(/\/+$/, "");
  return (
    normalized === "/api/webhook" ||
    normalized === "/api/webhooks" ||
    normalized === "/api/webhooks/asaas" ||
    normalized === "/api/webhook/asaas" ||
    normalized === "/api/asaas/webhook" ||
    normalized === "/api/asaas/webhooks"
  );
}
const checkoutApiPath = "/api/checkout";
const checkoutStatusPath = "/api/checkout/status";

function getClientIp(request: Request): string {
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  const xRealIp = request.headers.get("x-real-ip");
  if (xRealIp) return xRealIp.trim();

  const xForwarded = request.headers.get("x-forwarded-for");
  if (xForwarded) {
    const first = xForwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  return "127.0.0.1";
}

type RateLimitRecord = { count: number; expiresAt: number };
const rateLimitStore = new Map<string, RateLimitRecord>();

function enforceRateLimit(key: string, maxRequests: number, windowMs: number): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  if (rateLimitStore.size > 1500) {
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.expiresAt <= now) rateLimitStore.delete(k);
    }
  }

  const record = rateLimitStore.get(key);
  if (!record || record.expiresAt <= now) {
    rateLimitStore.set(key, { count: 1, expiresAt: now + windowMs });
    return { allowed: true };
  }

  if (record.count >= maxRequests) {
    const retryAfter = Math.ceil((record.expiresAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  record.count += 1;
  return { allowed: true };
}

function jsonResponse(payload: object, status: number, extraHeaders?: Record<string, string>) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "x-content-type-options": "nosniff",
      "x-frame-options": "DENY",
      "referrer-policy": "strict-origin-when-cross-origin",
      ...(extraHeaders || {}),
    },
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
  const clientIp = getClientIp(request);

  // Status check endpoint with rate limit (45 req / 60s per IP)
  if (url.pathname === checkoutStatusPath && request.method === "GET") {
    const statusRate = enforceRateLimit(`status:${clientIp}`, 45, 60_000);
    if (!statusRate.allowed) {
      return jsonResponse({ error: "too_many_requests" }, 429, { "retry-after": String(statusRate.retryAfter || 60) });
    }

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

  // Rate limiting on checkout submissions (max 6 per minute per IP to mitigate carding / fraud)
  const checkoutRate = enforceRateLimit(`checkout:${clientIp}`, 6, 60_000);
  if (!checkoutRate.allowed) {
    return jsonResponse(
      { error: "Muitas tentativas consecutivas de checkout. Por segurança, aguarde um momento antes de tentar novamente." },
      429,
      { "retry-after": String(checkoutRate.retryAfter || 60) }
    );
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

    const cleanEmail = body.email.trim().toLowerCase();
    const cleanDoc = body.document.replace(/\D/g, "");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return jsonResponse({ error: "Formato de e-mail inválido." }, 400);
    }

    if (cleanDoc.length !== 11 && cleanDoc.length !== 14) {
      return jsonResponse({ error: "CPF ou CNPJ inválido." }, 400);
    }

    if (body.paymentMethod === "card") {
      if (!body.creditCard) {
        return jsonResponse({ error: "Dados do cartão de crédito não informados." }, 400);
      }
      const rawNum = (body.creditCard.number || "").replace(/\D/g, "");
      const rawCvv = (body.creditCard.ccv || "").replace(/\D/g, "");
      if (rawNum.length < 13 || rawNum.length > 19) {
        return jsonResponse({ error: "Número de cartão de crédito inválido." }, 400);
      }
      if (rawCvv.length < 3 || rawCvv.length > 4) {
        return jsonResponse({ error: "Código de segurança (CVV) inválido." }, 400);
      }
      const expMonth = parseInt(body.creditCard.expiryMonth, 10);
      const expYear = parseInt(body.creditCard.expiryYear, 10);
      const currentYear = new Date().getFullYear();
      if (isNaN(expMonth) || expMonth < 1 || expMonth > 12) {
        return jsonResponse({ error: "Mês de expiração do cartão inválido." }, 400);
      }
      if (isNaN(expYear) || expYear < currentYear || expYear > currentYear + 30) {
        return jsonResponse({ error: "Ano de expiração do cartão inválido." }, 400);
      }
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

async function asaasWebhookResponse(request: Request, env: unknown): Promise<Response | undefined> {
  const url = new URL(request.url);
  if (!isAsaasWebhookPath(url.pathname)) return undefined;

  // 1. Healthcheck / Ping support for Asaas validation & monitor checks
  if (request.method === "GET" || request.method === "HEAD") {
    return jsonResponse(
      {
        status: "active",
        service: "asaas-webhook",
        endpoint: url.pathname,
        timestamp: new Date().toISOString(),
      },
      200,
    );
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }

  const webhookToken = getEnvValue(env, "ASAAS_WEBHOOK_TOKEN");
  const receivedToken =
    request.headers.get("asaas-access-token") ||
    request.headers.get("access-token") ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    url.searchParams.get("token");

  if (webhookToken) {
    if (!receivedToken || !tokensMatch(receivedToken, webhookToken)) {
      console.warn("Asaas webhook authentication rejected: missing or mismatched token.");
      return jsonResponse({ error: "unauthorized" }, 401);
    }
  }

  let payload: AsaasWebhookPayload;
  try {
    const rawBody = await request.text();
    if (!rawBody || rawBody.trim() === "") {
      return jsonResponse({ received: true, note: "empty_payload" }, 200);
    }
    payload = JSON.parse(rawBody) as AsaasWebhookPayload;
  } catch (parseErr) {
    console.error("Asaas webhook JSON parsing error:", parseErr);
    return jsonResponse({ received: true, error: "invalid_json_received" }, 200);
  }

  if (!payload.event) {
    return jsonResponse({ received: true, note: "no_event_specified" }, 200);
  }

  console.info("Asaas webhook received successfully:", {
    eventId: payload.id,
    event: payload.event,
    paymentId: payload.payment?.id,
    paymentStatus: payload.payment?.status,
    customer: payload.payment?.customer,
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

        const resendApiKey = getEnvValue(env, "RESEND_API_KEY");
        const resendFromEmail = getEnvValue(env, "RESEND_FROM_EMAIL");
        const siteUrl = getEnvValue(env, "SITE_URL") || getEnvValue(env, "VITE_SITE_URL") || url.origin;

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
          resendApiKey,
          resendFromEmail,
          loginUrl: siteUrl,
        });

        console.info("Account provisioned successfully via Asaas webhook:", provisionRes);
      } catch (provErr) {
        console.error("Error during webhook account provisioning:", provErr);
      }
    }
  } else if (event === "PAYMENT_OVERDUE" && payment?.subscription) {
    await updateSubscriptionStatus(payment.subscription, "past_due");
  } else if ((event === "SUBSCRIPTION_INACTIVATED" || event === "SUBSCRIPTION_DELETED") && payment?.subscription) {
    await updateSubscriptionStatus(payment.subscription, "cancelled");
  }

  return jsonResponse({ received: true, event: payload.event }, 200);
}

import {
  ResendClient,
  generateWelcomeEmailHtml,
  generatePasswordResetEmailHtml,
} from "./lib/resend";
import { createClient } from "@supabase/supabase-js";

function getAdminClient(env: unknown) {
  const supabaseUrl =
    getEnvValue(env, "SUPABASE_URL") ||
    getEnvValue(env, "VITE_SUPABASE_URL") ||
    "https://lyftfxlqngubskjqsbue.supabase.co";

  const serviceRoleKey =
    getEnvValue(env, "SUPABASE_SERVICE_ROLE_KEY") ||
    (typeof process !== "undefined" ? process.env['SUPABASE_SERVICE_ROLE_KEY'] : "");

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function isAuthorizedAdmin(request: Request, env: unknown): boolean {
  const adminSecret = getEnvValue(env, "ADMIN_SECRET_KEY") || getEnvValue(env, "ASAAS_WEBHOOK_TOKEN");
  const providedKey = request.headers.get("x-admin-key") || new URL(request.url).searchParams.get("adminKey");
  if (adminSecret && providedKey) {
    return tokensMatch(providedKey, adminSecret);
  }
  return false;
}

async function emailHandler(request: Request, env: unknown): Promise<Response | undefined> {
  const url = new URL(request.url);
  const isDev = typeof process !== "undefined" && process.env.NODE_ENV !== "production" && process.env['VITE_DEV'] === "true";

  // Welcome Email Preview Endpoint (Protected in production)
  if (url.pathname === "/api/email/preview" && request.method === "GET") {
    if (!isDev && !isAuthorizedAdmin(request, env)) {
      return jsonResponse({ error: "not_found" }, 404);
    }

    const html = generateWelcomeEmailHtml({
      fullName: url.searchParams.get("name") || "Daniel Diniz",
      firstName: (url.searchParams.get("name") || "Daniel").split(" ")[0] || "Daniel",
      email: url.searchParams.get("email") || "cliente@exemplo.com.br",
      password: "Nd7@" + Math.random().toString(36).slice(-8) + "!",
      isNewUser: true,
      planName: url.searchParams.get("plan") || "Trimestral",
      workspaceId: "nxs-exemplo",
      loginUrl: getEnvValue(env, "SITE_URL") || getEnvValue(env, "VITE_SITE_URL") || url.origin,
    });

    return new Response(html, {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "x-content-type-options": "nosniff",
        "x-frame-options": "DENY",
      },
    });
  }

  // Password Reset Email Preview Endpoint (Protected in production)
  if (url.pathname === "/api/email/preview-reset" && request.method === "GET") {
    if (!isDev && !isAuthorizedAdmin(request, env)) {
      return jsonResponse({ error: "not_found" }, 404);
    }

    const html = generatePasswordResetEmailHtml({
      fullName: url.searchParams.get("name") || "Daniel Diniz",
      firstName: (url.searchParams.get("name") || "Daniel").split(" ")[0] || "Daniel",
      email: url.searchParams.get("email") || "danieldiniz1999@yahoo.com.br",
      resetUrl: `${getEnvValue(env, "SITE_URL") || getEnvValue(env, "VITE_SITE_URL") || url.origin}/?mode=reset&token=exemplo-token-seguro`,
    });

    return new Response(html, {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "x-content-type-options": "nosniff",
        "x-frame-options": "DENY",
      },
    });
  }

  // Forgot Password Endpoint (Rate-limited, hardened against user enumeration and email bombing)
  if (url.pathname === "/api/auth/forgot-password" && request.method === "POST") {
    const clientIp = getClientIp(request);
    const forgotLimit = enforceRateLimit(`forgot:${clientIp}`, 3, 120_000);
    if (!forgotLimit.allowed) {
      return jsonResponse(
        { error: "Muitas solicitações recentes. Por segurança, aguarde alguns minutos antes de tentar novamente." },
        429,
        { "retry-after": String(forgotLimit.retryAfter || 120) }
      );
    }

    try {
      const body = (await request.json()) as { email?: string };
      const email = body.email?.trim().toLowerCase();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return jsonResponse({ error: "Informe um e-mail válido cadastrado." }, 400);
      }

      const siteUrl = getEnvValue(env, "SITE_URL") || getEnvValue(env, "VITE_SITE_URL") || url.origin;
      const redirectTo = `${siteUrl}/?reset_password=true`;

      let resetUrl: string | undefined;
      let fullName = "Cliente";

      try {
        const supabase = getAdminClient(env);
        const { data, error } = await supabase.auth.admin.generateLink({
          type: "recovery",
          email,
          options: { redirectTo },
        });

        if (error) {
          console.warn("Supabase generateLink info:", error.message);
        } else if (data?.properties?.action_link) {
          resetUrl = data.properties.action_link;
        }

        if (data?.user?.id) {
          const { data: userProfile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", data.user.id)
            .maybeSingle();

          if (userProfile?.full_name) {
            fullName = userProfile.full_name;
          }
        }
      } catch (adminErr) {
        console.warn("Admin recovery info:", adminErr);
      }

      // Only send an email if a legitimate recovery link was created for an existing user
      if (resetUrl) {
        const resendApiKey = getEnvValue(env, "RESEND_API_KEY");
        const resendFromEmail = getEnvValue(env, "RESEND_FROM_EMAIL");
        const resend = new ResendClient(resendApiKey, resendFromEmail);

        await resend.sendPasswordResetEmail({
          to: email,
          fullName,
          email,
          resetUrl,
        });
      }

      // Return a constant generic response to prevent account enumeration attacks
      return jsonResponse(
        {
          success: true,
          message: "Se o e-mail estiver cadastrado em nossa base, enviamos as instruções de redefinição para sua caixa de entrada.",
        },
        200,
      );
    } catch (err: unknown) {
      console.error("Forgot password error:", err);
      return jsonResponse(
        { error: "Erro ao processar solicitação de recuperação de senha." },
        500,
      );
    }
  }

  // Email Test/Manual Send Endpoint (Strictly protected against open relay exploitation)
  if (url.pathname === "/api/email/send-test" && request.method === "POST") {
    if (!isAuthorizedAdmin(request, env)) {
      console.warn("Blocked unauthorized access attempt to /api/email/send-test.");
      return jsonResponse({ error: "forbidden" }, 403);
    }

    try {
      const body = (await request.json()) as {
        to: string;
        fullName?: string;
        planName?: string;
        password?: string;
        type?: "welcome" | "reset";
      };

      if (!body.to) {
        return jsonResponse({ error: "Campo 'to' (e-mail de destino) é obrigatório." }, 400);
      }

      const resendApiKey = getEnvValue(env, "RESEND_API_KEY");
      const resendFromEmail = getEnvValue(env, "RESEND_FROM_EMAIL");
      const resend = new ResendClient(resendApiKey, resendFromEmail);

      const siteUrl = getEnvValue(env, "SITE_URL") || getEnvValue(env, "VITE_SITE_URL") || url.origin;

      let result;
      if (body.type === "reset") {
        result = await resend.sendPasswordResetEmail({
          to: body.to,
          fullName: body.fullName || "Daniel Diniz",
          email: body.to,
          resetUrl: `${siteUrl}/?mode=reset&token=token-teste`,
        });
      } else {
        result = await resend.sendWelcomeEmail({
          to: body.to,
          fullName: body.fullName || "Daniel Diniz",
          email: body.to,
          password: body.password || "Nd7@" + Math.random().toString(36).slice(-8) + "!",
          isNewUser: true,
          planName: body.planName || "Pro Trimestral",
          loginUrl: siteUrl,
        });
      }

      return jsonResponse({ success: true, message: "E-mail enviado com sucesso via Resend!", result }, 200);
    } catch (err: unknown) {
      return jsonResponse({ error: err instanceof Error ? err.message : "Erro ao enviar e-mail." }, 500);
    }
  }

  return undefined;
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
      const emailRes = await emailHandler(request, env);
      if (emailRes) return emailRes;

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
