export interface WebhookRequest {
  id: string;
  timestamp: Date;
  method: string;
  url: string;
  headers: Record<string, string>;
  query: Record<string, string | string[]>;
  body: any;
  ip?: string;
}

class WebhookStore {
  private requests: WebhookRequest[] = [];
  private maxRequests = 100; // Keep last 100 requests

  addRequest(request: WebhookRequest): void {
    this.requests.unshift(request);
    // Keep only the last maxRequests
    if (this.requests.length > this.maxRequests) {
      this.requests = this.requests.slice(0, this.maxRequests);
    }
  }

  getRequests(): WebhookRequest[] {
    return this.requests;
  }

  getRequest(id: string): WebhookRequest | undefined {
    return this.requests.find((req) => req.id === id);
  }

  clearRequests(): void {
    this.requests = [];
  }
}

// Singleton instance
export const webhookStore = new WebhookStore();
