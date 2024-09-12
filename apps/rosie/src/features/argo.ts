import { ArgoApplication } from '../types/argocd';
import { ArgoCD } from '../clients/argocd';
import { timeSince } from '../lib/utils';
import type { BotMessage } from '../types/bot';

export async function argoListApps({ message, say }: BotMessage) {
  const argo = new ArgoCD();

  if (message.subtype === undefined || message.subtype === 'bot_message') {
    const applications = await argo.applications().catch(console.error);

    if (!applications) {
      await say('No applications found');
      return;
    }

    const applicationBlocks: any[] = [];


    applications.forEach((app, index, array: ArgoApplication[]) => {
      // get the distance between now and last reconciled
      const lastDeployment = app.status.history[app.status.history.length - 1];
      const lastDeploymentDate = new Date(lastDeployment.deployedAt);
      const lastDeploymentRepoUrl: string = (lastDeployment.sources?.[1] || lastDeployment.source)?.repoURL?.slice(
        0,
        -4, // trim .git
      ) || '';
      const shortSha = lastDeployment.revision.slice(0, 7);
      const lastDeployedRepoUrlWithSha = `${lastDeploymentRepoUrl}/commit/${lastDeployment.revision}`;
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
          url: `https://${process.env.ARGOCD_SERVER}/applications/argo/${app.metadata.name}?view=tree`,
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
    return {
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
    };
  }
}
