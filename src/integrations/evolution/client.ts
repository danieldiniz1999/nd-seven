export interface EvolutionInstanceInfo {
  instanceName: string;
  status: "open" | "close" | "connecting" | "unknown";
  qrcode?: {
    base64?: string;
    code?: string;
  };
}

export interface EvolutionSendTextOptions {
  number: string;
  text: string;
  delay?: number;
}

export const DEFAULT_EVOLUTION_URL = "https://api.nissidigital.com.br";
export const DEFAULT_EVOLUTION_INSTANCE = "ndseven";
export const DEFAULT_EVOLUTION_API_KEY = "B6D711FCDE4D4FD5936544120E713976";

export class EvolutionApiClient {
  private baseUrl: string;
  private apiKey: string;
  private defaultInstance: string;

  constructor(options?: { baseUrl?: string; apiKey?: string; defaultInstance?: string }) {
    const envUrl =
      (typeof import.meta !== "undefined" && import.meta.env?.['VITE_EVOLUTION_API_URL']) ||
      (typeof process !== "undefined"
        ? process.env?.["EVOLUTION_API_URL"] || process.env?.["VITE_EVOLUTION_API_URL"]
        : undefined);

    const envKey =
      (typeof import.meta !== "undefined" && import.meta.env?.['VITE_EVOLUTION_API_KEY']) ||
      (typeof process !== "undefined"
        ? process.env?.["EVOLUTION_API_KEY"] || process.env?.["VITE_EVOLUTION_API_KEY"]
        : undefined);

    const envInstance =
      (typeof import.meta !== "undefined" && import.meta.env?.['VITE_EVOLUTION_INSTANCE_NAME']) ||
      (typeof process !== "undefined"
        ? process.env?.["EVOLUTION_INSTANCE_NAME"] || process.env?.["VITE_EVOLUTION_INSTANCE_NAME"]
        : undefined);

    this.baseUrl = (options?.baseUrl || envUrl || DEFAULT_EVOLUTION_URL).replace(/\/+$/, "");
    this.apiKey = options?.apiKey || envKey || DEFAULT_EVOLUTION_API_KEY;
    this.defaultInstance = options?.defaultInstance || envInstance || DEFAULT_EVOLUTION_INSTANCE;
  }

  private getHeaders(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      apikey: this.apiKey,
    };
  }

  /**
   * Obtém status da conexão da instância WhatsApp
   */
  async getInstanceStatus(instanceName?: string): Promise<{ connected: boolean; state: string; data?: any }> {
    const inst = instanceName || this.defaultInstance;
    try {
      const response = await fetch(`${this.baseUrl}/instance/connectionState/${encodeURIComponent(inst)}`, {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        return { connected: false, state: "disconnected" };
      }

      const data = await response.json();
      const state = data?.instance?.state || data?.state || "unknown";
      return {
        connected: state === "open",
        state,
        data,
      };
    } catch (err) {
      console.warn(`[Evolution API] Erro ao consultar status da instância ${inst}:`, err);
      return { connected: false, state: "error" };
    }
  }

  /**
   * Gera ou recupera o QR Code para conectar a instância do WhatsApp
   */
  async connectInstance(instanceName?: string): Promise<{ base64?: string; code?: string; pairingCode?: string }> {
    const inst = instanceName || this.defaultInstance;
    try {
      const response = await fetch(`${this.baseUrl}/instance/connect/${encodeURIComponent(inst)}`, {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Evolution API retornou status ${response.status}`);
      }

      const data = await response.json();
      return {
        base64: data?.base64 || data?.qrcode?.base64,
        code: data?.code || data?.qrcode?.code,
        pairingCode: data?.pairingCode,
      };
    } catch (err) {
      console.warn(`[Evolution API] Erro ao conectar instância ${inst}:`, err);
      return {};
    }
  }

  /**
   * Envia uma mensagem de texto via WhatsApp
   */
  async sendTextMessage(
    options: EvolutionSendTextOptions,
    instanceName?: string,
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    const inst = instanceName || this.defaultInstance;
    const cleanNumber = options.number.replace(/\D/g, "");

    try {
      const response = await fetch(`${this.baseUrl}/message/sendText/${encodeURIComponent(inst)}`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          number: cleanNumber,
          text: options.text,
          delay: options.delay || 1200,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        return {
          success: false,
          error: data?.message || `Erro ${response.status}`,
          data,
        };
      }

      return { success: true, data };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao enviar mensagem WhatsApp";
      return { success: false, error: message };
    }
  }

  /**
   * Desconecta o WhatsApp da instância
   */
  async logoutInstance(instanceName?: string): Promise<{ success: boolean }> {
    const inst = instanceName || this.defaultInstance;
    try {
      const response = await fetch(`${this.baseUrl}/instance/logout/${encodeURIComponent(inst)}`, {
        method: "DELETE",
        headers: this.getHeaders(),
      });
      return { success: response.ok };
    } catch {
      return { success: false };
    }
  }
}

export const evolutionApi = new EvolutionApiClient();
