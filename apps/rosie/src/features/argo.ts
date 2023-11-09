import { ArgoCD } from '../clients/argocd';
import { timeSince } from '../lib';
import { BotMessage } from '../types';

export async function argoListApps({ message, say }: BotMessage) {
  const argo = new ArgoCD(
    process.env.ARGOCD_USERNAME || '',
    process.env.ARGOCD_PASSWORD || '',
    process.env.ARGOCD_SERVER || '',
  );

  if (message.subtype === undefined || message.subtype === 'bot_message') {
    const applications = await argo.applications().catch(console.error);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const applicationBlocks: any[] = [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    applications.items.forEach((app: any, index: number, array: []) => {
      // get the distance between now and last reconciled
      const lastDeployment = app.status.history[app.status.history.length - 1];
      const lastDeploymentDate = new Date(lastDeployment.deployedAt);
      const lastDeploymentRepoUrl = lastDeployment.sources[1].repoURL.slice(
        0,
        -4, // trim .git
      );
      const sha = app.spec.source.helm.parameters[0].value;
      const shortSha = sha.slice(0, 7);
      const lastDeployedRepoUrlWithSha = `${lastDeploymentRepoUrl}/commit/${sha}`;
      const lastDeploymentMarkup = `${timeSince(
        lastDeploymentDate,
        new Date(),
      )} (<${lastDeployedRepoUrlWithSha}|${shortSha}>)`;

      const status = app.status.sync.status;
      const health = app.status.health.status;
      let healthEmoji: string;

      switch (health) {
        case 'Healthy':
          healthEmoji = ':heart:';
          break;
        case 'Progressing':
          healthEmoji = ':hourglass_flowing_sand:';
          break;
        default:
          healthEmoji = ':broken_heart:';
      }

      const healthMarkupWithEmoji = `${healthEmoji} ${health}`;
      const statusEmoji =
        status === 'Synced' ? ':large_green_circle:' : ':red_circle:';
      const statusMarkupWithEmoji = `${statusEmoji} ${status} `;
      applicationBlocks.push({
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
          url: `https://argo.lolwtf.ca/applications/argo/${app.metadata.name}?view=tree`,
          action_id: 'button-link',
        },
      });
      applicationBlocks.push({
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `*Status*: ${statusMarkupWithEmoji}\t*Health*: ${healthMarkupWithEmoji}\t*Last deployment*: ${lastDeploymentMarkup}`,
          },
        ],
      });
      if (index !== array.length - 1) {
        applicationBlocks.push({
          type: 'divider',
        });
      }
    });
    say({
      text: 'List of ArgoCD Applications',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: 'ArgoCD Applications :star:',
            emoji: true,
          },
        },
        ...applicationBlocks,
      ],
      unfurl_links: false,
      unfurl_media: false,
    });
  }
}
