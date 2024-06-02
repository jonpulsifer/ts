import { api } from '@pagerduty/pdjs';
import type { PartialCall } from '@pagerduty/pdjs/build/src/api';

interface OnCallsType {
  escalation_policy: {
    id: string;
    type: string;
    summary: string;
    self: string;
    html_url: string;
  };
  escalation_level: number;
  schedule: null;
  user: {
    id: string;
    type: string;
    summary: string;
    self: string;
    html_url: string;
  };
  start: null;
  end: null;
}

export class PagerDuty {
  readonly pd: PartialCall;
  constructor() {
    this.pd = api({
      token: process.env.PAGERDUTY_TOKEN,
      headers: { From: 'jonathan@pulsifer.ca' },
    });
  }

  async getEmailFromPDID(id: string) {
    return this.pd
      .get(`/users/${id}`)
      .then(({ data }) => {
        return String(data.user.email);
      })
      .catch((e) => {
        console.error(e);
        return undefined;
      });
  }

  async listOncalls() {
    return this.pd
      .get('/oncalls')
      .then(({ resource }) => {
        return resource as OnCallsType[];
      })
      .catch(console.error);
  }

  async createIncident(pdUser: string, description?: string | null) {
    return this.pd
      .post('/incidents', {
        data: {
          incident: {
            type: 'incident',
            title: 'Slack Page',
            service: {
              id: 'PNWORTA',
              type: 'service_reference',
            },
            body: {
              type: 'incident_body',
              details: description ?? 'No description provided',
            },
            urgency: 'high',
            incident_key: `${Date.now().toString()}-rosie-slack`,
            assignments: [
              {
                assignee: {
                  id: pdUser,
                  type: 'user_reference',
                },
                escalation_level: 1,
              },
            ],
          },
        },
      })
      .then(({ resource, response }) => {
        return { resource, response };
      })
      .catch((e) => {
        console.error(e);
        return { resource: undefined, response: { ok: false } };
      });
  }
}
