export class ArgoCD {
  private readonly server: string;
  private token: string | undefined;

  constructor() {
    this.server = process.env.ARGOCD_SERVER ?? '';
    this.login().catch(console.error);
  }

  private async login() {
    const username = process.env.ARGOCD_USERNAME ?? '';
    const password = process.env.ARGOCD_PASSWORD ?? '';
    const loginUrl = `${this.server}/api/v1/session`;

    try {
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) throw new Error(`Login failed: ${response.statusText}`);

      const json = await response.json();
      if (!json.token) throw new Error(`No token found in response`);

      this.token = json.token;
    } catch (error) {
      console.error('Failed to login to ArgoCD:', error);
    }
  }

  private async request(
    path: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH',
    body?: object,
  ): Promise<any> {
    if (!this.token) {
      await this.login();
      if (!this.token) throw new Error('Failed to obtain token');
    }

    const url = `${this.server}/api/v1/${path}`;
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.token}`
    };

    const options: RequestInit = { method, headers };
    if (body) {
      options.body = JSON.stringify(body);
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, options);

    if (response.status === 401) {
      // Token might have expired, try to login again
      await this.login();
      if (!this.token) throw new Error('Failed to renew token');

      // Retry the request with the new token
      headers['Authorization'] = `Bearer ${this.token}`;
      const retryResponse = await fetch(url, options);

      if (!retryResponse.ok) {
        throw new Error(`Request failed: ${retryResponse.statusText}`);
      }

      return retryResponse.json();
    }

    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`);
    }

    return response.json();
  }

  async applications() {
    return this.request('applications', 'GET');
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
