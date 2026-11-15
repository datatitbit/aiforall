# AIforAll

A one-page beginner's guide to AI. It is also a practice target for learning n8n.
Plain HTML, CSS and JavaScript. No build step. No server code.

## Files
- `index.html`: the page. `styles.css`: the look. `script.js`: loads tips, sends forms, copies the prompt.
- `config.js`: the n8n webhook addresses (the only setting you change).
- `content.json`: the "Latest tips" (n8n can edit this). `feed.xml`: an RSS feed of the tips. `status.json`: a health check.

## Deploy on Render (Static Site)
1. Render dashboard, New, Static Site, connect this GitHub repo.
2. Build command: leave empty. Publish directory: `.`
3. Deploy. Render gives a free `onrender.com` address.

## n8n practice ideas (easiest first)
1. Webhook receives a signup, then sends you an email.
2. Webhook receives feedback, then adds a row in Google Sheets.
3. Schedule trigger checks `status.json` and alerts you if the site is down.
4. RSS trigger reads `feed.xml` and posts to a chat or email.
5. n8n edits `content.json` through GitHub, and Render redeploys.

## Webhook notes
- `localhost` only works when you open the page on the same computer that runs n8n.
- Test address: `/webhook-test/...` works while n8n is listening. Production: `/webhook/...` works once the workflow is Active.
- The forms send JSON: `{ name, email, sentAt, source }` and `{ message, email, sentAt, source }`.

## Glossary
- **Webhook:** a web address that n8n listens on, so other things can send it data.
- **Trigger:** what starts a workflow (a webhook, a schedule, a button).
- **Node:** one step in a workflow.
- **Workflow:** a chain of nodes that does a job.
- **Static site:** a site made only of files, with no server code.
- **JSON:** a simple way to write data as labels and values.
- **RSS:** a feed of new items that tools can read.
