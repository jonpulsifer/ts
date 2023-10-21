import { api } from '@pagerduty/pdjs';
import {
  AckFn,
  App,
  AppMentionEvent,
  BlockAction,
  BlockElementAction,
  Logger,
  MessageEvent,
  SayFn,
} from '@slack/bolt';
import { WebClient } from '@slack/web-api';

interface BotMessage {
  message: MessageEvent | AppMentionEvent;
  say: SayFn;
}

interface BotAction {
  body: BlockAction<BlockElementAction>;
  client: WebClient;
  ack: AckFn<void>;
  logger: Logger;
}

interface oncallsType {
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

interface userOnCall {
  id: string;
  policy: string;
  policyId: string;
  email?: string;
  slackId?: string;
}

async function getEmailFromPDID(id: string) {
  return api({ token: process.env.PAGERDUTY_TOKEN })
    .get(`/users/${id}`)
    .then(({ data }) => {
      return String(data.user.email);
    });
}

export async function pdListOncalls({ message, say }: BotMessage, app: App) {
  const pd = api({ token: process.env.PAGERDUTY_TOKEN });

  if (message.subtype === undefined || message.subtype === 'bot_message') {
    // get all the oncalls
    const pdoncalls = await pd
      .get('/oncalls')
      .then(({ resource }) => {
        return resource as oncallsType[];
      })
      .catch(console.error);

    if (!pdoncalls || pdoncalls === undefined) {
      say(`: x: Sorry < @${message.user}> !I'm having trouble reaching PD.`);
      return;
    }

    const oncalls: userOnCall[] = [];
    for (const pdoncall of pdoncalls) {
      const email = await getEmailFromPDID(pdoncall.user.id);
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
            text: ':pager: On-calls',
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
          dispatch_action: true,
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
      ],
    });
  }
}

export async function pdPageSomeone({ body, client, ack, logger }: BotAction) {
  await ack();
  try {
    // Make sure the event is not in a view
    if (body.message) {
      if (!body.channel?.id) {
        // something went wrong
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
      try {
        await client.reactions.add({
          name: 'white_check_mark',
          timestamp: body.message?.ts,
          channel: body.channel?.id,
        });
      } catch (error) {
        if (body.channel?.id) {
          client.chat.postMessage({
            channel: body.channel?.id,
            text: `:x: Sorry <@${body.user.id}>! I've already tried paging <@${slackUser}> with \`${description}\``,
          });
        }
        return;
      }

      // create slack key using epoch time
      const slackKey = `${Date.now().toString()}-penny-slack`;
      const pd = api({
        token: process.env.PAGERDUTY_TOKEN,
        headers: { From: 'jonathan@pulsifer.ca' },
      });
      // create incident in PD with description
      // service: PNWORTA
      pd.post('/incidents', {
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
              details: description,
            },
            urgency: 'high',
            incident_key: slackKey,
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
        .then(({ data, resource, response }) => {
          logger.info(data);
          logger.info(response);
          logger.info(resource);
          if (!body.channel?.id || !body.message?.ts) {
            // something went wrong
            return;
          }
          client.chat.delete({
            channel: body.channel?.id,
            ts: body.message?.ts,
          });
          client.chat.postMessage({
            channel: body.channel?.id,
            text: `:pager: <@${body.user.id}> paged <@${slackUser}> with \`${description}\``,
          });
        })
        .catch(console.error);
    }
  } catch (error) {
    logger.error(error);
  }
}
