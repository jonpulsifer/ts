import { ArgoCD } from '../clients/argocd';
import type { ArgoApplication } from '../types/argocd';
import { timeSince } from '../utils/time';

export class ArgoService {
  private argo: ArgoCD;

  constructor() {
    this.argo = new ArgoCD();
  }

  async listApps({ message, say }: { message: any; say: any }) {
    try {
      const apps = await this.argo.applications();
      const applicationBlocks = this.generateApplicationBlocks(apps);

      await say({
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: 'Here are the Argo applications:',
            },
          },
          ...applicationBlocks,
        ],
      });
    } catch (error) {
      console.error('Error listing Argo applications:', error);
      await say(
        'Sorry, I encountered an error while fetching Argo applications.',
      );
    }
  }

  async getStatus(appName: string | undefined, event: any, say: any) {
    if (appName) {
      try {
        const app = await this.argo.get(appName);
        const statusBlock = this.generateApplicationBlocks([
          app as ArgoApplication,
        ]);
        await say({
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `Status for application: ${appName}`,
              },
            },
            ...statusBlock,
          ],
        });
      } catch (error) {
        console.error(`Error fetching status for ${appName}:`, error);
        await say(`Sorry, I couldn't fetch the status for ${appName}.`);
      }
    } else {
      await say('Please provide an application name to check its status.');
    }
  }

  private generateApplicationBlocks(apps: ArgoApplication[]) {
    return apps.flatMap((app) => {
      const health = app.status.health.status;
      const status = app.status.sync.status;
      const lastDeployment = app.status.history[0];
      const lastDeploymentTime = lastDeployment
        ? timeSince(new Date(lastDeployment.deployedAt))
        : 'N/A';

      let healthEmoji = ':question:';
      if (health === 'Healthy') {
        healthEmoji = ':green_heart:';
      } else if (health === 'Progressing') {
        healthEmoji = ':large_yellow_circle:';
      } else if (health === 'Degraded') {
        healthEmoji = ':broken_heart:';
      }

      const healthMarkupWithEmoji = `${healthEmoji} ${health}`;
      const statusEmoji =
        status === 'Synced' ? ':large_green_circle:' : ':red_circle:';
      const statusMarkupWithEmoji = `${statusEmoji} ${status}`;

      return [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${app.metadata.name}*`,
          },
          accessory: {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Open in Argo',
              emoji: true,
            },
            url: `https://${process.env.ARGOCD_SERVER}/applications/argo/${app.metadata.name}?view=tree`,
            action_id: 'button-link',
          },
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `*Status*: ${statusMarkupWithEmoji}\t*Health*: ${healthMarkupWithEmoji}\t*Last deployment*: ${lastDeploymentTime}`,
            },
          ],
        },
      ];
    });
  }
}
