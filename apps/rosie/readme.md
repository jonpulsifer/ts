# Bolt for JavaScript

A JavaScript framework to build Slack apps in a flash with the latest platform features. Read the [getting started guide](https://slack.dev/bolt-js/tutorial/getting-started) to set-up and run your first Bolt app.

Read [the documentation](https://slack.dev/bolt-js) to explore the basic and advanced concepts of Bolt for JavaScript.

## Setup

```bash
npm install @slack/bolt
```

## Initialization

Create an app by calling the constructor, which is a top-level export.

```ts
import { App } from '@slack/bolt';

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
});

/* Add functionality here */

(async () => {
  // Start the app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();
```
