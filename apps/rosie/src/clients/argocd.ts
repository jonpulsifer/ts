import type { ArgoApplication, ArgoLoginResponse } from '../types/argocd';
import { loadEnv } from '../utils/env';

export class ArgoCD {
  private server: string;
  private token: string | undefined;
  private username: string;
  private password: string;

  constructor() {
    loadEnv();
    this.server = process.env.ARGOCD_SERVER || '';
    this.username = process.env.ARGOCD_USERNAME || '';
    this.password = process.env.ARGOCD_PASSWORD || '';

    if (!this.server || !this.username || !this.password) {
      throw new Error('ArgoCD credentials not set in environment variables');
    }
  }

  private async login(): Promise<void> {
    const loginUrl = `${this.server}/api/v1/session`;

    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: this.username,
        password: this.password,
      }),
    });

    if (!response.ok) throw new Error(`Login failed: ${response.statusText}`);

    const json = (await response.json()) as ArgoLoginResponse;
    if (!json.token) throw new Error('No token found in response');

    this.token = json.token;
  }

  private async request<T>(
    path: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH',
    body?: object,
  ): Promise<T> {
    if (!this.token) {
      await this.login();
    }

    const url = `${this.server}/api/v1/${path}`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.token}`,
    };

    const options: RequestInit = { method, headers };
    if (body) {
      options.body = JSON.stringify(body);
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, options);

    if (response.status === 401) {
      await this.login();
      if (!this.token) throw new Error('Failed to renew token');

      headers.Authorization = `Bearer ${this.token}`;
      const retryResponse = await fetch(url, options);

      if (!retryResponse.ok) {
        throw new Error(`Request failed: ${retryResponse.statusText}`);
      }

      return retryResponse.json() as T;
    }

    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`);
    }

    return response.json() as T;
  }

  async applications(): Promise<ArgoApplication[]> {
    const results = await this.request<{ items: ArgoApplication[] }>(
      'applications',
      'GET',
    );
    return results.items as ArgoApplication[];
  }

  async sync(name: string) {
    return this.request(`applications/${name}/sync`, 'POST');
  }

  async get(name: string) {
    return this.request(`applications/${name}`, 'GET');
  }

  async create(name: string, repoUrl: string, path: string, cluster: string) {
    return this.request('applications', 'POST', {
      apiVersion: 'argoproj.io/v1alpha1',
      kind: 'Application',
      metadata: {
        name,
        finalizers: ['resources-finalizer.argocd.argoproj.io'],
      },
      spec: {
        destination: {
          namespace: 'default',
          server: `https://${cluster}`,
        },
        project: 'default',
        source: {
          path,
          repoURL: repoUrl,
          targetRevision: 'HEAD',
        },
        syncPolicy: {
          automated: {
            prune: true,
            selfHeal: true,
          },
          syncOptions: ['Validate=false'],
        },
      },
    });
  }

  async patch(name: string, patch: object) {
    return this.request(`applications/${name}`, 'PATCH', patch);
  }
}
