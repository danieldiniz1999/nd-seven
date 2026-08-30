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
  password?: string;
  isNewUser: boolean;
  planName?: string;
  workspaceId?: string;
  loginUrl?: string;
  apiKey?: string;
  fromEmail?: string;
};

export type PasswordResetEmailParams = {
  to: string;
  fullName?: string;
  email: string;
  resetUrl: string;
  apiKey?: string;
  fromEmail?: string;
};

export class ResendClient {
  private apiKey: string;
  private defaultFrom: string;

  constructor(apiKey?: string, defaultFrom?: string) {
    this.apiKey =
      apiKey ||
      (typeof process !== "undefined"
        ? process.env['RESEND_API_KEY']
        : "") ||
      "";
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
      <div style="background: linear-gradient(180deg, #f0f7ff 0%, #e6f0fa 100%); border: 1px solid #c7dcf7; border-radius: 12px; padding: 24px; margin: 28px 0; text-align: left;">
        <div style="display: flex; align-items: center; margin-bottom: 16px;">
          <span style="display: inline-block; background-color: #2563eb; color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; padding: 4px 10px; border-radius: 6px;">
            Dados de Acesso
          </span>
        </div>
        
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 8px;">
          <tr>
            <td style="padding: 6px 0; color: #475569; font-size: 14px; font-weight: 600; width: 130px;">E-mail de login:</td>
            <td style="padding: 6px 0; color: #0f172a; font-size: 15px; font-weight: 700; font-family: monospace;">${email}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #475569; font-size: 14px; font-weight: 600;">Senha provisória:</td>
            <td style="padding: 6px 0; color: #1e40af; font-size: 16px; font-weight: 800; font-family: monospace; background: #ffffff; border: 1px dashed #93c5fd; border-radius: 6px; padding: 4px 8px; display: inline-block;">${password}</td>
          </tr>
          ${
            workspaceId
              ? `
          <tr>
            <td style="padding: 6px 0; color: #475569; font-size: 14px; font-weight: 600;">Workspace:</td>
            <td style="padding: 6px 0; color: #0f172a; font-size: 14px; font-weight: 600;">${workspaceId}</td>
          </tr>`
              : ""
          }
        </table>

        <p style="margin: 16px 0 0 0; font-size: 12px; color: #64748b; line-height: 1.5;">
          🔒 <strong>Dica de Segurança:</strong> Por motivos de proteção, recomendamos que você altere sua senha após realizar o primeiro acesso através das configurações de perfil.
        </p>
      </div>
    `
    : `
      <div style="background: linear-gradient(180deg, #f0fdf4 0%, #dcfce7 100%); border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: left;">
        <span style="display: inline-block; background-color: #16a34a; color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; padding: 4px 10px; border-radius: 6px; margin-bottom: 12px;">
          Conta Atualizada
        </span>
        <p style="margin: 8px 0 0 0; color: #166534; font-size: 14px; line-height: 1.5;">
          Sua assinatura do plano <strong>${planName}</strong> foi vinculada com sucesso à sua conta existente com o e-mail <strong>${email}</strong>. Você pode acessar diretamente com a sua senha atual.
        </p>
      </div>
    `;

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bem-vindo ao ND-Seven CRM</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03); border: 1px solid #e2e8f0;">
          
          <!-- Header with Brand Accent -->
          <tr>
            <td style="background: linear-gradient(135deg, #071a3d 0%, #0c2b66 50%, #1e40af 100%); padding: 36px 32px; text-align: center;">
              <!-- Brand Title / Badge -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center">
                <tr>
                  <td style="background: rgba(255, 255, 255, 0.12); backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.2); padding: 8px 20px; border-radius: 9999px;">
                    <span style="color: #60a5fa; font-weight: 900; font-size: 20px; letter-spacing: 1px;">ND-7</span>
                    <span style="color: #ffffff; font-weight: 700; font-size: 16px; margin-left: 6px; letter-spacing: 0.5px;">CRM & GESTÃO</span>
                  </td>
                </tr>
              </table>
              <h1 style="margin: 20px 0 0 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">
                Tudo pronto para acelerar suas vendas! 🚀
              </h1>
              <p style="margin: 8px 0 0 0; color: #bfdbfe; font-size: 15px; font-weight: 400;">
                Seu ambiente exclusivo já está liberado e configurado.
              </p>
            </td>
          </tr>

          <!-- Main Body Content -->
          <tr>
            <td style="padding: 36px 32px;">
              <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #334155;">
                Olá, <strong>${firstName}</strong>!
              </p>
              
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #475569;">
                É um enorme prazer ter você conosco! Confirmamos o pagamento da sua assinatura do plano <span style="background-color: #dbeafe; color: #1e40af; font-weight: 700; padding: 2px 8px; border-radius: 4px;">${planName}</span>.
              </p>

              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #475569;">
                A partir de agora você tem à disposição um ecossistema completo para gestão de leads, automação comercial, funis de atendimento e acompanhamento de métricas em tempo real.
              </p>

              <!-- Credentials Card -->
              ${credentialsBlock}

              <!-- Action Button CTA -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 32px 0 24px 0;">
                <tr>
                  <td align="center">
                    <a href="${loginUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; font-size: 16px; font-weight: 700; text-decoration: none; padding: 16px 36px; border-radius: 10px; box-shadow: 0 4px 14px 0 rgba(37, 99, 235, 0.39); text-align: center;">
                      Acessar Meu Painel ND-Seven &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Steps & Help Box -->
              <div style="border-top: 1px solid #f1f5f9; padding-top: 24px; margin-top: 24px;">
                <h3 style="margin: 0 0 14px 0; font-size: 15px; font-weight: 700; color: #0f172a;">
                  ⚡ O que fazer agora?
                </h3>
                <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 14px; line-height: 1.7;">
                  <li style="margin-bottom: 6px;">Faça login com seu e-mail e senha no link acima.</li>
                  <li style="margin-bottom: 6px;">Personalize o nome da sua empresa e dados do perfil.</li>
                  <li style="margin-bottom: 6px;">Organize suas etapas de funil para receber seus primeiros contatos.</li>
                </ul>
              </div>

              <!-- Support Note -->
              <div style="margin-top: 28px; background-color: #f8fafc; border-radius: 8px; padding: 14px 18px; border: 1px solid #e2e8f0;">
                <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">
                  💬 <strong>Dúvidas ou suporte?</strong> Responda a este e-mail ou fale diretamente com a nossa equipe de atendimento. Estamos prontos para te ajudar a ter os melhores resultados.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0b1329; padding: 28px 32px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 13px; font-weight: 600;">
                ND-Seven CRM &copy; ${new Date().getFullYear()} - Plataforma de Vendas e Gestão
              </p>
              <p style="margin: 0; color: #64748b; font-size: 11px; line-height: 1.4;">
                Você recebeu este e-mail porque contratou uma assinatura no ND-Seven.<br>
                Este é um e-mail transacional de segurança e acesso.
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
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redefinição de Senha - ND-Seven CRM</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03); border: 1px solid #e2e8f0;">
          
          <!-- Header with Brand Accent -->
          <tr>
            <td style="background: linear-gradient(135deg, #071a3d 0%, #0c2b66 50%, #1e40af 100%); padding: 36px 32px; text-align: center;">
              <!-- Brand Title / Badge -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center">
                <tr>
                  <td style="background: rgba(255, 255, 255, 0.12); backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.2); padding: 8px 20px; border-radius: 9999px;">
                    <span style="color: #60a5fa; font-weight: 900; font-size: 20px; letter-spacing: 1px;">ND-7</span>
                    <span style="color: #ffffff; font-weight: 700; font-size: 16px; margin-left: 6px; letter-spacing: 0.5px;">SEGURANÇA</span>
                  </td>
                </tr>
              </table>
              <h1 style="margin: 20px 0 0 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">
                Recuperação de Senha 🔒
              </h1>
              <p style="margin: 8px 0 0 0; color: #bfdbfe; font-size: 15px; font-weight: 400;">
                Instruções para definir uma nova senha para sua conta.
              </p>
            </td>
          </tr>

          <!-- Main Body Content -->
          <tr>
            <td style="padding: 36px 32px;">
              <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #334155;">
                Olá, <strong>${firstName}</strong>!
              </p>
              
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #475569;">
                Recebemos uma solicitação para redefinir a senha da sua conta vinculada ao e-mail <strong style="color: #0f172a;">${email}</strong> no <strong>ND-Seven CRM</strong>.
              </p>

              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #475569;">
                Para cadastrar uma nova senha e restabelecer seu acesso, clique no botão seguro abaixo:
              </p>

              <!-- Action Button CTA -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0 28px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; font-size: 16px; font-weight: 700; text-decoration: none; padding: 16px 36px; border-radius: 10px; box-shadow: 0 4px 14px 0 rgba(37, 99, 235, 0.39); text-align: center;">
                      Redefinir Minha Senha &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback Link -->
              <div style="background-color: #f8fafc; border-radius: 8px; padding: 14px 18px; border: 1px solid #e2e8f0; margin-top: 24px;">
                <p style="margin: 0 0 6px 0; font-size: 12px; color: #64748b; font-weight: 600;">
                  Se o botão não funcionar, copie e cole o link abaixo no seu navegador:
                </p>
                <p style="margin: 0; font-size: 12px; color: #2563eb; word-break: break-all; font-family: monospace;">
                  ${resetUrl}
                </p>
              </div>

              <!-- Security Info Notice -->
              <div style="margin-top: 24px; border-left: 4px solid #f59e0b; background-color: #fffbeb; padding: 14px 18px; border-radius: 4px;">
                <p style="margin: 0 0 4px 0; font-size: 13px; font-weight: 700; color: #92400e;">
                  🛡️ Você não solicitou esta alteração?
                </p>
                <p style="margin: 0; font-size: 13px; color: #b45309; line-height: 1.5;">
                  Fique tranquilo: sua conta permanece segura e sua senha atual continuará ativa. Você pode simplesmente desconsiderar este e-mail.
                </p>
              </div>

              <p style="margin: 20px 0 0 0; font-size: 12px; color: #94a3b8; text-align: center;">
                ⏱️ Este link de recuperação expira em 24 horas.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0b1329; padding: 28px 32px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 13px; font-weight: 600;">
                ND-Seven CRM &copy; ${new Date().getFullYear()} - Plataforma de Vendas e Gestão
              </p>
              <p style="margin: 0; color: #64748b; font-size: 11px; line-height: 1.4;">
                Mensagem de segurança automática enviada para ${email}.<br>
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

