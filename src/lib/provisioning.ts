import { createClient } from "@supabase/supabase-js";

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
};

export type ProvisionResult = {
  success: boolean;
  companyId?: string | undefined;
  workspaceId?: string | undefined;
  userId?: string | undefined;
  isNewUser?: boolean | undefined;
  error?: string | undefined;
};

function getAdminClient() {
  const supabaseUrl =
    (typeof process !== "undefined"
      ? process.env['SUPABASE_URL'] || process.env['VITE_SUPABASE_URL']
      : "") || "https://lyftfxlqngubskjqsbue.supabase.co";

  const serviceRoleKey =
    typeof process !== "undefined" ? process.env['SUPABASE_SERVICE_ROLE_KEY'] : "";

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");
  }

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
    const existingUser = userList?.users.find((u) => u.email?.toLowerCase() === cleanEmail);

    if (existingUser) {
      userId = existingUser.id;
    } else {
      isNewUser = true;
      // Generate temporary initial password
      const tempPassword = `Nd7@${Math.random().toString(36).slice(-8)}!`;
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

    return {
      success: true,
      companyId,
      workspaceId,
      userId,
      isNewUser,
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
