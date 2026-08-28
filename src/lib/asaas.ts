export type AsaasCycle = "MONTHLY" | "QUARTERLY" | "SEMIANNUALLY" | "ANNUALLY";
export type AsaasBillingType = "CREDIT_CARD" | "PIX" | "BOLETO" | "UNDEFINED";

export type AsaasCustomerInput = {
  name: string;
  email: string;
  cpfCnpj: string;
  phone?: string | undefined;
  mobilePhone?: string | undefined;
  postalCode?: string | undefined;
  address?: string | undefined;
  addressNumber?: string | undefined;
  complement?: string | undefined;
  province?: string | undefined;
};

export type AsaasCreditCardInput = {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  ccv: string;
};

export type AsaasCreditCardHolderInfo = {
  name: string;
  email: string;
  cpfCnpj: string;
  postalCode: string;
  addressNumber: string;
  phone: string;
  addressComplement?: string | undefined;
};

export type AsaasSubscriptionInput = {
  customerId: string;
  billingType: AsaasBillingType;
  value: number;
  cycle: AsaasCycle;
  description: string;
  creditCard?: AsaasCreditCardInput | undefined;
  creditCardHolderInfo?: AsaasCreditCardHolderInfo | undefined;
};

export type AsaasCustomer = {
  id: string;
  name: string;
  email: string;
  cpfCnpj: string;
  phone?: string;
  mobilePhone?: string;
};

export type AsaasPayment = {
  id: string;
  customer: string;
  subscription?: string;
  value: number;
  netValue?: number;
  billingType: AsaasBillingType;
  status: string;
  dueDate: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  externalReference?: string;
};

export type AsaasPixQrCode = {
  encodedImage: string;
  payload: string;
  expirationDate: string;
};

export class AsaasClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string, isSandbox = false) {
    this.apiKey =
      apiKey ||
      (typeof process !== "undefined"
        ? process.env['ASAAS_API_KEY'] || process.env['ASAAS_ACCESS_TOKEN']
        : "") ||
      "";
    this.baseUrl = isSandbox ? "https://sandbox.asaas.com/v3" : "https://api.asaas.com/v3";
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!this.apiKey) {
      throw new Error("ASAAS_API_KEY is not configured.");
    }

    const headers: Record<string, string> = {
      access_token: this.apiKey,
      "Content-Type": "application/json",
      "User-Agent": "NDSeven/1.0",
      ...(options.headers as Record<string, string>),
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg =
        data.errors && data.errors.length > 0
          ? data.errors.map((e: { description: string }) => e.description).join(", ")
          : `Asaas API error: ${response.status} ${response.statusText}`;
      throw new Error(errorMsg);
    }

    return data as T;
  }

  async findCustomerByDocumentOrEmail(cpfCnpj: string, email: string): Promise<AsaasCustomer | null> {
    const cleanDoc = cpfCnpj.replace(/\D/g, "");
    if (cleanDoc) {
      const byDoc = await this.request<{ data: AsaasCustomer[] }>(
        `/customers?cpfCnpj=${encodeURIComponent(cleanDoc)}`,
      );
      if (byDoc.data && byDoc.data.length > 0) {
        return byDoc.data[0] ?? null;
      }
    }

    if (email) {
      const byEmail = await this.request<{ data: AsaasCustomer[] }>(
        `/customers?email=${encodeURIComponent(email)}`,
      );
      if (byEmail.data && byEmail.data.length > 0) {
        return byEmail.data[0] ?? null;
      }
    }

    return null;
  }

  async createCustomer(customer: AsaasCustomerInput): Promise<AsaasCustomer> {
    const cleanDoc = customer.cpfCnpj.replace(/\D/g, "");
    const cleanPhone = customer.phone?.replace(/\D/g, "");
    const cleanCep = customer.postalCode?.replace(/\D/g, "");

    return await this.request<AsaasCustomer>("/customers", {
      method: "POST",
      body: JSON.stringify({
        name: customer.name,
        email: customer.email,
        cpfCnpj: cleanDoc,
        phone: cleanPhone,
        mobilePhone: cleanPhone,
        postalCode: cleanCep,
        address: customer.address,
        addressNumber: customer.addressNumber,
        complement: customer.complement,
        province: customer.province,
        notificationDisabled: false,
      }),
    });
  }

  async findOrCreateCustomer(customer: AsaasCustomerInput): Promise<AsaasCustomer> {
    const existing = await this.findCustomerByDocumentOrEmail(customer.cpfCnpj, customer.email);
    if (existing) {
      return existing;
    }
    return await this.createCustomer(customer);
  }

  async createSubscription(input: AsaasSubscriptionInput): Promise<{ id: string; [key: string]: unknown }> {
    const today = new Date();
    const nextDueDate = today.toISOString().split("T")[0];

    const payload: Record<string, unknown> = {
      customer: input.customerId,
      billingType: input.billingType,
      value: input.value,
      nextDueDate,
      cycle: input.cycle,
      description: input.description,
    };

    if (input.creditCard && input.creditCardHolderInfo) {
      payload['creditCard'] = input.creditCard;
      payload['creditCardHolderInfo'] = input.creditCardHolderInfo;
    }

    return await this.request<{ id: string }>("/subscriptions", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async getSubscriptionPayments(subscriptionId: string): Promise<AsaasPayment[]> {
    const res = await this.request<{ data: AsaasPayment[] }>(
      `/subscriptions/${subscriptionId}/payments`,
    );
    return res.data || [];
  }

  async getPayment(paymentId: string): Promise<AsaasPayment> {
    return await this.request<AsaasPayment>(`/payments/${paymentId}`);
  }

  async getPixQrCode(paymentId: string): Promise<AsaasPixQrCode> {
    return await this.request<AsaasPixQrCode>(`/payments/${paymentId}/pixQrCode`);
  }

  async getCustomer(customerId: string): Promise<AsaasCustomer> {
    return await this.request<AsaasCustomer>(`/customers/${customerId}`);
  }
}
