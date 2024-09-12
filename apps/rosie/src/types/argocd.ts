export interface ArgoApplication {
  metadata: {
    name: string;
  };
  status: {
    sync: {
      status: string;
    };
    health: {
      status: string;
    };
    history: Array<{
      deployedAt: string;
      revision: string;
      sources?: Array<{
        repoURL: string;
      }>;
      source?: {
        repoURL: string;
      };
    }>;
  };
}

export interface ArgoLoginResponse {
  token: string;
}
