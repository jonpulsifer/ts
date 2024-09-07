export class ArgoCD {
  private readonly server: string;
  private readonly username: string;
  private readonly password: string;
  private token: string | undefined;

  constructor(username: string, password: string, server: string) {
    this.server = server;
    this.username = username;
    this.password = password;
    this.initializeToken();
  }

  private async initializeToken() {
    try {
      await this.login();
      console.log('ArgoCD: Successfully logged in');
    } catch (error) {
      console.error('ArgoCD: Failed to login', error);
    }
  }

  private async login() {
    const url = `${this.server}/api/v1/session`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: this.username,
        password: this.password,
      }),
    });
    if (!response.ok) throw new Error(`Request failed: ${response.statusText}`);
    const json = await response.json();
    if (!json.token) throw new Error(`No token found in response`);
    this.token = json.token;
  }

  private async request(
    path: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH',
    body?: object,
  ): Promise<any> {
    const url = `${this.server}/api/v1/${path}`;
    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    const options: RequestInit = { method, headers };
    if (body) {
      headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (response.status === 401) {
      // Unauthorized, try to login and retry the request
      await this.login();
      return this.request(path, method, body);
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
