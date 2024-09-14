import { PagerDuty } from '../clients/pagerduty';

export class PagerDutyService {
  private pd: PagerDuty;

  constructor() {
    this.pd = new PagerDuty();
  }

  async listOncalls({ message, say }: { message: any; say: any }) {
    try {
      const oncalls = await this.pd.listOncalls();
      if (!oncalls || oncalls.length === 0) {
        await say('No on-call schedules found.');
        return;
      }

      const blocks = this.generateOncallBlocks(oncalls);

      await say({
        blocks: blocks,
      });
    } catch (error) {
      console.error('Error listing on-calls:', error);
      await say(
        'Sorry, I encountered an error while fetching on-call information.',
      );
    }
  }

  async pageSomeone({ body, client }: { body: any; client: any }) {
    try {
      const userId =
        body.state.values['oncall-user']['oncall-user'].selected_user;
      const description =
        body.state.values['oncall-description']['oncall-description'].value;

      const pdUser = await this.pd.getEmailFromPDID(userId);
      if (!pdUser) {
        await client.chat.postMessage({
          channel: body.channel.id,
          text: 'Error: Unable to find PagerDuty user.',
        });
        return;
      }

      const { resource, response } = await this.pd.createIncident(
        pdUser,
        description,
      );

      if (response.ok) {
        await client.chat.postMessage({
          channel: body.channel.id,
          text: `Paged ${pdUser} successfully. Incident URL: ${resource.incident.html_url}`,
        });
      } else {
        await client.chat.postMessage({
          channel: body.channel.id,
          text: 'Error: Unable to create PagerDuty incident.',
        });
      }
    } catch (error) {
      console.error('Error paging someone:', error);
      await client.chat.postMessage({
        channel: body.channel.id,
        text: 'Sorry, I encountered an error while trying to page someone.',
      });
    }
  }

  private generateOncallBlocks(oncalls: any[]) {
    const blocks: any = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Current On-Call Schedules:*',
        },
      },
    ];

    for (const oncall of oncalls) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${oncall.schedule.summary}*\n${oncall.user.summary}`,
        },
      });
    }

    blocks.push({
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Page On-Call',
            emoji: true,
          },
          value: 'page_oncall',
          action_id: 'page_oncall',
        },
      ],
    });

    return blocks;
  }
}
