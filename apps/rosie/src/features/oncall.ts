import type { App } from '@slack/bolt';
import { PagerDuty } from '../clients/pagerduty';
import type { BotAction, BotMessage } from '../types';

interface UserOnCall {
  id: string;
  policy: string;
  policyId: string;
  email?: string;
  slackId?: string;
}

export async function pdListOncalls({ message, say }: BotMessage, app: App) {
  const pd = new PagerDuty();

  if (message.subtype === undefined || message.subtype === 'bot_message') {
    // get all the oncalls
    const pdOncalls = await pd.listOncalls();
    if (!pdOncalls || !pdOncalls.length) {
      say(`: x: Sorry < @${message.user}> !I'm having trouble reaching PD.`);
      return;
    }

    const oncalls: UserOnCall[] = [];
    for (const pdoncall of pdOncalls) {
      const email = await pd.getEmailFromPDID(pdoncall.user.id);
      const slackId = await app.client.users
        .lookupByEmail({
          email: String(email),
        })
        .then(({ user }) => {
          return user?.id;
        });
      oncalls.push({
        id: pdoncall.user.id,
        policy: pdoncall.escalation_policy.summary,
        policyId: pdoncall.escalation_policy.id,
        email,
        slackId,
      });
    }

    say({
      text: 'Page someone',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: ':pager: Send a Page with PagerDuty',
            emoji: true,
          },
        },
        {
          type: 'input',
          block_id: 'oncall-policies',
          element: {
            type: 'static_select',
            placeholder: {
              type: 'plain_text',
              text: 'Team or Person',
              emoji: true,
            },
            action_id: 'oncall-policies',
            options: oncalls.map((oncall) => {
              return {
                text: {
                  type: 'plain_text',
                  text: `${oncall.policy} (<@${oncall.slackId}>)`,
                  emoji: true,
                },
                value: `${oncall.id}:${oncall.slackId}`,
              };
            }),
          },
          label: {
            type: 'plain_text',
            text: 'Team & person to notify',
            emoji: true,
          },
        },
        {
          dispatch_action: false,
          type: 'input',
          block_id: 'oncall-description',
          element: {
            type: 'plain_text_input',
            action_id: 'oncall-description',
          },
          label: {
            type: 'plain_text',
            text: 'Description of the issue',
            emoji: true,
          },
        },
        {
          type: 'actions',
          block_id: 'oncall-actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                emoji: true,
                text: 'Send Page',
              },
              style: 'primary',
              action_id: 'oncall-page',
            },
            {
              type: 'button',
              text: {
                type: 'plain_text',
                emoji: true,
                text: 'Cancel',
              },
              style: 'danger',
              action_id: 'button-cancel-delete-message',
            },
          ],
        },
      ],
    });
  }
}

export async function pdPageSomeone({ body, client, ack, logger }: BotAction) {
  const pd = new PagerDuty();
  await ack();
  try {
    // Make sure the event is not in a view
    if (body.message) {
      if (!body.channel?.id || !body.message.ts) {
        console.error('Missing channel or ts');
        return;
      }

      const description =
        body.state?.values['oncall-description']['oncall-description'].value;

      const pdUser =
        body.state?.values['oncall-policies'][
          'oncall-policies'
        ].selected_option?.value.split(':')[0];
      const slackUser =
        body.state?.values['oncall-policies'][
          'oncall-policies'
        ].selected_option?.value.split(':')[1];
      if (!pdUser) {
        client.chat.postMessage({
          channel: body.channel.id,
          text: `:x: Sorry <@${body.user.id}>! I could not find a PagerDuty user for <@${slackUser}>`,
        });
        return;
      }
      try {
        await client.reactions.add({
          name: 'eyes',
          timestamp: body.message.ts,
          channel: body.channel.id,
        });
      } catch (error) {
        if (body.channel.id) {
          client.chat.postMessage({
            channel: body.channel.id,
            text: `:x: Sorry <@${body.user.id}>! I've already tried paging <@${slackUser}> with \`${description}\``,
          });
        }
        return;
      }

      const { response } = await pd.createIncident(pdUser, description);
      client.chat.delete({
        channel: body.channel.id,
        ts: body.message.ts,
      });
      if (!response.ok) {
        client.chat.postMessage({
          channel: body.channel.id,
          text: `:x: Sorry <@${body.user.id}>! I'm having trouble paging <@${slackUser}> with \`${description}\``,
        });
        return;
      }
      client.chat.postMessage({
        channel: body.channel.id,
        text: `:pager: <@${body.user.id}> paged <@${slackUser}> with \`${description}\``,
      });
    }
  } catch (error) {
    logger.error(error);
  }
}
