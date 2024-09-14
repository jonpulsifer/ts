import { ArgoCD } from '../clients/argocd';
import { timeSince } from '../lib/utils';
import type { ArgoApplication } from '../types/argocd';
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

    for (const app of applications) {
      let lastDeploymentMarkup = 'N/A';
      const lastDeployment = app.status.history.at(-1);
      if (lastDeployment) {
        const { deployedAt, revision, sources, source } = lastDeployment;
        const lastDeploymentDate = new Date(deployedAt);
        const repoUrl = (sources?.[1] || source)?.repoURL?.slice(0, -4) || '';
        const shortSha = revision.slice(0, 7);
        const commitUrl = `${repoUrl}/commit/${revision}`;
        lastDeploymentMarkup = `${timeSince(lastDeploymentDate, new Date())} (<${commitUrl}|${shortSha}>)`;
      }

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
      if (app !== applications[applications.length - 1]) {
        applicationBlocks.push({
          type: 'divider',
        });
      }
    }
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
