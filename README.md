# AIforAll

A one-page guide to the essentials of AI for non-technical people. It is also a practice target for learning n8n (workflow automation and AI agents).
Plain HTML, CSS and JavaScript. No build step. No server code.

## What the page covers
What AI is, common types (text, image, video, audio, prediction, agents), everyday uses, prompting (R-T-C-F framework), pitfalls, and a short note on automation and agents. It ends with the 5 basics to remember.

## Files
- `index.html`: the page. `styles.css`: the look. `script.js`: loads tips, sends forms, copies the prompt.
- `config.js`: the n8n webhook addresses (the only setting you change).
- `content.json`: the "Latest tips" list (n8n can edit this). `feed.xml`: RSS feed of the tips. `status.json`: a health check.
- `comments.json` and the "brief" part of `content.json` are no longer used.

## Deploy on Render (Static Site)
1. Render dashboard, New, Static Site, connect this GitHub repo.
2. Build command: leave empty. Publish directory: `.`
3. Deploy. Render gives a free `onrender.com` address.

## n8n practice ideas (easiest first)
1. Webhook receives a signup, then sends you an email.
2. Webhook receives feedback, then adds a row in Google Sheets.
3. Schedule trigger checks `status.json` and alerts you if the site is down.
4. RSS trigger reads `feed.xml` and posts to a chat or email.
5. n8n edits `content.json` through GitHub (add a new tip), and Render redeploys.
6. Agent practice: feedback arrives, an AI step suggests the next topic to explain, you approve, n8n adds a tip to `content.json`.

## Webhook notes
- `localhost` only works when you open the page on the same computer that runs n8n.
- Test address: `/webhook-test/...` works while n8n is listening. Production: `/webhook/...` works once the workflow is Active.
- The forms send JSON: `{ name, email, sentAt, source }` for signups and `{ feedback, sentAt, source }` for feedback.

## Glossary
- **Webhook:** a web address that n8n listens on, so other things can send it data.
- **Trigger:** what starts a workflow (a webhook, a schedule, a button).
- **Node:** one step in a workflow.
- **Workflow:** a chain of nodes that does a job.
- **Agent:** an AI step that decides what to do next, with you approving key actions.
- **Static site:** a site made only of files, with no server code.
- **JSON:** a simple way to write data as labels and values.
- **RSS:** a feed of new items that tools can read.
