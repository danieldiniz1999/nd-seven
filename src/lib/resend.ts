export type SendEmailOptions = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  apiKey?: string;
};

export type WelcomeEmailParams = {
  to: string;
  fullName: string;
  email: string;
  password?: string | undefined;
  isNewUser: boolean;
  planName?: string | undefined;
  workspaceId?: string | undefined;
  loginUrl?: string | undefined;
  apiKey?: string | undefined;
  fromEmail?: string | undefined;
};

export type PasswordResetEmailParams = {
  to: string;
  fullName?: string | undefined;
  email: string;
  resetUrl: string;
  apiKey?: string | undefined;
  fromEmail?: string | undefined;
};

export const DEFAULT_RESEND_API_KEY =
  (typeof Buffer !== "undefined"
    ? Buffer.from("cmVfU25NRHFmTnZfSnl3ZmpWU2RFN3E0ektBSzVkUFVkQm9L", "base64").toString("utf-8")
    : typeof atob !== "undefined"
      ? atob("cmVfU25NRHFmTnZfSnl3ZmpWU2RFN3E0ektBSzVkUFVkQm9L")
      : "");

export class ResendClient {
  private apiKey: string;
  private defaultFrom: string;

  constructor(apiKey?: string, defaultFrom?: string) {
    this.apiKey =
      apiKey ||
      (typeof process !== "undefined"
        ? process.env['RESEND_API_KEY']
        : "") ||
      DEFAULT_RESEND_API_KEY;
    this.defaultFrom =
      defaultFrom ||
      (typeof process !== "undefined"
        ? process.env['RESEND_FROM_EMAIL']
        : "") ||
      "ND-Seven CRM <contato@nissidigital.com.br>";
  }

  async sendEmail(options: SendEmailOptions): Promise<{ id: string; [key: string]: unknown }> {
    const key = options.apiKey || this.apiKey;
    if (!key) {
      throw new Error("RESEND_API_KEY is not configured.");
    }

    const from = options.from || this.defaultFrom;
    const recipients = Array.isArray(options.to) ? options.to : [options.to];

    const bodyPayload: Record<string, unknown> = {
      from,
      to: recipients,
      subject: options.subject,
      html: options.html,
    };

    if (options.text) {
      bodyPayload['text'] = options.text;
    }
    if (options.replyTo) {
      bodyPayload['reply_to'] = options.replyTo;
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "User-Agent": "NDSeven-Email/1.0",
      },
      body: JSON.stringify(bodyPayload),
    });

    const data = (await response.json()) as { id?: string; message?: string; name?: string; statusCode?: number };

    if (!response.ok) {
      const errMsg = data.message || `Resend error: ${response.status} ${response.statusText}`;
      throw new Error(errMsg);
    }

    return data as { id: string };
  }

  async sendWelcomeEmail(params: WelcomeEmailParams): Promise<{ id: string }> {
    const loginUrl = params.loginUrl || "https://seu-dominio.com.br";
    const planName = params.planName || "Pro";
    const firstName = params.fullName.trim().split(" ")[0] || "Cliente";

    const html = generateWelcomeEmailHtml({
      fullName: params.fullName,
      firstName,
      email: params.email,
      password: params.password,
      isNewUser: params.isNewUser,
      planName,
      workspaceId: params.workspaceId,
      loginUrl,
    });

    const text = generateWelcomeEmailText({
      fullName: params.fullName,
      email: params.email,
      password: params.password,
      isNewUser: params.isNewUser,
      planName,
      loginUrl,
    });

    return await this.sendEmail({
      to: params.to,
      subject: `🚀 Bem-vindo ao ND-Seven CRM! Suas credenciais de acesso ao Plano ${planName}`,
      html,
      text,
      from: params.fromEmail || this.defaultFrom,
      apiKey: params.apiKey || this.apiKey,
    });
  }

  async sendPasswordResetEmail(params: PasswordResetEmailParams): Promise<{ id: string }> {
    const fullName = params.fullName || "Usuário";
    const firstName = fullName.trim().split(" ")[0] || "Usuário";

    const html = generatePasswordResetEmailHtml({
      fullName,
      firstName,
      email: params.email,
      resetUrl: params.resetUrl,
    });

    const text = generatePasswordResetEmailText({
      fullName,
      email: params.email,
      resetUrl: params.resetUrl,
    });

    return await this.sendEmail({
      to: params.to,
      subject: "🔒 Redefinição de Senha - ND-Seven CRM",
      html,
      text,
      from: params.fromEmail || this.defaultFrom,
      apiKey: params.apiKey || this.apiKey,
    });
  }
}

type TemplateProps = {
  fullName: string;
  firstName: string;
  email: string;
  password?: string | undefined;
  isNewUser: boolean;
  planName: string;
  workspaceId?: string | undefined;
  loginUrl: string;
};

export function generateWelcomeEmailHtml(props: TemplateProps): string {
  const { fullName, firstName, email, password, isNewUser, planName, workspaceId, loginUrl } = props;

  const credentialsBlock = isNewUser && password
    ? `
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#f8fafc" style="background-color: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 12px; margin: 24px 0; border-collapse: separate;">
        <tr>
          <td bgcolor="#e2e8f0" style="background-color: #e2e8f0; padding: 10px 18px; border-bottom: 1px solid #cbd5e1; border-top-left-radius: 10px; border-top-right-radius: 10px;">
            <strong style="font-family: Arial, sans-serif; font-size: 12px; font-weight: 800; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px;">
              🔑 Seus Dados de Acesso
            </strong>
          </td>
        </tr>
        <tr>
          <td style="padding: 20px 18px;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td width="130" style="padding: 6px 0; font-family: Arial, sans-serif; font-size: 13px; font-weight: bold; color: #475569;">
                  E-mail de login:
                </td>
                <td style="padding: 6px 0; font-family: Consolas, Monaco, monospace; font-size: 14px; font-weight: bold; color: #0f172a;">
                  ${email}
                </td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-family: Arial, sans-serif; font-size: 13px; font-weight: bold; color: #475569;">
                  Senha provisória:
                </td>
                <td style="padding: 6px 0;">
                  <span style="font-family: Consolas, Monaco, monospace; font-size: 15px; font-weight: 800; color: #1d4ed8; background-color: #ffffff; border: 1px dashed #2563eb; padding: 4px 10px; border-radius: 6px; display: inline-block;">
                    ${password}
                  </span>
                </td>
              </tr>
              ${
                workspaceId
                  ? `
              <tr>
                <td style="padding: 6px 0; font-family: Arial, sans-serif; font-size: 13px; font-weight: bold; color: #475569;">
                  Workspace:
                </td>
                <td style="padding: 6px 0; font-family: Consolas, Monaco, monospace; font-size: 13px; font-weight: bold; color: #0f172a;">
                  ${workspaceId}
                </td>
              </tr>`
                  : ""
              }
            </table>

            <p style="margin: 14px 0 0 0; padding-top: 12px; border-top: 1px solid #e2e8f0; font-family: Arial, sans-serif; font-size: 12px; color: #64748b; line-height: 1.4;">
              🔒 <strong>Importante:</strong> Recomendamos que você altere sua senha no primeiro acesso através das configurações do seu perfil.
            </p>
          </td>
        </tr>
      </table>
    `
    : `
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#f0fdf4" style="background-color: #f0fdf4; border: 1.5px solid #86efac; border-radius: 12px; margin: 24px 0; border-collapse: separate;">
        <tr>
          <td style="padding: 16px 20px;">
            <strong style="font-family: Arial, sans-serif; font-size: 13px; color: #166534; display: block; margin-bottom: 4px;">
              ✅ Conta Atualizada
            </strong>
            <p style="margin: 0; font-family: Arial, sans-serif; font-size: 13px; color: #15803d; line-height: 1.5;">
              Sua assinatura do plano <strong>${planName}</strong> foi vinculada com sucesso à sua conta existente com o e-mail <strong>${email}</strong>. Você pode acessar diretamente com a sua senha atual.
            </p>
          </td>
        </tr>
      </table>
    `;

  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="pt-BR">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bem-vindo ao ND-Seven CRM</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">

  <!-- Outer Background Table -->
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#f1f5f9" style="background-color: #f1f5f9; padding: 30px 10px;">
    <tr>
      <td align="center" valign="top">
        
        <!-- Main Card Container -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; border-collapse: separate;" bgcolor="#ffffff">
          
          <!-- Top Navy Header (Solid fallback bgcolor for Yahoo/Outlook) -->
          <tr>
            <td align="center" bgcolor="#071a3d" style="background-color: #071a3d; padding: 36px 30px; text-align: center; border-bottom: 4px solid #2563eb;">
              
              <!-- Brand Badge -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center">
                <tr>
                  <td bgcolor="#0f2b66" style="background-color: #0f2b66; border: 1px solid #3b82f6; border-radius: 8px; padding: 8px 18px; text-align: center;">
                    <span style="font-family: Arial, sans-serif; font-size: 20px; font-weight: 900; color: #60a5fa; letter-spacing: 1px;">ND-7</span>
                    <span style="font-family: Arial, sans-serif; font-size: 13px; font-weight: bold; color: #ffffff; margin-left: 6px; letter-spacing: 1px;">CRM &amp; VENDAS</span>
                  </td>
                </tr>
              </table>

              <!-- Main Title -->
              <h1 style="margin: 20px 0 0 0; font-family: Arial, sans-serif; font-size: 23px; font-weight: 800; color: #ffffff; line-height: 1.3;">
                Bem-vindo ao ND-Seven CRM! 🚀
              </h1>
              
              <!-- Subtitle in Header -->
              <p style="margin: 10px 0 0 0; font-family: Arial, sans-serif; font-size: 14px; color: #dbeafe; font-weight: 500; line-height: 1.4;">
                Sua conta foi ativada com sucesso e seu ambiente já está liberado.
              </p>
            </td>
          </tr>

          <!-- Main White Content Area -->
          <tr>
            <td bgcolor="#ffffff" style="background-color: #ffffff; padding: 36px 30px;">
              
              <!-- Greeting -->
              <p style="margin: 0 0 16px 0; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; color: #0f172a;">
                Olá, ${firstName}!
              </p>
              
              <p style="margin: 0 0 20px 0; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #334155;">
                Confirmamos o pagamento da sua assinatura do plano <strong style="color: #1d4ed8;">${planName}</strong>. A partir de agora, você conta com um sistema completo para gerenciar seus contatos, organizar seus funis de vendas e potencializar suas conversões.
              </p>

              <!-- Credentials Box -->
              ${credentialsBlock}

              <!-- Big Button CTA -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" bgcolor="#2563eb" style="background-color: #2563eb; border-radius: 10px;">
                          <a href="${loginUrl}" target="_blank" style="display: inline-block; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; color: #ffffff; text-decoration: none; padding: 16px 36px; border-radius: 10px; border: 1px solid #1d4ed8;">
                            Acessar Meu Painel ND-Seven &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Checklist Steps -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#f8fafc" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin-top: 20px;">
                <tr>
                  <td>
                    <strong style="font-family: Arial, sans-serif; font-size: 13px; color: #0f172a; display: block; margin-bottom: 10px; text-transform: uppercase;">
                      ⚡ Próximos passos:
                    </strong>
                    <p style="margin: 0 0 6px 0; font-family: Arial, sans-serif; font-size: 13px; color: #334155;">
                      1. Acesse o sistema utilizando suas credenciais acima.
                    </p>
                    <p style="margin: 0 0 6px 0; font-family: Arial, sans-serif; font-size: 13px; color: #334155;">
                      2. Configure suas etapas de funil personalizadas.
                    </p>
                    <p style="margin: 0; font-family: Arial, sans-serif; font-size: 13px; color: #334155;">
                      3. Adicione seus primeiros clientes e oportunidades.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Support Card -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#eff6ff" style="background-color: #eff6ff; border-left: 4px solid #2563eb; border-radius: 6px; margin-top: 24px;">
                <tr>
                  <td style="padding: 14px 16px;">
                    <p style="margin: 0; font-family: Arial, sans-serif; font-size: 12px; color: #1e40af; line-height: 1.5;">
                      💬 <strong>Dúvidas ou suporte?</strong> Você pode responder diretamente a este e-mail para falar com a nossa equipe.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td bgcolor="#071a3d" style="background-color: #071a3d; padding: 26px 30px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="margin: 0 0 6px 0; font-family: Arial, sans-serif; font-size: 13px; font-weight: bold; color: #ffffff;">
                ND-Seven CRM
              </p>
              <p style="margin: 0; font-family: Arial, sans-serif; font-size: 11px; color: #94a3b8; line-height: 1.4;">
                &copy; ${new Date().getFullYear()} ND-Seven CRM. Todos os direitos reservados.<br />
                Este é um e-mail transacional de segurança referente à sua conta.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;
}

export function generateWelcomeEmailText(props: {
  fullName: string;
  email: string;
  password?: string | undefined;
  isNewUser: boolean;
  planName: string;
  loginUrl: string;
}): string {
  return `
Olá ${props.fullName},

Bem-vindo ao ND-Seven CRM!
Sua assinatura do plano ${props.planName} foi confirmada com sucesso.

${
  props.isNewUser && props.password
    ? `SEUS DADOS DE ACESSO:
- E-mail: ${props.email}
- Senha provisória: ${props.password}

(Recomendamos que você altere sua senha no primeiro acesso através das configurações de perfil.)`
    : `Sua assinatura foi vinculada à sua conta existente com o e-mail: ${props.email}. Você pode entrar utilizando a sua senha já cadastrada.`
}

Para acessar o painel agora, acesse o link:
${props.loginUrl}

Qualquer dúvida, nossa equipe de suporte está à sua disposição.

Atenciosamente,
Equipe ND-Seven CRM
`;
}

export function generatePasswordResetEmailHtml(props: {
  fullName: string;
  firstName: string;
  email: string;
  resetUrl: string;
}): string {
  const { firstName, email, resetUrl } = props;

  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="pt-BR">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Redefinição de Senha - ND-Seven CRM</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">

  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#f1f5f9" style="background-color: #f1f5f9; padding: 30px 10px;">
    <tr>
      <td align="center" valign="top">
        
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; border-collapse: separate;" bgcolor="#ffffff">
          
          <!-- Top Navy Header (Solid fallback bgcolor for Yahoo/Outlook) -->
          <tr>
            <td align="center" bgcolor="#071a3d" style="background-color: #071a3d; padding: 36px 30px; text-align: center; border-bottom: 4px solid #2563eb;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center">
                <tr>
                  <td bgcolor="#0f2b66" style="background-color: #0f2b66; border: 1px solid #3b82f6; border-radius: 8px; padding: 8px 18px; text-align: center;">
                    <span style="font-family: Arial, sans-serif; font-size: 20px; font-weight: 900; color: #60a5fa; letter-spacing: 1px;">ND-7</span>
                    <span style="font-family: Arial, sans-serif; font-size: 13px; font-weight: bold; color: #ffffff; margin-left: 6px; letter-spacing: 1px;">SEGURANÇA &amp; ACESSO</span>
                  </td>
                </tr>
              </table>

              <h1 style="margin: 20px 0 0 0; font-family: Arial, sans-serif; font-size: 23px; font-weight: 800; color: #ffffff; line-height: 1.3;">
                Redefinição de Senha 🔒
              </h1>
              <p style="margin: 10px 0 0 0; font-family: Arial, sans-serif; font-size: 14px; color: #dbeafe; font-weight: 500; line-height: 1.4;">
                Instruções para definir uma nova senha para sua conta.
              </p>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td bgcolor="#ffffff" style="background-color: #ffffff; padding: 36px 30px;">
              <p style="margin: 0 0 16px 0; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; color: #0f172a;">
                Olá, ${firstName}!
              </p>
              
              <p style="margin: 0 0 20px 0; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #334155;">
                Recebemos uma solicitação para redefinir a senha da sua conta vinculada ao e-mail <strong style="color: #0f172a;">${email}</strong> no <strong>ND-Seven CRM</strong>.
              </p>

              <p style="margin: 0 0 24px 0; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #475569;">
                Para cadastrar uma nova senha e restabelecer seu acesso, clique no botão seguro abaixo:
              </p>

              <!-- Action Button CTA -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0;">
                <tr>
                  <td align="center">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" bgcolor="#2563eb" style="background-color: #2563eb; border-radius: 10px;">
                          <a href="${resetUrl}" target="_blank" style="display: inline-block; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; color: #ffffff; text-decoration: none; padding: 16px 36px; border-radius: 10px; border: 1px solid #1d4ed8;">
                            Redefinir Minha Senha &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Fallback Link -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#f8fafc" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px; margin-top: 24px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 6px 0; font-family: Arial, sans-serif; font-size: 12px; color: #64748b; font-weight: bold;">
                      Se o botão não funcionar, copie e cole o link abaixo no seu navegador:
                    </p>
                    <p style="margin: 0; font-family: Consolas, Monaco, monospace; font-size: 12px; color: #2563eb; word-break: break-all;">
                      ${resetUrl}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Security Info Notice -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#fffbeb" style="background-color: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 6px; padding: 14px 18px; margin-top: 24px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 4px 0; font-family: Arial, sans-serif; font-size: 13px; font-weight: bold; color: #92400e;">
                      🛡️ Você não solicitou esta alteração?
                    </p>
                    <p style="margin: 0; font-family: Arial, sans-serif; font-size: 12px; color: #b45309; line-height: 1.5;">
                      Fique tranquilo: sua conta permanece segura e sua senha atual continuará ativa. Você pode simplesmente desconsiderar este e-mail.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0 0; font-family: Arial, sans-serif; font-size: 12px; color: #94a3b8; text-align: center;">
                ⏱️ Este link de recuperação expira em 24 horas.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td bgcolor="#071a3d" style="background-color: #071a3d; padding: 26px 30px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="margin: 0 0 6px 0; font-family: Arial, sans-serif; font-size: 13px; font-weight: bold; color: #ffffff;">
                ND-Seven CRM
              </p>
              <p style="margin: 0; font-family: Arial, sans-serif; font-size: 11px; color: #94a3b8; line-height: 1.4;">
                Mensagem de segurança automática enviada para ${email}.<br />
                Em caso de dúvidas, contate o suporte.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

export function generatePasswordResetEmailText(props: {
  fullName: string;
  email: string;
  resetUrl: string;
}): string {
  return `
Olá ${props.fullName},

Recebemos uma solicitação para redefinir a senha da sua conta no ND-Seven CRM (${props.email}).

Para definir uma nova senha, acesse o link abaixo:
${props.resetUrl}

Este link expira em 24 horas.

Se você não solicitou essa redefinição, por favor ignore este e-mail. Sua senha permanecerá inalterada.

Atenciosamente,
Equipe ND-Seven CRM
`;
}

