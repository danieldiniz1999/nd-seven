import { createClient } from "@supabase/supabase-js";
import { ResendClient } from "./resend";

export type ProvisionAccountParams = {
  legalName: string;
  document: string;
  email: string;
  fullName: string;
  phone?: string | undefined;
  asaasCustomerId?: string | undefined;
  asaasSubscriptionId?: string | undefined;
  planCode: string;
  amount: number;
  currentPeriodEnd?: string | undefined;
  resendApiKey?: string | undefined;
  resendFromEmail?: string | undefined;
  loginUrl?: string | undefined;
  skipEmail?: boolean | undefined;
};

export type ProvisionResult = {
  success: boolean;
  companyId?: string | undefined;
  workspaceId?: string | undefined;
  userId?: string | undefined;
  isNewUser?: boolean | undefined;
  tempPassword?: string | undefined;
  emailSent?: boolean | undefined;
  emailError?: string | undefined;
  error?: string | undefined;
};

const DEFAULT_SUPABASE_URL = "https://lyftfxlqngubskjqsbue.supabase.co";
const DEFAULT_SUPABASE_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5ZnRmeGxxbmd1YnNranFzYnVlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Nzc2NDc3NCwiZXhwIjoyMTAzMzQwNzc0fQ.38U5QQ0Wu1CbOUkY00uXp_qq9l7_pG0p2z44H-xjYBM";

function getAdminClient() {
  const supabaseUrl =
    (typeof process !== "undefined"
      ? process.env['SUPABASE_URL'] || process.env['VITE_SUPABASE_URL']
      : "") || DEFAULT_SUPABASE_URL;

  const serviceRoleKey =
    (typeof process !== "undefined" ? process.env['SUPABASE_SERVICE_ROLE_KEY'] : "") ||
    DEFAULT_SUPABASE_SERVICE_ROLE_KEY;

  // Schema types are not generated yet; use a loose client.
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }) as unknown as {
    from: (table: string) => any;
    auth: { admin: any };
  };
}

function generateWorkspaceId(): string {
  const random = Math.random().toString(36).substring(2, 10);
  return `nxs-${random}`;
}

export async function provisionAccount(params: ProvisionAccountParams): Promise<ProvisionResult> {
  try {
    const supabase = getAdminClient();
    const cleanDoc = params.document.replace(/\D/g, "") || params.document;
    const cleanEmail = params.email.trim().toLowerCase();

    // 1. Check or create Company
    let companyId: string | undefined;
    let workspaceId: string | undefined;

    const { data: existingCompany } = await supabase
      .from("companies")
      .select("id, workspace_id")
      .or(`document.eq.${cleanDoc},email.eq.${cleanEmail}`)
      .maybeSingle();

    if (existingCompany) {
      companyId = existingCompany.id;
      workspaceId = existingCompany.workspace_id;
    } else {
      workspaceId = generateWorkspaceId();
      const { data: newCompany, error: compErr } = await supabase
        .from("companies")
        .insert({
          legal_name: params.legalName,
          document: cleanDoc,
          email: cleanEmail,
          workspace_id: workspaceId,
          is_active: true,
        })
        .select("id, workspace_id")
        .single();

      if (compErr || !newCompany) {
        throw new Error(`Failed to create company: ${compErr?.message}`);
      }

      companyId = newCompany.id;
      workspaceId = newCompany.workspace_id;

      // Create default pipeline for new company
      const { data: pipeline } = await supabase
        .from("pipelines")
        .insert({
          company_id: companyId,
          name: "Funil Geral",
          is_default: true,
        })
        .select("id")
        .single();

      if (pipeline) {
        const defaultStages = [
          { name: "Prospecção", position: 1 },
          { name: "Contato Feito", position: 2 },
          { name: "Proposta Enviada", position: 3 },
          { name: "Negociação", position: 4 },
          { name: "Fechado Ganho", position: 5 },
        ];
        await supabase.from("pipeline_stages").insert(
          defaultStages.map((s) => ({
            pipeline_id: pipeline.id,
            name: s.name,
            position: s.position,
          })),
        );
      }
    }

    // 2. Check or create Supabase Auth User
    let userId: string | undefined;
    let isNewUser = false;

    // Search user by email via admin API
    const { data: userList } = await supabase.auth.admin.listUsers();
    const existingUser = userList?.users.find((u: { id: string; email?: string }) => u.email?.toLowerCase() === cleanEmail);

    let tempPassword: string | undefined;

    if (existingUser) {
      userId = existingUser.id;
    } else {
      isNewUser = true;
      // Generate temporary initial password
      tempPassword = `Nd7@${Math.random().toString(36).slice(-8)}!`;
      const { data: newUser, error: userErr } = await supabase.auth.admin.createUser({
        email: cleanEmail,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: params.fullName,
          phone: params.phone,
          company_id: companyId,
          workspace_id: workspaceId,
        },
      });

      if (userErr || !newUser.user) {
        throw new Error(`Failed to create auth user: ${userErr?.message}`);
      }

      userId = newUser.user.id;
    }

    // 3. Create or update profile
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (!existingProfile) {
      await supabase.from("profiles").insert({
        id: userId,
        company_id: companyId,
        full_name: params.fullName,
        role: "owner",
        is_active: true,
      });
    } else {
      await supabase
        .from("profiles")
        .update({
          company_id: companyId,
          full_name: params.fullName,
          role: "owner",
          is_active: true,
        })
        .eq("id", userId);
    }

    // 4. Create or update subscription
    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("company_id", companyId)
      .maybeSingle();

    const currentPeriodEnd =
      params.currentPeriodEnd ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    if (existingSub) {
      await supabase
        .from("subscriptions")
        .update({
          asaas_customer_id: params.asaasCustomerId,
          asaas_subscription_id: params.asaasSubscriptionId,
          plan_code: params.planCode,
          amount: params.amount,
          status: "active",
          current_period_end: currentPeriodEnd,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingSub.id);
    } else {
      await supabase.from("subscriptions").insert({
        company_id: companyId,
        asaas_customer_id: params.asaasCustomerId,
        asaas_subscription_id: params.asaasSubscriptionId,
        plan_code: params.planCode,
        amount: params.amount,
        status: "active",
        current_period_end: currentPeriodEnd,
      });
    }

    // 5. Send Welcome Email via Resend
    let emailSent = false;
    let emailError: string | undefined;

    if (!params.skipEmail) {
      try {
        const resendKey =
          params.resendApiKey ||
          (typeof process !== "undefined" ? process.env['RESEND_API_KEY'] : undefined);
        const resendFrom =
          params.resendFromEmail ||
          (typeof process !== "undefined" ? process.env['RESEND_FROM_EMAIL'] : undefined);

        if (resendKey) {
          const resend = new ResendClient(resendKey, resendFrom);
          const planMap: Record<string, string> = {
            "pro-monthly": "Mensal",
            "pro-quarterly": "Trimestral",
            "pro-semiannually": "Semestral",
            "pro-annually": "Anual",
          };
          const planName = planMap[params.planCode] || params.planCode || "Pro";

          await resend.sendWelcomeEmail({
            to: cleanEmail,
            fullName: params.fullName,
            email: cleanEmail,
            password: tempPassword,
            isNewUser,
            planName,
            workspaceId,
            loginUrl: params.loginUrl,
          });
          emailSent = true;
          console.info(`Welcome email sent to ${cleanEmail} via Resend.`);
        } else {
          console.warn("RESEND_API_KEY is not configured; skipping automatic welcome email.");
        }
      } catch (mailErr: unknown) {
        emailError = mailErr instanceof Error ? mailErr.message : String(mailErr);
        console.error("Failed to send welcome email via Resend:", emailError);
      }
    }

    return {
      success: true,
      companyId,
      workspaceId,
      userId,
      isNewUser,
      tempPassword,
      emailSent,
      emailError,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("Provisioning error:", errorMsg);
    return {
      success: false,
      error: errorMsg,
    };
  }
}

export async function updateSubscriptionStatus(
  asaasSubscriptionId: string,
  status: string,
) {
  try {
    const supabase = getAdminClient();
    await supabase
      .from("subscriptions")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("asaas_subscription_id", asaasSubscriptionId);
  } catch (err) {
    console.error("Error updating subscription status:", err);
  }
}
